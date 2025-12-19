/**
 * Alpha Vantage API service
 * Handles all external API calls with error handling, rate limiting, and cooldown timer
 * Gracefully manages API limits by logging warnings instead of throwing errors
 */

import axios, { AxiosInstance } from 'axios';
import { AlphaVantageQuoteResponse, AlphaVantageTimeSeriesResponse } from '../types/api.types';
import { StockQuote, ChartDataPoint } from '../types/stock.types';

const ALPHAVANTAGE_API_KEY = process.env.REACT_APP_ALPHAVANTAGE_API_KEY || '';
const ALPHAVANTAGE_BASE_URL = process.env.REACT_APP_ALPHAVANTAGE_BASE_URL || '';

// Delay between API calls to respect rate limits
const RATE_LIMIT_DELAY_MS = Number(process.env.REACT_APP_RATE_LIMIT_DELAY_MS || '12000');

// Enforce only one inflight call at a time
let inflightPromise: Promise<any> | null = null;

// Timestamp when next request is allowed (rate-limit cooldown)
let nextAvailableTime = 0;

export const getAlphaVantageWaitMs = () => {
  const now = Date.now();
  return Math.max(0, nextAvailableTime - now);
};

class AlphaVantageService {
  private api: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = ALPHAVANTAGE_API_KEY;
    this.api = axios.create({
      baseURL: ALPHAVANTAGE_BASE_URL,
      timeout: 10000,
    });
  }

  // Ensure API calls do not exceed Alpha Vantage rate limits
  // If a cooldown is active, wait until allowed
  private async throttle() {
    const now = Date.now();
    if (now < nextAvailableTime) {
      const waitTime = nextAvailableTime - now;
      console.warn(`[AlphaVantage] Cooling down for ${waitTime}ms...`);
      await new Promise((res) => setTimeout(res, waitTime));
    }
  }

  private beginCooldown() {
    nextAvailableTime = Date.now() + RATE_LIMIT_DELAY_MS;
  }

  private isRateLimitResponse(data: any): boolean {
    const info = data?.Information;
    if (!info || typeof info !== "string") return false;

    return (
      info.includes("API call frequency") ||
      info.includes("maximum allowed") ||
      info.includes("Thank you for using Alpha Vantage") ||
      info.includes("rate") ||
      info.includes("limit")
    );
  }

  // Ensure only one concurrent API request is in flight (global lock)
  private lock<T>(fn: () => Promise<T>): Promise<T> {
    if (!inflightPromise) {
      inflightPromise = fn().finally(() => {
        inflightPromise = null;
      });
    }
    return inflightPromise;
  }
  
  /**
   * Fetch real-time stock quote
   * @param symbol - Stock symbol (e.g., 'AAPL')
   */
  async getQuote(symbol: string, skipLock = false): Promise<StockQuote | null> {
    const fetchQuoteWithDelay = async () => {
      await this.throttle();

      try {
        // any cast on response.data to allow 'Information' key checking
        const response = await this.api.get<AlphaVantageQuoteResponse | any>('', {
          params: {
            function: 'GLOBAL_QUOTE',
            symbol,
            apikey: this.apiKey,
          },
        });

        // DEBUG: log the full API response
        console.log(`[AlphaVantageService][DEBUG] getQuote response for ${symbol}:`, response.data);

        // fail gracefully
        if (response.data.Information) {
          console.warn(`[AlphaVantageService] Info message from API:`, response.data['Information']);

          if (this.isRateLimitResponse(response.data)) {
            console.warn(`[AlphaVantageService] Rate limit detected while fetching quote for ${symbol}`);
            this.beginCooldown();
            return null;
          }
        }

        const quote = response.data['Global Quote'];
        if (!quote || !quote['01. symbol']) {
          console.error(`[AlphaVantageService][ERROR] Invalid quote response for ${symbol}:`, response.data);
          return null;
        }

        return {
          symbol: quote['01. symbol'],
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
          volume: parseInt(quote['06. volume'], 10),
          timestamp: new Date(quote['07. latest trading day']),
        };
      } catch (error) {
        console.error(`[AlphaVantageService][ERROR] Error fetching quote for ${symbol}:`, error);
        return null;
      }
    }
    if (skipLock) return fetchQuoteWithDelay();
    return this.lock(fetchQuoteWithDelay);
  };
 
  /**
   * Fetch time series data for charting
   * @param symbol - Stock symbol
   * @param interval - Time interval ('daily', 'weekly', 'monthly')
   */
  async getTimeSeries(
    symbol: string,
    interval: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<ChartDataPoint[]> {
    return this.lock(async () => {
      await this.throttle();
    
      const functionMap = {
        daily: 'TIME_SERIES_DAILY',
        weekly: 'TIME_SERIES_WEEKLY',
        monthly: 'TIME_SERIES_MONTHLY',
      };

      const keyMap = {
        daily: 'Time Series (Daily)',
        weekly: 'Time Series (Weekly)',
        monthly: 'Time Series (Monthly)',
      };

      const params = {
        function: functionMap[interval],
        symbol,
        apikey: this.apiKey,
        outputsize: 'compact', // Last 100 data points
      };

      try {
        const response = await this.api.get<AlphaVantageTimeSeriesResponse>('', { params });

        // DEBUG: log the full API response
        console.log(`[AlphaVantageService][DEBUG] getTimeSeries response for ${symbol} (${interval}):`, response.data);

        // Handle API info messages (rate limit, invalid key, etc.)
        if (response.data.Information) {
          console.warn(`[AlphaVantageService][WARN] Info message from API:`, response.data.Information);

          if (this.isRateLimitResponse(response.data)) {
            console.warn(`[AlphaVantageService][WARN] Rate limit detected while fetching time series for ${symbol}`);
            this.beginCooldown();
          }
          return []; // Return empty array gracefully
        }

        // Cast response.data for dynamic key access
        const raw = response.data as any;
        const timeSeriesRaw = raw[keyMap[interval]];

        if (!timeSeriesRaw || typeof timeSeriesRaw !== "object") {
          console.error(`[AlphaVantageService][ERROR] Invalid time series response for ${symbol}:`, response.data);
          return []; // Return empty array gracefully
        }

        return Object.entries(timeSeriesRaw).map(([date, point]) => {
          const p = point as Record<string, string>;

          return  {
            date,
            open: parseFloat(p['1. open']),
            high: parseFloat(p['2. high']),
            low: parseFloat(p['3. low']),
            close: parseFloat(p['4. close']),
            volume: parseInt(p['5. volume'], 10),
          };
      }).reverse(); // Reverse to get chronological order
      } catch (error) {
        console.error(`[AlphaVantageService][ERROR] Error fetching time series for ${symbol}:`, error);
        return []; // Fail gracefully
      }
    });
  }

  /**
   * Fetch multiple quotes in batch (simulated)
   * Note: Alpha Vantage free tier doesn't support true batch requests
   */
  async getBatchQuotes(symbols: string[]): Promise<Record<string, StockQuote | null>> {
    const results: Record<string, StockQuote | null> = {};

    // Track the last request time to respect the free tier
    let lastRequestTime = 0;

    // Fetch a single symbol with retries
    const fetchQuoteWithRetry = async (
      symbol: string,
      retries = 3
    ): Promise<StockQuote | null> => {
      console.log(`[AlphaVantageService][DEBUG] getBatchQuotes starting fetch for symbol: ${symbol}`);

      const now = Date.now();
      const elapsed = now - lastRequestTime;

      if (elapsed < RATE_LIMIT_DELAY_MS) {
        const waitMs = RATE_LIMIT_DELAY_MS - elapsed;
        console.log(`[AlphaVantageService][DEBUG] getBatchQuotes waiting ${waitMs}ms before fetching ${symbol}`);
        await new Promise((res) => setTimeout(res, waitMs));
      }

      lastRequestTime = Date.now();
      const quote = await this.getQuote(symbol, true);

      if (quote) {
        console.log(`[AlphaVantageService][DEBUG] getBatchQuotes fetched quote for ${symbol}:`, quote);
        return quote;
      } else if (retries > 0) {
        console.warn(`[AlphaVantageService][WARN] getBatchQuotes retrying ${symbol}, retries left: ${retries}`);
        await new Promise((res) => setTimeout(res, RATE_LIMIT_DELAY_MS));
        return fetchQuoteWithRetry(symbol, retries - 1);
      } else {
        console.warn(`[AlphaVantageService][DEBUG] getBatchQuotes quote for ${symbol} returned null (rate limit or error)`);
        return null;
      }
    };

    for (const symbol of symbols) {
      console.log(`[AlphaVantageService][DEBUG] getBatchQuotes looping symbol: ${symbol}`);
      results[symbol] = await fetchQuoteWithRetry(symbol);
    }

    console.log('[AlphaVantageService][DEBUG] getBatchQuotes all symbols processed:', results);
    return results;
  }

}

const alphaVantageService = new AlphaVantageService();
export default alphaVantageService;
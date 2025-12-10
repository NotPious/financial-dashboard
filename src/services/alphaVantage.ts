/**
 * Alpha Vantage API service
 * Handles all external API calls with error handling and rate limiting
 */

import axios, { AxiosInstance } from 'axios';
import {
  AlphaVantageQuoteResponse,
  AlphaVantageTimeSeriesResponse,
} from '../types/api.types';
import { StockQuote, ChartDataPoint } from '../types/stock.types';

class AlphaVantageService {
  private api: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY || '';
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_BASE_URL || 'https://www.alphavantage.co/query',
      timeout: 10000,
    });
  }

  /**
   * Fetch real-time stock quote
   * @param symbol - Stock symbol (e.g., 'AAPL')
   */
  async getQuote(symbol: string): Promise<StockQuote> {
    try {
      const response = await this.api.get<AlphaVantageQuoteResponse>('', {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol,
          apikey: this.apiKey,
        },
      });

      const quote = response.data['Global Quote'];
      
      if (!quote || !quote['01. symbol']) {
        throw new Error('Invalid API response or rate limit exceeded');
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
      console.error(`Error fetching quote for ${symbol}:`, error);
      throw new Error(`Failed to fetch quote for ${symbol}`);
    }
  }

  /**
   * Fetch time series data for charting
   * @param symbol - Stock symbol
   * @param interval - Time interval ('daily', 'weekly', 'monthly')
   */
  async getTimeSeries(
    symbol: string,
    interval: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<ChartDataPoint[]> {
    try {
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

      const response = await this.api.get<AlphaVantageTimeSeriesResponse>('', {
        params: {
          function: functionMap[interval],
          symbol,
          apikey: this.apiKey,
          outputsize: 'compact', // Last 100 data points
        },
      });

      // Cast response.data for dynamic key access and narrow timeSeries shape
      const key = keyMap[interval];
      const timeSeries = (response.data as any)[key] as Record<
        string,
        Record<string, string>
      > | undefined;
      
      if (!timeSeries || Object.keys(timeSeries).length === 0) {
        throw new Error('Invalid API response or rate limit exceeded');
      }

      // Transform API response to chart data points
      return Object.entries(timeSeries)
        .map(([date, data]) => ({
          date,
          open: parseFloat(data['1. open']),
          high: parseFloat(data['2. high']),
          low: parseFloat(data['3. low']),
          close: parseFloat(data['4. close']),
          volume: parseInt(data['5. volume'], 10),
        }))
        .reverse(); // Reverse to get chronological order
    } catch (error) {
      console.error(`Error fetching time series for ${symbol}:`, error);
      throw new Error(`Failed to fetch time series for ${symbol}`);
    }
  }

  /**
   * Fetch multiple quotes in batch (simulated)
   * Note: Alpha Vantage free tier doesn't support true batch requests
   */
  async getBatchQuotes(symbols: string[]): Promise<Record<string, StockQuote>> {
    const quotes: Record<string, StockQuote> = {};
    
    // Fetch quotes sequentially to respect API rate limits
    for (const symbol of symbols) {
      try {
        quotes[symbol] = await this.getQuote(symbol);
        // Add delay to respect rate limits (5 calls per minute on free tier)
        await this.delay(12000); // 12 seconds between calls
      } catch (error) {
        console.error(`Failed to fetch quote for ${symbol}:`, error);
      }
    }
    
    return quotes;
  }

  /**
   * Utility: Add delay between API calls
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new AlphaVantageService();
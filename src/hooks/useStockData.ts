/**
 * Custom hook for fetching and managing stock data
 * Separate quote fetch and time-series fetch
 * Implements caching and error handling
 * Minimizes rate limit usage
 */
import { useState, useEffect, useCallback } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { portfolioState, stockQuotesState, loadingState, errorState } from '../state/atoms';
import alphaVantageService from '../services/alphaVantage';
import { StockQuote, ChartDataPoint } from '../types/stock.types';

interface UseStockDataOptions {
  enabled?: boolean;
}

interface UseStockDataReturn {
  quote: StockQuote | null;
  chartData: ChartDataPoint[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Quote cache freshness window
const QUOTE_TTL_MS = Number(process.env.REACT_APP_QUOTE_TTL_MS || 60000); // 1 minute default

export const useStockData = (
  symbol: string, 
  interval: 'daily' | 'weekly' | 'monthly' = 'daily', 
  options?: UseStockDataOptions):UseStockDataReturn => {
  const enabled = options?.enabled ?? true;   // debug flag

  const [, setPortfolio] = useRecoilState(portfolioState);
  const [stockQuotes, setStockQuotes] = useRecoilState(stockQuotesState);

  const setLoading = useSetRecoilState(loadingState);
  const setError = useSetRecoilState(errorState);
  
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Check if we already have a recently fetched quote
  const cachedQuote = stockQuotes[symbol];
  const isQuoteFresh = cachedQuote && Date.now() - cachedQuote.timestamp.getTime() < QUOTE_TTL_MS;

  // Fetch and update the quote only when needed
  const fetchQuote  = useCallback(async () => {
    if (!enabled) return;             // <-- disabled → no API calls
    if (!symbol) return;

    const key = `stock-${symbol}`;

    // Skip API call if the cache is fresh
    if (isQuoteFresh) return;

    try {
      setLocalLoading(true);
      setLoading(prev => ({ ...prev, [key]: true }));
      setLocalError(null);
      setError(prev => ({ ...prev, [key]: null }));

      const quote = await alphaVantageService.getQuote(symbol);

      // Only accept quote if it has a price and symbol
      if (!quote || !quote.symbol || typeof quote.price !== 'number') {
        console.warn(`Invalid or rate-limited quote for ${symbol}`, quote);

        // Fallback: use cached quote even if stale
        if (cachedQuote) {
          console.log(`Using stale cached quote for ${symbol}`);
          return;
        }

        setLocalError('Failed to fetch valid quote');
        setError(prev => ({ ...prev, [key]: 'Failed to fetch valid quote' }));
        return;
      }

      // Update global state with new quote
      setStockQuotes(prev => ({ ...prev, [symbol]: quote }));

      // Update portfolio holdings with new quote data
      setPortfolio(prev => prev.map(h => 
        h.symbol === symbol 
          ? { 
              ...h,
              currentPrice: quote.price,
              totalValue: quote.price * h.shares,
              gainLoss: quote.price * h.shares - h.avgCost * h.shares,
              gainLossPercent: h.avgCost
                ? ((quote.price - h.avgCost) / h.avgCost) * 100
                : 0,
            } 
          : h
        ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stock data';
      setLocalError(errorMessage);
      setError(prev => ({ ...prev, [key]: errorMessage }));
    } finally {
      setLocalLoading(false);
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  }, [enabled, symbol, cachedQuote, isQuoteFresh, setStockQuotes, setPortfolio, setLoading, setError]);

  // Fetch time series independently to avoid doubling quote requests
  const fetchTimeSeries = useCallback(async () => {
    if (!enabled) return;     // <-- disabled → no API calls
    if (!symbol) return;

    try {
      const data = await alphaVantageService.getTimeSeries(symbol, interval);
      
      if (Array.isArray(data)) {
        if (data.length > 0) {
          // Valid chart data
          setChartData(data);
        } else {
          // Empty array returned, possibly due to rate limit or no data
          console.info(`[AlphaVantageService] No chart data for ${symbol} (possibly rate-limited or symbol unavailable).`);
          setChartData([]);
        }
      } else {
        // Unexpected response type
        console.warn(`[AlphaVantageService] Unexpected chart data for ${symbol}:`, data);
        setChartData([]);
      }
    } catch (err) {
      console.error(`Error fetching time series for ${symbol}:`, err);
      setChartData([]);
    }
  }, [enabled, symbol, interval]);

  // Initial quote load (or refresh when symbol changes)
/* TODO: [Refactor] Move quote fetching to a separate hook/component, for now it is unused, and Portfolio handles batch quotes
   useEffect(() => {
    if (!enabled) return;     // <-- do not auto-exec
    //    fetchQuote();
  }, [fetchQuote, enabled]);
*/

  // Fetch chart data when symbol or interval changes
  useEffect(() => {
    if (!enabled) return;     // <-- do not auto-exec
    fetchTimeSeries();
  }, [fetchTimeSeries, enabled]);

  // Manual refetch action
  const refetch = useCallback(async () => {
    if (!enabled) return;
    await fetchQuote();
    await fetchTimeSeries();
  }, [fetchQuote, fetchTimeSeries, enabled]);

  return {
    quote: stockQuotes[symbol] || null,
    chartData: chartData || [],
    loading: enabled ? localLoading : false,
    error: enabled ? localError : null,
    refetch,
  };
};
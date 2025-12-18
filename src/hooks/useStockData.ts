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
  const enabled = options?.enabled ?? true;   // <-- debug flag

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

      // Fetch quote
      const quote = await alphaVantageService.getQuote(symbol);

      if (!quote) {
        console.warn(`No fresh quote for ${symbol}`);
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
  }, [enabled, symbol, isQuoteFresh, setStockQuotes, setPortfolio, setLoading, setError]);

  // Fetch time series independently to avoid doubling quote requests
  const fetchTimeSeries = useCallback(async () => {
    if (!enabled) return;     // <-- disabled → no API calls
    if (!symbol) return;

    const data = await alphaVantageService.getTimeSeries(symbol, interval);
    setChartData(data);
  }, [enabled, symbol, interval]);

  /**
   * Initial quote load (or refresh when symbol changes)
   */
  useEffect(() => {
    if (!enabled) return;     // <-- do not auto-exec
    fetchQuote();
  }, [fetchQuote, enabled]);

  /**
   * Fetch chart data when symbol or interval changes
   */
  useEffect(() => {
    if (!enabled) return;     // <-- do not auto-exec
    fetchTimeSeries();
  }, [fetchTimeSeries, enabled]);

  /**
   * Manual refetch action
   */
  const refetch = useCallback(async () => {
    if (!enabled) return;
    await fetchQuote();
    await fetchTimeSeries();
  }, [fetchQuote, fetchTimeSeries, enabled]);

  return {
    quote: stockQuotes[symbol] || null,
    chartData,
    loading: enabled ? localLoading : false,
    error: enabled ? localError : null,
    refetch,
  };
};
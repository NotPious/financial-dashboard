/**
 * Custom hook for fetching and managing stock data
 * Implements caching and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { stockQuotesState, loadingState, errorState } from '../state/atoms';
import alphaVantageService from '../services/alphaVantage';
import { StockQuote, ChartDataPoint } from '../types/stock.types';

interface UseStockDataReturn {
  quote: StockQuote | null;
  chartData: ChartDataPoint[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useStockData = (symbol: string, interval: 'daily' | 'weekly' | 'monthly' = 'daily'): UseStockDataReturn => {
  const [stockQuotes, setStockQuotes] = useRecoilState(stockQuotesState);
  const setLoading = useSetRecoilState(loadingState);
  const setError = useSetRecoilState(errorState);
  
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const fetchStockData = useCallback(async () => {
    if (!symbol) return;

    const key = `stock-${symbol}`;
    setLocalLoading(true);
    setLoading(prev => ({ ...prev, [key]: true }));
    setLocalError(null);
    setError(prev => ({ ...prev, [key]: null }));

    try {
      // Fetch quote
      const quote = await alphaVantageService.getQuote(symbol);
      setStockQuotes(prev => ({ ...prev, [symbol]: quote }));

      // Fetch chart data
      const timeSeries = await alphaVantageService.getTimeSeries(symbol, interval);
      setChartData(timeSeries);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stock data';
      setLocalError(errorMessage);
      setError(prev => ({ ...prev, [key]: errorMessage }));
    } finally {
      setLocalLoading(false);
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  }, [symbol, interval, setStockQuotes, setLoading, setError]);

  useEffect(() => {
    fetchStockData();
  }, [fetchStockData]);

  return {
    quote: stockQuotes[symbol] || null,
    chartData,
    loading: localLoading,
    error: localError,
    refetch: fetchStockData,
  };
};
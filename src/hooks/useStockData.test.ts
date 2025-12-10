/**
 * Tests for useStockData hook
 * Following TDD principles
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

// Mock the API service BEFORE importing anything that uses it
// Note: __esModule: true is crucial for default exports
jest.mock('../services/alphaVantage', () => ({
  __esModule: true,
  default: {
    getQuote: jest.fn(),
    getTimeSeries: jest.fn(),
    getBatchQuotes: jest.fn(),
  },
}));

import { useStockData } from './useStockData';
import alphaVantageService from '../services/alphaVantage';

const mockQuote = {
  symbol: 'AAPL',
  price: 150.25,
  change: 2.5,
  changePercent: 1.69,
  volume: 50000000,
  timestamp: new Date('2025-01-15'),
};

const mockChartData = [
  {
    date: '2025-01-10',
    open: 145.0,
    high: 148.0,
    low: 144.0,
    close: 147.0,
    volume: 45000000,
  },
  {
    date: '2025-01-15',
    open: 147.5,
    high: 151.0,
    low: 146.5,
    close: 150.25,
    volume: 50000000,
  },
];

describe('useStockData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch stock quote and chart data successfully', async () => {
    // Arrange
    (alphaVantageService.getQuote as jest.Mock).mockResolvedValue(mockQuote);
    (alphaVantageService.getTimeSeries as jest.Mock).mockResolvedValue(mockChartData);

    // Act
   const { result } = renderHook(() => useStockData('AAPL'), {
      wrapper: RecoilRoot,
   });

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert final state
    expect(result.current.quote).toEqual(mockQuote);
    expect(result.current.chartData).toEqual(mockChartData);
    expect(result.current.error).toBeNull();
  });

  it('should handle API errors gracefully', async () => {
    // Arrange
    const errorMessage = 'API rate limit exceeded';
    (alphaVantageService.getQuote as jest.Mock).mockRejectedValue(new Error(errorMessage));

    // Act
    const { result } = renderHook(() => useStockData('AAPL'), {
      wrapper: RecoilRoot,
    });

    // Assert
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('API rate limit exceeded');
    expect(result.current.quote).toBeNull();
  });

  it('should refetch data when refetch is called', async () => {
    // Arrange
    (alphaVantageService.getQuote as jest.Mock).mockResolvedValue(mockQuote);
    (alphaVantageService.getTimeSeries as jest.Mock).mockResolvedValue(mockChartData);

    // Act
    const { result } = renderHook(() => useStockData('AAPL'), {
      wrapper: RecoilRoot,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear mock calls from initial render
    jest.clearAllMocks();

    // Trigger refetch wrapped in act
    await act(async () => {
      await result.current.refetch();
    });

    // Assert
    expect(alphaVantageService.getQuote).toHaveBeenCalledWith('AAPL');
    expect(alphaVantageService.getTimeSeries).toHaveBeenCalledWith('AAPL', 'daily');
  });

  it('should not fetch data if symbol is empty', async () => {
    // Arrange
    (alphaVantageService.getQuote as jest.Mock).mockResolvedValue(mockQuote);
    (alphaVantageService.getTimeSeries as jest.Mock).mockResolvedValue(mockChartData);

    // Act
    const { result } = renderHook(() => useStockData(''), {
      wrapper: RecoilRoot,
    });

    // Assert
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(alphaVantageService.getQuote).not.toHaveBeenCalled();
    expect(alphaVantageService.getTimeSeries).not.toHaveBeenCalled();
    expect(result.current.quote).toBeNull();
  });
});
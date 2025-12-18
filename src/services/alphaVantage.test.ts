/**
 * Tests for Alpha Vantage service
 */

// Mock axios BEFORE importing the service
jest.mock('axios', () => {
  // Create a mock axios instance that will be reused
  const mockAxiosInstance = {
    get: jest.fn(),
  };

return {
    create: () => mockAxiosInstance,
    // export the instance so tests can access it
    mockAxiosInstance,
  };
});

import axios from 'axios';
import alphaVantageService from './alphaVantage';

const { mockAxiosInstance } = axios as any;

describe('AlphaVantageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getQuote', () => {
    it('should fetch and parse stock quote', async () => {
      const mockResponse = {
        data: {
          'Global Quote': {
            '01. symbol': 'AAPL',
            '05. price': '150.25',
            '09. change': '2.50',
            '10. change percent': '1.69%',
            '06. volume': '50000000',
            '07. latest trading day': '2025-01-15',
          },
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      // Act
      const quote = await alphaVantageService.getQuote('AAPL');

      // Assert
      expect(quote).toEqual({
        symbol: 'AAPL',
        price: 150.25,
        change: 2.50,
        changePercent: 1.69,
        volume: 50000000,
        timestamp: new Date('2025-01-15'),
      });
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('', {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: 'AAPL',
          apikey: expect.any(String),
        },
      });
    });

    it('should throw error on invalid response', async () => {
      // Arrange - empty response
      const mockResponse = { data: {} };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(alphaVantageService.getQuote('INVALID')).rejects.toThrow(
        'Failed to fetch quote for INVALID'
      );
    });

    it('should throw error on network failure', async () => {
      // Arrange
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(alphaVantageService.getQuote('AAPL')).rejects.toThrow(
        'Failed to fetch quote for AAPL'
      );
    });
  });

  describe('getTimeSeries', () => {
    it('should fetch and parse time series data', async () => {
      // Arrange
      const mockResponse = {
        data: {
          'Meta Data': {
            '1. Information': 'Daily Prices',
            '2. Symbol': 'AAPL',
            '3. Last Refreshed': '2025-01-15',
            '6. Time Zone': 'US/Eastern',
          },
          'Time Series (Daily)': {
            '2025-01-15': {
              '1. open': '148.00',
              '2. high': '151.00',
              '3. low': '147.00',
              '4. close': '150.25',
              '5. volume': '50000000',
            },
          },
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      // Act
      const timeSeries = await alphaVantageService.getTimeSeries('AAPL', 'daily');

      // Assert
      expect(timeSeries).toHaveLength(1);
      expect(timeSeries[0]).toEqual({
        date: '2025-01-15',
        open: 148.00,
        high: 151.00,
        low: 147.00,
        close: 150.25,
        volume: 50000000,
      });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('', {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: 'AAPL',
          apikey: expect.any(String),
//          outputsize: 'compact',
        },
      });
    });

    it('should handle weekly time series', async () => {
      // Arrange
      const mockResponse = {
        data: {
          'Time Series (Weekly)': {
            '2025-01-10': {
              '1. open': '145.00',
              '2. high': '151.00',
              '3. low': '144.00',
              '4. close': '150.25',
              '5. volume': '250000000',
            },
          },
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      // Act
      const timeSeries = await alphaVantageService.getTimeSeries('AAPL', 'weekly');

      // Assert
      expect(timeSeries).toHaveLength(1);
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('', {
        params: {
          function: 'TIME_SERIES_WEEKLY',
          symbol: 'AAPL',
          apikey: expect.any(String),
//          outputsize: 'compact',
        },
      });
    });

    it('should throw error on invalid time series response', async () => {
      // Arrange
      const mockResponse = { data: {} };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(alphaVantageService.getTimeSeries('INVALID', 'daily')).rejects.toThrow(
        'Failed to fetch time series for INVALID'
      );
    });

    it('should throw error on network failure', async () => {
      // Arrange
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(alphaVantageService.getTimeSeries('AAPL', 'daily')).rejects.toThrow(
        'Failed to fetch time series for AAPL'
      );
    });
  });
});
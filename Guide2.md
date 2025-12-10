# Financial Dashboard - Part 2: Hooks, Components & Tests

## Custom Hooks

### 1. src/hooks/useStockData.ts
```typescript
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
```

### 2. src/hooks/useStockData.test.ts
```typescript
/**
 * Tests for useStockData hook
 * Following TDD principles
 */

import { renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { useStockData } from './useStockData';
import alphaVantageService from '../services/alphaVantage';

// Mock the API service
jest.mock('../services/alphaVantage');

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

    // Assert - Initial state
    expect(result.current.loading).toBe(true);
    expect(result.current.quote).toBeNull();
    expect(result.current.chartData).toEqual([]);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

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

    expect(result.current.error).toBe(`Failed to fetch stock data`);
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

    // Trigger refetch
    await result.current.refetch();

    // Assert
    expect(alphaVantageService.getQuote).toHaveBeenCalledWith('AAPL');
    expect(alphaVantageService.getTimeSeries).toHaveBeenCalledWith('AAPL', 'daily');
  });

  it('should not fetch data if symbol is empty', async () => {
    // Act
    const { result } = renderHook(() => useStockData(''), {
      wrapper: RecoilRoot,
    });

    // Assert
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(alphaVantageService.getQuote).not.toHaveBeenCalled();
    expect(result.current.quote).toBeNull();
  });
});
```

## React Components

### 3. src/components/Layout/Header.tsx
```typescript
/**
 * Header component with navigation and branding
 * Accessible and responsive
 */

import React from 'react';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'Financial Dashboard' }) => {
  return (
    <header
      className="bg-neutral-900 text-white shadow-lg"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center font-bold text-xl"
              aria-hidden="true"
            >
              FD
            </div>
            <h1 className="text-xl font-semibold tracking-tight">
              {title}
            </h1>
          </div>

          {/* Navigation */}
          <nav aria-label="Main navigation">
            <ul className="flex space-x-6">
              <li>
                <a
                  href="#dashboard"
                  className="text-neutral-300 hover:text-white transition-colors focus:outline-none focus:text-white"
                  aria-current="page"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="#portfolio"
                  className="text-neutral-300 hover:text-white transition-colors focus:outline-none focus:text-white"
                >
                  Portfolio
                </a>
              </li>
              <li>
                <a
                  href="#markets"
                  className="text-neutral-300 hover:text-white transition-colors focus:outline-none focus:text-white"
                >
                  Markets
                </a>
              </li>
            </ul>
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            <button
              className="text-neutral-300 hover:text-white transition-colors focus:outline-none"
              aria-label="Notifications"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
            <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center font-semibold">
              <span aria-label="User profile">JD</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
```

### 4. src/components/Layout/Header.test.tsx
```typescript
/**
 * Tests for Header component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from './Header';

describe('Header', () => {
  it('should render with default title', () => {
    render(<Header />);
    
    expect(screen.getByText('Financial Dashboard')).toBeInTheDocument();
  });

  it('should render with custom title', () => {
    render(<Header title="Executive Dashboard" />);
    
    expect(screen.getByText('Executive Dashboard')).toBeInTheDocument();
  });

  it('should have accessible navigation', () => {
    render(<Header />);
    
    const nav = screen.getByRole('navigation', { name: /main navigation/i });
    expect(nav).toBeInTheDocument();
    
    expect(screen.getByText('Dashboard')).toHaveAttribute('href', '#dashboard');
    expect(screen.getByText('Portfolio')).toHaveAttribute('href', '#portfolio');
    expect(screen.getByText('Markets')).toHaveAttribute('href', '#markets');
  });

  it('should have accessible banner role', () => {
    render(<Header />);
    
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('should have notification button with aria-label', () => {
    render(<Header />);
    
    const notificationBtn = screen.getByRole('button', { name: /notifications/i });
    expect(notificationBtn).toBeInTheDocument();
  });

  it('should display user initials', () => {
    render(<Header />);
    
    expect(screen.getByLabelText('User profile')).toHaveTextContent('JD');
  });
});
```

### 5. src/components/StockChart/StockChart.tsx
```typescript
/**
 * Stock chart component using Recharts
 * Displays candlestick or line chart with volume
 */

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartDataPoint } from '../../types/stock.types';
import { formatCurrency, formatDate, formatLargeNumber } from '../../utils/formatters';

interface StockChartProps {
  data: ChartDataPoint[];
  symbol: string;
  loading?: boolean;
}

const StockChart: React.FC<StockChartProps> = ({ data, symbol, loading = false }) => {
  // Memoize chart data processing
  const chartData = useMemo(() => {
    return data.map(point => ({
      ...point,
      formattedDate: formatDate(point.date),
    }));
  }, [data]);

  if (loading) {
    return (
      <div
        className="card flex items-center justify-center h-96"
        role="status"
        aria-live="polite"
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"
            aria-hidden="true"
          />
          <p className="mt-4 text-neutral-600">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card flex items-center justify-center h-96">
        <p className="text-neutral-500">No chart data available</p>
      </div>
    );
  }

  return (
    <div className="card" role="region" aria-label={`Stock chart for ${symbol}`}>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-neutral-900">
          {symbol} Price Chart
        </h2>
        <div className="text-sm text-neutral-500">
          Last updated: {formatDate(data[data.length - 1]?.date)}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="formattedDate"
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis
            yAxisId="price"
            orientation="left"
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickFormatter={(value) => `$${value}`}
            domain={['auto', 'auto']}
          />
          <YAxis
            yAxisId="volume"
            orientation="right"
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickFormatter={formatLargeNumber}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'volume') return [formatLargeNumber(value), 'Volume'];
              return [formatCurrency(value), name];
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          
          {/* Price line */}
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="close"
            stroke="#0284c7"
            strokeWidth={2}
            dot={false}
            name="Close Price"
            activeDot={{ r: 6 }}
          />
          
          {/* Volume bars */}
          <Bar
            yAxisId="volume"
            dataKey="volume"
            fill="#94a3b8"
            opacity={0.3}
            name="Volume"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;
```

### 6. src/components/StockChart/StockChart.test.tsx
```typescript
/**
 * Tests for StockChart component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StockChart from './StockChart';
import { ChartDataPoint } from '../../types/stock.types';

const mockData: ChartDataPoint[] = [
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

describe('StockChart', () => {
  it('should render loading state', () => {
    render(<StockChart data={[]} symbol="AAPL" loading={true} />);
    
    expect(screen.getByText(/loading chart data/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render empty state when no data', () => {
    render(<StockChart data={[]} symbol="AAPL" loading={false} />);
    
    expect(screen.getByText(/no chart data available/i)).toBeInTheDocument();
  });

  it('should render chart with data', () => {
    render(<StockChart data={mockData} symbol="AAPL" loading={false} />);
    
    expect(screen.getByText('AAPL Price Chart')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /stock chart for aapl/i })).toBeInTheDocument();
  });

  it('should display last updated date', () => {
    render(<StockChart data={mockData} symbol="AAPL" loading={false} />);
    
    expect(screen.getByText(/last updated:/i)).toBeInTheDocument();
  });

  it('should be accessible', () => {
    const { container } = render(<StockChart data={mockData} symbol="AAPL" loading={false} />);
    
    // Check for aria-label
    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-label', 'Stock chart for AAPL');
  });
});
```

### 7. src/components/MarketOverview/MarketOverview.tsx
```typescript
/**
 * Market overview component
 * Displays key market indices and statistics
 */

import React from 'react';
import { MarketIndex } from '../../types/stock.types';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface MarketOverviewProps {
  indices: MarketIndex[];
  loading?: boolean;
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ indices, loading = false }) => {
  if (loading) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Market Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
              <div className="h-6 bg-neutral-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section
      className="card"
      role="region"
      aria-label="Market overview"
    >
      <h2 className="text-xl font-semibold mb-4 text-neutral-900">
        Market Overview
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {indices.map((index) => {
          const isPositive = index.change >= 0;
          
          return (
            <div
              key={index.symbol}
              className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-neutral-900">
                    {index.name}
                  </h3>
                  <p className="text-sm text-neutral-500">
                    {index.symbol}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isPositive
                      ? 'bg-success-100 text-success-800'
                      : 'bg-danger-100 text-danger-800'
                  }`}
                  aria-label={`${isPositive ? 'Positive' : 'Negative'} change`}
                >
                  {isPositive ? '↑' : '↓'} {formatPercent(Math.abs(index.changePercent))}
                </span>
              </div>
              
              <div className="mt-3">
                <p className="text-2xl font-bold text-neutral-900">
                  {formatCurrency(index.value, 2)}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    isPositive ? 'text-success-600' : 'text-danger-600'
                  }`}
                >
                  {isPositive ? '+' : ''}{formatCurrency(index.change, 2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MarketOverview;
```

### 8. src/components/MarketOverview/MarketOverview.test.tsx
```typescript
/**
 * Tests for MarketOverview component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MarketOverview from './MarketOverview';
import { MarketIndex } from '../../types/stock.types';

const mockIndices: MarketIndex[] = [
  {
    name: 'S&P 500',
    symbol: 'SPX',
    value: 4500.25,
    change: 25.50,
    changePercent: 0.57,
  },
  {
    name: 'Dow Jones',
    symbol: 'DJI',
    value: 35000.75,
    change: -150.25,
    changePercent: -0.43,
  },
];

describe('MarketOverview', () => {
  it('should render loading state', () => {
    render(<MarketOverview indices={[]} loading={true} />);
    
    expect(screen.getByText('Market Overview')).toBeInTheDocument();
    // Check for loading skeleton
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render market indices', () => {
    render(<MarketOverview indices={mockIndices} loading={false} />);
    
    expect(screen.getByText('S&P 500')).toBeInTheDocument();
    expect(screen.getByText('SPX')).toBeInTheDocument();
    expect(screen.getByText('Dow Jones')).toBeInTheDocument();
    expect(screen.getByText('DJI')).toBeInTheDocument();
  });

  it('should display positive changes correctly', () => {
    render(<MarketOverview indices={mockIndices} loading={false} />);
    
    // S&P 500 is positive
    expect(screen.getByText(/\+0\.57%/i)).toBeInTheDocument();
    expect(screen.getByText('$4,500.25')).toBeInTheDocument();
  });

  it('should display negative changes correctly', () => {
    render(<MarketOverview indices={mockIndices} loading={false} />);
    
    // Dow Jones is negative
    expect(screen.getByText(/-0\.43%/i)).toBeInTheDocument();
  });

  it('should have accessible region label', () => {
    render(<MarketOverview indices={mockIndices} loading={false} />);
    
    const region = screen.getByRole('region', { name: /market overview/i });
    expect(region).toBeInTheDocument();
  });

  it('should show up/down arrows for changes', () => {
    render(<MarketOverview indices={mockIndices} loading={false} />);
    
    // Check for positive/negative aria-labels
    expect(screen.getByLabelText(/positive change/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/negative change/i)).toBeInTheDocument();
  });
});
```

Continue to Part 3 for Dashboard, Portfolio components, and main App...

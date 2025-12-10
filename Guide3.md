# Financial Dashboard - Part 3: Dashboard, Portfolio & App

## Main Components

### 1. src/components/PortfolioSummary/PortfolioSummary.tsx
```typescript
/**
 * Portfolio summary component
 * Displays holdings and performance metrics
 */

import React from 'react';
import { PortfolioHolding } from '../../types/stock.types';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface PortfolioSummaryProps {
  holdings: PortfolioHolding[];
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  loading?: boolean;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  holdings,
  totalValue,
  totalGainLoss,
  totalGainLossPercent,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Portfolio Summary</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-neutral-200 rounded" />
          <div className="h-40 bg-neutral-200 rounded" />
        </div>
      </div>
    );
  }

  const isPositiveReturn = totalGainLoss >= 0;

  return (
    <section
      className="card"
      role="region"
      aria-label="Portfolio summary"
    >
      <h2 className="text-xl font-semibold mb-4 text-neutral-900">
        Portfolio Summary
      </h2>

      {/* Total Value Card */}
      <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-primary-700 font-medium mb-1">
              Total Portfolio Value
            </p>
            <p className="text-3xl font-bold text-primary-900">
              {formatCurrency(totalValue)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-primary-700 font-medium mb-1">
              Total Return
            </p>
            <p
              className={`text-2xl font-bold ${
                isPositiveReturn ? 'text-success-600' : 'text-danger-600'
              }`}
            >
              {isPositiveReturn ? '+' : ''}{formatCurrency(totalGainLoss)}
            </p>
            <p
              className={`text-sm ${
                isPositiveReturn ? 'text-success-600' : 'text-danger-600'
              }`}
            >
              {formatPercent(totalGainLossPercent)}
            </p>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="overflow-x-auto">
        <table className="w-full" role="table" aria-label="Portfolio holdings">
          <thead>
            <tr className="border-b border-neutral-200">
              <th
                scope="col"
                className="text-left py-3 px-4 text-sm font-semibold text-neutral-700"
              >
                Symbol
              </th>
              <th
                scope="col"
                className="text-right py-3 px-4 text-sm font-semibold text-neutral-700"
              >
                Shares
              </th>
              <th
                scope="col"
                className="text-right py-3 px-4 text-sm font-semibold text-neutral-700"
              >
                Avg Cost
              </th>
              <th
                scope="col"
                className="text-right py-3 px-4 text-sm font-semibold text-neutral-700"
              >
                Current Price
              </th>
              <th
                scope="col"
                className="text-right py-3 px-4 text-sm font-semibold text-neutral-700"
              >
                Total Value
              </th>
              <th
                scope="col"
                className="text-right py-3 px-4 text-sm font-semibold text-neutral-700"
              >
                Gain/Loss
              </th>
            </tr>
          </thead>
          <tbody>
            {holdings.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-neutral-500">
                  No holdings in portfolio
                </td>
              </tr>
            ) : (
              holdings.map((holding) => {
                const isPositive = holding.gainLoss >= 0;
                
                return (
                  <tr
                    key={holding.symbol}
                    className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-neutral-900">
                      {holding.symbol}
                    </td>
                    <td className="py-3 px-4 text-right text-neutral-700">
                      {holding.shares.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-neutral-700">
                      {formatCurrency(holding.avgCost)}
                    </td>
                    <td className="py-3 px-4 text-right text-neutral-700">
                      {formatCurrency(holding.currentPrice)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-neutral-900">
                      {formatCurrency(holding.totalValue)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div
                        className={`${
                          isPositive ? 'text-success-600' : 'text-danger-600'
                        }`}
                      >
                        <div className="font-medium">
                          {isPositive ? '+' : ''}{formatCurrency(holding.gainLoss)}
                        </div>
                        <div className="text-sm">
                          {formatPercent(holding.gainLossPercent)}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default PortfolioSummary;
```

### 2. src/components/PortfolioSummary/PortfolioSummary.test.tsx
```typescript
/**
 * Tests for PortfolioSummary component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PortfolioSummary from './PortfolioSummary';
import { PortfolioHolding } from '../../types/stock.types';

const mockHoldings: PortfolioHolding[] = [
  {
    symbol: 'AAPL',
    shares: 100,
    avgCost: 140.0,
    currentPrice: 150.0,
    totalValue: 15000.0,
    gainLoss: 1000.0,
    gainLossPercent: 7.14,
  },
  {
    symbol: 'GOOGL',
    shares: 50,
    avgCost: 2800.0,
    currentPrice: 2750.0,
    totalValue: 137500.0,
    gainLoss: -2500.0,
    gainLossPercent: -1.79,
  },
];

describe('PortfolioSummary', () => {
  it('should render loading state', () => {
    render(
      <PortfolioSummary
        holdings={[]}
        totalValue={0}
        totalGainLoss={0}
        totalGainLossPercent={0}
        loading={true}
      />
    );
    
    expect(screen.getByText('Portfolio Summary')).toBeInTheDocument();
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should render portfolio metrics', () => {
    render(
      <PortfolioSummary
        holdings={mockHoldings}
        totalValue={152500}
        totalGainLoss={-1500}
        totalGainLossPercent={-0.97}
        loading={false}
      />
    );
    
    expect(screen.getByText('$152,500.00')).toBeInTheDocument();
    expect(screen.getByText('-$1,500.00')).toBeInTheDocument();
    expect(screen.getByText('-0.97%')).toBeInTheDocument();
  });

  it('should render holdings table', () => {
    render(
      <PortfolioSummary
        holdings={mockHoldings}
        totalValue={152500}
        totalGainLoss={-1500}
        totalGainLossPercent={-0.97}
        loading={false}
      />
    );
    
    expect(screen.getByRole('table', { name: /portfolio holdings/i })).toBeInTheDocument();
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('GOOGL')).toBeInTheDocument();
  });

  it('should display positive gains in green', () => {
    render(
      <PortfolioSummary
        holdings={mockHoldings}
        totalValue={152500}
        totalGainLoss={1500}
        totalGainLossPercent={0.99}
        loading={false}
      />
    );
    
    const positiveValue = screen.getByText('+$1,500.00');
    expect(positiveValue).toHaveClass('text-success-600');
  });

  it('should display negative losses in red', () => {
    render(
      <PortfolioSummary
        holdings={mockHoldings}
        totalValue={152500}
        totalGainLoss={-1500}
        totalGainLossPercent={-0.97}
        loading={false}
      />
    );
    
    const negativeValue = screen.getByText('-$1,500.00');
    expect(negativeValue).toHaveClass('text-danger-600');
  });

  it('should show empty state when no holdings', () => {
    render(
      <PortfolioSummary
        holdings={[]}
        totalValue={0}
        totalGainLoss={0}
        totalGainLossPercent={0}
        loading={false}
      />
    );
    
    expect(screen.getByText(/no holdings in portfolio/i)).toBeInTheDocument();
  });

  it('should be accessible with proper ARIA labels', () => {
    render(
      <PortfolioSummary
        holdings={mockHoldings}
        totalValue={152500}
        totalGainLoss={-1500}
        totalGainLossPercent={-0.97}
        loading={false}
      />
    );
    
    expect(screen.getByRole('region', { name: /portfolio summary/i })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: /portfolio holdings/i })).toBeInTheDocument();
  });
});
```

### 3. src/components/Dashboard/Dashboard.tsx
```typescript
/**
 * Main dashboard component - Micro-frontend container
 * Orchestrates all child components
 */

import React, { useEffect } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import {
  selectedSymbolState,
  watchlistState,
  portfolioState,
  marketIndicesState,
} from '../../state/atoms';
import {
  totalPortfolioValueSelector,
  totalPortfolioGainLossSelector,
} from '../../state/selectors';
import { useStockData } from '../../hooks/useStockData';
import Header from '../Layout/Header';
import MarketOverview from '../MarketOverview/MarketOverview';
import StockChart from '../StockChart/StockChart';
import PortfolioSummary from '../PortfolioSummary/PortfolioSummary';

const Dashboard: React.FC = () => {
  const selectedSymbol = useRecoilValue(selectedSymbolState);
  const watchlist = useRecoilValue(watchlistState);
  const [portfolio, setPortfolio] = useRecoilState(portfolioState);
  const [marketIndices, setMarketIndices] = useRecoilState(marketIndicesState);
  
  const totalValue = useRecoilValue(totalPortfolioValueSelector);
  const gainLoss = useRecoilValue(totalPortfolioGainLossSelector);
  
  const { quote, chartData, loading, error } = useStockData(selectedSymbol);

  // Initialize demo data on mount
  useEffect(() => {
    // Demo portfolio data
    if (portfolio.length === 0) {
      setPortfolio([
        {
          symbol: 'AAPL',
          shares: 100,
          avgCost: 140.0,
          currentPrice: 150.0,
          totalValue: 15000.0,
          gainLoss: 1000.0,
          gainLossPercent: 7.14,
        },
        {
          symbol: 'GOOGL',
          shares: 50,
          avgCost: 2800.0,
          currentPrice: 2750.0,
          totalValue: 137500.0,
          gainLoss: -2500.0,
          gainLossPercent: -1.79,
        },
      ]);
    }

    // Demo market indices
    if (marketIndices.length === 0) {
      setMarketIndices([
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
        {
          name: 'NASDAQ',
          symbol: 'IXIC',
          value: 14200.50,
          change: 75.30,
          changePercent: 0.53,
        },
      ]);
    }
  }, [portfolio.length, marketIndices.length, setPortfolio, setMarketIndices]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header title="Executive Financial Dashboard" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Skip to content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-md"
        >
          Skip to main content
        </a>

        <div id="main-content" className="space-y-6">
          {/* Market Overview Section */}
          <MarketOverview indices={marketIndices} loading={false} />

          {/* Two-column layout for chart and portfolio */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Chart */}
            <div className="lg:col-span-2">
              {error ? (
                <div
                  className="card bg-danger-50 border-danger-200"
                  role="alert"
                  aria-live="assertive"
                >
                  <p className="text-danger-800">
                    <strong>Error:</strong> {error}
                  </p>
                  <p className="text-sm text-danger-600 mt-2">
                    Please check your API key in the .env file and ensure you haven't exceeded rate limits.
                  </p>
                </div>
              ) : (
                <StockChart
                  data={chartData}
                  symbol={selectedSymbol}
                  loading={loading}
                />
              )}
            </div>

            {/* Portfolio Summary */}
            <div className="lg:col-span-2">
              <PortfolioSummary
                holdings={portfolio}
                totalValue={totalValue}
                totalGainLoss={gainLoss.amount}
                totalGainLossPercent={gainLoss.percent}
                loading={false}
              />
            </div>
          </div>

          {/* Watchlist Section */}
          <section
            className="card"
            role="region"
            aria-label="Stock watchlist"
          >
            <h2 className="text-xl font-semibold mb-4 text-neutral-900">
              Watchlist
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {watchlist.map((symbol) => (
                <button
                  key={symbol}
                  className={`p-4 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    symbol === selectedSymbol
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-neutral-200 hover:border-primary-300'
                  }`}
                  onClick={() => {
                    // Would update selectedSymbolState here
                    console.log(`Selected: ${symbol}`);
                  }}
                  aria-pressed={symbol === selectedSymbol}
                >
                  <span className="font-semibold text-neutral-900">
                    {symbol}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm">
            © 2025 Financial Dashboard. Data provided by Alpha Vantage.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
```

### 4. src/components/Dashboard/Dashboard.test.tsx
```typescript
/**
 * Tests for Dashboard component
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import '@testing-library/jest-dom';
import Dashboard from './Dashboard';
import { useStockData } from '../../hooks/useStockData';

// Mock the custom hook
jest.mock('../../hooks/useStockData');

const mockUseStockData = useStockData as jest.MockedFunction<typeof useStockData>;

describe('Dashboard', () => {
  beforeEach(() => {
    mockUseStockData.mockReturnValue({
      quote: {
        symbol: 'AAPL',
        price: 150.25,
        change: 2.5,
        changePercent: 1.69,
        volume: 50000000,
        timestamp: new Date('2025-01-15'),
      },
      chartData: [],
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it('should render the dashboard with all sections', async () => {
    render(
      <RecoilRoot>
        <Dashboard />
      </RecoilRoot>
    );

    await waitFor(() => {
      expect(screen.getByText('Executive Financial Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Market Overview')).toBeInTheDocument();
      expect(screen.getByText('Portfolio Summary')).toBeInTheDocument();
      expect(screen.getByText('Watchlist')).toBeInTheDocument();
    });
  });

  it('should have accessible skip link', () => {
    render(
      <RecoilRoot>
        <Dashboard />
      </RecoilRoot>
    );

    const skipLink = screen.getByText(/skip to main content/i);
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('should display error message when API fails', async () => {
    mockUseStockData.mockReturnValue({
      quote: null,
      chartData: [],
      loading: false,
      error: 'API rate limit exceeded',
      refetch: jest.fn(),
    });

    render(
      <RecoilRoot>
        <Dashboard />
      </RecoilRoot>
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/API rate limit exceeded/i)).toBeInTheDocument();
    });
  });

  it('should render watchlist with proper ARIA attributes', async () => {
    render(
      <RecoilRoot>
        <Dashboard />
      </RecoilRoot>
    );

    await waitFor(() => {
      const watchlistSection = screen.getByRole('region', { name: /stock watchlist/i });
      expect(watchlistSection).toBeInTheDocument();
      
      const watchlistButtons = screen.getAllByRole('button', { pressed: false });
      expect(watchlistButtons.length).toBeGreaterThan(0);
    });
  });

  it('should have accessible landmark regions', async () => {
    render(
      <RecoilRoot>
        <Dashboard />
      </RecoilRoot>
    );

    await waitFor(() => {
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });
  });
});
```

### 5. src/App.tsx
```typescript
/**
 * Root application component
 * Sets up Recoil state management and routes
 */

import React from 'react';
import { RecoilRoot } from 'recoil';
import Dashboard from './components/Dashboard/Dashboard';

const App: React.FC = () => {
  return (
    <RecoilRoot>
      <Dashboard />
    </RecoilRoot>
  );
};

export default App;
```

### 6. src/App.test.tsx
```typescript
/**
 * Tests for App component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { useStockData } from './hooks/useStockData';

// Mock the custom hook
jest.mock('./hooks/useStockData');

const mockUseStockData = useStockData as jest.MockedFunction<typeof useStockData>;

describe('App', () => {
  beforeEach(() => {
    mockUseStockData.mockReturnValue({
      quote: null,
      chartData: [],
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it('should render without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Financial Dashboard/i)).toBeInTheDocument();
  });

  it('should wrap components in RecoilRoot', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
```

### 7. src/index.tsx
```typescript
/**
 * Application entry point
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Continue to Part 4 for utilities tests, setup scripts, and final instructions...

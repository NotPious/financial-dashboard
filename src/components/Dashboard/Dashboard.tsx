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
  
  const { chartData, loading, error } = useStockData(selectedSymbol);

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
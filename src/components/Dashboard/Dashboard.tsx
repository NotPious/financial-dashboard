import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { selectedSymbolState, watchlistState, marketIndicesState } from '../../state/atoms';
import { totalPortfolioValueSelector, totalPortfolioGainLossSelector } from '../../state/selectors';

import { useStockData } from '../../hooks/useStockData';
import { useMarketIndices } from '../../hooks/useMarketIndices';
import { usePortfolioData } from '../../hooks/usePortfolioData';

import Header from '../Layout/Header';
import MarketOverview from '../MarketOverview/MarketOverview';
import StockChart from '../StockChart/StockChart';
import PortfolioSummary from '../PortfolioSummary/PortfolioSummary';

interface DashboardProps {
  debugSection?: 'market' | 'stock' | 'portfolio';
}

const Dashboard: React.FC<DashboardProps> = ({ debugSection }) => {
  // Determine which section is active
  const activeMarket = !debugSection || debugSection === 'market';
  const activeStock = !debugSection || debugSection === 'stock';
  const activePortfolio = !debugSection || debugSection === 'portfolio';

  // Recoil state and selectors
  const [selectedSymbol, setSelectedSymbol] = useRecoilState(selectedSymbolState);
  const watchlist = useRecoilValue(watchlistState);
  const totalValue = useRecoilValue(totalPortfolioValueSelector);
  const gainLoss = useRecoilValue(totalPortfolioGainLossSelector);

  // Call hooks with polling enabled/disabled based on section visibility
  const marketHook = useMarketIndices({ enabled: activeMarket });
  const stockHook = useStockData(selectedSymbol, "daily", { enabled: activeStock })
  const portfolioHook = usePortfolioData({ enabled: activePortfolio })

  const marketIndices = useRecoilValue(marketIndicesState);
  console.log("Market indices from Recoil state in Dashboard:", marketIndices);

  console.log('MarketHook data:', marketHook.data); // Log data here

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header title="Executive Financial Dashboard" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-md"
        >
          Skip to main content
        </a>

        <div id="main-content" className="space-y-6">
          {/* Market Overview Section */}
          {!debugSection || debugSection === 'market'
          ? (
              <>
              {marketHook.error ? (
              <div className="card bg-danger-50 border-danger-200 p-4">
                <p className="text-danger-800 font-semibold">Error loading market indices.</p>
              </div>
            ) : (
              <MarketOverview
                indices={marketHook.data}
                loading={marketHook.loading}
              />
            )}
          </>
        ) : null }

          {/* Two-column layout for chart and portfolio */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Chart */}
            {!debugSection || debugSection === 'stock'
            ? (
            <div className="lg:col-span-2">
              {stockHook.error ? (
                <div className="card bg-danger-50 border-danger-200 p-4" role="alert">
                  <p className="text-danger-800 font-semibold">Error loading chart data: {stockHook.error}</p>
                  <p className="text-sm text-danger-600 mt-2">Please check your API key or rate limits.</p>
                </div>
              ) : (
                <StockChart
                  data={stockHook.chartData}
                  symbol={selectedSymbol}
                  loading={stockHook.loading}
                />
              )}
            </div>
            )
            : null}

            {/* Portfolio Summary */}
            {!debugSection || debugSection === 'portfolio'
            ? (
            <div className="lg:col-span-2">
              {portfolioHook.error
              ? (
                <div className="card bg-danger-50 border-danger-200 p-4">
                  <p className="text-danger-800 font-semibold">Error loading portfolio.</p>
                </div>
                ) 
                : (
                  <PortfolioSummary
                    holdings={portfolioHook.data}
                    totalValue={totalValue}
                    totalGainLoss={gainLoss.amount}
                    totalGainLossPercent={gainLoss.percent}
                    loading={portfolioHook.loading}
                  />
                )
              }
            </div>
            ) 
            : null}
          </div>

          {/* Watchlist Section */}
          {!debugSection || debugSection === 'stock'
          ? (
          <section className="card" aria-label="Stock watchlist">
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
                  onClick={() => setSelectedSymbol(symbol)}
                  aria-pressed={symbol === selectedSymbol}
                >
                  <span className="font-semibold text-neutral-900">{symbol}</span>
                </button>
              ))}
            </div>
          </section>
          )
          : null }
        </div>
      </main>

      <footer className="bg-neutral-900 text-neutral-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm">
            © 2025 Eric Young. Data provided by Alpha Vantage & Finnhub.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
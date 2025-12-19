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
  waitMs?: number;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  holdings,
  totalValue,
  totalGainLoss,
  totalGainLossPercent,
  loading = false,
  waitMs = 0, // 👈 default
}) => {

  const secondsRemaining = Math.ceil(waitMs / 1000);
  const showCountdown = loading && waitMs > 0;

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Portfolio Summary</h2>

        <div className="flex items-center gap-3 text-sm text-neutral-600 mb-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-primary-600" />
          {showCountdown ? (
            <span>Updating portfolio in {secondsRemaining}s (API rate limit)</span>
          ) : (
            <span>Loading portfolio data…</span>
          )}
        </div>

        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-neutral-200 rounded" />
          <div className="h-40 bg-neutral-200 rounded" />
        </div>
      </div>
    );
  }

  const holdingsWithQuote = holdings.filter(h => h.hasQuote);

  totalValue = holdingsWithQuote.reduce((sum, h) => sum + h.totalValue, 0);
  totalGainLoss = holdingsWithQuote.reduce((sum, h) => sum + h.gainLoss, 0);
  totalGainLossPercent = totalValue !== 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;

  const isPositiveReturn = totalGainLoss >= 0;
  const allHaveQuotes = holdings.every(h => h.hasQuote); // helper for displaying dashes when data missing for high level totals

  return (
    <section
      className="card"
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
              {allHaveQuotes ? formatCurrency(totalValue) : '–'}
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
              {allHaveQuotes
                ? `${isPositiveReturn ? '+' : ''}${formatCurrency(totalGainLoss)}`
                : '–'}
            </p>
            <p
              className={`text-sm ${
                isPositiveReturn ? 'text-success-600' : 'text-danger-600'
              }`}
            >
              {allHaveQuotes ? formatPercent(totalGainLossPercent) : '–'}
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
                const isPositive = holding.gainLoss != null && holding.gainLoss >= 0;
                const hasQuote = holding.hasQuote ?? true; // fallback to true if field not present

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
                      {hasQuote && holding.avgCost != null ? formatCurrency(holding.avgCost) : '–'}
                    </td>
                    <td className="py-3 px-4 text-right text-neutral-700">
                      {hasQuote && holding.currentPrice != null ? formatCurrency(holding.currentPrice) : '–'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-neutral-900">
                      {hasQuote && holding.totalValue != null ? formatCurrency(holding.totalValue) : '–'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className={`${isPositive ? 'text-success-600' : 'text-danger-600'}`}>
                        <div className="font-medium">
                          {hasQuote && holding.gainLoss != null
                            ? `${isPositive ? '+' : ''}${formatCurrency(holding.gainLoss)}`
                            : '–'}
                        </div>
                        <div className="text-sm">
                          {hasQuote && holding.gainLossPercent != null
                            ? formatPercent(holding.gainLossPercent)
                            : '–'}
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
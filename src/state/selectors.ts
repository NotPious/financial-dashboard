/**
 * Recoil selectors for derived state
 */

import { selector } from 'recoil';
import { portfolioState, stockQuotesState } from './atoms';

// Calculate total portfolio value
export const totalPortfolioValueSelector = selector({
  key: 'totalPortfolioValue',
  get: ({ get }) => {
    const portfolio = get(portfolioState);
    return portfolio.reduce((sum, holding) => sum + holding.totalValue, 0);
  },
});

// Calculate total portfolio gain/loss
export const totalPortfolioGainLossSelector = selector({
  key: 'totalPortfolioGainLoss',
  get: ({ get }) => {
    const portfolio = get(portfolioState);
    const totalGainLoss = portfolio.reduce((sum, holding) => sum + holding.gainLoss, 0);
    const totalValue = portfolio.reduce((sum, holding) => sum + holding.totalValue, 0);
    const totalCost = totalValue - totalGainLoss;
    
    return {
      amount: totalGainLoss,
      percent: totalCost !== 0 ? (totalGainLoss / totalCost) * 100 : 0,
    };
  },
});

// Get watchlist quotes
export const watchlistQuotesSelector = selector({
  key: 'watchlistQuotes',
  get: ({ get }) => {
    const watchlist = get(stockQuotesState);
    return Object.values(watchlist);
  },
});

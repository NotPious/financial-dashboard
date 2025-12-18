/**
 * Recoil atoms for global state management
 * Following micro-frontend pattern with isolated state
 */

import { atom } from 'recoil';
import { StockQuote, PortfolioHolding, MarketIndex } from '../types/stock.types';

// Selected stock symbol for detailed view
export const selectedSymbolState = atom<string>({
  key: 'selectedSymbol',
  //default: 'AAPL',
  default: 'IBM',
});

// Watchlist symbols
export const watchlistState = atom<string[]>({
  key: 'watchlist',
//  default: ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'],
  default: ['IBM', 'MSFT'],
});

// Stock quotes cache
export const stockQuotesState = atom<Record<string, StockQuote>>({
  key: 'stockQuotes',
  default: {},
});

// Portfolio holdings
export const portfolioState = atom<PortfolioHolding[]>({
  key: 'portfolio',
  default: [],
});

// Market indices
export const marketIndicesState = atom<MarketIndex[]>({
  key: 'marketIndices',
  default: [],
});

// Time interval for charts
export const chartIntervalState = atom<string>({
  key: 'chartInterval',
  default: 'daily',
});

// Loading states
export const loadingState = atom<Record<string, boolean>>({
  key: 'loading',
  default: {},
});

// Error states
export const errorState = atom<Record<string, string | null>>({
  key: 'error',
  default: {},
});
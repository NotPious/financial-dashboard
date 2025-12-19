/**
 * Type definitions for stock market data
 * Aligned with Alpha Vantage API response structure
 */

export interface TimeSeriesData {
  '1. open': string;
  '2. high': string;
  '3. low': string;
  '4. close': string;
  '5. volume': string;
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: Date;
}

export interface ChartDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PortfolioHolding {
  symbol: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
  hasQuote: boolean; // indicates to frontend if quote data is available, so default UI can be shown if not
}


export interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
}

export type TimeInterval = '1min' | '5min' | '15min' | '30min' | '60min' | 'daily' | 'weekly' | 'monthly';
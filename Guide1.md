# Financial Dashboard - Complete Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Initialization](#project-initialization)
3. [Git & GitHub Setup](#git--github-setup)
4. [Project Structure](#project-structure)
5. [Configuration Files](#configuration-files)
6. [Key Implementation Files](#key-implementation-files)
7. [Testing Strategy](#testing-strategy)
8. [Running the Application](#running-the-application)
9. [Git Workflow & Best Practices](#git-workflow--best-practices)

---

## Prerequisites

### Required Software
```powershell
# Verify Node.js (v18+ recommended)
node --version

# Verify npm
npm --version

# Verify Git
git --version
```

### API Key Setup
1. Get a free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Keep this key handy for the `.env` file: SB153YJEZJ8P94AL

---

## Project Initialization

### Step 1: Create React App with TypeScript
```powershell
# Create the project
npx create-react-app financial-dashboard --template typescript

# Navigate to project directory
cd financial-dashboard
```

### Step 2: Install Dependencies
```powershell
# Core dependencies
npm install recoil recharts axios date-fns

# Development dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest eslint-plugin-jsx-a11y

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer

# Some npm/Windows setups can end up with multiple Tailwind versions
# npx tailwindcss init -p

# Initialize config using the explicit CLI version to avoid npx resolution issues (example version 3.4.18)
npx tailwindcss@3.4.18 init -p
```

---

## Git & GitHub Setup

### Step 1: Initialize Git Repository
```powershell
# Initialize Git
git init

# Configure user (if not already done)
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Step 2: Create .gitignore
Create a file named `.gitignore` in the root directory:

```gitignore
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
.idea/
*.swp
*.swo
*~

# OS
Thumbs.db
```

### Step 3: Create GitHub Repository
```powershell
# Option 1: Using GitHub CLI (if installed)
gh repo create financial-dashboard --public --source=. --remote=origin

# Option 2: Manual approach
# 1. Go to https://github.com/new
# 2. Create a new repository named "financial-dashboard"
# 3. Do NOT initialize with README, .gitignore, or license
# 4. Copy the repository URL (https://github.com/yourusername/financial-dashboard.git)
```

### Step 4: Link Local Repository to GitHub
```powershell
# Add remote origin (replace with your actual GitHub URL)
git remote add origin https://github.com/yourusername/financial-dashboard.git

# Verify remote
git remote -v
```

### Step 5: Initial Commit and Push
```powershell
# Stage all files
git add .

# Create initial commit
git commit -m "Initial commit: Project setup with React, TypeScript, Tailwind, Recoil"

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

---

## Project Structure

```
financial-dashboard/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── __tests__/           # Test files
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   ├── components/          # Micro-frontend components
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Dashboard.test.tsx
│   │   │   └── index.ts
│   │   ├── StockChart/
│   │   │   ├── StockChart.tsx
│   │   │   ├── StockChart.test.tsx
│   │   │   └── index.ts
│   │   ├── MarketOverview/
│   │   │   ├── MarketOverview.tsx
│   │   │   ├── MarketOverview.test.tsx
│   │   │   └── index.ts
│   │   ├── PortfolioSummary/
│   │   │   ├── PortfolioSummary.tsx
│   │   │   ├── PortfolioSummary.test.tsx
│   │   │   └── index.ts
│   │   └── Layout/
│   │       ├── Header.tsx
│   │       ├── Header.test.tsx
│   │       ├── Sidebar.tsx
│   │       └── Sidebar.test.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useStockData.ts
│   │   ├── useStockData.test.ts
│   │   ├── useMarketData.ts
│   │   └── useMarketData.test.ts
│   ├── services/            # API services
│   │   ├── alphaVantage.ts
│   │   └── alphaVantage.test.ts
│   ├── state/               # Recoil state management
│   │   ├── atoms.ts
│   │   ├── selectors.ts
│   │   └── state.test.ts
│   ├── types/               # TypeScript types
│   │   ├── stock.types.ts
│   │   └── api.types.ts
│   ├── utils/               # Utility functions
│   │   ├── formatters.ts
│   │   ├── formatters.test.ts
│   │   ├── calculations.ts
│   │   └── calculations.test.ts
│   ├── App.tsx
│   ├── App.test.tsx
│   ├── index.tsx
│   └── index.css
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

---

## Configuration Files

### 1. tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional financial dashboard color scheme
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
        success: {
          500: '#22c55e',
          600: '#16a34a',
        },
        danger: {
          500: '#ef4444',
          600: '#dc2626',
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### 2. tsconfig.json (Enhanced)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": false,
    "outDir": "./build",
    "rootDir": "./src",
    "removeComments": true,
    "noEmit": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "baseUrl": "./src",
    "paths": {
      "@components/*": ["components/*"],
      "@hooks/*": ["hooks/*"],
      "@services/*": ["services/*"],
      "@state/*": ["state/*"],
      "@types/*": ["types/*"],
      "@utils/*": ["utils/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "build"]
}
```

### 3. .env.example
```env
# Alpha Vantage API Configuration
REACT_APP_ALPHA_VANTAGE_API_KEY=your_api_key_here
REACT_APP_API_BASE_URL=https://www.alphavantage.co/query

# Feature Flags
REACT_APP_ENABLE_MOCK_DATA=false

# Environment
REACT_APP_ENV=development
```

### 4. Create actual .env file
```powershell
# Copy the example file
Copy-Item .env.example .env

# Edit .env and add your actual API key
# Use notepad or your preferred editor
notepad .env
```

---

## Key Implementation Files

### 1. src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* Import Inter font */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  
  body {
    @apply font-sans antialiased;
  }
  
  /* Focus styles for accessibility */
  *:focus-visible {
    @apply outline-2 outline-offset-2 outline-primary-500;
  }
}

@layer components {
  /* Custom component classes */
  .card {
    @apply bg-white rounded-lg shadow-md p-6 border border-neutral-200;
  }
  
  .btn-primary {
    @apply bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors;
  }
  
  .metric-card {
    @apply card hover:shadow-lg transition-shadow cursor-pointer;
  }
}
```

### 2. src/types/stock.types.ts
```typescript
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
}

export interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
}

export type TimeInterval = '1min' | '5min' | '15min' | '30min' | '60min' | 'daily' | 'weekly' | 'monthly';
```

### 3. src/types/api.types.ts
```typescript
/**
 * API response type definitions
 */

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface AlphaVantageQuoteResponse {
  'Global Quote': {
    '01. symbol': string;
    '05. price': string;
    '09. change': string;
    '10. change percent': string;
    '06. volume': string;
    '07. latest trading day': string;
  };
}

export interface AlphaVantageTimeSeriesResponse {
  'Meta Data': {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Interval'?: string;
    '5. Output Size'?: string;
    '6. Time Zone': string;
  };
  'Time Series (Daily)'?: Record<string, TimeSeriesData>;
  'Time Series (Intraday)'?: Record<string, TimeSeriesData>;
}

interface TimeSeriesData {
  '1. open': string;
  '2. high': string;
  '3. low': string;
  '4. close': string;
  '5. volume': string;
}
```

### 4. src/state/atoms.ts
```typescript
/**
 * Recoil atoms for global state management
 * Following micro-frontend pattern with isolated state
 */

import { atom } from 'recoil';
import { StockQuote, PortfolioHolding, MarketIndex } from '../types/stock.types';

// Selected stock symbol for detailed view
export const selectedSymbolState = atom<string>({
  key: 'selectedSymbol',
  default: 'AAPL',
});

// Watchlist symbols
export const watchlistState = atom<string[]>({
  key: 'watchlist',
  default: ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'],
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
```

### 5. src/state/selectors.ts
```typescript
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
```

### 6. src/services/alphaVantage.ts
```typescript
/**
 * Alpha Vantage API service
 * Handles all external API calls with error handling and rate limiting
 */

import axios, { AxiosInstance } from 'axios';
import {
  AlphaVantageQuoteResponse,
  AlphaVantageTimeSeriesResponse,
} from '../types/api.types';
import { StockQuote, ChartDataPoint } from '../types/stock.types';

class AlphaVantageService {
  private api: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY || '';
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_BASE_URL || 'https://www.alphavantage.co/query',
      timeout: 10000,
    });
  }

  /**
   * Fetch real-time stock quote
   * @param symbol - Stock symbol (e.g., 'AAPL')
   */
  async getQuote(symbol: string): Promise<StockQuote> {
    try {
      const response = await this.api.get<AlphaVantageQuoteResponse>('', {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol,
          apikey: this.apiKey,
        },
      });

      const quote = response.data['Global Quote'];
      
      if (!quote || !quote['01. symbol']) {
        throw new Error('Invalid API response or rate limit exceeded');
      }

      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume'], 10),
        timestamp: new Date(quote['07. latest trading day']),
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      throw new Error(`Failed to fetch quote for ${symbol}`);
    }
  }

  /**
   * Fetch time series data for charting
   * @param symbol - Stock symbol
   * @param interval - Time interval ('daily', 'weekly', 'monthly')
   */
  async getTimeSeries(
    symbol: string,
    interval: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<ChartDataPoint[]> {
    try {
      const functionMap = {
        daily: 'TIME_SERIES_DAILY',
        weekly: 'TIME_SERIES_WEEKLY',
        monthly: 'TIME_SERIES_MONTHLY',
      };

      const response = await this.api.get<AlphaVantageTimeSeriesResponse>('', {
        params: {
          function: functionMap[interval],
          symbol,
          apikey: this.apiKey,
          outputsize: 'compact', // Last 100 data points
        },
      });

      const timeSeries = response.data[`Time Series (${interval.charAt(0).toUpperCase() + interval.slice(1)})`];
      
      if (!timeSeries) {
        throw new Error('Invalid API response or rate limit exceeded');
      }

      // Transform API response to chart data points
      return Object.entries(timeSeries).map(([date, data]) => ({
        date,
        open: parseFloat(data['1. open']),
        high: parseFloat(data['2. high']),
        low: parseFloat(data['3. low']),
        close: parseFloat(data['4. close']),
        volume: parseInt(data['5. volume'], 10),
      })).reverse(); // Reverse to get chronological order
    } catch (error) {
      console.error(`Error fetching time series for ${symbol}:`, error);
      throw new Error(`Failed to fetch time series for ${symbol}`);
    }
  }

  /**
   * Fetch multiple quotes in batch (simulated)
   * Note: Alpha Vantage free tier doesn't support true batch requests
   */
  async getBatchQuotes(symbols: string[]): Promise<Record<string, StockQuote>> {
    const quotes: Record<string, StockQuote> = {};
    
    // Fetch quotes sequentially to respect API rate limits
    for (const symbol of symbols) {
      try {
        quotes[symbol] = await this.getQuote(symbol);
        // Add delay to respect rate limits (5 calls per minute on free tier)
        await this.delay(12000); // 12 seconds between calls
      } catch (error) {
        console.error(`Failed to fetch quote for ${symbol}:`, error);
      }
    }
    
    return quotes;
  }

  /**
   * Utility: Add delay between API calls
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new AlphaVantageService();
```

### 7. src/utils/formatters.ts
```typescript
/**
 * Formatting utilities for financial data display
 */

/**
 * Format currency value
 * @param value - Numeric value
 * @param decimals - Number of decimal places (default: 2)
 */
export const formatCurrency = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format percentage value
 * @param value - Numeric value
 * @param decimals - Number of decimal places (default: 2)
 */
export const formatPercent = (value: number, decimals: number = 2): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

/**
 * Format large numbers with K, M, B suffixes
 * @param value - Numeric value
 */
export const formatLargeNumber = (value: number): string => {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`;
  }
  return value.toFixed(2);
};

/**
 * Format date for display
 * @param date - Date object or string
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(dateObj);
};

/**
 * Format timestamp for display
 * @param date - Date object or string
 */
export const formatTimestamp = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(dateObj);
};
```

Continue to Part 2 for hooks, components, and tests...

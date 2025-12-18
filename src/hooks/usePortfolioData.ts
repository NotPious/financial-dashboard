import { useRecoilState } from 'recoil';
import { portfolioState } from '../state/atoms';
import { PortfolioHolding } from '../types/stock.types';
import { usePollingData, PollingDataResult } from './usePollingData';
import alphaVantageService from '../services/alphaVantage';

const PORTFOLIO_POLLING_INTERVAL_MS = Number(process.env.REACT_APP_PORTFOLIO_POLLING_INTERVAL_MS || '120000'); // 2 minutes default

const parseEnvPortfolio = (): PortfolioHolding[] => {
  const envPortfolio = process.env.REACT_APP_PORTFOLIO || '';
  if (!envPortfolio) return [];

  return envPortfolio.split(',').map((item) => {
    const [symbol, shares] = item.split(':');
    return {
      symbol: symbol.trim(),
      shares: Number(shares),
      avgCost: 0,
      currentPrice: 0,
      totalValue: 0,
      gainLoss: 0,
      gainLossPercent: 0,
    };
  });
};

// parse only once — stable initial portfolio array
const initialPortfolio: PortfolioHolding[] = parseEnvPortfolio();

interface UsePortfolioDataOptions {
  enabled?: boolean;
}

export const usePortfolioData = (options?: UsePortfolioDataOptions): PollingDataResult<PortfolioHolding[]> => {
  const enabled = options?.enabled ?? true;

  const [portfolio, setPortfolio] = useRecoilState(portfolioState);

  // Use env-based portfolio only if state is initially empty
  const effectivePortfolio = portfolio.length === 0 ? initialPortfolio : portfolio;

  // Fetch updated prices for each symbol in the portfolio
  const fetchPortfolio = async (): Promise<PortfolioHolding[]> => {
    if (!enabled) return effectivePortfolio; // <-- skip API when disabled
    if (effectivePortfolio.length === 0) {
      return [];
    }

    const symbols = effectivePortfolio.map((holding) => holding.symbol);

    let quotes: Record<string, any> = {};
    try {
      quotes = await alphaVantageService.getBatchQuotes(symbols);
    } catch (err) {
      console.error('Failed to fetch batch quotes', err);
    }

    const updated = effectivePortfolio.map((holding) => {
      const quote = quotes[holding.symbol];

      if (!quote) {
        console.error(`No quote data for ${holding.symbol}, using existing values`);
        return holding; // fallback to existing values
      }

    return {
        ...holding,
        currentPrice: quote.price,
        totalValue: quote.price * holding.shares,
        gainLoss: holding.avgCost
          ? quote.price * holding.shares - holding.avgCost * holding.shares
          : 0,
        gainLossPercent: holding.avgCost 
          ? ((quote.price - holding.avgCost) / holding.avgCost) * 100
          : 0,
      };
    });

    setPortfolio(updated);
    return updated;
  };

 // Pass interval = 0 if disabled to stop polling
  const interval = enabled ? PORTFOLIO_POLLING_INTERVAL_MS : 0;

  // Always call hook
  const polling = usePollingData<PortfolioHolding[]>(fetchPortfolio, interval, effectivePortfolio, enabled);

  // When disabled, freeze output
  if (!enabled) {
    return {
      data: effectivePortfolio,
      loading: false,
      error: null,
      refetch: async () => {},
    };
  }

  return polling;
};

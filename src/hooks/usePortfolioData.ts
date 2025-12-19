//import { useRecoilState } from 'recoil';
import { useRecoilValue } from 'recoil';
import { portfolioState } from '../state/atoms';
import { PortfolioHolding } from '../types/stock.types';
import { usePollingData, PollingDataResult } from './usePollingData';
import alphaVantageService from '../services/alphaVantage';

/* TODO(STATE): Portfolio polling currently returns derived live data.
   Recoil remains source of truth for holdings config only.
   Consider one-way sync or selector-based model later.
*/

const PORTFOLIO_POLLING_INTERVAL_MS = Number(process.env.REACT_APP_PORTFOLIO_POLLING_INTERVAL_MS || '120000'); // 2 minutes default

const parseEnvPortfolio = (): PortfolioHolding[] => {
  const envPortfolio = process.env.REACT_APP_PORTFOLIO || '';
  if (!envPortfolio) return [];

  return envPortfolio.split(',').map((item) => {
    const [symbol, shares, avgCost] = item.split(':');
    return {
      symbol: symbol.trim(),
      shares: Number(shares),
      avgCost: avgCost ? Number(avgCost) : 0,  // default to 0
      currentPrice: 0,
      totalValue: 0,
      gainLoss: 0,
      gainLossPercent: 0,
      hasQuote: false, // no quote yet
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

  const portfolio = useRecoilValue(portfolioState);

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

    return effectivePortfolio.map((holding) => {
      const quote = quotes[holding.symbol];

      const hasQuote = quote?.price != null;
      const currentPrice = hasQuote ? quote.price : holding.currentPrice;
      const totalValue = hasQuote ? currentPrice * holding.shares : holding.totalValue;
      const gainLoss = hasQuote ? (currentPrice - holding.avgCost) * holding.shares : holding.gainLoss;
      const gainLossPercent = hasQuote && holding.avgCost !== 0 ? ((currentPrice - holding.avgCost)/holding.avgCost)*100 : holding.gainLossPercent;

      return { ...holding, currentPrice, totalValue, gainLoss, gainLossPercent, hasQuote };
    });
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

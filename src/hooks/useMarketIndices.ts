import axios from 'axios';
import { useRecoilState } from 'recoil';
import { marketIndicesState } from '../state/atoms';
import { MarketIndex } from '../types/stock.types';
import { FinnhubQuote } from '../types/finnhub.types';
import { usePollingData, PollingDataResult } from './usePollingData';

const FINNHUB_API_KEY = process.env.REACT_APP_FINNHUB_API_KEY || '';
const FINNHUB_BASE_URL = process.env.REACT_APP_FINNHUB_BASE_URL || '';

const INDICES_POLLING_INTERVAL_MS = Number(process.env.REACT_APP_INDICES_POLLING_INTERVAL_MS || '120000'); // 2 minutes default

// Cooldown after rate limit message
const RATE_LIMIT_COOLDOWN_MS = Number(process.env.REACT_APP_RATE_LIMIT_COOLDOWN_MS || '30000'); // 30 seconds default
const rateLimitedUntil: Record<string, number> = {};

console.log("FINNHUB_API_KEY:", FINNHUB_API_KEY);
console.log("FINNHUB_BASE_URL:", FINNHUB_BASE_URL);
console.log("INDICES_POLLING_INTERVAL_MS:", INDICES_POLLING_INTERVAL_MS);

const INDEX_SYMBOLS = [
  { name: 'S&P 500', symbol: 'SPY' },
  { name: 'Dow Jones', symbol: 'DIA' },
  { name: 'NASDAQ', symbol: 'QQQ' },
];

interface UseMarketIndicesOptions {
  enabled?: boolean; // Controls whether polling is active or not
}

export const useMarketIndices = (options?: UseMarketIndicesOptions): PollingDataResult<MarketIndex[]> => {
  const enabled = options?.enabled ?? true; // Default to enabled (true) if not specified
  const [marketIndices, setMarketIndices] = useRecoilState(marketIndicesState);

  // Fetch market indices; errors must not clear existing data, partial success should still update state
  const fetchIndices = async (): Promise<MarketIndex[]> => {
    if (!enabled) return marketIndices;

    const updated: MarketIndex[] = [];
    const now = Date.now();

    for (const index of INDEX_SYMBOLS) {
      const blockedUntil = rateLimitedUntil[index.symbol];

      if (blockedUntil && blockedUntil > now) {
        console.warn(`Skipping ${index.symbol} due to rate limit cooldown`);
        continue;
      }

      try {
        const response = await axios.get<FinnhubQuote>(FINNHUB_BASE_URL, {
          params: { symbol: index.symbol, token: FINNHUB_API_KEY },
        });

        const data = response.data;

        updated.push({
          name: index.name,
          symbol: index.symbol,
          value: data.c,
          change: data.d,
          changePercent: data.dp,
        });

      } catch (error: any) {
        if (error?.response?.status === 429) {
          console.warn(`Rate limit hit for ${index.symbol}, cooling down...`);
          rateLimitedUntil[index.symbol] = Date.now() + RATE_LIMIT_COOLDOWN_MS;
        } else {
          console.error(`Error fetching data for ${index.symbol}:`, error);
        }
      }
    }

    if (updated.length === 0) {
      console.warn(
        'Market indices update skipped — no successful responses (preserving previous data).'
      );
      return marketIndices;
    }
    setMarketIndices(updated);
    return updated;
  };

  // Use Recoil only to seed initial value
  const initialValue: MarketIndex[] =  marketIndices.length > 0 ? marketIndices : [];

  // Disable polling when not enabled
  const interval = enabled ? INDICES_POLLING_INTERVAL_MS : 0;

  // ✅ Always fetch once on mount
  const polling = usePollingData(fetchIndices, interval, initialValue, true);

  console.log("Polling data:", polling);

  // When disabled, return the initial value and stop polling
  if (!enabled) {
    console.log("Polling disabled in useMarketIndices.");
    return {
      data: initialValue,
      loading: false,
      error: null,
      refetch: async () => {},
    };
  }

  return polling;
};

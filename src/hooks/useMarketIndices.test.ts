import { renderHook, waitFor, act } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import axios from 'axios';
import { useMarketIndices } from './useMarketIndices';
import { MarketIndex } from '../types/stock.types';

// Mock axios BEFORE importing the hook
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockIndices: MarketIndex[] = [
  { name: 'S&P 500', symbol: 'SPY', value: 5000, change: 50, changePercent: 1 },
  { name: 'Dow Jones', symbol: 'DIA', value: 35000, change: 100, changePercent: 0.29 },
  { name: 'NASDAQ', symbol: 'QQQ', value: 15000, change: 200, changePercent: 1.35 },
];

describe('useMarketIndices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('fetches market indices successfully', async () => {
    // Arrange: mock axios.get for all indices
    mockedAxios.get.mockImplementation(({ params }: any) => {
      const symbol = params.symbol;
      const indexData = mockIndices.find((i) => i.symbol === symbol);
      return Promise.resolve({ data: { c: indexData?.value, d: indexData?.change, dp: indexData?.changePercent } });
    });

    // Act
    const { result } = renderHook(() => useMarketIndices({ enabled: true }), {
      wrapper: RecoilRoot,
    });

    // Wait for loading to finish
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Assert
    expect(result.current.data.length).toBe(3);
    expect(result.current.data).toEqual(mockIndices);
    expect(result.current.error).toBeNull();
  });

  it('handles rate-limit errors gracefully', async () => {
    // Arrange: mock SPY to return 429
    mockedAxios.get.mockImplementation(({ params }: any) => {
      if (params.symbol === 'SPY') {
        const err: any = new Error('Rate limit');
        err.response = { status: 429 };
        return Promise.reject(err);
      }
      const indexData = mockIndices.find((i) => i.symbol === params.symbol);
      return Promise.resolve({ data: { c: indexData?.value, d: indexData?.change, dp: indexData?.changePercent } });
    });

    const { result } = renderHook(() => useMarketIndices({ enabled: true }), { wrapper: RecoilRoot });

    await waitFor(() => expect(result.current.loading).toBe(false));

    // SPY should be skipped, others still updated
    expect(result.current.data.some((d) => d.symbol === 'SPY')).toBe(false);
    expect(result.current.data.some((d) => d.symbol === 'DIA')).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('does not fetch when disabled', async () => {
    const { result } = renderHook(() => useMarketIndices({ enabled: false }), { wrapper: RecoilRoot });

    // Act & Assert
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([]);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('refetches data when refetch is called', async () => {
    mockedAxios.get.mockResolvedValue({ data: { c: 200, d: 2, dp: 1 } });

    const { result } = renderHook(() => useMarketIndices({ enabled: true }), { wrapper: RecoilRoot });

    await waitFor(() => expect(result.current.loading).toBe(false));

    jest.clearAllMocks();

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockedAxios.get).toHaveBeenCalledTimes(3); // One per index
    expect(result.current.data.some((d) => d.value === 200)).toBe(true);
  });
});

/**
 * Tests for Dashboard component
 */

// import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import '@testing-library/jest-dom';
import Dashboard from './Dashboard';
import { useStockData } from '../../hooks/useStockData';

// Mock the custom hook
jest.mock('../../hooks/useStockData');

const mockUseStockData = useStockData as jest.MockedFunction<typeof useStockData>;

describe('Dashboard', () => {
  beforeEach(() => {
    mockUseStockData.mockReturnValue({
      quote: {
        symbol: 'AAPL',
        price: 150.25,
        change: 2.5,
        changePercent: 1.69,
        volume: 50000000,
        timestamp: new Date('2025-01-15'),
      },
      chartData: [],
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it('should render the dashboard with all sections', async () => {
    render(
      <RecoilRoot>
        <Dashboard />
      </RecoilRoot>
    );

    await waitFor(() => {
      expect(screen.getByText('Executive Financial Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Market Overview')).toBeInTheDocument();
      expect(screen.getByText('Portfolio Summary')).toBeInTheDocument();
      expect(screen.getByText('Watchlist')).toBeInTheDocument();
    });
  });

  it('should have accessible skip link', () => {
    render(
      <RecoilRoot>
        <Dashboard />
      </RecoilRoot>
    );

    const skipLink = screen.getByText(/skip to main content/i);
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('should display error message when API fails', async () => {
    mockUseStockData.mockReturnValue({
      quote: null,
      chartData: [],
      loading: false,
      error: 'API rate limit exceeded',
      refetch: jest.fn(),
    });

    render(
      <RecoilRoot>
        <Dashboard />
      </RecoilRoot>
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/API rate limit exceeded/i)).toBeInTheDocument();
    });
  });

  it('should render watchlist with proper ARIA attributes', async () => {
    render(
      <RecoilRoot>
        <Dashboard />
      </RecoilRoot>
    );

    await waitFor(() => {
      const watchlistSection = screen.getByRole('region', { name: /stock watchlist/i });
      expect(watchlistSection).toBeInTheDocument();
      
      const watchlistButtons = screen.getAllByRole('button', { pressed: false });
      expect(watchlistButtons.length).toBeGreaterThan(0);
    });
  });

  it('should have accessible landmark regions', async () => {
    render(
      <RecoilRoot>
        <Dashboard />
      </RecoilRoot>
    );

    await waitFor(() => {
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });
  });
});
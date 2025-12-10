/**
 * Tests for PortfolioSummary component
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PortfolioSummary from './PortfolioSummary';
import { PortfolioHolding } from '../../types/stock.types';

const mockHoldings: PortfolioHolding[] = [
  {
    symbol: 'AAPL',
    shares: 100,
    avgCost: 140.0,
    currentPrice: 150.0,
    totalValue: 15000.0,
    gainLoss: 1000.0,
    gainLossPercent: 7.14,
  },
  {
    symbol: 'GOOGL',
    shares: 50,
    avgCost: 2800.0,
    currentPrice: 2750.0,
    totalValue: 137500.0,
    gainLoss: -2500.0,
    gainLossPercent: -1.79,
  },
];

describe('PortfolioSummary', () => {
  it('should render loading state', () => {
    render(
      <PortfolioSummary
        holdings={[]}
        totalValue={0}
        totalGainLoss={0}
        totalGainLossPercent={0}
        loading={true}
      />
    );
    
    expect(screen.getByText('Portfolio Summary')).toBeInTheDocument();
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should render portfolio metrics', () => {
    render(
      <PortfolioSummary
        holdings={mockHoldings}
        totalValue={152500}
        totalGainLoss={-1500}
        totalGainLossPercent={-0.97}
        loading={false}
      />
    );
    
    expect(screen.getByText('$152,500.00')).toBeInTheDocument();
    expect(screen.getByText('-$1,500.00')).toBeInTheDocument();
    expect(screen.getByText('-0.97%')).toBeInTheDocument();
  });

  it('should render holdings table', () => {
    render(
      <PortfolioSummary
        holdings={mockHoldings}
        totalValue={152500}
        totalGainLoss={-1500}
        totalGainLossPercent={-0.97}
        loading={false}
      />
    );
    
    expect(screen.getByRole('table', { name: /portfolio holdings/i })).toBeInTheDocument();
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('GOOGL')).toBeInTheDocument();
  });

  it('should display positive gains in green', () => {
    render(
      <PortfolioSummary
        holdings={mockHoldings}
        totalValue={152500}
        totalGainLoss={1500}
        totalGainLossPercent={0.99}
        loading={false}
      />
    );
    
    const positiveValue = screen.getByText('+$1,500.00');
    expect(positiveValue).toHaveClass('text-success-600');
  });

  it('should display negative losses in red', () => {
    render(
      <PortfolioSummary
        holdings={mockHoldings}
        totalValue={152500}
        totalGainLoss={-1500}
        totalGainLossPercent={-0.97}
        loading={false}
      />
    );
    
    const negativeValue = screen.getByText('-$1,500.00');
    expect(negativeValue).toHaveClass('text-danger-600');
  });

  it('should show empty state when no holdings', () => {
    render(
      <PortfolioSummary
        holdings={[]}
        totalValue={0}
        totalGainLoss={0}
        totalGainLossPercent={0}
        loading={false}
      />
    );
    
    expect(screen.getByText(/no holdings in portfolio/i)).toBeInTheDocument();
  });

  it('should be accessible with proper ARIA labels', () => {
    render(
      <PortfolioSummary
        holdings={mockHoldings}
        totalValue={152500}
        totalGainLoss={-1500}
        totalGainLossPercent={-0.97}
        loading={false}
      />
    );
    
    expect(screen.getByRole('region', { name: /portfolio summary/i })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: /portfolio holdings/i })).toBeInTheDocument();
  });
});
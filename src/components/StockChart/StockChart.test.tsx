/**
 * Tests for StockChart component
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StockChart from './StockChart';
import { ChartDataPoint } from '../../types/stock.types';

const mockData: ChartDataPoint[] = [
  {
    date: '2025-01-10',
    open: 145.0,
    high: 148.0,
    low: 144.0,
    close: 147.0,
    volume: 45000000,
  },
  {
    date: '2025-01-15',
    open: 147.5,
    high: 151.0,
    low: 146.5,
    close: 150.25,
    volume: 50000000,
  },
];

describe('StockChart', () => {
  it('should render loading state', () => {
    render(<StockChart data={[]} symbol="AAPL" loading={true} />);
    
    expect(screen.getByText(/loading chart data/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render empty state when no data', () => {
    render(<StockChart data={[]} symbol="AAPL" loading={false} />);
    
    expect(screen.getByText(/no chart data available/i)).toBeInTheDocument();
  });

  it('should render chart with data', () => {
    render(<StockChart data={mockData} symbol="AAPL" loading={false} />);
    
    expect(screen.getByText('AAPL Price Chart')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /stock chart for aapl/i })).toBeInTheDocument();
  });

  it('should display last updated date', () => {
    render(<StockChart data={mockData} symbol="AAPL" loading={false} />);
    
    expect(screen.getByText(/last updated:/i)).toBeInTheDocument();
  });

  it('should be accessible', () => {
    render(<StockChart data={mockData} symbol="AAPL" loading={false} />);
    
    // Check for aria-label
    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-label', 'Stock chart for AAPL');
  });
});
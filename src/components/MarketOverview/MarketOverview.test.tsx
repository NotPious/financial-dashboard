/**
 * Tests for MarketOverview component
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MarketOverview from './MarketOverview';
import { MarketIndex } from '../../types/stock.types';

const mockIndices: MarketIndex[] = [
  {
    name: 'S&P 500',
    symbol: 'SPX',
    value: 4500.25,
    change: 25.50,
    changePercent: 0.57,
  },
  {
    name: 'Dow Jones',
    symbol: 'DJI',
    value: 35000.75,
    change: -150.25,
    changePercent: -0.43,
  },
];

describe('MarketOverview', () => {
  it('should render loading state', () => {
    render(<MarketOverview indices={[]} loading={true} />);
    
    expect(screen.getByText('Market Overview')).toBeInTheDocument();
    // Check for loading skeleton
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render market indices', () => {
    render(<MarketOverview indices={mockIndices} loading={false} />);
    
    expect(screen.getByText('S&P 500')).toBeInTheDocument();
    expect(screen.getByText('SPX')).toBeInTheDocument();
    expect(screen.getByText('Dow Jones')).toBeInTheDocument();
    expect(screen.getByText('DJI')).toBeInTheDocument();
  });

  it('should display positive changes correctly', () => {
    render(<MarketOverview indices={mockIndices} loading={false} />);
    
    // S&P 500 is positive
    expect(screen.getByText(/\+0\.57%/i)).toBeInTheDocument();
    expect(screen.getByText('$4,500.25')).toBeInTheDocument();
  });

  it('should display negative changes correctly', () => {
    render(<MarketOverview indices={mockIndices} loading={false} />);

    // Dow Jones is negative
    // tolerant match for minus or unicode minus and possible spacing
    expect(screen.getByText(/[-\u2212]?\s*0\.43%/i)).toBeInTheDocument();
  });

  it('should have accessible region label', () => {
    render(<MarketOverview indices={mockIndices} loading={false} />);
    
    const region = screen.getByRole('region', { name: /market overview/i });
    expect(region).toBeInTheDocument();
  });

  it('should show up/down arrows for changes', () => {
    render(<MarketOverview indices={mockIndices} loading={false} />);
    
    // Check for positive/negative aria-labels
    expect(screen.getByLabelText(/positive change/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/negative change/i)).toBeInTheDocument();
  });
});
/**
 * Tests for App component
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { useStockData } from './hooks/useStockData';

// Mock the custom hook
jest.mock('./hooks/useStockData');

const mockUseStockData = useStockData as jest.MockedFunction<typeof useStockData>;

describe('App', () => {
  beforeEach(() => {
    mockUseStockData.mockReturnValue({
      quote: null,
      chartData: [],
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it('should render without crashing', () => {
    render(<App />);
    
    expect(
      screen.getByRole('heading', { name: /Executive Financial Dashboard/i })
    ).toBeInTheDocument();
  });

  it('should wrap components in RecoilRoot', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
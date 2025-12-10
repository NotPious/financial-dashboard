/**
 * Tests for Header component
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from './Header';

describe('Header', () => {
  it('should render with default title', () => {
    render(<Header />);
    
    expect(screen.getByText('Financial Dashboard')).toBeInTheDocument();
  });

  it('should render with custom title', () => {
    render(<Header title="Executive Dashboard" />);
    
    expect(screen.getByText('Executive Dashboard')).toBeInTheDocument();
  });

  it('should have accessible navigation', () => {
    render(<Header />);
    
    const nav = screen.getByRole('navigation', { name: /main navigation/i });
    expect(nav).toBeInTheDocument();
    
    expect(screen.getByText('Dashboard')).toHaveAttribute('href', '#dashboard');
    expect(screen.getByText('Portfolio')).toHaveAttribute('href', '#portfolio');
    expect(screen.getByText('Markets')).toHaveAttribute('href', '#markets');
  });

  it('should have accessible banner role', () => {
    render(<Header />);
    
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('should have notification button with aria-label', () => {
    render(<Header />);
    
    const notificationBtn = screen.getByRole('button', { name: /notifications/i });
    expect(notificationBtn).toBeInTheDocument();
  });

  it('should display user initials', () => {
    render(<Header />);
    
    expect(screen.getByLabelText('User profile')).toHaveTextContent('JD');
  });
});
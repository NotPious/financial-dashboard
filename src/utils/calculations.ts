/**
 * Financial calculation utilities
 */

/**
 * Calculate gain/loss percentage
 * @param currentValue - Current value
 * @param costBasis - Original cost basis
 */
export const calculateGainLossPercent = (
  currentValue: number,
  costBasis: number
): number => {
  if (costBasis === 0) return 0;
  return ((currentValue - costBasis) / costBasis) * 100;
};

/**
 * Calculate simple moving average
 * @param data - Array of numbers
 * @param period - Number of periods
 */
export const calculateSMA = (data: number[], period: number): number[] => {
  if (data.length < period) return [];
  
  const sma: number[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  return sma;
};

/**
 * Calculate portfolio allocation percentages
 * @param holdings - Array of holding values
 */
export const calculateAllocation = (holdings: number[]): number[] => {
  const total = holdings.reduce((sum, value) => sum + value, 0);
  if (total === 0) return holdings.map(() => 0);
  return holdings.map(value => (value / total) * 100);
};

/**
 * Calculate compound annual growth rate (CAGR)
 * @param beginningValue - Initial value
 * @param endingValue - Final value
 * @param years - Number of years
 */
export const calculateCAGR = (
  beginningValue: number,
  endingValue: number,
  years: number
): number => {
  if (beginningValue === 0 || years === 0) return 0;
  return (Math.pow(endingValue / beginningValue, 1 / years) - 1) * 100;
};
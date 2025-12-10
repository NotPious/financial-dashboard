/**
 * Tests for calculation utilities
 */

import {
  calculateGainLossPercent,
  calculateSMA,
  calculateAllocation,
  calculateCAGR,
} from './calculations';

describe('calculations', () => {
  describe('calculateGainLossPercent', () => {
    it('should calculate positive gain percentage', () => {
      expect(calculateGainLossPercent(150, 100)).toBeCloseTo(50, 2);
    });

    it('should calculate negative loss percentage', () => {
      expect(calculateGainLossPercent(75, 100)).toBeCloseTo(-25, 2);
    });

    it('should handle zero cost basis', () => {
      expect(calculateGainLossPercent(100, 0)).toBe(0);
    });

    it('should return zero when values are equal', () => {
      expect(calculateGainLossPercent(100, 100)).toBe(0);
    });
  });

  describe('calculateSMA', () => {
    it('should calculate simple moving average', () => {
      const data = [1, 2, 3, 4, 5];
      const sma = calculateSMA(data, 3);
      expect(sma).toEqual([2, 3, 4]);
    });

    it('should return empty array for insufficient data', () => {
      const data = [1, 2];
      const sma = calculateSMA(data, 3);
      expect(sma).toEqual([]);
    });

    it('should handle period of 1', () => {
      const data = [1, 2, 3];
      const sma = calculateSMA(data, 1);
      expect(sma).toEqual([1, 2, 3]);
    });
  });

  describe('calculateAllocation', () => {
    it('should calculate allocation percentages', () => {
      const holdings = [100, 200, 300];
      const allocation = calculateAllocation(holdings);
      expect(allocation[0]).toBeCloseTo(16.67, 1);
      expect(allocation[1]).toBeCloseTo(33.33, 1);
      expect(allocation[2]).toBeCloseTo(50.00, 1);
    });

    it('should handle zero total', () => {
      const holdings = [0, 0, 0];
      const allocation = calculateAllocation(holdings);
      expect(allocation).toEqual([0, 0, 0]);
    });

    it('should handle single holding', () => {
      const holdings = [100];
      const allocation = calculateAllocation(holdings);
      expect(allocation).toEqual([100]);
    });
  });

  describe('calculateCAGR', () => {
    it('should calculate compound annual growth rate', () => {
      const cagr = calculateCAGR(100, 200, 5);
      expect(cagr).toBeCloseTo(14.87, 1);
    });

    it('should handle zero beginning value', () => {
      expect(calculateCAGR(0, 200, 5)).toBe(0);
    });

    it('should handle zero years', () => {
      expect(calculateCAGR(100, 200, 0)).toBe(0);
    });

    it('should calculate negative CAGR for losses', () => {
      const cagr = calculateCAGR(200, 100, 5);
      expect(cagr).toBeLessThan(0);
    });
  });
});
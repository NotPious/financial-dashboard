/**
 * Tests for formatting utilities
 */

import {
  formatCurrency,
  formatPercent,
  formatLargeNumber,
  formatDate,
  formatTimestamp,
} from './formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('should format positive currency values', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    it('should format negative currency values', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should respect decimal places parameter', () => {
      expect(formatCurrency(1234.5678, 4)).toBe('$1,234.5678');
      expect(formatCurrency(1234.5, 0)).toBe('$1,235');
    });
  });

  describe('formatPercent', () => {
    it('should format positive percentages with plus sign', () => {
      expect(formatPercent(5.67)).toBe('+5.67%');
    });

    it('should format negative percentages', () => {
      expect(formatPercent(-3.45)).toBe('-3.45%');
    });

    it('should handle zero', () => {
      expect(formatPercent(0)).toBe('+0.00%');
    });

    it('should respect decimal places parameter', () => {
      expect(formatPercent(5.6789, 3)).toBe('+5.679%');
      expect(formatPercent(-3.456, 1)).toBe('-3.5%');
    });
  });

  describe('formatLargeNumber', () => {
    it('should format billions with B suffix', () => {
      expect(formatLargeNumber(1500000000)).toBe('1.50B');
      expect(formatLargeNumber(25000000000)).toBe('25.00B');
    });

    it('should format millions with M suffix', () => {
      expect(formatLargeNumber(1500000)).toBe('1.50M');
      expect(formatLargeNumber(250000000)).toBe('250.00M');
    });

    it('should format thousands with K suffix', () => {
      expect(formatLargeNumber(1500)).toBe('1.50K');
      expect(formatLargeNumber(250000)).toBe('250.00K');
    });

    it('should format numbers less than 1000 normally', () => {
      expect(formatLargeNumber(500)).toBe('500.00');
      expect(formatLargeNumber(99.99)).toBe('99.99');
    });
  });

  describe('formatDate', () => {
    it('should format Date objects', () => {
      const date = new Date('2025-01-15T14:30:00');
      const formatted = formatDate(date);
      expect(formatted).toMatch("Jan 15, 2025");
    });

    it('should format date strings', () => {
      const formatted = formatDate('2025-01-15T14:30:00');
      expect(formatted).toMatch("Jan 15, 2025");
    });
  });

  describe('formatTimestamp', () => {
    it('should format Date objects with time', () => {
      const date = new Date('2025-01-15T14:30:00');
      const formatted = formatTimestamp(date);
      expect(formatted).toContain('Jan 15');
      expect(formatted).toMatch(/\d{1,2}:\d{2}/); // Contains time
    });

    it('should format timestamp strings', () => {
      const formatted = formatTimestamp('2025-01-15T14:30:00');
      expect(formatted).toContain('Jan 15');
    });
  });
});
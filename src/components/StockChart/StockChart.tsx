/**
 * Stock chart component using Recharts
 * Displays candlestick or line chart with volume
 */

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartDataPoint } from '../../types/stock.types';
import { formatCurrency, formatDate, formatLargeNumber } from '../../utils/formatters';

interface StockChartProps {
  data: ChartDataPoint[];
  symbol: string;
  loading?: boolean;
}

const StockChart: React.FC<StockChartProps> = ({ data, symbol, loading = false }) => {
  // Memoize chart data processing
  const chartData = useMemo(() => {
    return (Array.isArray(data) ? data : []).map(point => ({
      ...point,
      formattedDate: formatDate(point.date),
    }));
  }, [data]);

  if (loading) {
    return (
      <div
        className="card flex items-center justify-center h-96"
        role="status"
        aria-live="polite"
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"
            aria-hidden="true"
          />
          <p className="mt-4 text-neutral-600">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card flex items-center justify-center h-96">
        <p className="text-neutral-500">No chart data available</p>
      </div>
    );
  }

  return (
    <div className="card" role="region" aria-label={`Stock chart for ${symbol}`}>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-neutral-900">
          {symbol} Price Chart
        </h2>
        <div className="text-sm text-neutral-500">
          Last updated: {formatDate(data[data.length - 1]?.date)}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="formattedDate"
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis
            yAxisId="price"
            orientation="left"
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickFormatter={(value) => `$${value}`}
            domain={['auto', 'auto']}
          />
          <YAxis
            yAxisId="volume"
            orientation="right"
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickFormatter={formatLargeNumber}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'volume') return [formatLargeNumber(value), 'Volume'];
              return [formatCurrency(value), name];
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          
          {/* Price line */}
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="close"
            stroke="#0284c7"
            strokeWidth={2}
            dot={false}
            name="Close Price"
            activeDot={{ r: 6 }}
          />
          
          {/* Volume bars */}
          <Bar
            yAxisId="volume"
            dataKey="volume"
            fill="#94a3b8"
            opacity={0.3}
            name="Volume"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;
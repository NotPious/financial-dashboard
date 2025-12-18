/**
 * Market overview component
 * Displays key market indices and statistics
 */

import React, { useEffect } from 'react';
import { MarketIndex } from '../../types/stock.types';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface MarketOverviewProps {
  indices: MarketIndex[];
  loading?: boolean;
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ indices, loading = false }) => {

  useEffect(() => {
    console.log('MarketOverview indices prop:', indices); // Log indices prop
  }, [indices]); // Will log every time indices prop changes

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Market Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
              <div className="h-6 bg-neutral-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section
      className="card"
      aria-label="Market overview"
    >
      <h2 className="text-xl font-semibold mb-4 text-neutral-900">
        Market Overview
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {indices.map((index) => {
           const isNegative = index.changePercent < 0;
           const arrow = isNegative ? '↓' : '↑';
           const formattedPercent = formatPercent(index.changePercent);
           const badgeClasses = isNegative
             ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-800'
             : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800';

           return (
             <div
               key={index.symbol}
               className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow"
             >
               <div className="flex justify-between items-start mb-2">
                 <div>
                   <h3 className="font-semibold text-neutral-900">
                     {index.name}
                   </h3>
                   <p className="text-sm text-neutral-500">
                     {index.symbol}
                   </p>
                 </div>

                 <span
                   className={badgeClasses}
                   aria-label={isNegative ? 'Negative change' : 'Positive change'}
                 >
                   <span aria-hidden>{arrow}</span>
                   <span className="ml-1">{formattedPercent}</span>
                 </span>
               </div>

               <div className="mt-3">
                 <p className="text-2xl font-bold text-neutral-900">
                   {formatCurrency(index.value, 2)}
                 </p>
                 <p
                   className={`text-sm mt-1 ${isNegative ? 'text-danger-600' : 'text-success-600'}`}
                 >
                   {formatPercent(index.change)}
                 </p>
               </div>
             </div>
           );
        })}
      </div>
    </section>
  );
};

export default MarketOverview;
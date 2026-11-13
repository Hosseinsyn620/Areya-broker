/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useBroker } from '../context/BrokerContext';

export const RecentTrades: React.FC = () => {
  const { activeMarket, recentTrades } = useBroker();
  const isTomanQuote = activeMarket.quoteAsset === 'IRT';

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border-r border-slate-800/80 text-xs select-none">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/70">
        <span className="font-semibold text-slate-200">معاملات اخیر بازار</span>
        <span className="text-[10px] text-slate-400">زنده</span>
      </div>

      <div className="grid grid-cols-3 px-3 py-1 text-[10px] text-slate-400 border-b border-slate-850">
        <span className="text-right">قیمت</span>
        <span className="text-center">حجم</span>
        <span className="text-left">زمان</span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-900/40">
        {recentTrades.slice(0, 15).map((trade) => {
          const d = new Date(trade.time);
          const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d
            .getMinutes()
            .toString()
            .padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;

          return (
            <div
              key={trade.id}
              className="grid grid-cols-3 px-3 py-1 font-mono-numbers text-[11px] hover:bg-slate-850/40"
            >
              <span
                className={`text-right font-medium ${
                  trade.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {trade.price.toLocaleString(isTomanQuote ? 'fa-IR' : 'en-US', {
                  maximumFractionDigits: activeMarket.precision,
                })}
              </span>
              <span className="text-center text-slate-300">{trade.amount.toFixed(2)}</span>
              <span className="text-left text-slate-400">{timeStr}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

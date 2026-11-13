/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useBroker } from '../context/BrokerContext';

export const OrderBook: React.FC = () => {
  const { activeMarket, currentPrice, orderBook } = useBroker();
  const [viewMode, setViewMode] = useState<'both' | 'bids' | 'asks'>('both');

  const isTomanQuote = activeMarket.quoteAsset === 'IRT';

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border-r border-slate-800/80 text-xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/70">
        <span className="font-semibold text-slate-200">دفتر سفارشات (Order Book)</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('both')}
            title="نمایش هر دو طرف"
            className={`px-1.5 py-0.5 rounded text-[10px] ${
              viewMode === 'both' ? 'bg-slate-800 text-amber-400' : 'text-slate-500'
            }`}
          >
            کامل
          </button>
          <button
            onClick={() => setViewMode('bids')}
            title="فقط خریداران"
            className={`px-1.5 py-0.5 rounded text-[10px] ${
              viewMode === 'bids' ? 'bg-emerald-950 text-emerald-400' : 'text-slate-500'
            }`}
          >
            خرید
          </button>
          <button
            onClick={() => setViewMode('asks')}
            title="فقط فروشندگان"
            className={`px-1.5 py-0.5 rounded text-[10px] ${
              viewMode === 'asks' ? 'bg-rose-950 text-rose-400' : 'text-slate-500'
            }`}
          >
            فروش
          </button>
        </div>
      </div>

      {/* Table Column Titles */}
      <div className="grid grid-cols-3 px-3 py-1 text-[10px] text-slate-400 border-b border-slate-850">
        <span className="text-right">قیمت ({isTomanQuote ? 'تومان' : activeMarket.quoteAsset})</span>
        <span className="text-center">حجم ({activeMarket.baseAsset})</span>
        <span className="text-left">مجموع</span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        {/* Asks (Sell Orders - Red) */}
        {(viewMode === 'both' || viewMode === 'asks') && (
          <div className="flex-1 flex flex-col justify-end overflow-hidden divide-y divide-slate-900/40">
            {orderBook.asks.slice(viewMode === 'both' ? -6 : -12).map((ask, idx) => (
              <div
                key={`ask_${idx}`}
                className="relative grid grid-cols-3 px-3 py-0.5 font-mono-numbers text-[11px] hover:bg-slate-800/50 cursor-pointer"
              >
                {/* Visual Depth Bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-rose-500/10 pointer-events-none"
                  style={{ width: `${ask.percent}%` }}
                />
                <span className="text-right text-rose-400 font-medium relative z-10">
                  {ask.price.toLocaleString(isTomanQuote ? 'fa-IR' : 'en-US', {
                    maximumFractionDigits: activeMarket.precision,
                  })}
                </span>
                <span className="text-center text-slate-300 relative z-10">{ask.amount.toFixed(2)}</span>
                <span className="text-left text-slate-400 relative z-10">{ask.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Current Mid Price & Spread */}
        <div className="px-3 py-1.5 bg-[#090d13] border-y border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold font-mono-numbers text-emerald-400">
              {currentPrice.toLocaleString(isTomanQuote ? 'fa-IR' : 'en-US', {
                maximumFractionDigits: activeMarket.precision,
              })}
            </span>
            <span className="text-[10px] text-slate-400">
              {isTomanQuote ? 'تومان' : activeMarket.quoteAsset}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <span>اسپرد:</span>
            <span className="font-mono-numbers text-slate-300">{orderBook.spread}</span>
          </div>
        </div>

        {/* Bids (Buy Orders - Green) */}
        {(viewMode === 'both' || viewMode === 'bids') && (
          <div className="flex-1 flex flex-col overflow-hidden divide-y divide-slate-900/40">
            {orderBook.bids.slice(0, viewMode === 'both' ? 6 : 12).map((bid, idx) => (
              <div
                key={`bid_${idx}`}
                className="relative grid grid-cols-3 px-3 py-0.5 font-mono-numbers text-[11px] hover:bg-slate-800/50 cursor-pointer"
              >
                {/* Visual Depth Bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-emerald-500/10 pointer-events-none"
                  style={{ width: `${bid.percent}%` }}
                />
                <span className="text-right text-emerald-400 font-medium relative z-10">
                  {bid.price.toLocaleString(isTomanQuote ? 'fa-IR' : 'en-US', {
                    maximumFractionDigits: activeMarket.precision,
                  })}
                </span>
                <span className="text-center text-slate-300 relative z-10">{bid.amount.toFixed(2)}</span>
                <span className="text-left text-slate-400 relative z-10">{bid.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

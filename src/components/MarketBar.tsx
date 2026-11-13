/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useBroker } from '../context/BrokerContext';
import {
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Zap,
} from 'lucide-react';

export const MarketBar: React.FC = () => {
  const { activeMarket, currentPrice, setMarketsModalOpen, tickDirection } = useBroker();

  const isPositive = activeMarket.change24h >= 0;
  const isTomanQuote = activeMarket.quoteAsset === 'IRT';

  return (
    <div className="bg-[#0b0f17] border-b border-slate-850 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Left: Active market selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMarketsModalOpen(true)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[#111724] border border-slate-800 hover:border-amber-500/50 hover:bg-[#161e2f] transition-all group shadow-sm"
        >
          <div
            className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${activeMarket.iconBg} flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}
          >
            {activeMarket.baseAsset.substring(0, 3)}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 font-bold text-slate-100 text-sm">
              <span className="font-mono-numbers">{activeMarket.symbol}</span>
              <span className="text-xs font-normal text-slate-400">({activeMarket.nameFa})</span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors mr-1" />
        </button>

        {/* Leverage Tag */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-amber-300 bg-amber-400/10 border border-amber-400/25 px-2.5 py-1 rounded-xl">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>اهرم تا {activeMarket.maxLeverage}x</span>
        </div>
      </div>

      {/* Middle: Live Price & 24h Stats */}
      <div className="flex items-center gap-5 lg:gap-8 overflow-x-auto py-1">
        {/* Main Price with Dynamic Tick Pulse */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400">قیمت لحظه‌ای</span>
            <span
              className={`w-1.5 h-1.5 rounded-full transition-all duration-150 ${
                tickDirection === 'up'
                  ? 'bg-emerald-400 animate-ping'
                  : tickDirection === 'down'
                  ? 'bg-rose-400 animate-ping'
                  : 'bg-slate-600'
              }`}
            />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-base lg:text-lg font-bold font-mono-numbers tracking-tight transition-all duration-150 ${
                tickDirection === 'up'
                  ? 'text-emerald-400 bg-emerald-500/10 px-1 rounded'
                  : tickDirection === 'down'
                  ? 'text-rose-400 bg-rose-500/10 px-1 rounded'
                  : isPositive
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {currentPrice.toLocaleString(isTomanQuote ? 'fa-IR' : 'en-US', {
                minimumFractionDigits: activeMarket.precision > 0 ? 2 : 0,
                maximumFractionDigits: activeMarket.precision,
              })}
            </span>
            <span className="text-[10px] text-slate-400">
              {isTomanQuote ? 'تومان' : activeMarket.quoteAsset}
            </span>
          </div>
        </div>

        {/* 24h Change */}
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400">تغییرات ۲۴ ساعته</span>
          <div
            className={`flex items-center gap-0.5 font-bold font-mono-numbers text-xs ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
            )}
            <span>
              {isPositive ? '+' : ''}
              {activeMarket.change24h.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* 24h High */}
        <div className="hidden md:flex flex-col">
          <span className="text-[10px] text-slate-400">بیشترین ۲۴ ساعت</span>
          <span className="font-mono-numbers font-medium text-slate-200">
            {activeMarket.high24h.toLocaleString(isTomanQuote ? 'fa-IR' : 'en-US', {
              maximumFractionDigits: activeMarket.precision,
            })}
          </span>
        </div>

        {/* 24h Low */}
        <div className="hidden md:flex flex-col">
          <span className="text-[10px] text-slate-400">کمترین ۲۴ ساعت</span>
          <span className="font-mono-numbers font-medium text-slate-200">
            {activeMarket.low24h.toLocaleString(isTomanQuote ? 'fa-IR' : 'en-US', {
              maximumFractionDigits: activeMarket.precision,
            })}
          </span>
        </div>

        {/* 24h Volume */}
        <div className="hidden lg:flex flex-col">
          <span className="text-[10px] text-slate-400">حجم ۲۴ ساعت</span>
          <span className="font-mono-numbers font-medium text-slate-300">
            {activeMarket.volume24h > 1000000
              ? `${(activeMarket.volume24h / 1000000).toFixed(1)}M`
              : activeMarket.volume24h.toLocaleString('en-US')}
          </span>
        </div>
      </div>
    </div>
  );
};

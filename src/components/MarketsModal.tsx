/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useBroker } from '../context/BrokerContext';
import { MarketCategory } from '../types/broker';
import { X, Search, TrendingUp, TrendingDown, Zap, Star } from 'lucide-react';

export const MarketsModal: React.FC = () => {
  const { markets, activeMarket, selectMarket, isMarketsModalOpen, setMarketsModalOpen } =
    useBroker();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory | 'all'>('all');

  if (!isMarketsModalOpen) return null;

  const filteredMarkets = markets.filter((m) => {
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesSearch =
      m.symbol.toLowerCase().includes(search.toLowerCase()) ||
      m.nameFa.includes(search);
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'همه بازارها' },
    { id: 'gold', label: 'طلا و مسکوکات' },
    { id: 'forex', label: 'فارکس و ارزها' },
    { id: 'crypto', label: 'رمزارزها' },
    { id: 'us_stocks', label: 'سهام و شاخص‌های آمریکا' },
    { id: 'commodities', label: 'نفت و انرژی' },
    { id: 'toman', label: 'بازار تومانی' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-2xl bg-[#0e131b] border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-100">انتخاب نماد معاملاتی</h3>
          <button
            onClick={() => setMarketsModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Tabs */}
        <div className="p-4 border-b border-slate-800 bg-[#090d13] space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی نماد (مثلاً طلا، BTC، EUR، تتر)..."
              className="w-full bg-[#121822] border border-slate-800 focus:border-amber-500 rounded-xl py-2 pr-9 pl-3 text-slate-100 text-xs focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as MarketCategory | 'all')}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Markets Table */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-850 text-xs">
          {filteredMarkets.map((market) => {
            const isPositive = market.change24h >= 0;
            const isTomanQuote = market.quoteAsset === 'IRT';
            const isSelected = market.id === activeMarket.id;

            return (
              <div
                key={market.id}
                onClick={() => {
                  selectMarket(market.id);
                  setMarketsModalOpen(false);
                }}
                className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected ? 'bg-amber-500/10' : 'hover:bg-slate-850/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${market.iconBg} flex items-center justify-center text-xs font-bold text-white shadow-md`}
                  >
                    {market.baseAsset.substring(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm font-mono-numbers">
                        {market.symbol}
                      </span>
                      {market.maxLeverage > 1 && (
                        <span className="text-[10px] bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5" />
                          <span>{market.maxLeverage}x</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">{market.nameFa}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-left">
                  <div>
                    <span className="font-bold text-sm text-slate-100 font-mono-numbers block">
                      {market.price.toLocaleString(isTomanQuote ? 'fa-IR' : 'en-US', {
                        maximumFractionDigits: market.precision,
                      })}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {isTomanQuote ? 'تومان' : market.quoteAsset}
                    </span>
                  </div>

                  <div
                    className={`min-w-[65px] px-2 py-1 rounded-lg text-center font-bold font-mono-numbers text-xs flex items-center justify-center gap-0.5 ${
                      isPositive
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-rose-500/15 text-rose-400'
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isPositive ? '+' : ''}
                      {market.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

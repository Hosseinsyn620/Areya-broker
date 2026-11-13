/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useBroker } from '../context/BrokerContext';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Zap,
  Check,
  AlertCircle,
  Percent,
  Sliders,
  Sparkles,
} from 'lucide-react';

export const ChartQuickTradeBar: React.FC = () => {
  const {
    activeMarket,
    currentPrice,
    accountMode,
    balances,
    brokerSettings,
    placeOrder,
  } = useBroker();

  const isDemo = accountMode === 'demo';
  const isTomanQuote = activeMarket.quoteAsset === 'IRT';
  const quoteKey = isDemo
    ? isTomanQuote ? 'demo_IRT' : 'demo_USDT'
    : isTomanQuote ? 'IRT' : 'USDT';

  const availableBalance = balances[quoteKey as keyof typeof balances];
  const quoteName = isTomanQuote ? 'تومان' : activeMarket.quoteAsset;

  // Selected quick leverage (defaults to account leverage, up to 2000x)
  const [quickLeverage, setQuickLeverage] = useState<number>(
    brokerSettings.defaultLeverage || 20
  );

  // Sync with brokerSettings.defaultLeverage
  React.useEffect(() => {
    if (brokerSettings.defaultLeverage) {
      setQuickLeverage(
        Math.min(brokerSettings.defaultLeverage, activeMarket.maxLeverage)
      );
    }
  }, [brokerSettings.defaultLeverage, activeMarket.maxLeverage]);

  // Amount input state
  const defaultAmount = useMemo(() => {
    if (activeMarket.category === 'forex') return '100';
    if (activeMarket.category === 'gold' && isTomanQuote) return '1';
    if (activeMarket.id === 'btc_usdt') return '0.01';
    if (activeMarket.id === 'eth_usdt') return '0.1';
    return '1';
  }, [activeMarket.id, activeMarket.category, isTomanQuote]);

  const [amount, setAmount] = useState<string>(defaultAmount);
  const [isLeverageMenuOpen, setIsLeverageMenuOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  const numAmount = parseFloat(amount) || 0;
  const totalValue = currentPrice * numAmount;
  const requiredMargin = totalValue / (quickLeverage || 1);

  // Spread simulation (0.01% for bid/ask distinction)
  const spread = currentPrice * 0.0002;
  const askPrice = currentPrice + spread / 2;
  const bidPrice = currentPrice - spread / 2;

  const handlePercent = (pct: number) => {
    if (availableBalance <= 0 || currentPrice <= 0) return;
    const marginToUse = availableBalance * (pct / 100);
    const totalPosValue = marginToUse * quickLeverage;
    const calcAmount = totalPosValue / currentPrice;
    setAmount(
      calcAmount.toFixed(
        activeMarket.precision > 2 ? 3 : activeMarket.precision === 0 ? 0 : 2
      )
    );
  };

  const handleQuickTrade = (side: 'buy' | 'sell') => {
    if (numAmount <= 0) {
      setFeedback({ text: 'لطفاً حجم معامله را وارد کنید.', type: 'error' });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    const res = placeOrder({
      side,
      type: 'market',
      tradingMode: 'margin',
      amount: numAmount,
      leverage: quickLeverage,
    });

    if (res.success) {
      setFeedback({
        text: `سفارش سریع ${side === 'buy' ? 'خرید' : 'فروش'} با اهرم ${quickLeverage}x با موفقیت باز شد!`,
        type: 'success',
      });
    } else {
      setFeedback({ text: res.message, type: 'error' });
    }

    setTimeout(() => setFeedback(null), 4000);
  };

  const leveragePresets = [1, 10, 50, 100, 200, 500, 1000, 2000].filter(
    (l) => l <= activeMarket.maxLeverage
  );

  return (
    <div className="relative border-t border-slate-800/90 bg-[#090d15] p-2.5 sm:p-3 select-none transition-all">
      {/* Toast Feedback Notification */}
      {feedback && (
        <div
          className={`absolute -top-12 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-2xl text-xs font-bold shadow-xl border flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/60 text-emerald-200'
              : 'bg-rose-950/95 border-rose-500/60 text-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Main Bar: Buy Button + Controls + Sell Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* FAST BUY BUTTON (Green) */}
        <button
          onClick={() => handleQuickTrade('buy')}
          className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold transition-all shadow-lg shadow-emerald-600/25 active:scale-[0.98] border border-emerald-400/40 flex items-center justify-between group"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="text-right">
              <span className="block text-xs font-black tracking-wide">خرید سریع (BUY)</span>
              <span className="block text-[10px] text-emerald-100/90 font-normal">
                Ask Market Price
              </span>
            </div>
          </div>
          <div className="text-left font-mono-numbers">
            <span className="text-xs sm:text-sm font-black block">
              {askPrice.toLocaleString('en-US', {
                minimumFractionDigits: activeMarket.precision,
                maximumFractionDigits: activeMarket.precision,
              })}
            </span>
            <span className="text-[10px] text-emerald-200/90 font-normal">
              {activeMarket.quoteAsset}
            </span>
          </div>
        </button>

        {/* CENTER CONTROLS: Amount & Leverage Pill */}
        <div className="flex items-center justify-center gap-2 bg-[#0e1422] p-1.5 rounded-2xl border border-slate-800 shrink-0">
          {/* Quick Volume Chips */}
          <div className="hidden md:flex items-center gap-1">
            {[25, 50, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => handlePercent(pct)}
                className="px-2 py-1 rounded-xl bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-[10px] font-bold font-mono-numbers transition-all"
                title={`${pct}٪ موجودی کیف پول`}
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Amount Numeric Input */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-950/80 rounded-xl border border-slate-800/90">
            <span className="text-[10px] text-slate-400 font-medium">حجم:</span>
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-16 sm:w-20 bg-transparent text-slate-100 font-mono-numbers font-bold text-xs text-center focus:outline-none"
              placeholder="0.00"
            />
            <span className="text-[10px] text-amber-400 font-bold">{activeMarket.baseAsset}</span>
          </div>

          {/* Leverage Selector Badge (Up to 2000x) */}
          <div className="relative">
            <button
              onClick={() => setIsLeverageMenuOpen(!isLeverageMenuOpen)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-400 font-mono-numbers font-bold text-xs flex items-center gap-1 transition-all active:scale-95"
              title="تغییر سریع اهرم"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{quickLeverage}x</span>
            </button>

            {/* Quick Leverage Dropdown */}
            {isLeverageMenuOpen && (
              <div className="absolute bottom-11 left-1/2 -translate-x-1/2 z-40 p-2 bg-[#0e1422] border border-slate-750 rounded-2xl shadow-2xl w-48 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1 border-b border-slate-800">
                  <span className="font-bold">انتخاب اهرم ترید سریع:</span>
                  <span className="text-amber-400 font-mono-numbers">{quickLeverage}x</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {leveragePresets.map((lev) => (
                    <button
                      key={lev}
                      onClick={() => {
                        setQuickLeverage(lev);
                        setIsLeverageMenuOpen(false);
                      }}
                      className={`py-1 rounded-lg text-[10px] font-mono-numbers font-bold transition-all ${
                        quickLeverage === lev
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {lev}x
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FAST SELL BUTTON (Red) */}
        <button
          onClick={() => handleQuickTrade('sell')}
          className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-bold transition-all shadow-lg shadow-rose-600/25 active:scale-[0.98] border border-rose-400/40 flex items-center justify-between group"
        >
          <div className="text-right font-mono-numbers">
            <span className="text-xs sm:text-sm font-black block">
              {bidPrice.toLocaleString('en-US', {
                minimumFractionDigits: activeMarket.precision,
                maximumFractionDigits: activeMarket.precision,
              })}
            </span>
            <span className="text-[10px] text-rose-200/90 font-normal">
              {activeMarket.quoteAsset}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-left">
              <span className="block text-xs font-black tracking-wide">فروش سریع (SELL)</span>
              <span className="block text-[10px] text-rose-100/90 font-normal">
                Bid Market Price
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
        </button>
      </div>

      {/* Sub-bar: Margin Calculation & Available Balance */}
      <div className="mt-1.5 px-2 flex items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center gap-2">
          <span>
            مارجین مورد نیاز:
            <span className="font-mono-numbers font-bold text-slate-200 mr-1">
              {requiredMargin.toLocaleString('en-US', {
                minimumFractionDigits: isTomanQuote ? 0 : 2,
                maximumFractionDigits: isTomanQuote ? 0 : 2,
              })}{' '}
              {quoteName}
            </span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="hidden sm:inline">
            ارزش معامله:
            <span className="font-mono-numbers text-slate-300 mr-1">
              {totalValue.toLocaleString('en-US', {
                minimumFractionDigits: isTomanQuote ? 0 : 2,
                maximumFractionDigits: isTomanQuote ? 0 : 2,
              })}{' '}
              {quoteName}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono-numbers">
          <span className="text-slate-500">موجودی در دسترس:</span>
          <span className="font-bold text-amber-400">
            {availableBalance.toLocaleString('en-US', {
              minimumFractionDigits: isTomanQuote ? 0 : 2,
              maximumFractionDigits: isTomanQuote ? 0 : 2,
            })}{' '}
            {quoteName}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useBroker } from '../context/BrokerContext';
import { TradingMode, OrderSide, OrderType } from '../types/broker';
import {
  Zap,
  ShieldAlert,
  ArrowDownLeft,
  ArrowUpRight,
  PlusCircle,
  TrendingUp,
  Percent,
} from 'lucide-react';

export const TradeForm: React.FC = () => {
  const {
    activeMarket,
    currentPrice,
    accountMode,
    balances,
    brokerSettings,
    placeOrder,
    setCardDepositModalOpen,
  } = useBroker();

  const [tradingMode, setTradingMode] = useState<TradingMode>('margin');
  const [orderSide, setOrderSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [leverage, setLeverage] = useState<number>(brokerSettings.defaultLeverage || 20);

  // Sync with brokerSettings.defaultLeverage when user changes it in settings
  React.useEffect(() => {
    if (brokerSettings.defaultLeverage) {
      setLeverage(Math.min(brokerSettings.defaultLeverage, activeMarket.maxLeverage));
    }
  }, [brokerSettings.defaultLeverage, activeMarket.maxLeverage]);

  const [priceInput, setPriceInput] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('0.5');
  const [enableTpSl, setEnableTpSl] = useState<boolean>(false);
  const [tpInput, setTpInput] = useState<string>('');
  const [slInput, setSlInput] = useState<string>('');
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  const isDemo = accountMode === 'demo';
  const isTomanQuote = activeMarket.quoteAsset === 'IRT';
  const quoteAssetKey = isDemo
    ? isTomanQuote ? 'demo_IRT' : 'demo_USDT'
    : isTomanQuote ? 'IRT' : 'USDT';

  const availableBalance = balances[quoteAssetKey as keyof typeof balances];
  const quoteName = isTomanQuote ? 'تومان' : activeMarket.quoteAsset;

  const effectivePrice = orderType === 'market' ? currentPrice : parseFloat(priceInput) || currentPrice;
  const amount = parseFloat(amountInput) || 0;
  const totalValue = effectivePrice * amount;
  const effectiveLeverage = tradingMode === 'margin' ? leverage : 1;
  const requiredMargin = totalValue / effectiveLeverage;

  // Liquidation price calculation
  const estLiquidation =
    tradingMode === 'margin' && effectiveLeverage > 1
      ? orderSide === 'buy'
        ? Math.max(0, effectivePrice * (1 - 0.9 / effectiveLeverage))
        : effectivePrice * (1 + 0.9 / effectiveLeverage)
      : 0;

  const leverageOptions = [1, 10, 50, 100, 200, 500, 1000, 2000].filter((l) => l <= activeMarket.maxLeverage);

  const handlePercentClick = (percent: number) => {
    if (availableBalance <= 0 || effectivePrice <= 0) return;
    const maxMargin = availableBalance * (percent / 100);
    const maxTotalValue = maxMargin * effectiveLeverage;
    const calculatedAmount = maxTotalValue / effectivePrice;
    setAmountInput(calculatedAmount.toFixed(activeMarket.precision > 2 ? 3 : 2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setNotification({ text: 'لطفاً مقدار معامله را وارد کنید.', type: 'error' });
      return;
    }

    const res = placeOrder({
      side: orderSide,
      type: orderType,
      tradingMode,
      price: orderType === 'limit' ? parseFloat(priceInput) : undefined,
      amount,
      leverage: effectiveLeverage,
      takeProfit: enableTpSl && tpInput ? parseFloat(tpInput) : undefined,
      stopLoss: enableTpSl && slInput ? parseFloat(slInput) : undefined,
    });

    if (res.success) {
      setNotification({ text: res.message, type: 'success' });
    } else {
      setNotification({ text: res.message, type: 'error' });
    }

    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0e16] p-3.5 text-xs select-none overflow-y-auto">
      {/* 1. Spot vs Margin Mode Selector (Modern Pill) */}
      <div className="flex items-center bg-[#111723] p-1 rounded-2xl border border-slate-800/80 mb-3 shadow-inner">
        <button
          type="button"
          onClick={() => setTradingMode('margin')}
          className={`flex-1 py-2 rounded-xl font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
            tradingMode === 'margin'
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>معاملات اهرمی (فیوچرز)</span>
        </button>
        <button
          type="button"
          onClick={() => setTradingMode('spot')}
          className={`flex-1 py-2 rounded-xl font-bold text-center transition-all ${
            tradingMode === 'spot'
              ? 'bg-slate-750 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>اسپات (نقدی)</span>
        </button>
      </div>

      {/* 2. Buy / Sell Modern Segmented Cards */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <button
          type="button"
          onClick={() => setOrderSide('buy')}
          className={`py-2.5 px-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
            orderSide === 'buy'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-400/40'
              : 'bg-[#121927] text-slate-400 hover:text-emerald-400 border border-slate-800'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
          <span>{tradingMode === 'margin' ? 'خرید / لانگ (Long)' : 'خرید اسپات'}</span>
        </button>
        <button
          type="button"
          onClick={() => setOrderSide('sell')}
          className={`py-2.5 px-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
            orderSide === 'sell'
              ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/25 ring-1 ring-rose-400/40'
              : 'bg-[#121927] text-slate-400 hover:text-rose-400 border border-slate-800'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          <span>{tradingMode === 'margin' ? 'فروش / شورت (Short)' : 'فروش اسپات'}</span>
        </button>
      </div>

      {/* 3. Order Type (Market vs Limit) */}
      <div className="flex items-center gap-2 mb-3 bg-[#111723] p-1 rounded-2xl border border-slate-800/80">
        <button
          type="button"
          onClick={() => setOrderType('market')}
          className={`flex-1 py-1.5 rounded-xl text-center transition-all font-bold ${
            orderType === 'market'
              ? 'bg-slate-800 text-amber-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          قیمت مارکت (فوری)
        </button>
        <button
          type="button"
          onClick={() => {
            setOrderType('limit');
            if (!priceInput) setPriceInput(currentPrice.toString());
          }}
          className={`flex-1 py-1.5 rounded-xl text-center transition-all font-bold ${
            orderType === 'limit'
              ? 'bg-slate-800 text-amber-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          سفارش لیمیت (محدود)
        </button>
      </div>

      {/* 4. Leverage Selector (Margin mode only - up to 2000x) */}
      {tradingMode === 'margin' && (
        <div className="mb-3 p-3 bg-[#111723] rounded-2xl border border-slate-800/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">ضریب اهرم معاملاتی (تا ۲۰۰۰x):</span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-amber-400 font-mono-numbers text-xs">{leverage}x</span>
              {leverage >= 1000 && (
                <span className="text-[9px] bg-rose-500/20 text-rose-400 px-1.5 py-0.2 rounded-full font-bold">Ultra</span>
              )}
            </div>
          </div>

          {/* Leverage Range Slider */}
          <input
            type="range"
            min="1"
            max={activeMarket.maxLeverage}
            step="1"
            value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
            className="w-full accent-amber-500 h-1 bg-slate-800 rounded cursor-pointer"
          />

          <div className="grid grid-cols-4 gap-1.5">
            {leverageOptions.map((lev) => (
              <button
                key={lev}
                type="button"
                onClick={() => setLeverage(lev)}
                className={`py-1 rounded-xl text-[10px] font-mono-numbers font-bold transition-all ${
                  leverage === lev
                    ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                    : 'bg-slate-850 text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-750/60'
                }`}
              >
                {lev}x
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Form Inputs */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Limit Price Input */}
        {orderType === 'limit' && (
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>قیمت سفارش</span>
              <span>{quoteName}</span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder={currentPrice.toString()}
                className="w-full bg-[#111723] border border-slate-800 focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 rounded-2xl py-2 px-3 text-slate-100 font-mono-numbers text-sm text-left focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setPriceInput(currentPrice.toString())}
                className="absolute right-3 top-2.5 text-[10px] text-amber-400 hover:underline font-bold"
              >
                قیمت زنده
              </button>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>حجم معامله</span>
            <span>{activeMarket.baseAsset}</span>
          </div>
          <input
            type="number"
            step="any"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            className="w-full bg-[#111723] border border-slate-800 focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/15 rounded-2xl py-2 px-3 text-slate-100 font-mono-numbers text-sm text-left focus:outline-none transition-all"
          />
        </div>

        {/* Percentage Shortcuts */}
        <div className="grid grid-cols-4 gap-1.5">
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => handlePercentClick(pct)}
              className="py-1.5 rounded-xl bg-[#111723] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-mono-numbers text-[11px] font-bold transition-all"
            >
              {pct}%
            </button>
          ))}
        </div>

        {/* TP / SL Checkbox & Fields */}
        <div className="pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300 select-none">
            <input
              type="checkbox"
              checked={enableTpSl}
              onChange={(e) => setEnableTpSl(e.target.checked)}
              className="w-4 h-4 rounded-md bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 accent-amber-500"
            />
            <span className="font-bold">تنظیم حد سود (TP) و حد ضرر (SL)</span>
          </label>

          {enableTpSl && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <span className="text-[10px] text-emerald-400 block mb-1 font-bold">حد سود (TP)</span>
                <input
                  type="number"
                  step="any"
                  value={tpInput}
                  onChange={(e) => setTpInput(e.target.value)}
                  placeholder="قیمت هدف"
                  className="w-full bg-[#111723] border border-slate-800 rounded-xl py-1.5 px-2.5 text-slate-100 font-mono-numbers text-xs text-left focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-rose-400 block mb-1 font-bold">حد ضرر (SL)</span>
                <input
                  type="number"
                  step="any"
                  value={slInput}
                  onChange={(e) => setSlInput(e.target.value)}
                  placeholder="قیمت توقف"
                  className="w-full bg-[#111723] border border-slate-800 rounded-xl py-1.5 px-2.5 text-slate-100 font-mono-numbers text-xs text-left focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Calculations (Glassy Card) */}
        <div className="p-3 bg-[#111723]/90 rounded-2xl border border-slate-800/90 space-y-2 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">موجودی در دسترس:</span>
            <div className="flex items-center gap-1 font-mono-numbers text-slate-200">
              <span className="font-bold">
                {availableBalance.toLocaleString(isTomanQuote ? 'fa-IR' : 'en-US', {
                  maximumFractionDigits: isTomanQuote ? 0 : 2,
                })}
              </span>
              <span className="text-slate-400">{quoteName}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">ارزش کل پوزیشن:</span>
            <div className="flex items-center gap-1 font-mono-numbers text-slate-200">
              <span>
                {totalValue.toLocaleString(isTomanQuote ? 'fa-IR' : 'en-US', {
                  maximumFractionDigits: isTomanQuote ? 0 : 2,
                })}
              </span>
              <span className="text-slate-400">{quoteName}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">مارجین مورد نیاز:</span>
            <div className="flex items-center gap-1 font-mono-numbers text-amber-400 font-bold">
              <span>
                {requiredMargin.toLocaleString(isTomanQuote ? 'fa-IR' : 'en-US', {
                  maximumFractionDigits: isTomanQuote ? 0 : 2,
                })}
              </span>
              <span className="text-slate-400">{quoteName}</span>
            </div>
          </div>

          {tradingMode === 'margin' && effectiveLeverage > 1 && (
            <div className="flex items-center justify-between text-rose-400 pt-1 border-t border-slate-800/80">
              <span className="flex items-center gap-1 font-bold">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>قیمت لیکوئیدیشن:</span>
              </span>
              <span className="font-mono-numbers font-bold">
                {estLiquidation.toLocaleString(isTomanQuote ? 'fa-IR' : 'en-US', {
                  maximumFractionDigits: activeMarket.precision,
                })}
              </span>
            </div>
          )}
        </div>

        {/* Notification Toast */}
        {notification && (
          <div
            className={`p-2.5 rounded-2xl text-xs font-bold ${
              notification.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950/80 text-rose-300 border border-rose-800'
            }`}
          >
            {notification.text}
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          className={`w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all shadow-xl active:scale-[0.98] ${
            orderSide === 'buy'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-600/30 ring-1 ring-emerald-400/30'
              : 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 shadow-rose-600/30 ring-1 ring-rose-400/30'
          }`}
        >
          {orderSide === 'buy'
            ? `ثبت سفارش خرید (${tradingMode === 'margin' ? 'Long' : 'اسپات'})`
            : `ثبت سفارش فروش (${tradingMode === 'margin' ? 'Short' : 'اسپات'})`}
        </button>

        {/* Quick Deposit Trigger if balance is low */}
        {availableBalance < requiredMargin && (
          <button
            type="button"
            onClick={() => setCardDepositModalOpen(true)}
            className="w-full py-2.5 rounded-2xl border border-dashed border-amber-500/40 text-amber-400 hover:bg-amber-500/10 transition-colors flex items-center justify-center gap-1.5 text-xs font-bold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>موجودی کم است - شارژ کارت به کارت</span>
          </button>
        )}
      </form>
    </div>
  );
};

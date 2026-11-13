/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useBroker } from '../context/BrokerContext';
import {
  X,
  ArrowDownUp,
  RefreshCw,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';

interface SwapAssetOption {
  symbol: string;
  nameFa: string;
  usdPrice: number;
  iconBg: string;
}

export const InstantSwapModal: React.FC = () => {
  const {
    isSwapModalOpen,
    setSwapModalOpen,
    balances,
    accountMode,
    brokerSettings,
    executeInstantSwap,
    markets,
  } = useBroker();

  // Find live prices from markets if available
  const btcPrice = useMemo(() => {
    return markets.find((m) => m.id === 'btc_usdt')?.price || 74995;
  }, [markets]);

  const ethPrice = useMemo(() => {
    return markets.find((m) => m.id === 'eth_usdt')?.price || 2123;
  }, [markets]);

  const goldGramToman = useMemo(() => {
    return markets.find((m) => m.id === 'irtg_irt')?.price || 9196700;
  }, [markets]);

  const usdToToman = brokerSettings.usdToTomanRate || 95000;

  const SWAP_ASSETS: SwapAssetOption[] = useMemo(
    () => [
      {
        symbol: 'IRT',
        nameFa: 'تومان ایران (IRT)',
        usdPrice: 1 / usdToToman,
        iconBg: 'from-blue-600 to-indigo-800',
      },
      {
        symbol: 'USDT',
        nameFa: 'تتر (USDT)',
        usdPrice: 1,
        iconBg: 'from-emerald-500 to-teal-700',
      },
      {
        symbol: 'BTC',
        nameFa: 'بیت‌کوین (BTC)',
        usdPrice: btcPrice,
        iconBg: 'from-amber-500 to-orange-700',
      },
      {
        symbol: 'GOLD_GRAM',
        nameFa: 'طلای ۱۸ عیار (گرم)',
        usdPrice: goldGramToman / usdToToman,
        iconBg: 'from-yellow-400 to-amber-600',
      },
      {
        symbol: 'ETH',
        nameFa: 'اتریوم (ETH)',
        usdPrice: ethPrice,
        iconBg: 'from-indigo-500 to-purple-700',
      },
    ],
    [usdToToman, btcPrice, goldGramToman, ethPrice]
  );

  const [fromAsset, setFromAsset] = useState<string>('IRT');
  const [toAsset, setToAsset] = useState<string>('USDT');
  const [fromAmount, setFromAmount] = useState<string>('10000000'); // 10 million Toman default
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isSwapModalOpen) return null;

  const isDemo = accountMode === 'demo';

  // Get user balance for chosen asset
  const getAssetBalance = (sym: string): number => {
    const key = isDemo ? `demo_${sym}` : sym;
    return (balances[key as keyof typeof balances] as number) || 0;
  };

  const currentFromBalance = getAssetBalance(fromAsset);

  // Calculate swap rate
  const fromAssetMeta = SWAP_ASSETS.find((a) => a.symbol === fromAsset) || SWAP_ASSETS[0];
  const toAssetMeta = SWAP_ASSETS.find((a) => a.symbol === toAsset) || SWAP_ASSETS[1];

  // Rate: 1 FromAsset = how many ToAsset?
  const unitRate = fromAssetMeta.usdPrice / toAssetMeta.usdPrice;

  const numericFromAmount = parseFloat(fromAmount) || 0;
  const grossToAmount = numericFromAmount * unitRate;
  const swapFeeRate = 0.001; // 0.1% fee
  const feeAmount = grossToAmount * swapFeeRate;
  const netToAmount = Math.max(0, grossToAmount - feeAmount);

  // Invert From and To
  const handleSwapDirection = () => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
    setNotification(null);
  };

  const handleSetMax = (pct: number) => {
    const amt = currentFromBalance * pct;
    if (fromAsset === 'IRT') {
      setFromAmount(Math.floor(amt).toString());
    } else {
      setFromAmount(amt.toFixed(4));
    }
  };

  const handleExecute = async () => {
    if (numericFromAmount <= 0) {
      setNotification({ type: 'error', text: 'لطفا مبلغ معتبر جهت تبدیل وارد کنید.' });
      return;
    }

    if (numericFromAmount > currentFromBalance) {
      setNotification({
        type: 'error',
        text: `موجودی شما ناکافی است. موجودی در دسترس: ${currentFromBalance.toLocaleString('fa-IR')} ${fromAsset}`,
      });
      return;
    }

    setIsSwapping(true);
    setNotification(null);

    await new Promise((r) => setTimeout(r, 1200));

    const res = executeInstantSwap(
      fromAsset,
      toAsset,
      numericFromAmount,
      Number(netToAmount.toFixed(4))
    );

    setIsSwapping(false);
    if (res.success) {
      setNotification({ type: 'success', text: res.message });
      setFromAmount('');
    } else {
      setNotification({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-lg bg-[#0e131b] border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <span>صرافی تبدیل سریع (Instant Swap)</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                  بدون اسلیپیج
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تبدیل آنی تومان به تتر، طلا و بیت‌کوین با بهترین نرخ بازار جهانی
              </p>
            </div>
          </div>
          <button
            onClick={() => setSwapModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs flex-1">
          {notification && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
                notification.type === 'success'
                  ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/70 border-rose-800 text-rose-300'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{notification.text}</span>
            </div>
          )}

          {/* From Asset Box */}
          <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="font-bold text-slate-300">پرداخت می‌کنید (از دارایی):</span>
              <div className="flex items-center gap-1.5">
                <span>موجودی:</span>
                <span className="font-mono-numbers text-amber-300 font-bold">
                  {currentFromBalance.toLocaleString('fa-IR')} {fromAsset}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="flex-1 bg-transparent text-xl font-bold font-mono-numbers text-slate-100 placeholder-slate-600 focus:outline-none"
              />
              <select
                value={fromAsset}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === toAsset) {
                    setToAsset(fromAsset);
                  }
                  setFromAsset(val);
                }}
                className="bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
              >
                {SWAP_ASSETS.map((a) => (
                  <option key={a.symbol} value={a.symbol}>
                    {a.nameFa}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Percentage Chips */}
            <div className="flex items-center gap-1.5 pt-1">
              {[0.25, 0.5, 0.75, 1].map((pct) => (
                <button
                  key={pct}
                  onClick={() => handleSetMax(pct)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-bold transition-colors"
                >
                  {pct === 1 ? 'کل موجودی (۱۰۰٪)' : `${pct * 100}٪`}
                </button>
              ))}
            </div>
          </div>

          {/* Invert Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              onClick={handleSwapDirection}
              className="p-2.5 rounded-full bg-slate-800 border-2 border-slate-900 text-blue-400 hover:text-white hover:bg-blue-600 transition-all shadow-lg active:scale-95"
            >
              <ArrowDownUp className="w-4 h-4" />
            </button>
          </div>

          {/* To Asset Box */}
          <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="font-bold text-slate-300">دریافت می‌کنید (به دارایی):</span>
              <div className="flex items-center gap-1.5">
                <span>موجودی فعلی:</span>
                <span className="font-mono-numbers text-slate-300 font-medium">
                  {getAssetBalance(toAsset).toLocaleString('fa-IR')} {toAsset}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={numericFromAmount > 0 ? netToAmount.toLocaleString('fa-IR', { maximumFractionDigits: 6 }) : '0'}
                className="flex-1 bg-transparent text-xl font-bold font-mono-numbers text-emerald-400 focus:outline-none"
              />
              <select
                value={toAsset}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === fromAsset) {
                    setFromAsset(toAsset);
                  }
                  setToAsset(val);
                }}
                className="bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
              >
                {SWAP_ASSETS.map((a) => (
                  <option key={a.symbol} value={a.symbol}>
                    {a.nameFa}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Breakdown Details */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-slate-400">
              <span>نرخ تبدیل لحظه‌ای:</span>
              <span className="font-mono-numbers text-slate-200 font-bold">
                1 {fromAsset} ≈ {unitRate < 0.001 ? unitRate.toFixed(8) : unitRate.toFixed(4)} {toAsset}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>کارمزد تبدیل (۰.۱٪):</span>
              <span className="font-mono-numbers text-slate-200">
                {feeAmount.toFixed(4)} {toAsset}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>تطبیق هوشمند قیمت:</span>
              <span className="text-emerald-400 font-medium">تضمین حداقل قیمت بدون لغزش</span>
            </div>
          </div>

          {/* Swap Action Button */}
          <button
            onClick={handleExecute}
            disabled={isSwapping || numericFromAmount <= 0}
            className="w-full py-3 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            {isSwapping ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>در حال تبادل در هسته معاملات...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>تبدیل فوری {fromAsset} به {toAsset}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useBroker } from '../context/BrokerContext';
import { formatCurrency } from '../utils/iranianBanks';
import { InvestableAssetSymbol, WalletBalances } from '../types/broker';
import {
  X,
  Wallet,
  CreditCard,
  ArrowUpRight,
  Landmark,
  Lock,
} from 'lucide-react';

const WALLET_ASSET_META: {
  symbol: InvestableAssetSymbol;
  nameFa: string;
  desc: string;
  badgeText: string;
  badgeClass: string;
  precision: number;
  unitSuffix?: string;
}[] = [
  {
    symbol: 'USDT',
    nameFa: 'تتر دیجیتال (USDT)',
    desc: 'دلار باثبات کریپتوکارنسی',
    badgeText: 'USDT',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    precision: 2,
  },
  {
    symbol: 'GOLD_GRAM',
    nameFa: 'طلای ۱۸ عیار آب‌شده',
    desc: 'سرمایه‌گذاری با پشتوانه طلا',
    badgeText: 'AU18',
    badgeClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    precision: 3,
    unitSuffix: 'گرم',
  },
  {
    symbol: 'BTC',
    nameFa: 'بیت‌کوین (Bitcoin)',
    desc: 'طلای دیجیتال جهان',
    badgeText: 'BTC',
    badgeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    precision: 6,
  },
  {
    symbol: 'ETH',
    nameFa: 'اتریوم (Ethereum)',
    desc: 'قراردادهای هوشمند وب۳',
    badgeText: 'ETH',
    badgeClass: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    precision: 5,
  },
  {
    symbol: 'SOL',
    nameFa: 'سولانا (Solana)',
    desc: 'شبکه بلاکچین پرسرعت',
    badgeText: 'SOL',
    badgeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    precision: 4,
  },
  {
    symbol: 'BNB',
    nameFa: 'بایننس کوین (BNB)',
    desc: 'توکن اکوسیستم بایننس',
    badgeText: 'BNB',
    badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    precision: 4,
  },
  {
    symbol: 'TON',
    nameFa: 'تون‌کوین (Toncoin)',
    desc: 'رمزارز شبکه تلگرام',
    badgeText: 'TON',
    badgeClass: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    precision: 2,
  },
  {
    symbol: 'XRP',
    nameFa: 'ریپل (XRP)',
    desc: 'شبکه انتقال بین‌بانکی',
    badgeText: 'XRP',
    badgeClass: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    precision: 2,
  },
];

export const WalletModal: React.FC = () => {
  const {
    isWalletModalOpen,
    setWalletModalOpen,
    balances,
    accountMode,
    setAccountMode,
    setCardDepositModalOpen,
    setWithdrawModalOpen,
    setExchangeModalOpen,
    brokerSettings,
    markets,
    getAssetUnitPriceToman,
    getLockedCollateralAmount,
    loans,
  } = useBroker();

  if (!isWalletModalOpen) return null;

  const isDemo = accountMode === 'demo';
  const irt = isDemo ? balances.demo_IRT : balances.IRT;

  const liveUsdRate =
    markets.find((m) => m.id === 'usdt_irt')?.price ||
    brokerSettings.usdToTomanRate ||
    95000;

  const assetRows = WALLET_ASSET_META.map((meta) => {
    const key = (isDemo ? `demo_${meta.symbol}` : meta.symbol) as keyof WalletBalances;
    const qty = (balances[key] as number) || 0;
    const unitPriceToman = getAssetUnitPriceToman(meta.symbol);
    const valueInToman = Math.round(qty * unitPriceToman);
    const locked = getLockedCollateralAmount(meta.symbol);
    return {
      ...meta,
      qty,
      locked,
      valueInToman,
    };
  });

  const cryptoGoldTotalToman = assetRows.reduce((s, r) => s + r.valueInToman, 0);
  const totalEquityToman = irt + cryptoGoldTotalToman;
  const totalEquityUsd = totalEquityToman / liveUsdRate;
  const activeLoansCount = loans.filter(
    (l) => l.status === 'active' && l.accountMode === accountMode
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-2xl bg-[#0e131b] border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">کیف پول اختصاصی بروکر آریا</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                مدیریت دارایی‌های ریالی، رمزارزها، طلا و اعتبار وام ۷۰٪ شما
              </p>
            </div>
          </div>
          <button
            onClick={() => setWalletModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto text-xs flex-1">
          {/* Account Switcher Banner */}
          <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">نوع حساب فعال:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  isDemo
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {isDemo ? 'حساب مجازی و آزمایشی (Demo)' : 'حساب واقعی سرمایه‌گذاری (Real)'}
              </span>
            </div>
            <button
              onClick={() => setAccountMode(isDemo ? 'real' : 'demo')}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-[11px] transition-colors"
            >
              تغییر به {isDemo ? 'حساب واقعی' : 'حساب دمو'}
            </button>
          </div>

          {/* Total Portfolio Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#161f2e] via-[#101724] to-[#0a0f18] border border-slate-750 shadow-lg space-y-3">
            <span className="text-[11px] text-slate-400 block">ارزش تخمینی کل دارایی‌ها (Equity):</span>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-2xl font-bold font-mono-numbers text-white tracking-tight">
                {formatCurrency(totalEquityToman)}
              </span>
              <span className="text-amber-400 font-medium text-sm">تومان</span>
              <span className="text-slate-500 text-xs mr-2">≈</span>
              <span className="text-emerald-400 font-mono-numbers text-sm">
                ${totalEquityUsd.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </span>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => {
                  setWalletModalOpen(false);
                  setCardDepositModalOpen(true);
                }}
                className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <CreditCard className="w-4 h-4" />
                <span>شارژ کارت به کارت</span>
              </button>
              <button
                onClick={() => {
                  setWalletModalOpen(false);
                  setExchangeModalOpen(true);
                }}
                className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Landmark className="w-4 h-4" />
                <span>صرافی و وام ۷۰٪</span>
              </button>
              <button
                onClick={() => {
                  setWalletModalOpen(false);
                  setWithdrawModalOpen(true);
                }}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowUpRight className="w-4 h-4 text-sky-400" />
                <span>برداشت به شبا</span>
              </button>
            </div>
          </div>

          {/* Asset Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold">تفکیک موجودی کیف پول و دارایی‌های سرمایه‌گذاری:</span>
              {activeLoansCount > 0 && (
                <span className="text-[10px] text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                  {activeLoansCount} وام فعال
                </span>
              )}
            </div>

            <div className="space-y-2">
              {/* Toman */}
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                    IRT
                  </div>
                  <div>
                    <span className="font-bold text-slate-200 block text-xs">تومان ایران (IRT)</span>
                    <span className="text-[10px] text-slate-400">موجودی نقدی قابل ترید و برداشت</span>
                  </div>
                </div>
                <div className="text-left font-mono-numbers">
                  <span className="font-bold text-sm text-slate-100 block">
                    {formatCurrency(irt)}
                  </span>
                  <span className="text-[10px] text-amber-400">تومان</span>
                </div>
              </div>

              {/* Crypto & Gold Assets (show core 3 always, plus any held assets with > 0) */}
              {assetRows
                .filter(
                  (r) =>
                    r.qty > 0 ||
                    r.symbol === 'USDT' ||
                    r.symbol === 'BTC' ||
                    r.symbol === 'GOLD_GRAM'
                )
                .map((row) => (
                  <div
                    key={row.symbol}
                    className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-[10px] ${row.badgeClass}`}
                      >
                        {row.badgeText}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-200 text-xs">{row.nameFa}</span>
                          {row.locked > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded">
                              <Lock className="w-2.5 h-2.5" />
                              وثیقه وام
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block">{row.desc}</span>
                      </div>
                    </div>
                    <div className="text-left font-mono-numbers">
                      <span className="font-bold text-sm text-slate-100 block">
                        {row.qty.toLocaleString('en-US', {
                          minimumFractionDigits: row.symbol === 'USDT' ? 2 : 0,
                          maximumFractionDigits: row.precision,
                        })}{' '}
                        {row.unitSuffix || row.symbol}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ≈ {formatCurrency(row.valueInToman)} تومان
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

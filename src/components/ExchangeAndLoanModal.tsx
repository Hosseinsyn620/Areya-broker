/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useBroker } from '../context/BrokerContext';
import {
  formatCardNumber,
  formatSheba,
  formatCurrency,
  numberToWordsFa,
} from '../utils/iranianBanks';
import { InvestableAssetSymbol, WalletBalances } from '../types/broker';
import {
  X,
  Landmark,
  Coins,
  CreditCard,
  Copy,
  Check,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Lock,
  Unlock,
  Percent,
  Calendar,
  Wallet,
  CheckCircle2,
  AlertCircle,
  ArrowDownLeft,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

type ExchangeTab = 'buy' | 'portfolio' | 'loan';

interface AssetCatalogItem {
  symbol: InvestableAssetSymbol;
  nameFa: string;
  unitLabel: string;
  precision: number;
  badgeColor: string;
  isGold?: boolean;
}

const EXCHANGE_ASSETS: AssetCatalogItem[] = [
  {
    symbol: 'GOLD_GRAM',
    nameFa: 'طلای ۱۸ عیار آب‌شده',
    unitLabel: 'گرم',
    precision: 3,
    badgeColor: 'from-yellow-400 to-amber-600',
    isGold: true,
  },
  {
    symbol: 'USDT',
    nameFa: 'تتر دیجیتال (دلار)',
    unitLabel: 'USDT',
    precision: 2,
    badgeColor: 'from-emerald-500 to-teal-700',
  },
  {
    symbol: 'BTC',
    nameFa: 'بیت‌کوین (Bitcoin)',
    unitLabel: 'BTC',
    precision: 6,
    badgeColor: 'from-amber-500 to-orange-700',
  },
  {
    symbol: 'ETH',
    nameFa: 'اتریوم (Ethereum)',
    unitLabel: 'ETH',
    precision: 5,
    badgeColor: 'from-indigo-500 to-purple-700',
  },
  {
    symbol: 'SOL',
    nameFa: 'سولانا (Solana)',
    unitLabel: 'SOL',
    precision: 4,
    badgeColor: 'from-purple-500 to-emerald-500',
  },
  {
    symbol: 'BNB',
    nameFa: 'بایننس کوین (BNB)',
    unitLabel: 'BNB',
    precision: 4,
    badgeColor: 'from-yellow-500 to-amber-600',
  },
  {
    symbol: 'TON',
    nameFa: 'تون‌کوین (Toncoin)',
    unitLabel: 'TON',
    precision: 2,
    badgeColor: 'from-sky-400 to-blue-600',
  },
  {
    symbol: 'XRP',
    nameFa: 'ریپل (XRP)',
    unitLabel: 'XRP',
    precision: 2,
    badgeColor: 'from-slate-600 to-slate-800',
  },
];

export const ExchangeAndLoanModal: React.FC = () => {
  const {
    isExchangeModalOpen,
    setExchangeModalOpen,
    setWithdrawModalOpen,
    balances,
    accountMode,
    brokerBankAccounts,
    kycInfo,
    exchangeLots,
    loans,
    getAssetUnitPriceToman,
    getLockedCollateralAmount,
    submitExchangeCardPurchase,
    sellExchangeAssetToToman,
    requestCollateralLoan,
    payLoanInstallment,
  } = useBroker();

  const [activeTab, setActiveTab] = useState<ExchangeTab>('buy');

  // --- Buy with Card state ---
  const [selectedAsset, setSelectedAsset] = useState<InvestableAssetSymbol>('GOLD_GRAM');
  const [tomanAmountStr, setTomanAmountStr] = useState<string>('10000000');
  const [selectedBankIdx, setSelectedBankIdx] = useState<number>(0);
  const [senderCardLast4, setSenderCardLast4] = useState<string>(
    kycInfo.registeredCardLast4 || '1755'
  );
  const [trackingCode, setTrackingCode] = useState<string>('78294105');
  const [referenceId] = useState<string>(
    () => `EX-${Math.floor(Math.random() * 899999 + 100000)}`
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmittingBuy, setIsSubmittingBuy] = useState<boolean>(false);
  const [buyFeedback, setBuyFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // --- Portfolio Sell-to-Rial state ---
  const [sellingAsset, setSellingAsset] = useState<InvestableAssetSymbol | null>(null);
  const [sellAmountStr, setSellAmountStr] = useState<string>('');
  const [portfolioFeedback, setPortfolioFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
    showWithdrawBtn?: boolean;
  } | null>(null);

  // --- Loan 70% state ---
  const [loanAsset, setLoanAsset] = useState<InvestableAssetSymbol>('GOLD_GRAM');
  const [loanCollateralStr, setLoanCollateralStr] = useState<string>('');
  const [loanCurrency, setLoanCurrency] = useState<'IRT' | 'USDT'>('IRT');
  const [monthsCount, setMonthsCount] = useState<number>(6);
  const [loanFeedback, setLoanFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
    showWithdrawBtn?: boolean;
  } | null>(null);

  const isDemo = accountMode === 'demo';
  const activeBanks = brokerBankAccounts.filter((b) => b.active !== false);
  const currentBank = activeBanks[selectedBankIdx] || activeBanks[0] || brokerBankAccounts[0];

  const getBal = (sym: InvestableAssetSymbol | 'IRT'): number => {
    const key = (isDemo ? `demo_${sym}` : sym) as keyof WalletBalances;
    return (balances[key] as number) || 0;
  };

  // Build live portfolio summary for all 8 assets
  const portfolioItems = useMemo(() => {
    return EXCHANGE_ASSETS.map((meta) => {
      const totalAmt = getBal(meta.symbol);
      const lockedAmt = getLockedCollateralAmount(meta.symbol);
      const freeAmt = Math.max(0, totalAmt - lockedAmt);
      const unitPriceToman = getAssetUnitPriceToman(meta.symbol);
      const liveValueToman = Math.round(totalAmt * unitPriceToman);
      const freeValueToman = Math.round(freeAmt * unitPriceToman);

      const assetLots = exchangeLots.filter(
        (l) => l.asset === meta.symbol && l.accountMode === accountMode
      );
      const totalBoughtCost = assetLots.reduce((acc, l) => acc + l.costToman, 0);
      const totalBoughtQty = assetLots.reduce((acc, l) => acc + l.amount, 0);
      const avgBuyPrice = totalBoughtQty > 0 ? totalBoughtCost / totalBoughtQty : unitPriceToman;
      const unrealizedProfitPct =
        totalBoughtQty > 0 && avgBuyPrice > 0
          ? ((unitPriceToman - avgBuyPrice) / avgBuyPrice) * 100
          : 0;

      return {
        ...meta,
        totalAmt,
        lockedAmt,
        freeAmt,
        unitPriceToman,
        liveValueToman,
        freeValueToman,
        unrealizedProfitPct,
        hasLots: assetLots.length > 0,
      };
    });
  }, [balances, accountMode, exchangeLots, loans, getAssetUnitPriceToman, getLockedCollateralAmount]);

  const totalPortfolioToman = portfolioItems.reduce((sum, i) => sum + i.liveValueToman, 0);
  const totalFreeValueToman = portfolioItems.reduce((sum, i) => sum + i.freeValueToman, 0);
  const maxEligibleLoanIRT = Math.round(totalFreeValueToman * 0.7);
  const activeModeLoans = loans.filter((l) => l.accountMode === accountMode);

  if (!isExchangeModalOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  // Calculations for Tab 1 (Buy)
  const selectedMeta =
    EXCHANGE_ASSETS.find((a) => a.symbol === selectedAsset) || EXCHANGE_ASSETS[0];
  const numericTomanBuy = Number(tomanAmountStr.replace(/[^\d]/g, '')) || 0;
  const selectedUnitPrice = getAssetUnitPriceToman(selectedAsset) || 1;
  const calculatedAssetQty = Number(
    (numericTomanBuy / selectedUnitPrice).toFixed(selectedMeta.precision)
  );
  const potentialLoanFromPurchaseIRT = Math.round(numericTomanBuy * 0.7);

  const handleBuySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numericTomanBuy < 100000) {
      setBuyFeedback({
        type: 'error',
        text: 'حداقل مبلغ خرید و سرمایه‌گذاری ۱۰۰,۰۰۰ تومان است.',
      });
      return;
    }
    if (!trackingCode.trim()) {
      setBuyFeedback({
        type: 'error',
        text: 'لطفاً شماره پیگیری یا ارجاع تراکنش بانکی را وارد نمایید.',
      });
      return;
    }

    setIsSubmittingBuy(true);
    setBuyFeedback(null);

    try {
      const res = await submitExchangeCardPurchase({
        asset: selectedAsset,
        tomanAmount: numericTomanBuy,
        assetAmount: calculatedAssetQty,
        senderCardLast4: senderCardLast4 || '0000',
        trackingCode,
        destBank: currentBank.bankName,
        referenceId,
      });

      setBuyFeedback({
        type: 'success',
        text: res.message,
      });
    } catch {
      setBuyFeedback({
        type: 'error',
        text: 'خطا در ثبت تراکنش. لطفاً مجدداً تلاش کنید.',
      });
    } finally {
      setIsSubmittingBuy(false);
    }
  };

  // Calculations for Tab 2 (Sell to Toman)
  const handleConfirmSell = (asset: InvestableAssetSymbol) => {
    const qty = parseFloat(sellAmountStr) || 0;
    const res = sellExchangeAssetToToman(asset, qty);
    if (res.success) {
      setPortfolioFeedback({
        type: 'success',
        text: res.message,
        showWithdrawBtn: true,
      });
      setSellingAsset(null);
      setSellAmountStr('');
    } else {
      setPortfolioFeedback({ type: 'error', text: res.message });
    }
  };

  // Calculations for Tab 3 (70% Loan with 12% Interest)
  const selectedLoanPortfolio =
    portfolioItems.find((p) => p.symbol === loanAsset) || portfolioItems[0];
  const numericCollateralQty = parseFloat(loanCollateralStr) || 0;
  const collateralValueIRT = Math.round(
    numericCollateralQty * selectedLoanPortfolio.unitPriceToman
  );
  const usdRate = getAssetUnitPriceToman('USDT') || 95000;
  const loanPrincipalIRT = Math.round(collateralValueIRT * 0.7);
  const loanPrincipalDisplay =
    loanCurrency === 'USDT'
      ? Number((loanPrincipalIRT / usdRate).toFixed(2))
      : loanPrincipalIRT;
  const loanInterestDisplay =
    loanCurrency === 'USDT'
      ? Number((loanPrincipalDisplay * 0.12).toFixed(2))
      : Math.round(loanPrincipalDisplay * 0.12);
  const loanTotalRepayDisplay =
    loanCurrency === 'USDT'
      ? Number((loanPrincipalDisplay + loanInterestDisplay).toFixed(2))
      : loanPrincipalDisplay + loanInterestDisplay;
  const monthlyInstallmentDisplay =
    loanCurrency === 'USDT'
      ? Number((loanTotalRepayDisplay / monthsCount).toFixed(2))
      : Math.round(loanTotalRepayDisplay / monthsCount);

  const handleRequestLoan = () => {
    setLoanFeedback(null);
    const res = requestCollateralLoan({
      collateralAsset: loanAsset,
      collateralAmount: numericCollateralQty,
      loanCurrency,
      monthsCount,
    });
    if (res.success) {
      setLoanFeedback({
        type: 'success',
        text: res.message,
        showWithdrawBtn: true,
      });
      setLoanCollateralStr('');
    } else {
      setLoanFeedback({ type: 'error', text: res.message });
    }
  };

  const handlePayInstallment = (loanId: string, settleFull = false) => {
    setLoanFeedback(null);
    const res = payLoanInstallment(loanId, settleFull);
    setLoanFeedback({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-4xl bg-[#0c111a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-l from-amber-500/15 via-emerald-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20">
              <Landmark className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2 flex-wrap">
                <span>صرافی اختصاصی آریا (خرید رمزارز و طلا + وام ۷۰٪)</span>
                {isDemo && (
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                    حالت دمو فعال است
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                خرید مستقیم با واریز کارت به کارت • نگهداری سرمایه‌گذاری • دریافت وام ۷۰٪ با سود ۱۲٪
              </p>
            </div>
          </div>

          <button
            onClick={() => setExchangeModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 pt-3 pb-2 bg-[#090d14] border-b border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('buy')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeTab === 'buy'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>۱. خرید و سرمایه‌گذاری (کارت به کارت)</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeTab === 'portfolio'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>۲. کیف دارایی و تبدیل به ریال</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono-numbers ${
                activeTab === 'portfolio'
                  ? 'bg-slate-950 text-emerald-400'
                  : 'bg-slate-800 text-amber-400'
              }`}
            >
              {portfolioItems.filter((p) => p.totalAmt > 0).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('loan')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeTab === 'loan'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>۳. دریافت وام ۷۰٪ و پرداخت اقساط (سود ۱۲٪)</span>
            {activeModeLoans.filter((l) => l.status === 'active').length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 font-mono-numbers">
                {activeModeLoans.filter((l) => l.status === 'active').length} فعال
              </span>
            )}
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs">
          {/* ========================================================== */}
          {/* TAB 1: BUY CRYPTO OR GOLD VIA RIAL CARD-TO-CARD */}
          {/* ========================================================== */}
          {activeTab === 'buy' && (
            <div className="space-y-5">
              {buyFeedback && (
                <div
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    buyFeedback.type === 'success'
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {buyFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <span className="font-medium leading-relaxed">{buyFeedback.text}</span>
                  </div>
                  {buyFeedback.type === 'success' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveTab('portfolio')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[11px]"
                      >
                        مشاهده در کیف دارایی
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoanAsset(selectedAsset);
                          setActiveTab('loan');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-500 text-white font-bold text-[11px]"
                      >
                        دریافت وام ۷۰٪
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 1: Select Crypto or Gold Asset */}
              <div>
                <label className="text-slate-200 font-bold block mb-2">
                  ۱. انتخاب رمزارز یا طلا جهت خرید و نگهداری سرمایه‌گذاری:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {EXCHANGE_ASSETS.map((item) => {
                    const priceIRT = getAssetUnitPriceToman(item.symbol);
                    const isSelected = selectedAsset === item.symbol;
                    return (
                      <button
                        key={item.symbol}
                        type="button"
                        onClick={() => setSelectedAsset(item.symbol)}
                        className={`p-3 rounded-xl border text-right transition-all flex flex-col gap-1.5 ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                            : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black text-white bg-gradient-to-r ${item.badgeColor}`}
                          >
                            {item.symbol === 'GOLD_GRAM' ? 'طلا ۱۸ عیار' : item.symbol}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                        </div>
                        <span className="font-bold text-slate-100 text-[11px]">{item.nameFa}</span>
                        <span className="font-mono-numbers text-[10px] text-amber-300">
                          {formatCurrency(priceIRT)} تومان
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Deposit Amount & Live Conversion Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Toman Input */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <label className="font-bold text-slate-200 block">
                    ۲. مبلغ واریزی به تومان را وارد کنید:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={tomanAmountStr}
                      onChange={(e) => setTomanAmountStr(e.target.value.replace(/[^\d]/g, ''))}
                      className="w-full bg-slate-950 border-2 border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-lg font-black font-mono-numbers text-white outline-none text-left"
                      placeholder="10000000"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      تومان
                    </span>
                  </div>

                  <div className="text-[11px] text-amber-300 font-medium">
                    معادل به حروف: {numberToWordsFa(numericTomanBuy)}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {[2000000, 5000000, 10000000, 20000000, 50000000, 100000000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setTomanAmountStr(String(val))}
                        className={`py-1.5 rounded-lg text-[11px] font-mono-numbers font-bold transition-colors ${
                          numericTomanBuy === val
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {(val / 1000000).toLocaleString('fa-IR')} م ت
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Asset Output + Loan Bonus Preview */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block">
                      میزان دارایی که بلافاصله به کیف حساب شما واریز می‌شود:
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black font-mono-numbers text-emerald-400">
                        {calculatedAssetQty.toLocaleString('en-US', {
                          maximumFractionDigits: selectedMeta.precision,
                        })}
                      </span>
                      <span className="text-sm font-bold text-emerald-200">
                        {selectedMeta.unitLabel}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      نرخ لحظه‌ای واحد:{' '}
                      <span className="font-mono-numbers text-slate-200">
                        {formatCurrency(selectedUnitPrice)} تومان
                      </span>
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 space-y-1">
                    <div className="flex items-center justify-between text-indigo-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>اعتبار وام ۷۰٪ قابل دریافت روی این خرید:</span>
                      </span>
                      <span className="font-mono-numbers text-white">
                        {formatCurrency(potentialLoanFromPurchaseIRT)} ت
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      این دارایی تا زمان فروش یا تبدیل مجدد به تومان، در کیف پول شما به عنوان سرمایه‌گذاری باقی می‌ماند و می‌توانید تا ۷۰٪ ارزش آن را وام (سود ۱۲٪) دریافت کنید.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3: Card-to-Card Payment to Owner's Card */}
              <form
                onSubmit={handleBuySubmit}
                className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-[#111826] to-[#0b1019] border border-amber-500/30 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>۳. واریز کارت به کارت به حساب رسمی مدیر بروکر:</span>
                  </span>
                  {activeBanks.length > 1 && (
                    <div className="flex items-center gap-1">
                      {activeBanks.map((b, idx) => (
                        <button
                          key={b.cardNumber}
                          type="button"
                          onClick={() => setSelectedBankIdx(idx)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                            selectedBankIdx === idx
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {b.bankName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bank Card Details Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">
                        شماره کارت مقصد ({currentBank.bankName})
                      </span>
                      <span className="font-mono-numbers text-base font-black text-amber-300 tracking-wider">
                        {formatCardNumber(currentBank.cardNumber)}
                      </span>
                      <span className="text-[11px] text-slate-300 block mt-0.5">
                        به نام: <strong className="text-white">{currentBank.accountHolder}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(currentBank.cardNumber, 'card')}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition-colors flex items-center gap-1 text-xs font-bold"
                    >
                      {copiedField === 'card' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>کپی شد</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>کپی کارت</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">شماره شبا رسمی:</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(currentBank.sheba, 'sheba')}
                        className="text-amber-400 hover:underline text-[10px]"
                      >
                        {copiedField === 'sheba' ? 'کپی شد!' : 'کپی شبا'}
                      </button>
                    </div>
                    <span className="font-mono-numbers text-[11px] text-slate-200">
                      {formatSheba(currentBank.sheba)}
                    </span>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 mt-1">
                      <span className="text-[10px] text-amber-300">شناسه پرداخت:</span>
                      <span className="font-mono-numbers font-bold text-amber-200">{referenceId}</span>
                    </div>
                  </div>
                </div>

                {/* Proof inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">
                      ۴ رقم آخر کارت واریزکننده:
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={senderCardLast4}
                      onChange={(e) => setSenderCardLast4(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 font-mono-numbers text-white text-left outline-none"
                      placeholder="1755"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">
                      شماره پیگیری تراکنش بانکی (شتاب):
                    </label>
                    <input
                      type="text"
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 font-mono-numbers text-white text-left outline-none"
                      placeholder="کد پیگیری رسید"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingBuy}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isSubmittingBuy ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>در حال تایید تراکنش و شارژ دارایی در کیف پول...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        ثبت واریز {formatCurrency(numericTomanBuy)} تومان و دریافت {calculatedAssetQty}{' '}
                        {selectedMeta.unitLabel}
                      </span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 2: INVESTMENT PORTFOLIO & SELL BACK TO RIAL/WITHDRAW */}
          {/* ========================================================== */}
          {activeTab === 'portfolio' && (
            <div className="space-y-4">
              {/* Summary Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#131d2e] via-[#0e1726] to-[#0a101a] border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-[11px] text-slate-400 block">
                    ارزش کل سبد سرمایه‌گذاری (رمزارز و طلا):
                  </span>
                  <span className="text-xl font-black font-mono-numbers text-white mt-0.5 block">
                    {formatCurrency(totalPortfolioToman)}{' '}
                    <span className="text-xs text-amber-400 font-normal">تومان</span>
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">
                    ارزش دارایی آزاد (قابل فروش و برداشت):
                  </span>
                  <span className="text-xl font-black font-mono-numbers text-emerald-400 mt-0.5 block">
                    {formatCurrency(totalFreeValueToman)}{' '}
                    <span className="text-xs text-emerald-300 font-normal">تومان</span>
                  </span>
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">
                      سقف وام ۷۰٪ قابل دریافت همین لحظه:
                    </span>
                    <span className="text-xl font-black font-mono-numbers text-indigo-400 mt-0.5 block">
                      {formatCurrency(maxEligibleLoanIRT)}{' '}
                      <span className="text-xs text-indigo-300 font-normal">تومان</span>
                    </span>
                  </div>
                </div>
              </div>

              {portfolioFeedback && (
                <div
                  className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 ${
                    portfolioFeedback.type === 'success'
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <span>{portfolioFeedback.text}</span>
                  {portfolioFeedback.showWithdrawBtn && (
                    <button
                      onClick={() => {
                        setExchangeModalOpen(false);
                        setWithdrawModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1"
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      <span>برداشت به کارت / شبا بانکی</span>
                    </button>
                  )}
                </div>
              )}

              {/* Current Cash Balance Bar */}
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">موجودی نقدی ریالی آماده ترید و برداشت:</span>
                  <span className="font-black font-mono-numbers text-amber-400 text-sm">
                    {formatCurrency(getBal('IRT'))} تومان
                  </span>
                </div>
                <button
                  onClick={() => {
                    setExchangeModalOpen(false);
                    setWithdrawModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white transition-colors font-bold flex items-center gap-1.5"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>برداشت وجه به شبا</span>
                </button>
              </div>

              {/* Assets List */}
              {portfolioItems.every((p) => p.totalAmt <= 0) ? (
                <div className="py-12 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl space-y-3">
                  <Coins className="w-10 h-10 text-amber-400/50 mx-auto" />
                  <p className="text-slate-300 font-bold">
                    هنوز هیچ رمزارز یا طلایی در سبد سرمایه‌گذاری صرافی ندارید.
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    از تب «خرید و سرمایه‌گذاری» می‌توانید با واریز ریال، طلا یا رمزارز خریداری کرده و روی آن وام ۷۰٪ بگیرید.
                  </p>
                  <button
                    onClick={() => setActiveTab('buy')}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold"
                  >
                    شروع خرید در صرافی
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {portfolioItems
                    .filter((item) => item.totalAmt > 0)
                    .map((item) => {
                      const isSellingThis = sellingAsset === item.symbol;
                      return (
                        <div
                          key={item.symbol}
                          className="p-3.5 rounded-2xl bg-slate-900/85 border border-slate-800 space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.badgeColor} flex items-center justify-center font-black text-white text-[11px] shadow-md`}
                              >
                                {item.symbol === 'GOLD_GRAM' ? 'AU18' : item.symbol}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-sm">{item.nameFa}</span>
                                  {item.hasLots && (
                                    <span
                                      className={`text-[10px] font-mono-numbers px-1.5 py-0.5 rounded font-bold ${
                                        item.unrealizedProfitPct >= 0
                                          ? 'bg-emerald-500/15 text-emerald-400'
                                          : 'bg-rose-500/15 text-rose-400'
                                      }`}
                                    >
                                      {item.unrealizedProfitPct >= 0 ? '+' : ''}
                                      {item.unrealizedProfitPct.toFixed(2)}%
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                                  <span>
                                    کل موجودی:{' '}
                                    <strong className="text-slate-200 font-mono-numbers">
                                      {item.totalAmt.toLocaleString('en-US', {
                                        maximumFractionDigits: item.precision,
                                      })}{' '}
                                      {item.unitLabel}
                                    </strong>
                                  </span>
                                  {item.lockedAmt > 0 && (
                                    <span className="text-indigo-300 flex items-center gap-1">
                                      <Lock className="w-3 h-3" />
                                      وثیقه وام:{' '}
                                      <strong className="font-mono-numbers">
                                        {item.lockedAmt.toLocaleString('en-US', {
                                          maximumFractionDigits: item.precision,
                                        })}
                                      </strong>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3">
                              <div className="text-right sm:text-left">
                                <span className="font-black text-sm font-mono-numbers text-amber-300 block">
                                  {formatCurrency(item.liveValueToman)} تومان
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono-numbers">
                                  قیمت واحد: {formatCurrency(item.unitPriceToman)} ت
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {item.freeAmt > 0 && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setLoanAsset(item.symbol);
                                        setLoanCollateralStr(
                                          item.freeAmt.toFixed(item.precision)
                                        );
                                        setActiveTab('loan');
                                      }}
                                      className="px-2.5 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white border border-indigo-500/30 text-[11px] font-bold transition-colors"
                                    >
                                      وام ۷۰٪
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (isSellingThis) {
                                          setSellingAsset(null);
                                        } else {
                                          setSellingAsset(item.symbol);
                                          setSellAmountStr(
                                            item.freeAmt.toFixed(item.precision)
                                          );
                                        }
                                      }}
                                      className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-[11px] font-bold transition-colors"
                                    >
                                      تبدیل به ریال
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Inline Sell to Rial Box */}
                          {isSellingThis && (
                            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-950/70 p-3 rounded-xl">
                              <div className="flex-1">
                                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                                  <span>مقدار فروش ({item.unitLabel}):</span>
                                  <div className="flex gap-1">
                                    {[0.25, 0.5, 1].map((pct) => (
                                      <button
                                        key={pct}
                                        type="button"
                                        onClick={() =>
                                          setSellAmountStr(
                                            (item.freeAmt * pct).toFixed(item.precision)
                                          )
                                        }
                                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-200"
                                      >
                                        {pct * 100}%
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <input
                                  type="text"
                                  value={sellAmountStr}
                                  onChange={(e) => setSellAmountStr(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 font-mono-numbers text-white outline-none"
                                />
                              </div>

                              <div className="text-right sm:px-3">
                                <span className="text-[10px] text-slate-400 block">
                                  مبلغ ریالی دریافتی:
                                </span>
                                <span className="font-bold font-mono-numbers text-emerald-400 text-sm">
                                  {formatCurrency(
                                    Math.round((parseFloat(sellAmountStr) || 0) * item.unitPriceToman)
                                  )}{' '}
                                  تومان
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleConfirmSell(item.symbol)}
                                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                              >
                                فروش و واریز به موجودی تومان
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 3: 70% ASSET-BACKED LOAN WITH 12% INTEREST & INSTALLMENTS */}
          {/* ========================================================== */}
          {activeTab === 'loan' && (
            <div className="space-y-5">
              {loanFeedback && (
                <div
                  className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-2 ${
                    loanFeedback.type === 'success'
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {loanFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{loanFeedback.text}</span>
                  </div>
                  {loanFeedback.showWithdrawBtn && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExchangeModalOpen(false)}
                        className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px]"
                      >
                        شروع ترید با مبلغ وام
                      </button>
                      <button
                        onClick={() => {
                          setExchangeModalOpen(false);
                          setWithdrawModalOpen(true);
                        }}
                        className="px-3 py-1 rounded-lg bg-sky-500 text-slate-950 font-bold text-[11px]"
                      >
                        برداشت وام به شبا
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Loan Origination Form */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-indigo-500/20">
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <Percent className="w-4 h-4 text-indigo-400" />
                      <span>درخواست وام فوری معادل ۷۰٪ ارزش دارایی شما</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      دارایی شما در کیف سرمایه‌گذاری باقی می‌ماند و مبلغ وام با سود ثابت{' '}
                      <strong className="text-amber-300">۱۲٪</strong> بلافاصله قابل ترید یا برداشت است.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold text-[11px]">
                    LTV: 70% | سود: 12%
                  </span>
                </div>

                {portfolioItems.every((p) => p.freeAmt <= 0) ? (
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
                    <p className="text-slate-300 font-medium">
                      در حال حاضر دارایی آزادی برای وثیقه‌گذاری جهت دریافت وام ندارید.
                    </p>
                    <button
                      onClick={() => setActiveTab('buy')}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                    >
                      ابتدا از صرافی رمزارز یا طلا خریداری کنید
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Collateral Selection */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-slate-300 font-bold block mb-1">
                          انتخاب دارایی وثیقه (فقط دارایی‌های موجود):
                        </label>
                        <select
                          value={loanAsset}
                          onChange={(e) => {
                            const sym = e.target.value as InvestableAssetSymbol;
                            setLoanAsset(sym);
                            const found = portfolioItems.find((p) => p.symbol === sym);
                            if (found) {
                              setLoanCollateralStr(found.freeAmt.toFixed(found.precision));
                            }
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold outline-none"
                        >
                          {portfolioItems
                            .filter((p) => p.freeAmt > 0)
                            .map((p) => (
                              <option key={p.symbol} value={p.symbol}>
                                {p.nameFa} — موجودی آزاد:{' '}
                                {p.freeAmt.toLocaleString('en-US', {
                                  maximumFractionDigits: p.precision,
                                })}{' '}
                                {p.unitLabel} (≈ {formatCurrency(p.freeValueToman)} ت)
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-slate-300 font-bold">
                            مقدار وثیقه ({selectedLoanPortfolio.unitLabel}):
                          </label>
                          <div className="flex gap-1">
                            {[0.25, 0.5, 0.75, 1].map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() =>
                                  setLoanCollateralStr(
                                    (selectedLoanPortfolio.freeAmt * pct).toFixed(
                                      selectedLoanPortfolio.precision
                                    )
                                  )
                                }
                                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-indigo-600 text-[10px] text-slate-200 transition-colors"
                              >
                                {pct * 100}%
                              </button>
                            ))}
                          </div>
                        </div>
                        <input
                          type="text"
                          value={loanCollateralStr}
                          onChange={(e) => setLoanCollateralStr(e.target.value)}
                          placeholder={`حداکثر ${selectedLoanPortfolio.freeAmt.toFixed(selectedLoanPortfolio.precision)}`}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 font-mono-numbers text-white outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-slate-300 font-bold block mb-1">
                            واحد دریافت وام:
                          </label>
                          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                            <button
                              type="button"
                              onClick={() => setLoanCurrency('IRT')}
                              className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                                loanCurrency === 'IRT'
                                  ? 'bg-amber-500 text-slate-950'
                                  : 'text-slate-400'
                              }`}
                            >
                              تومان (IRT)
                            </button>
                            <button
                              type="button"
                              onClick={() => setLoanCurrency('USDT')}
                              className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                                loanCurrency === 'USDT'
                                  ? 'bg-emerald-500 text-slate-950'
                                  : 'text-slate-400'
                              }`}
                            >
                              تتر (USDT)
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-300 font-bold block mb-1">
                            مدت بازپرداخت اقساط:
                          </label>
                          <select
                            value={monthsCount}
                            onChange={(e) => setMonthsCount(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-bold outline-none"
                          >
                            <option value={3}>۳ قسط ماهانه</option>
                            <option value={6}>۶ قسط ماهانه</option>
                            <option value={12}>۱۲ قسط ماهانه</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Loan Math Breakdown */}
                    <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between space-y-3">
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>ارزش روز دارایی وثیقه‌شده:</span>
                          <span className="font-mono-numbers text-slate-200">
                            {formatCurrency(collateralValueIRT)} تومان
                          </span>
                        </div>
                        <div className="flex justify-between text-emerald-400 font-bold">
                          <span>مبلغ وام واریزی آنی (۷۰٪ ارزش دارایی):</span>
                          <span className="font-mono-numbers text-base">
                            {loanPrincipalDisplay.toLocaleString('fa-IR')}{' '}
                            {loanCurrency === 'IRT' ? 'تومان' : 'USDT'}
                          </span>
                        </div>
                        <div className="flex justify-between text-amber-300">
                          <span>سود ثابت تسهیلات (۱۲٪):</span>
                          <span className="font-mono-numbers">
                            {loanInterestDisplay.toLocaleString('fa-IR')}{' '}
                            {loanCurrency === 'IRT' ? 'تومان' : 'USDT'}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-200 font-bold pt-2 border-t border-slate-800">
                          <span>مجموع اصل و سود بازپرداخت:</span>
                          <span className="font-mono-numbers">
                            {loanTotalRepayDisplay.toLocaleString('fa-IR')}{' '}
                            {loanCurrency === 'IRT' ? 'تومان' : 'USDT'}
                          </span>
                        </div>
                        <div className="flex justify-between text-indigo-300 font-bold bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>مبلغ هر قسط ({monthsCount} ماه):</span>
                          </span>
                          <span className="font-mono-numbers">
                            {monthlyInstallmentDisplay.toLocaleString('fa-IR')}{' '}
                            {loanCurrency === 'IRT' ? 'تومان' : 'USDT'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRequestLoan}
                        disabled={numericCollateralQty <= 0}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
                      >
                        تایید وثیقه و دریافت فوری وام ۷۰٪
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Active & Settled Loans Installments Ledger */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-200 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>وام‌های دریافتی و جدول پرداخت اقساط (سود ۱۲٪)</span>
                </h4>

                {activeModeLoans.length === 0 ? (
                  <div className="p-6 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500">
                    هنوز هیچ وامی دریافت نکرده‌اید. پس از خرید دارایی در صرافی می‌توانید تا ۷۰٪ ارزش آن را وام بگیرید.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeModeLoans.map((loan) => {
                      const paidCount = loan.installments.filter(
                        (i) => i.status === 'paid'
                      ).length;
                      const nextInst = loan.installments.find(
                        (i) => i.status === 'upcoming'
                      );
                      const unitText = loan.loanCurrency === 'IRT' ? 'تومان' : 'USDT';

                      return (
                        <div
                          key={loan.id}
                          className={`p-4 rounded-2xl border space-y-3 ${
                            loan.status === 'active'
                              ? 'bg-slate-900/90 border-indigo-500/40'
                              : 'bg-slate-900/40 border-emerald-500/30 opacity-90'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              {loan.status === 'active' ? (
                                <span className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                                  <Lock className="w-4 h-4" />
                                </span>
                              ) : (
                                <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                                  <Unlock className="w-4 h-4" />
                                </span>
                              )}
                              <div>
                                <span className="font-bold text-white text-xs block">
                                  وام {loan.principalAmount.toLocaleString('fa-IR')} {unitText} با وثیقه{' '}
                                  {loan.collateralAmount} {loan.collateralAsset}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  اقساط پرداخت‌شده: {paidCount} از {loan.monthsCount} قسط | سود:{' '}
                                  {loan.interestRatePercent}٪
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {loan.status === 'active' ? (
                                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold font-mono-numbers">
                                  مانده بدهی: {loan.remainingAmount.toLocaleString('fa-IR')} {unitText}
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                                  تسویه کامل و آزادسازی وثیقه
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Installments Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
                            {loan.installments.map((inst) => (
                              <div
                                key={inst.installmentNumber}
                                className={`p-2 rounded-lg border text-[10px] font-mono-numbers ${
                                  inst.status === 'paid'
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                    : 'bg-slate-950 border-slate-800 text-slate-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>قسط {inst.installmentNumber}</span>
                                  {inst.status === 'paid' && (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  )}
                                </div>
                                <div className="font-bold text-white mt-0.5">
                                  {inst.amount.toLocaleString('fa-IR')}
                                </div>
                                <div className="text-[9px] text-slate-500 mt-0.5">
                                  {new Date(inst.dueDate).toLocaleDateString('fa-IR')}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Repayment Buttons */}
                          {loan.status === 'active' && nextInst && (
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                              <span className="text-[11px] text-slate-300">
                                قسط پیش‌رو (#{nextInst.installmentNumber}):{' '}
                                <strong className="text-amber-300 font-mono-numbers">
                                  {nextInst.amount.toLocaleString('fa-IR')} {unitText}
                                </strong>
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handlePayInstallment(loan.id, false)}
                                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
                                >
                                  پرداخت قسط #{nextInst.installmentNumber}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handlePayInstallment(loan.id, true)}
                                  className="px-3.5 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white border border-indigo-500/30 font-bold text-xs transition-colors"
                                >
                                  تسویه کامل و آزادسازی وثیقه
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

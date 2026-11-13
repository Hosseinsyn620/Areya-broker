/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useBroker } from '../context/BrokerContext';
import {
  OFFICIAL_BROKER_BANK_ACCOUNTS,
  formatCardNumber,
  formatSheba,
  formatCurrency,
  numberToWordsFa,
} from '../utils/iranianBanks';
import {
  X,
  CreditCard,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  Upload,
  ArrowRight,
  Sparkles,
  Lock,
  DollarSign,
  TrendingUp,
  Wallet,
} from 'lucide-react';

export const CardToCardDepositModal: React.FC = () => {
  const {
    isCardDepositModalOpen,
    setCardDepositModalOpen,
    submitCardDeposit,
    kycInfo,
    brokerSettings,
    markets,
  } = useBroker();

  const liveUsdRate =
    brokerSettings.usdToTomanRate ||
    markets.find((m) => m.id === 'usdt_irt')?.price ||
    95000;

  const [selectedBankIdx, setSelectedBankIdx] = useState<number>(0);
  const [amount, setAmount] = useState<number>(10000000); // 10 million Tomans
  const [creditType, setCreditType] = useState<'USDT' | 'IRT'>('USDT');
  const [senderCardLast4, setSenderCardLast4] = useState<string>(
    kycInfo.registeredCardLast4 || '1755'
  );
  const [trackingCode, setTrackingCode] = useState<string>('94812304');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [step, setStep] = useState<'details' | 'confirm' | 'success'>('details');
  const [receiptFileName, setReceiptFileName] = useState<string>('receipt_mellat_94812304.jpg');

  // Generate reference ID once
  const [referenceId] = useState<string>(
    () => `REF-${Math.floor(Math.random() * 899999 + 100000)}`
  );

  if (!isCardDepositModalOpen) return null;

  const currentBank = OFFICIAL_BROKER_BANK_ACCOUNTS[selectedBankIdx];

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const equivalentUsdt = Number((amount / liveUsdRate).toFixed(2));

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitCardDeposit({
        amount,
        senderCardLast4,
        trackingCode,
        destBank: currentBank.bankName,
        referenceId,
        creditAsUsdt: creditType === 'USDT',
        usdtAmount: equivalentUsdt,
      });
      setIsSubmitting(false);
      setStep('success');
    } catch {
      setIsSubmitting(false);
    }
  };

  const quickAmounts = [
    2000000, 5000000, 10000000, 20000000, 50000000, 100000000,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-2xl bg-[#0e131b] border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <span>شارژ حساب با کارت‌به‌کارت (مخصوص کاربران ایران)</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                  شبکه شتاب آنی
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                واریز مستقیم به حساب امانی شرکت واسط پردازش مالی آریا تریدر
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setCardDepositModalOpen(false);
              setStep('details');
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {step === 'details' && (
            <>
              {/* Important Security Notice */}
              <div className="p-3 bg-slate-900/90 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-slate-300">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold text-amber-300">قوانین واریز شتاب:</span> واریز وجه
                  تنها باید از <span className="underline">کارت بانکی به نام خود شما</span> (تطبیق
                  کد ملی) انجام شود. در برنامه بانکی خود حتماً{' '}
                  <span className="text-amber-400 font-mono-numbers font-bold">
                    شناسه پرداخت {referenceId}
                  </span>{' '}
                  را در قسمت بابت/شناسه وارد فرمایید.
                </div>
              </div>

              {/* Step 1: Select Broker Destination Bank */}
              <div>
                <label className="block text-slate-300 font-bold mb-2">
                  ۱. انتخاب حساب بانکی رسمی بروکر جهت انتقال:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {OFFICIAL_BROKER_BANK_ACCOUNTS.map((bank, idx) => (
                    <button
                      key={bank.bankCode}
                      type="button"
                      onClick={() => setSelectedBankIdx(idx)}
                      className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                        selectedBankIdx === idx
                          ? 'border-amber-500 bg-amber-500/10 text-slate-100 shadow-sm'
                          : 'border-slate-800 bg-[#090d13] text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-bold text-xs text-slate-200">{bank.bankName}</span>
                      <span className="text-[10px] text-slate-500 font-mono-numbers mt-1">
                        ****{bank.cardNumber.slice(-4)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bank Card Presentation Card */}
              <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-[#131b26] to-[#0d141e] border border-amber-500/30 shadow-xl space-y-3">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span className="font-medium text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>حساب تایید شده امانی بروکر آریا ({currentBank.bankName})</span>
                  </span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                    {currentBank.dailyLimit}
                  </span>
                </div>

                {/* Account Holder */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">صاحب حساب:</span>
                  <span className="font-bold text-slate-100 text-xs">{currentBank.accountHolder}</span>
                </div>

                {/* 16-Digit Card Number with Copy */}
                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400">شماره کارت مقصد</span>
                    <span className="font-mono-numbers text-base sm:text-lg font-bold text-amber-300 tracking-wider">
                      {formatCardNumber(currentBank.cardNumber)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(currentBank.cardNumber, 'card')}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-colors flex items-center gap-1 text-xs"
                  >
                    {copiedField === 'card' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">کپی شد</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>کپی کارت</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Sheba with Copy */}
                <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">شماره شبا:</span>
                    <span className="font-mono-numbers text-slate-200">
                      {formatSheba(currentBank.sheba)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(currentBank.sheba, 'sheba')}
                    className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    {copiedField === 'sheba' ? 'کپی شد' : 'کپی شبا'}
                  </button>
                </div>

                {/* Dedicated Payment Reference ID */}
                <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-300 font-bold">شناسه اختصاصی پرداخت شما:</span>
                    <span className="font-mono-numbers font-black text-amber-200 text-sm">
                      {referenceId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(referenceId, 'ref')}
                    className="text-amber-400 hover:underline flex items-center gap-1"
                  >
                    {copiedField === 'ref' ? 'کپی شد' : 'کپی شناسه'}
                  </button>
                </div>
              </div>

              {/* Step 2: Amount Input & Live USD Conversion */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-slate-200 font-bold flex items-center gap-1.5">
                    <span>۲. مبلغ پرداختی به تومان:</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono-numbers">
                      نرخ زنده: ۱ دلار = {formatCurrency(liveUsdRate)} ت
                    </span>
                  </label>
                  <span className="text-[11px] text-amber-400 font-mono-numbers font-bold">
                    معادل: ${equivalentUsdt} USDT
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    step="500000"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-[#080b10] border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 px-3 text-slate-100 font-mono-numbers text-lg font-bold text-left focus:outline-none"
                  />
                  <span className="absolute right-3 top-3 text-xs text-slate-400 font-medium">تومان</span>
                </div>

                {/* Verbal Amount in Persian */}
                <div className="text-[11px] text-slate-400 pr-1 flex items-center justify-between">
                  <span>به حروف: <span className="text-amber-300 font-medium">{numberToWordsFa(amount)}</span></span>
                </div>

                {/* PROMINENT LIVE USD CONVERSION DISPLAY */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0b1926] via-[#091522] to-[#08111b] border border-emerald-500/40 shadow-lg space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <DollarSign className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">مبلغ دلاری واریزی به حساب شما:</span>
                        <span className="font-bold text-xs text-emerald-300">
                          محاسبه آنلاین با نرخ لحظه‌ای صرافی
                        </span>
                      </div>
                    </div>
                    <div className="text-left font-mono-numbers">
                      <span className="text-lg font-black text-emerald-400">
                        ${equivalentUsdt} <span className="text-xs font-normal">USDT</span>
                      </span>
                    </div>
                  </div>

                  {/* Currency Credit Selector */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-300 text-[11px]">نحوه شارژ موجودی کیف پول:</span>
                    <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setCreditType('USDT')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          creditType === 'USDT'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        شارژ دلاری (${equivalentUsdt} USDT)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreditType('IRT')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          creditType === 'IRT'
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        شارژ تومانی ({formatCurrency(amount)} ت)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                  {quickAmounts.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setAmount(q)}
                      className={`py-1.5 px-1.5 rounded-xl text-[10px] font-mono-numbers transition-colors ${
                        amount === q
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                          : 'bg-slate-850 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-750/70'
                      }`}
                    >
                      {formatCurrency(q / 1000000)} م تومان
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Transaction Proof & Verification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    ۴ رقم آخر کارت بانکی واریزکننده:
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={senderCardLast4}
                    onChange={(e) => setSenderCardLast4(e.target.value.replace(/\D/g, ''))}
                    placeholder="مثلاً ۸۱۵۴"
                    className="w-full bg-[#080b10] border border-slate-800 rounded-lg py-1.5 px-3 text-slate-100 font-mono-numbers text-sm text-left focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    شماره پیگیری / ارجاع تراکنش بانکی:
                  </label>
                  <input
                    type="text"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="کد پیگیری رسید بانکی"
                    className="w-full bg-[#080b10] border border-slate-800 rounded-lg py-1.5 px-3 text-slate-100 font-mono-numbers text-sm text-left focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Receipt File simulation */}
              <div className="p-3 bg-slate-950/60 border border-dashed border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-slate-300 block text-xs font-medium">
                      تصویر فیش / اسکرین‌شات رسید انتقال:
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono-numbers">
                      {receiptFileName} (پیوست شده)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReceiptFileName(`receipt_${Date.now().toString().slice(-6)}.jpg`)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                >
                  تغییر فایل
                </button>
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                onClick={handleDepositSubmit}
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>در حال تطبیق هوشمند بانکی با شبکه شتاب...</span>
                  </>
                ) : (
                  <>
                    <span>ثبت واریز و شارژ آنی حساب</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="py-8 px-4 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-100">واریز با موفقیت تایید شد!</h4>
                <p className="text-slate-400 text-xs">
                  مبلغ{' '}
                  <span className="text-amber-400 font-bold font-mono-numbers">
                    {formatCurrency(amount)} تومان
                  </span>{' '}
                  به کیف پول شما افزوده شد و هم‌اکنون آماده انجام معامله در بازار است.
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 max-w-sm mx-auto text-right space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">شناسه اختصاصی:</span>
                  <span className="font-mono-numbers text-slate-200">{referenceId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">کد رهگیری شتاب:</span>
                  <span className="font-mono-numbers text-slate-200">{trackingCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">بانک مقصد:</span>
                  <span className="text-slate-200">{currentBank.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">وضعیت:</span>
                  <span className="text-emerald-400 font-bold">تسویه شده و آماده ترید</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCardDepositModalOpen(false);
                  setStep('details');
                }}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
              >
                ورود به تالار معاملات
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

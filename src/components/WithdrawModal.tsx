/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useBroker } from '../context/BrokerContext';
import {
  getBankFromCardNumber,
  formatCardNumber,
  formatSheba,
  formatCurrency,
  numberToWordsFa,
} from '../utils/iranianBanks';
import {
  X,
  ArrowUpRight,
  Check,
  AlertCircle,
  Building2,
  Clock,
  Coins,
  CreditCard,
  DollarSign,
  Copy,
  ShieldCheck,
} from 'lucide-react';

export const WithdrawModal: React.FC = () => {
  const {
    isWithdrawModalOpen,
    setWithdrawModalOpen,
    balances,
    userBankAccounts,
    submitWithdrawal,
    submitCryptoWithdrawal,
    brokerSettings,
    markets,
  } = useBroker();

  const [withdrawType, setWithdrawType] = useState<'irt' | 'usdt'>('irt');
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    userBankAccounts[0]?.id || ''
  );
  const [customCard, setCustomCard] = useState<string>('');
  const [customSheba, setCustomSheba] = useState<string>('');
  const [amountIrt, setAmountIrt] = useState<number>(5000000);
  const [amountUsdt, setAmountUsdt] = useState<number>(50);
  const [usdtAddress, setUsdtAddress] = useState<string>(
    'TUVHe19wY3nzeuu6Tacf4tLUV3j2ve85vx'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isWithdrawModalOpen) return null;

  const currentAccount = userBankAccounts.find((a) => a.id === selectedAccountId);
  const targetCard = currentAccount ? currentAccount.cardNumber : customCard;
  const targetSheba = currentAccount ? currentAccount.sheba : customSheba;
  const detectedBank = getBankFromCardNumber(targetCard);

  const availableToman = balances.IRT;
  const availableUsdt = balances.USDT;
  const liveUsdRate =
    brokerSettings.usdToTomanRate ||
    markets.find((m) => m.id === 'usdt_irt')?.price ||
    95000;

  const handleWithdrawIrt = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (amountIrt <= 0) {
      setErrorMessage('لطفاً مبلغ برداشت را مشخص کنید.');
      return;
    }
    if (amountIrt > availableToman) {
      setErrorMessage('مبلغ برداشت بیشتر از موجودی تومانی قابل برداشت شماست.');
      return;
    }

    setIsSubmitting(true);
    const res = await submitWithdrawal({
      amount: amountIrt,
      cardNumber: targetCard,
      sheba: targetSheba,
      bankName: detectedBank.name,
    });
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage(res.message);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleWithdrawUsdt = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (amountUsdt <= 0) {
      setErrorMessage('لطفاً مبلغ برداشت تتر را وارد کنید.');
      return;
    }
    if (amountUsdt > availableUsdt) {
      setErrorMessage('مبلغ برداشت بیشتر از موجودی تتری در دسترس شماست.');
      return;
    }
    if (!usdtAddress || usdtAddress.length < 20) {
      setErrorMessage('لطفاً آدرس صحیح کیف پول تتر TRC20 را وارد کنید.');
      return;
    }

    setIsSubmitting(true);
    const res = await submitCryptoWithdrawal({
      amount: amountUsdt,
      address: usdtAddress,
      network: 'TRON (TRC-20)',
    });
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage(res.message);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-xl bg-[#0e131b] border border-slate-750 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-sky-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">
                تسویه و برداشت وجه از حساب
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                برداشت به شبا بانکی یا انتقال تتری (USDT TRC-20)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setWithdrawModalOpen(false);
              setSuccessMessage(null);
              setErrorMessage(null);
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currency Tabs */}
        <div className="px-5 pt-3 border-b border-slate-800/80 flex items-center gap-2 bg-[#0a0e16]">
          <button
            onClick={() => {
              setWithdrawType('irt');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`pb-2.5 px-3 rounded-t-xl font-bold text-xs transition-all flex items-center gap-2 border-b-2 ${
              withdrawType === 'irt'
                ? 'border-sky-400 text-sky-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>برداشت ریالی شبا (تومان)</span>
          </button>
          <button
            onClick={() => {
              setWithdrawType('usdt');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`pb-2.5 px-3 rounded-t-xl font-bold text-xs transition-all flex items-center gap-2 border-b-2 ${
              withdrawType === 'usdt'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>برداشت تتری USDT (شبکه TRC-20)</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs flex-1">
          {successMessage ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <h4 className="font-bold text-slate-100 text-sm">{successMessage}</h4>
              <p className="text-slate-400 text-xs">
                کد رهگیری تراکنش در تاریخچه تراکنش‌ها ثبت گردید.
              </p>
              <button
                onClick={() => {
                  setWithdrawModalOpen(false);
                  setSuccessMessage(null);
                }}
                className="mt-4 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
              >
                بستن پنجره
              </button>
            </div>
          ) : withdrawType === 'irt' ? (
            /* TAB 1: IRT WITHDRAWAL */
            <form onSubmit={handleWithdrawIrt} className="space-y-4">
              {/* Available Balance Box */}
              <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">موجودی آزاد تومانی حساب حقیقی:</span>
                  <span className="text-base font-bold text-amber-400 font-mono-numbers">
                    {formatCurrency(availableToman)} تومان
                  </span>
                </div>
                {availableToman > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmountIrt(availableToman)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-[11px]"
                  >
                    برداشت کل موجودی
                  </button>
                )}
              </div>

              {/* Select Destination Account */}
              <div>
                <label className="block text-slate-300 font-bold mb-2">
                  انتخاب کارت و شبای بانکی مقصد:
                </label>
                <div className="space-y-2">
                  {userBankAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      onClick={() => setSelectedAccountId(acc.id)}
                      className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                        selectedAccountId === acc.id
                          ? 'border-sky-500 bg-sky-500/10'
                          : 'border-slate-800 bg-[#090d13] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-4 h-4 text-sky-400" />
                        <div>
                          <span className="font-bold text-slate-200 block text-xs">
                            {acc.bankName} - {acc.accountHolder}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono-numbers">
                            {formatCardNumber(acc.cardNumber)}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-300">
                        حساب تایید شده
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-bold">مبلغ برداشت (تومان):</label>
                  <span className="text-amber-400 text-[11px] font-mono-numbers">
                    معادل دلاری: ${(amountIrt / liveUsdRate).toFixed(2)} USDT
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="500000"
                    value={amountIrt}
                    onChange={(e) => setAmountIrt(Number(e.target.value))}
                    className="w-full bg-[#080b10] border border-slate-800 focus:border-sky-500 rounded-2xl py-2 px-3 text-slate-100 font-mono-numbers text-base font-bold text-left focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">تومان</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  به حروف: <span className="text-sky-300 font-medium">{numberToWordsFa(amountIrt)}</span>
                </div>
              </div>

              {/* Paya Schedule Notice */}
              <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>زمان‌بندی تسویه پایا شاپرک:</span>
                </div>
                <p>
                  درخواست‌های ثبت‌شده تا ساعت ۱۰:۳۰ در سیکل ۱۱:۴۵ و درخواست‌های بعد از آن در سیکل ۱۵:۴۵
                  همان روز تسویه خواهند شد.
                </p>
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-2xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-2xl font-bold text-sm text-white bg-sky-600 hover:bg-sky-500 transition-colors shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'در حال ثبت درخواست تسویه پایا...' : 'ثبت درخواست برداشت ریالی'}
              </button>
            </form>
          ) : (
            /* TAB 2: USDT TRC-20 WITHDRAWAL */
            <form onSubmit={handleWithdrawUsdt} className="space-y-4">
              {/* Available USDT Balance Box */}
              <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">موجودی آزاد تتری حساب حقیقی:</span>
                  <span className="text-base font-bold text-emerald-400 font-mono-numbers">
                    ${availableUsdt.toFixed(2)} USDT
                  </span>
                </div>
                {availableUsdt > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmountUsdt(availableUsdt)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-[11px]"
                  >
                    برداشت کل تتر
                  </button>
                )}
              </div>

              {/* Destination USDT Address */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-bold">
                  آدرس ولت مقصد تتر (شبکه TRON - TRC20):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={usdtAddress}
                    onChange={(e) => setUsdtAddress(e.target.value)}
                    placeholder="آدرس تتر TRC20 (با T شروع می‌شود)"
                    className="w-full bg-[#080b10] border border-slate-800 focus:border-emerald-500 rounded-2xl py-2 px-3 text-slate-100 font-mono-numbers text-xs text-left focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>شبکه انتقال: <strong className="text-emerald-400">TRON TRC-20</strong></span>
                  <button
                    type="button"
                    onClick={() => setUsdtAddress('TUVHe19wY3nzeuu6Tacf4tLUV3j2ve85vx')}
                    className="text-amber-400 hover:underline"
                  >
                    آدرس ولت اختصاصی من
                  </button>
                </div>
              </div>

              {/* USDT Amount Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-bold">مبلغ برداشت (USDT):</label>
                  <span className="text-emerald-400 text-[11px] font-mono-numbers">
                    معادل تومانی: {formatCurrency(amountUsdt * liveUsdRate)} تومان
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={amountUsdt}
                    onChange={(e) => setAmountUsdt(Number(e.target.value))}
                    className="w-full bg-[#080b10] border border-slate-800 focus:border-emerald-500 rounded-2xl py-2 px-3 text-slate-100 font-mono-numbers text-base font-bold text-left focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">USDT</span>
                </div>
                <span className="text-[10px] text-slate-500 block">
                  کارمزد شبکه ترون (TRC20): ۱ دلار کسر خواهد شد
                </span>
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-2xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'در حال ثبت تراکنش تتری...' : 'ثبت درخواست برداشت تتر TRC-20'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

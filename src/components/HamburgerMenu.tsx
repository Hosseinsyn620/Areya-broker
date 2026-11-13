/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useBroker } from '../context/BrokerContext';
import {
  X,
  TrendingUp,
  Zap,
  Coins,
  CreditCard,
  ArrowDownLeft,
  Wallet,
  Users,
  Gift,
  ShieldCheck,
  Settings,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  User,
  BadgeCheck,
  Sliders,
  Mail,
  Landmark,
} from 'lucide-react';

export const HamburgerMenu: React.FC = () => {
  const {
    isHamburgerMenuOpen,
    setHamburgerMenuOpen,
    kycInfo,
    balances,
    accountMode,
    setAccountMode,
    setSwapModalOpen,
    setCryptoDepositModalOpen,
    setCardDepositModalOpen,
    setWithdrawModalOpen,
    setWalletModalOpen,
    setKycModalOpen,
    setReferralModalOpen,
    setRewardsModalOpen,
    setSettingsModalOpen,
    setGmailModalOpen,
    setExchangeModalOpen,
    setIsAdminOpen,
    soundEnabled,
    toggleSound,
    resetDemoBalance,
  } = useBroker();

  if (!isHamburgerMenuOpen) return null;

  const isDemo = accountMode === 'demo';

  const handleNavigate = (action: () => void) => {
    setHamburgerMenuOpen(false);
    action();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end select-none">
      {/* Backdrop */}
      <div
        onClick={() => setHamburgerMenuOpen(false)}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Container (Right-to-Left Slide) */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-[#0a0e16] border-r border-slate-800 h-full flex flex-col shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-l from-slate-900 to-[#0e131d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-black text-amber-400 text-xs">
              آریا
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">منوی اصلی بروکر</h3>
              <p className="text-[10px] text-slate-400">آریا تریدر | سامانه جامع معاملات</p>
            </div>
          </div>
          <button
            onClick={() => setHamburgerMenuOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card & KYC Status */}
        <div className="p-3.5 mx-3 mt-3 bg-gradient-to-br from-[#121926] to-[#0c1018] rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-xs">
                {kycInfo.fullName.substring(0, 1)}
              </div>
              <div>
                <span className="font-bold text-xs text-slate-100 block">{kycInfo.fullName}</span>
                <span className="font-mono-numbers text-[10px] text-slate-400">{kycInfo.phoneNumber}</span>
              </div>
            </div>
            {kycInfo.isVerified ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" />
                <span>احراز هویت شده</span>
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold">
                عدم تایید
              </span>
            )}
          </div>

          {/* Quick Balance Summary */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">موجودی در دسترس:</span>
            <span className="font-bold font-mono-numbers text-amber-400">
              {isDemo
                ? `${balances.demo_IRT.toLocaleString('fa-IR')} ت (دمو)`
                : `${balances.IRT.toLocaleString('fa-IR')} تومان`}
            </span>
          </div>

          {/* Real vs Demo Account Toggle */}
          <div className="pt-1 flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-[11px] font-bold">
            <button
              onClick={() => setAccountMode('real')}
              className={`flex-1 py-1 rounded-md transition-colors text-center ${
                !isDemo
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              حساب واقعی
            </button>
            <button
              onClick={() => setAccountMode('demo')}
              className={`flex-1 py-1 rounded-md transition-colors text-center ${
                isDemo
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              حساب دمو (آزمایشی)
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
          {/* Featured: صرافی (خرید رمزارز و طلا + وام ۷۰٪ با سود ۱۲٪) */}
          <button
            onClick={() => handleNavigate(() => setExchangeModalOpen(true))}
            className="w-full p-2.5 rounded-xl border border-emerald-500/45 bg-gradient-to-l from-emerald-500/20 via-[#0f1d1b] to-[#111622] text-emerald-300 font-bold flex items-center justify-between shadow-sm hover:brightness-110 transition-all text-right mb-1"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/25 text-emerald-400">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs text-emerald-300">صرافی (خرید رمزارز و طلا + وام ۷۰٪)</span>
                <span className="text-[10px] text-emerald-400/80 font-normal">
                  خرید با کارت، نگهداری سرمایه‌گذاری و تسهیلات ۱۲٪
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-500 text-slate-950 font-black">
              جدید
            </span>
          </button>

          {/* Highlighted: Referral Program */}
          <button
            onClick={() => handleNavigate(() => setReferralModalOpen(true))}
            className="w-full p-2.5 rounded-xl border border-amber-500/40 bg-gradient-to-l from-amber-500/15 via-[#1b1710] to-[#111622] text-amber-300 font-bold flex items-center justify-between shadow-sm hover:brightness-110 transition-all text-right"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs text-amber-300">زیرمجموعه‌گیری و درآمد دائم</span>
                <span className="text-[10px] text-amber-400/80 font-normal">تا ۵۰٪ کمیسیون مادام‌العمر</span>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </button>

          {/* Highlighted: Rewards & Bonuses */}
          <button
            onClick={() => handleNavigate(() => setRewardsModalOpen(true))}
            className="w-full p-2.5 rounded-xl border border-purple-500/40 bg-gradient-to-l from-purple-500/15 via-[#171120] to-[#111622] text-purple-300 font-bold flex items-center justify-between shadow-sm hover:brightness-110 transition-all text-right"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs text-purple-300">جوایز و بونوس‌ها + گردونه شانس</span>
                <span className="text-[10px] text-purple-400/80 font-normal">بونوس ثبت‌نام + گردونه روزانه</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] bg-purple-500 text-white font-bold">
              هدیه
            </span>
          </button>

          {/* Highlighted: Gmail Communications & Marketing */}
          <button
            onClick={() => handleNavigate(() => setGmailModalOpen(true))}
            className="w-full p-2.5 rounded-xl border border-rose-500/40 bg-gradient-to-l from-rose-500/15 via-[#181119] to-[#111622] text-rose-300 font-bold flex items-center justify-between shadow-sm hover:brightness-110 transition-all text-right"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs text-rose-300">ارتباط با کاربر و تبلیغات (Gmail)</span>
                <span className="text-[10px] text-rose-400/80 font-normal">ارسال ایمیل‌های تبلیغاتی، تخفیف، بونوس و پشتیبانی</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] bg-rose-600 text-white font-bold font-mono-numbers">
              Gmail
            </span>
          </button>

          <div className="h-2" />

          {/* Instant Swap */}
          <button
            onClick={() => handleNavigate(() => setSwapModalOpen(true))}
            className="w-full p-2.5 rounded-xl hover:bg-slate-800/80 text-slate-200 transition-colors flex items-center justify-between text-right"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-100 block">صرافی تبدیل سریع (Swap)</span>
                <span className="text-[10px] text-slate-400 font-normal">تبدیل آنی تومان به تتر، طلا و بیت‌کوین</span>
              </div>
            </div>
          </button>

          {/* Multi-Crypto Deposit */}
          <button
            onClick={() => handleNavigate(() => setCryptoDepositModalOpen(true))}
            className="w-full p-2.5 rounded-xl hover:bg-slate-800/80 text-slate-200 transition-colors flex items-center justify-between text-right"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-100 block">شارژ با چند رمزارز</span>
                <span className="text-[10px] text-slate-400 font-normal">تتر، بیت‌کوین، اتریوم، تون و سولانا</span>
              </div>
            </div>
          </button>

          {/* Card-to-Card Deposit */}
          <button
            onClick={() => handleNavigate(() => setCardDepositModalOpen(true))}
            className="w-full p-2.5 rounded-xl hover:bg-slate-800/80 text-slate-200 transition-colors flex items-center justify-between text-right"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-100 block">واریز کارت به کارت شتاب</span>
                <span className="text-[10px] text-slate-400 font-normal">شارژ مستقیم با شناسه واریز اختصاصی</span>
              </div>
            </div>
          </button>

          {/* Bank Withdrawal */}
          <button
            onClick={() => handleNavigate(() => setWithdrawModalOpen(true))}
            className="w-full p-2.5 rounded-xl hover:bg-slate-800/80 text-slate-200 transition-colors flex items-center justify-between text-right"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-100 block">برداشت ریالی شبا (پایا)</span>
                <span className="text-[10px] text-slate-400 font-normal">تسویه فوری به حساب بانکی</span>
              </div>
            </div>
          </button>

          {/* Wallet portfolio */}
          <button
            onClick={() => handleNavigate(() => setWalletModalOpen(true))}
            className="w-full p-2.5 rounded-xl hover:bg-slate-800/80 text-slate-200 transition-colors flex items-center justify-between text-right"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-100 block">مدیریت کیف پول و تراکنش‌ها</span>
                <span className="text-[10px] text-slate-400 font-normal">تاریخچه واریز و برداشت‌ها</span>
              </div>
            </div>
          </button>

          {/* KYC */}
          <button
            onClick={() => handleNavigate(() => setKycModalOpen(true))}
            className="w-full p-2.5 rounded-xl hover:bg-slate-800/80 text-slate-200 transition-colors flex items-center justify-between text-right"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-100 block">احراز هویت و تحویل مدارک</span>
                <span className="text-[10px] text-slate-400 font-normal">کارت ملی، گواهینامه، ایمیل و شبا</span>
              </div>
            </div>
          </button>

          {/* Settings Modal */}
          <button
            onClick={() => handleNavigate(() => setSettingsModalOpen(true))}
            className="w-full p-2.5 rounded-2xl hover:bg-slate-800/80 text-slate-200 transition-colors flex items-center justify-between text-right"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-100 block">تنظیمات پلتفرم و ارائه‌دهنده قیمت</span>
                <span className="text-[10px] text-slate-400 font-normal">کراکن، کوین‌بیس، استایل چارت و اهرم</span>
              </div>
            </div>
          </button>

        </div>

        {/* Footer controls: Sound & Demo Reset */}
        <div className="p-3 border-t border-slate-800 bg-[#090d14] flex items-center justify-between text-xs">
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            <span className="text-[11px]">{soundEnabled ? 'صدا روشن' : 'صدا خاموش'}</span>
          </button>

          {isDemo && (
            <button
              onClick={resetDemoBalance}
              className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors flex items-center gap-1.5 text-[11px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ریست حساب دمو</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useBroker } from '../context/BrokerContext';
import {
  CreditCard,
  Wallet,
  ShieldCheck,
  TrendingUp,
  Volume2,
  VolumeX,
  ArrowUpRight,
  Sparkles,
  Menu,
  Zap,
  Coins,
  Users,
  Gift,
  Settings,
  Mail,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    accountMode,
    setAccountMode,
    balances,
    soundEnabled,
    toggleSound,
    setCardDepositModalOpen,
    setWithdrawModalOpen,
    setWalletModalOpen,
    setKycModalOpen,
    resetDemoBalance,
    setIsAdminOpen,
    setSwapModalOpen,
    setCryptoDepositModalOpen,
    setReferralModalOpen,
    setRewardsModalOpen,
    setHamburgerMenuOpen,
    setSettingsModalOpen,
    setGmailModalOpen,
  } = useBroker();

  const isDemo = accountMode === 'demo';
  const displayedIRT = isDemo ? balances.demo_IRT : balances.IRT;
  const displayedUSDT = isDemo ? balances.demo_USDT : balances.USDT;

  const [logoTapCount, setLogoTapCount] = React.useState<number>(0);
  const tapTimerRef = React.useRef<any>(null);

  const handleLogoTap = () => {
    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
    }

    const nextCount = logoTapCount + 1;
    if (nextCount >= 5) {
      setLogoTapCount(0);
      setIsAdminOpen(true);
    } else {
      setLogoTapCount(nextCount);
      // Secret silent tap timer - no counter text shown to regular users
      tapTimerRef.current = setTimeout(() => {
        setLogoTapCount(0);
      }, 2500);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#090d15]/95 backdrop-blur-xl border-b border-slate-850 px-3 lg:px-6 py-2.5 flex items-center justify-between gap-3 lg:gap-6 transition-colors shadow-sm">
      {/* Zone 1: Hamburger Button & Brand Wordmark (Secret 5-Tap Admin Trigger) */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={() => setHamburgerMenuOpen(true)}
          className="p-2.5 rounded-2xl bg-[#0f1420] border border-slate-800 hover:border-amber-500/40 hover:bg-[#151c2d] text-slate-200 hover:text-amber-400 transition-all shadow-sm flex items-center gap-2 active:scale-95"
          title="منوی جامع امکانات بروکر"
        >
          <Menu className="w-5 h-5 text-amber-400" />
          <span className="hidden sm:inline font-bold text-xs text-slate-200">منو</span>
        </button>

        {/* Secret 5-Tap Area on Broker Brand Symbol (Completely silent without counter) */}
        <div
          onClick={handleLogoTap}
          className="flex items-center gap-2.5 cursor-pointer select-none active:scale-95 transition-all group relative"
          title="بروکر آریا تریدر"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-base group-hover:shadow-amber-500/40 transition-shadow">
            <TrendingUp className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm lg:text-base tracking-tight text-white whitespace-nowrap group-hover:text-amber-300 transition-colors">
              بروکر آریا تریدر
            </span>
            <span className="text-[10px] text-amber-400 font-medium tracking-wider font-mono-numbers">
              ARIATRADER
            </span>
          </div>
        </div>
      </div>

      {/* Zone 2: Navigation Links & Fast Access Features (Admin button removed from public view) */}
      <nav className="hidden xl:flex items-center gap-2 lg:gap-3 text-xs font-medium text-slate-300">
        <button
          onClick={() => setSwapModalOpen(true)}
          className="hover:text-blue-400 transition-colors whitespace-nowrap flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl hover:bg-slate-850/80"
        >
          <Zap className="w-4 h-4 text-blue-400" />
          <span>صرافی تبدیل سریع</span>
        </button>
        <button
          onClick={() => setCryptoDepositModalOpen(true)}
          className="hover:text-emerald-400 transition-colors whitespace-nowrap flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl hover:bg-slate-850/80"
        >
          <Coins className="w-4 h-4 text-emerald-400" />
          <span>شارژ رمزارزی</span>
        </button>
        <button
          onClick={() => setCardDepositModalOpen(true)}
          className="hover:text-amber-400 transition-colors whitespace-nowrap flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl hover:bg-slate-850/80"
        >
          <CreditCard className="w-4 h-4 text-amber-400" />
          <span>واریز کارت به کارت</span>
        </button>
        <button
          onClick={() => setWithdrawModalOpen(true)}
          className="hover:text-sky-400 transition-colors whitespace-nowrap flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl hover:bg-slate-850/80"
        >
          <ArrowUpRight className="w-4 h-4 text-sky-400" />
          <span>برداشت شبا</span>
        </button>
        <button
          onClick={() => setReferralModalOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 hover:bg-amber-500/20 transition-all whitespace-nowrap flex items-center gap-1.5 font-bold"
        >
          <Users className="w-3.5 h-3.5 text-amber-400" />
          <span>زیرمجموعه‌گیری (تا ۵۰٪)</span>
        </button>
        <button
          onClick={() => setRewardsModalOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-300 hover:bg-purple-500/20 transition-all whitespace-nowrap flex items-center gap-1.5 font-bold"
        >
          <Gift className="w-3.5 h-3.5 text-purple-400" />
          <span>جوایز و گردونه</span>
        </button>
        <button
          onClick={() => setGmailModalOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 hover:bg-rose-500/20 transition-all whitespace-nowrap flex items-center gap-1.5 font-bold"
        >
          <Mail className="w-3.5 h-3.5 text-rose-400" />
          <span>جیمیل و تبلیغات</span>
        </button>
      </nav>

      {/* Zone 3: Account Controls & CTAs */}
      <div className="flex items-center gap-2 lg:gap-2.5 shrink-0">
        {/* Real / Demo Toggle Pill */}
        <div className="flex items-center bg-[#0d121c] border border-slate-800 p-1 rounded-2xl text-xs">
          <button
            onClick={() => setAccountMode('real')}
            className={`px-3 py-1 rounded-xl font-medium transition-all whitespace-nowrap ${
              !isDemo
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            حساب واقعی
          </button>
          <button
            onClick={() => setAccountMode('demo')}
            className={`px-3 py-1 rounded-xl font-medium transition-all whitespace-nowrap ${
              isDemo
                ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            آزمایشی (دمو)
          </button>
        </div>

        {/* Balance Preview Card */}
        <div
          onClick={() => setWalletModalOpen(true)}
          className="cursor-pointer hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 bg-[#0f1422] border border-slate-800 rounded-2xl hover:border-slate-700 transition-all text-xs shadow-sm"
        >
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400">
              {isDemo ? 'موجودی مجازی' : 'موجودی کل'}
            </span>
            <span className="font-semibold text-slate-100 font-mono-numbers text-xs">
              {displayedIRT.toLocaleString('fa-IR')}{' '}
              <span className="text-[10px] text-amber-400 font-normal">تومان</span>
            </span>
          </div>
          <div className="h-6 w-[1px] bg-slate-800" />
          <div className="text-left font-mono-numbers text-emerald-400 text-xs">
            ${displayedUSDT.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </div>
        </div>

        {/* Primary CTA: Deposit Card-to-Card */}
        <button
          onClick={() => setCardDepositModalOpen(true)}
          className="px-3.5 lg:px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-2xl shadow-md shadow-amber-500/20 transition-all whitespace-nowrap flex items-center gap-1.5 active:scale-95"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>شارژ کارت‌به‌کارت</span>
        </button>

        {/* Gmail Marketing & Communication Button */}
        <button
          onClick={() => setGmailModalOpen(true)}
          title="مرکز ارتباط با کاربر، ارسال تبلیغات و کمپین‌های جیمیل"
          className="p-2 text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-2xl transition-all shadow-sm active:scale-95"
        >
          <Mail className="w-4 h-4 text-rose-400" />
        </button>

        {/* Settings Button */}
        <button
          onClick={() => setSettingsModalOpen(true)}
          title="تنظیمات پلتفرم، ارائه‌دهنده قیمت و چارت"
          className="p-2 text-slate-300 hover:text-amber-400 bg-[#0f1422] border border-slate-800 hover:border-slate-700 rounded-2xl transition-all shadow-sm active:scale-95"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          title={soundEnabled ? 'قطع صدای معاملات' : 'فعال‌سازی صدای معاملات'}
          className="p-2 text-slate-400 hover:text-slate-200 bg-[#0f1422] border border-slate-800 hover:border-slate-700 rounded-2xl transition-all shadow-sm"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-amber-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>
      </div>
    </header>
  );
};

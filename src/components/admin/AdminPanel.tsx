/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useBroker } from '../../context/BrokerContext';
import {
  formatCurrency,
  formatCardNumber,
  formatSheba,
  numberToWordsFa,
} from '../../utils/iranianBanks';
import {
  LayoutDashboard,
  CreditCard,
  Building2,
  ArrowUpRight,
  Users,
  Sliders,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  Zap,
  Radio,
  Lock,
  Unlock,
  Plus,
  ArrowRight,
  TrendingUp,
  Eye,
  FileText,
  Image as ImageIcon,
  Mail,
  Save,
  Check,
  DollarSign,
} from 'lucide-react';
import { BankAccountInfo, AdminUserRecord } from '../../types/broker';

type AdminTab =
  | 'overview'
  | 'deposits'
  | 'bank_accounts'
  | 'withdrawals'
  | 'users'
  | 'positions'
  | 'settings';

export const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    transactions,
    positions,
    markets,
    balances,
    brokerSettings,
    updateBrokerSettings,
    adminUsers,
    updateAdminUser,
    brokerBankAccounts,
    updateBrokerBankAccount,
    addBrokerBankAccount,
    approveDeposit,
    rejectDeposit,
    approveWithdrawal,
    rejectWithdrawal,
    adminClosePosition,
    dataProviderStatus,
    setAccountMode,
    setGmailModalOpen,
  } = useBroker();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // New bank account form state
  const [newBank, setNewBank] = useState<BankAccountInfo>({
    bankName: 'بانک پاسارگاد',
    bankCode: 'BPG',
    cardPrefix: '502229',
    accountHolder: 'آریا پرداز مالی خاورمیانه',
    cardNumber: '5022291084561234',
    sheba: 'IR550570084380005678912345',
    accountNumber: '843-820-5678912-1',
    dailyLimit: 'کارت به کارت تا ۱۰ میلیون تومان',
    active: true,
  });
  const [isAddingBank, setIsAddingBank] = useState(false);

  // Balance adjustment modal state
  const [adjustingUserId, setAdjustingUserId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(5000000);
  const [adjustCurrency, setAdjustCurrency] = useState<'IRT' | 'USDT'>('IRT');

  // KYC Inspection Modal state
  const [viewingDocUser, setViewingDocUser] = useState<AdminUserRecord | null>(null);

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Dedicated local state for Settings Form (completely decoupled from live market tick re-renders)
  const [settingsForm, setSettingsForm] = useState({
    usdToTomanRate: String(brokerSettings.usdToTomanRate || 95000),
    makerFeePercent: String(brokerSettings.makerFeePercent ?? 0.04),
    takerFeePercent: String(brokerSettings.takerFeePercent ?? 0.06),
    spreadMarkupPercent: String(brokerSettings.spreadMarkupPercent ?? 0.02),
    maxLeverageGlobal: brokerSettings.maxLeverageGlobal || 2000,
    autoApproveDepositsUnder: String(brokerSettings.autoApproveDepositsUnder || 20000000),
  });
  const [settingsSavedBadge, setSettingsSavedBadge] = useState(false);

  // Sync if tab opened
  useEffect(() => {
    if (activeTab === 'settings') {
      setSettingsForm((prev) => ({
        ...prev,
        usdToTomanRate: prev.usdToTomanRate || String(brokerSettings.usdToTomanRate || 95000),
      }));
    }
  }, [activeTab, brokerSettings.usdToTomanRate]);

  const handleSaveSettings = () => {
    const rawUsd = Number(String(settingsForm.usdToTomanRate).replace(/[^\d.]/g, '')) || 95000;
    const usdRate = Math.max(1000, Math.round(rawUsd));
    const makerFee = parseFloat(settingsForm.makerFeePercent) || 0;
    const takerFee = parseFloat(settingsForm.takerFeePercent) || 0;
    const spreadMarkup = parseFloat(settingsForm.spreadMarkupPercent) || 0;
    const maxLeverage = Number(settingsForm.maxLeverageGlobal) || 2000;
    const autoApprove = Number(String(settingsForm.autoApproveDepositsUnder).replace(/[^\d.]/g, '')) || 20000000;

    updateBrokerSettings({
      usdToTomanRate: usdRate,
      makerFeePercent: makerFee,
      takerFeePercent: takerFee,
      spreadMarkupPercent: spreadMarkup,
      maxLeverageGlobal: maxLeverage,
      autoApproveDepositsUnder: autoApprove,
    });

    setSettingsForm((prev) => ({
      ...prev,
      usdToTomanRate: String(usdRate),
      autoApproveDepositsUnder: String(autoApprove),
    }));

    setSettingsSavedBadge(true);
    setTimeout(() => setSettingsSavedBadge(false), 3500);
    showToast(`تنظیمات ذخیره شد. نرخ پایه دلار روی ${formatCurrency(usdRate)} تومان در کل سامانه اعمال گردید.`);
  };

  const handleAdjustUsd = (delta: number) => {
    const raw = Number(String(settingsForm.usdToTomanRate).replace(/[^\d.]/g, '')) || 95000;
    const updated = Math.max(1000, raw + delta);
    setSettingsForm((prev) => ({ ...prev, usdToTomanRate: String(updated) }));
  };

  const handleSetUsdPreset = (val: number) => {
    setSettingsForm((prev) => ({ ...prev, usdToTomanRate: String(val) }));
  };

  // Calculations for Overview Dashboard
  const depositsList = transactions.filter(
    (t) => t.type === 'deposit_card' || t.type === 'exchange_buy'
  );
  const withdrawalsList = transactions.filter((t) => t.type === 'withdraw_sheba');

  const pendingDeposits = depositsList.filter((t) => t.status === 'pending');
  const pendingWithdrawals = withdrawalsList.filter((t) => t.status === 'pending');

  const totalDepositedVolume = depositsList
    .filter((t) => t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalWithdrawnVolume = withdrawalsList
    .filter((t) => t.status === 'completed')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalActiveExposure = positions.reduce((acc, p) => acc + p.margin, 0);
  const totalEstimatedBrokerRevenue = totalDepositedVolume * 0.0035 + 24800000; // commission + spread

  return (
    <div className="fixed inset-0 z-50 flex bg-[#080b10] text-slate-100 select-none overflow-hidden font-sans">
      {/* 1. Admin Sidebar Navigation */}
      <aside className="w-64 bg-[#0d1117] border-l border-slate-800 flex flex-col shrink-0">
        {/* Brand Lockup */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-white block">پنل مدیریت آریا تریدر</span>
              <span className="text-[10px] text-amber-400 font-mono-numbers">ADMIN PORTAL v2.6</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>داشبورد و آمار مالی</span>
          </button>

          <button
            onClick={() => setActiveTab('deposits')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
              activeTab === 'deposits'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4" />
              <span>واریزهای کارت‌به‌کارت</span>
            </div>
            {pendingDeposits.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-600 text-white font-bold">
                {pendingDeposits.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('bank_accounts')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition-colors ${
              activeTab === 'bank_accounts'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>حساب‌های بانکی بروکر</span>
          </button>

          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
              activeTab === 'withdrawals'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ArrowUpRight className="w-4 h-4" />
              <span>تسویه و برداشت شبا</span>
            </div>
            {pendingWithdrawals.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-slate-950 font-bold">
                {pendingWithdrawals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>مدیریت کاربران و KYC</span>
          </button>

          <button
            onClick={() => setActiveTab('positions')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
              activeTab === 'positions'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4" />
              <span>مانیتورینگ ریسک و پوزیشن‌ها</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono-numbers">
              {positions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>تنظیمات کارمزد، اسپرد و سرور</span>
          </button>

          <button
            onClick={() => setGmailModalOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition-all text-rose-300 hover:text-white bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 shadow-sm"
          >
            <Mail className="w-4 h-4 text-rose-400" />
            <span>ارسال تبلیغات و ایمیل جیمیل</span>
          </button>
        </nav>

        {/* Exit Admin Button */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به تالار معاملات تریدر</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Admin Workspace */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Notification Toast */}
        {actionSuccessMsg && (
          <div className="bg-emerald-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button onClick={() => setActionSuccessMsg(null)}>×</button>
          </div>
        )}

        {/* Admin Top Header */}
        <header className="px-6 py-3.5 border-b border-slate-800 bg-[#0c1017] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-white">
              {activeTab === 'overview' && 'داشبورد جامع نظارت مالی و آماری بروکر'}
              {activeTab === 'deposits' && 'مدیریت و تایید واریزی‌های کارت به کارت بانکی'}
              {activeTab === 'bank_accounts' && 'حساب‌ها و کارت‌های رسمی دریافت وجه بروکر'}
              {activeTab === 'withdrawals' && 'تسویه درخواست‌های برداشت به شماره شبا (پایا)'}
              {activeTab === 'users' && 'فهرست کاربران، احراز هویت و مدیریت دسترسی'}
              {activeTab === 'positions' && 'مانیتورینگ زنده پوزیشن‌های باز کاربران و مدیریت ریسک'}
              {activeTab === 'settings' && 'تنظیمات نرخ دلار، اسپرد، کارمزدها و ارائه‌دهنده داده'}
            </h2>
          </div>

          {/* Live Market Provider Status */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 font-mono-numbers">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>{dataProviderStatus.name}</span>
              <span className="text-emerald-400 font-bold">({dataProviderStatus.latencyMs}ms)</span>
            </div>
          </div>
        </header>

        {/* Content Tabs */}
        <div className="flex-1 p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Financial KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#131b26] to-[#0c121a] border border-slate-800 shadow-md space-y-2">
                  <span className="text-slate-400 text-xs block">کل واریزی‌های ریالی تایید شده:</span>
                  <div className="text-xl font-bold font-mono-numbers text-emerald-400">
                    {formatCurrency(totalDepositedVolume)} تومان
                  </div>
                  <span className="text-[11px] text-slate-500">از طریق شبکه شتاب و کارت‌به‌کارت</span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#131b26] to-[#0c121a] border border-slate-800 shadow-md space-y-2">
                  <span className="text-slate-400 text-xs block">کل تسویه‌ها و برداشت‌ها:</span>
                  <div className="text-xl font-bold font-mono-numbers text-sky-400">
                    {formatCurrency(totalWithdrawnVolume)} تومان
                  </div>
                  <span className="text-[11px] text-slate-500">حواله‌های پایا و ساتنا پردازش شده</span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#131b26] to-[#0c121a] border border-slate-800 shadow-md space-y-2">
                  <span className="text-slate-400 text-xs block">درآمد کارمزد خالص بروکر:</span>
                  <div className="text-xl font-bold font-mono-numbers text-amber-400">
                    {formatCurrency(totalEstimatedBrokerRevenue)} تومان
                  </div>
                  <span className="text-[11px] text-slate-500">از میکر، تیکر و اسپرد نمادها</span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#131b26] to-[#0c121a] border border-slate-800 shadow-md space-y-2">
                  <span className="text-slate-400 text-xs block">مارجین درگیر پوزیشن‌های لایو:</span>
                  <div className="text-xl font-bold font-mono-numbers text-purple-400">
                    {formatCurrency(totalActiveExposure)} تومان
                  </div>
                  <span className="text-[11px] text-slate-500">{positions.length} معامله باز فعال</span>
                </div>
              </div>

              {/* Action Required: Pending Queues */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Deposits Box */}
                <div className="p-4 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <h3 className="font-bold text-sm text-slate-200">
                        واریزی‌های کارت‌به‌کارت منتظر تایید ({pendingDeposits.length})
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('deposits')}
                      className="text-xs text-amber-400 hover:underline"
                    >
                      مشاهده همه
                    </button>
                  </div>

                  {pendingDeposits.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      هیچ واریزی بلاتکلیفی وجود ندارد. تمام تراکنش‌ها بررسی شده‌اند.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pendingDeposits.map((dep) => (
                        <div
                          key={dep.id}
                          className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-100 block">
                              {formatCurrency(dep.amount)} تومان
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              کارت مبدا: ****{dep.senderCardLast4} | پیگیری: {dep.trackingCode}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                approveDeposit(dep.id);
                                showToast(`واریز ${formatCurrency(dep.amount)} تومان تایید و کیف پول شارژ شد.`);
                              }}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                            >
                              تایید و شارژ
                            </button>
                            <button
                              onClick={() => {
                                rejectDeposit(dep.id, 'عدم تطابق فیش بانکی');
                                showToast('واریز رد شد.');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-950 text-rose-300 hover:bg-rose-900 text-xs"
                            >
                              رد
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pending Withdrawals Box */}
                <div className="p-4 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="w-4 h-4 text-sky-400" />
                      <h3 className="font-bold text-sm text-slate-200">
                        درخواست‌های تسویه پایا ({pendingWithdrawals.length})
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('withdrawals')}
                      className="text-xs text-sky-400 hover:underline"
                    >
                      مشاهده همه
                    </button>
                  </div>

                  {pendingWithdrawals.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      هیچ درخواست برداشتی در صف انتظار نیست.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pendingWithdrawals.map((wth) => (
                        <div
                          key={wth.id}
                          className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-100 block">
                              {formatCurrency(wth.amount)} تومان
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              بانک مقصد: {wth.destBank} | مرجع: {wth.referenceId}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                approveWithdrawal(wth.id, `PAYA-${Date.now().toString().slice(-6)}`);
                                showToast('درخواست برداشت با حواله پایا تایید شد.');
                              }}
                              className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs"
                            >
                              تایید پایا
                            </button>
                            <button
                              onClick={() => {
                                rejectWithdrawal(wth.id, 'کد شبا نامعتبر');
                                showToast('برداشت لغو و موجودی به کیف پول کاربر بازگشت.');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-rose-900 text-xs"
                            >
                              لغو
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEPOSITS MANAGEMENT */}
          {activeTab === 'deposits' && (
            <div className="p-4 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    لیست واریزی‌های کارت به کارت بانکی شتاب
                  </h3>
                  <p className="text-xs text-slate-400">
                    امکان بررسی فیش بانکی، شماره کارت مبدا، تطبیق با حساب امانی و تایید فوری
                  </p>
                </div>
              </div>

              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] pb-2">
                    <th className="py-2 px-3">شناسه پرداخت</th>
                    <th className="py-2 px-3">مبلغ (تومان)</th>
                    <th className="py-2 px-3">۴ رقم کارت مبدا</th>
                    <th className="py-2 px-3">بانک مقصد بروکر</th>
                    <th className="py-2 px-3">کد پیگیری شتاب</th>
                    <th className="py-2 px-3">وضعیت</th>
                    <th className="py-2 px-3">زمان ثبت</th>
                    <th className="py-2 px-3 text-center">اقدام مدیریت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {depositsList.map((dep) => (
                    <tr key={dep.id} className="hover:bg-slate-900/50">
                      <td className="py-3 px-3 font-mono-numbers font-bold text-amber-400">
                        {dep.referenceId}
                      </td>
                      <td className="py-3 px-3 font-mono-numbers font-bold text-slate-100">
                        {formatCurrency(dep.amount)}
                      </td>
                      <td className="py-3 px-3 font-mono-numbers text-slate-300">
                        ****{dep.senderCardLast4 || '8154'}
                      </td>
                      <td className="py-3 px-3 text-slate-300">{dep.destBank || 'بانک سامان'}</td>
                      <td className="py-3 px-3 font-mono-numbers text-slate-400">
                        {dep.trackingCode || '-'}
                      </td>
                      <td className="py-3 px-3">
                        {dep.status === 'completed' ? (
                          <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                            تایید شده
                          </span>
                        ) : dep.status === 'pending' ? (
                          <span className="px-2 py-0.5 rounded text-[11px] bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                            در انتظار تایید
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                            رد شده
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono-numbers text-slate-400 text-[11px]">
                        {new Date(dep.timestamp).toLocaleDateString('fa-IR')}{' '}
                        {new Date(dep.timestamp).toLocaleTimeString('fa-IR')}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {dep.status === 'pending' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                approveDeposit(dep.id);
                                showToast(`واریز ${formatCurrency(dep.amount)} تومان با موفقیت تایید شد.`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                            >
                              تایید
                            </button>
                            <button
                              onClick={() => {
                                rejectDeposit(dep.id, 'مغایرت فیش بانکی');
                                showToast('واریز رد شد.');
                              }}
                              className="px-2 py-1 rounded-lg bg-rose-950 text-rose-300 hover:bg-rose-900 text-xs"
                            >
                              رد
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: BROKER BANK ACCOUNTS */}
          {activeTab === 'bank_accounts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    حساب‌های بانکی و شماره کارت‌های امانی بروکر جهت شارژ
                  </h3>
                  <p className="text-xs text-slate-400">
                    این کارت‌ها مستقیماً در درگاه واریز کارت‌به‌کارت به کاربران نمایش داده می‌شوند.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingBank(!isAddingBank)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>افزودن کارت بانکی جدید</span>
                </button>
              </div>

              {/* Add New Bank Card Form */}
              {isAddingBank && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-3 text-xs">
                  <h4 className="font-bold text-amber-300">افزودن شماره کارت بانکی جدید به لیست بروکر:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-300 block mb-1">نام بانک:</label>
                      <input
                        type="text"
                        value={newBank.bankName}
                        onChange={(e) => setNewBank({ ...newBank, bankName: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-1">شماره کارت ۱۶ رقمی:</label>
                      <input
                        type="text"
                        value={newBank.cardNumber}
                        onChange={(e) => setNewBank({ ...newBank, cardNumber: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono-numbers text-left"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-1">شماره شبا (با IR):</label>
                      <input
                        type="text"
                        value={newBank.sheba}
                        onChange={(e) => setNewBank({ ...newBank, sheba: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono-numbers text-left"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        addBrokerBankAccount(newBank);
                        setIsAddingBank(false);
                        showToast(`کارت ${newBank.bankName} به لیست واریزها افزوده شد.`);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                    >
                      ذخیره کارت
                    </button>
                    <button
                      onClick={() => setIsAddingBank(false)}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300"
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              )}

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {brokerBankAccounts.map((b) => (
                  <div
                    key={b.cardNumber}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      b.active
                        ? 'bg-gradient-to-br from-[#121822] to-[#0c1017] border-slate-750'
                        : 'bg-[#0a0d13] border-slate-850 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-sm text-slate-100">{b.bankName}</span>
                      </div>
                      <button
                        onClick={() => {
                          updateBrokerBankAccount(b.cardNumber, { active: !b.active });
                          showToast(`وضعیت کارت ${b.bankName} تغییر یافت.`);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          b.active
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {b.active ? 'فعال (در حال دریافت)' : 'غیرفعال'}
                      </button>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div>
                        صاحب حساب: <span className="text-slate-100 font-medium">{b.accountHolder}</span>
                      </div>
                      <div className="font-mono-numbers text-amber-300 font-bold text-sm tracking-wider">
                        {formatCardNumber(b.cardNumber)}
                      </div>
                      <div className="font-mono-numbers text-slate-400 text-[11px]">
                        {formatSheba(b.sheba)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: WITHDRAWALS (SETTLEMENT) */}
          {activeTab === 'withdrawals' && (
            <div className="p-4 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    درخواست‌های برداشت ریالی کاربران به شماره شبا
                  </h3>
                  <p className="text-xs text-slate-400">
                    ثبت کد پیگیری حواله پایا/ساتنا و تسویه خودکار با بانک
                  </p>
                </div>
              </div>

              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] pb-2">
                    <th className="py-2 px-3">شناسه برداشت</th>
                    <th className="py-2 px-3">مبلغ (تومان)</th>
                    <th className="py-2 px-3">بانک مقصد</th>
                    <th className="py-2 px-3">وضعیت</th>
                    <th className="py-2 px-3">کد پیگیری حواله پایا</th>
                    <th className="py-2 px-3">زمان ثبت</th>
                    <th className="py-2 px-3 text-center">اقدام تسویه</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {withdrawalsList.map((wth) => (
                    <tr key={wth.id} className="hover:bg-slate-900/50">
                      <td className="py-3 px-3 font-mono-numbers font-bold text-sky-400">
                        {wth.referenceId}
                      </td>
                      <td className="py-3 px-3 font-mono-numbers font-bold text-slate-100">
                        {formatCurrency(wth.amount)}
                      </td>
                      <td className="py-3 px-3 text-slate-300">{wth.destBank}</td>
                      <td className="py-3 px-3">
                        {wth.status === 'completed' ? (
                          <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                            تسویه و واریز شد
                          </span>
                        ) : wth.status === 'pending' ? (
                          <span className="px-2 py-0.5 rounded text-[11px] bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                            در صف پایا
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                            لغو شده
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono-numbers text-slate-400">
                        {wth.trackingCode || '-'}
                      </td>
                      <td className="py-3 px-3 font-mono-numbers text-slate-400 text-[11px]">
                        {new Date(wth.timestamp).toLocaleDateString('fa-IR')}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {wth.status === 'pending' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                approveWithdrawal(wth.id, `PAYA-${Date.now().toString().slice(-6)}`);
                                showToast('درخواست تسویه شد.');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs"
                            >
                              تایید و ثبت پایا
                            </button>
                            <button
                              onClick={() => {
                                rejectWithdrawal(wth.id, 'لغو توسط مدیر سیستم');
                                showToast('برداشت لغو شد و وجه بازگردانده شد.');
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-rose-900 text-xs"
                            >
                              لغو
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: USERS & KYC */}
          {activeTab === 'users' && (
            <div className="p-4 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    مدیریت کاربران، تایید احراز هویت و دسترسی‌ها
                  </h3>
                  <p className="text-xs text-slate-400">
                    نظارت بر تریدرهای فعال داخل کشور، بررسی کد ملی و شارژ/کسر دستی موجودی
                  </p>
                </div>
              </div>

              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] pb-2">
                    <th className="py-2 px-3">نام و نام خانوادگی</th>
                    <th className="py-2 px-3">کد ملی</th>
                    <th className="py-2 px-3">شماره تماس</th>
                    <th className="py-2 px-3">موجودی تومانی</th>
                    <th className="py-2 px-3">موجودی تتر</th>
                    <th className="py-2 px-3">وضعیت KYC</th>
                    <th className="py-2 px-3">وضعیت حساب</th>
                    <th className="py-2 px-3 text-center">عملیات مدیریت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {adminUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-900/50">
                      <td className="py-3 px-3 font-bold text-slate-100">{user.fullName}</td>
                      <td className="py-3 px-3 font-mono-numbers text-slate-300">
                        {user.nationalCode}
                      </td>
                      <td className="py-3 px-3 font-mono-numbers text-slate-300">
                        {user.phoneNumber}
                      </td>
                      <td className="py-3 px-3 font-mono-numbers font-bold text-amber-400">
                        {formatCurrency(user.balanceIRT)}
                      </td>
                      <td className="py-3 px-3 font-mono-numbers font-bold text-emerald-400">
                        ${user.balanceUSDT.toFixed(2)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                          سطح {user.kycLevel} تایید شده
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {user.isBanned ? (
                          <span className="px-2 py-0.5 rounded text-[11px] bg-rose-500/20 text-rose-400 font-bold">
                            مسدود شده
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-400">
                            فعال
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setViewingDocUser(user)}
                            className="px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-white font-bold text-xs transition-colors flex items-center gap-1"
                            title="مشاهده تصویر کارت ملی/شناسایی"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>مدرک</span>
                          </button>
                          <button
                            onClick={() => {
                              setAdjustingUserId(user.id);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs transition-colors"
                          >
                            تعدیل موجودی
                          </button>
                          <button
                            onClick={() => {
                              updateAdminUser(user.id, { isBanned: !user.isBanned });
                              showToast(
                                user.isBanned ? 'کاربر از حالت مسدود خارج شد.' : 'حساب کاربر مسدود شد.'
                              );
                            }}
                            className={`p-1.5 rounded-lg text-xs ${
                              user.isBanned ? 'bg-emerald-900 text-emerald-300' : 'bg-rose-950 text-rose-300'
                            }`}
                          >
                            {user.isBanned ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* View KYC Document Photo Modal */}
              {viewingDocUser && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/40 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-400" />
                      <h4 className="font-bold text-sm text-slate-100">
                        بررسی مدارک شناسایی و تطبیق هویت: {viewingDocUser.fullName}
                      </h4>
                    </div>
                    <button
                      onClick={() => setViewingDocUser(null)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      بستن پنجره
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* User Identity Details */}
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 bg-slate-950 rounded-xl space-y-1.5 border border-slate-800">
                        <div className="flex justify-between">
                          <span className="text-slate-400">کد ملی:</span>
                          <span className="font-mono-numbers font-bold text-slate-200">
                            {viewingDocUser.nationalCode}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">شماره موبایل:</span>
                          <span className="font-mono-numbers text-slate-200">
                            {viewingDocUser.phoneNumber}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">ایمیل:</span>
                          <span className="font-mono-numbers text-slate-200">
                            {viewingDocUser.email || 'ثبت نشده'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">شماره کارت:</span>
                          <span className="font-mono-numbers text-slate-200">
                            ****{viewingDocUser.registeredCardLast4}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">شماره شبا:</span>
                          <span className="font-mono-numbers text-slate-200">
                            {viewingDocUser.sheba || 'IR450560084380001234567890'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => {
                            updateAdminUser(viewingDocUser.id, {
                              isVerified: true,
                              kycLevel: 2,
                              verificationStatus: 'verified',
                            });
                            showToast(`احراز هویت ${viewingDocUser.fullName} تایید شد.`);
                            setViewingDocUser(null);
                          }}
                          className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                        >
                          تایید مدارک و اعطای سطح ۲
                        </button>
                        <button
                          onClick={() => {
                            updateAdminUser(viewingDocUser.id, {
                              isVerified: false,
                              kycLevel: 1,
                              verificationStatus: 'rejected',
                            });
                            showToast(`مدارک کاربر رد شد و درخواست ارسال مجدد صادر گردید.`);
                            setViewingDocUser(null);
                          }}
                          className="px-4 py-2 rounded-xl bg-rose-950 text-rose-300 hover:bg-rose-900 text-xs transition-colors"
                        >
                          رد مدرک
                        </button>
                      </div>
                    </div>

                    {/* Image Preview Box */}
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
                      <span className="text-[11px] text-slate-400 mb-2 block font-bold">
                        تصویر بارگذاری شده مدرک شناسایی (کارت ملی / گواهینامه):
                      </span>
                      {viewingDocUser.idCardImage && viewingDocUser.idCardImage.startsWith('data:') ? (
                        <img
                          src={viewingDocUser.idCardImage}
                          alt="مدرک شناسایی"
                          className="max-h-48 object-contain rounded-lg border border-slate-750 shadow-md"
                        />
                      ) : (
                        <div className="w-full h-40 bg-slate-900 border border-dashed border-slate-750 rounded-lg flex flex-col items-center justify-center p-3 text-slate-400 space-y-2">
                          <ImageIcon className="w-8 h-8 text-indigo-400" />
                          <span className="font-bold text-xs text-slate-300">
                            سند رسمی کارت ملی هوشمند کاربر
                          </span>
                          <span className="text-[10px] text-emerald-400">
                            تطبیق داده شده با سامانه شاهکار و ثبت احوال
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Adjust Balance Dialog */}
              {adjustingUserId && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-3">
                  <h4 className="font-bold text-sm text-amber-300">
                    افزایش یا کسر دستی موجودی حساب تریدر:
                  </h4>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(Number(e.target.value))}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-2 font-mono-numbers text-xs text-white"
                    />
                    <select
                      value={adjustCurrency}
                      onChange={(e) => setAdjustCurrency(e.target.value as any)}
                      className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="IRT">تومان (IRT)</option>
                      <option value="USDT">تتر (USDT)</option>
                    </select>
                    <button
                      onClick={() => {
                        const target = adminUsers.find((u) => u.id === adjustingUserId);
                        if (target) {
                          const newBalance =
                            adjustCurrency === 'IRT'
                              ? target.balanceIRT + adjustAmount
                              : target.balanceUSDT + adjustAmount;

                          updateAdminUser(target.id, {
                            ...(adjustCurrency === 'IRT'
                              ? { balanceIRT: Math.max(0, newBalance) }
                              : { balanceUSDT: Math.max(0, newBalance) }),
                          });
                          showToast(`موجودی کاربر با موفقیت تغییر کرد.`);
                          setAdjustingUserId(null);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold"
                    >
                      اعمال تغییر
                    </button>
                    <button
                      onClick={() => setAdjustingUserId(null)}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300"
                    >
                      بستن
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: POSITIONS & RISK MONITOR */}
          {activeTab === 'positions' && (
            <div className="p-4 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    نظارت زنده بر معاملات باز تریدرها (Risk Exposure Engine)
                  </h3>
                  <p className="text-xs text-slate-400">
                    مشاهده لحظه‌ای سود/زیان باز، لوریج‌های بالا و امکان بستن اضطراری معامله در صورت ریسک سیستمی
                  </p>
                </div>
              </div>

              {positions.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  در حال حاضر هیچ معامله بازی در سیستم وجود ندارد.
                </div>
              ) : (
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[11px] pb-2">
                      <th className="py-2 px-3">نماد مارکت</th>
                      <th className="py-2 px-3">جهت / اهرم</th>
                      <th className="py-2 px-3">حجم</th>
                      <th className="py-2 px-3">قیمت ورود</th>
                      <th className="py-2 px-3">قیمت لایو</th>
                      <th className="py-2 px-3">قیمت لیکوئیدی</th>
                      <th className="py-2 px-3">مارجین</th>
                      <th className="py-2 px-3">سود/زیان لحظه‌ای</th>
                      <th className="py-2 px-3 text-center">اقدام مداخله</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {positions.map((pos) => {
                      const isProfit = pos.unrealizedPnl >= 0;
                      return (
                        <tr key={pos.id} className="hover:bg-slate-900/50">
                          <td className="py-3 px-3 font-bold font-mono-numbers text-slate-200">
                            {pos.marketSymbol}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                                pos.side === 'long'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {pos.side === 'long' ? 'لانگ (خرید)' : 'شورت (فروش)'} {pos.leverage}x
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono-numbers">{pos.amount}</td>
                          <td className="py-3 px-3 font-mono-numbers">{formatCurrency(pos.entryPrice, 2)}</td>
                          <td className="py-3 px-3 font-mono-numbers">{formatCurrency(pos.currentPrice, 2)}</td>
                          <td className="py-3 px-3 font-mono-numbers text-rose-400 font-bold">
                            {formatCurrency(pos.liquidationPrice, 2)}
                          </td>
                          <td className="py-3 px-3 font-mono-numbers">{formatCurrency(pos.margin, 2)}</td>
                          <td className="py-3 px-3 font-mono-numbers font-bold">
                            <span className={isProfit ? 'text-emerald-400' : 'text-rose-400'}>
                              {isProfit ? '+' : ''}
                              {pos.unrealizedPnl} ({isProfit ? '+' : ''}
                              {pos.unrealizedPnlPercent.toFixed(2)}%)
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => {
                                adminClosePosition(pos.id);
                                showToast(`معامله ${pos.marketSymbol} توسط مدیر بسته شد.`);
                              }}
                              className="px-2.5 py-1 rounded bg-rose-950 text-rose-300 hover:bg-rose-900 text-xs font-bold"
                            >
                              بستن اضطراری
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 7: SETTINGS & DATA PROVIDER */}
          {activeTab === 'settings' && (
            <div className="p-4 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-6">
              <div>
                <h3 className="font-bold text-sm text-slate-100">
                  تنظیمات سرور تامین‌کننده قیمت، اسپرد و کارمزدهای بروکر
                </h3>
                <p className="text-xs text-slate-400">
                  کنترل کامل روی موتور محاسباتی بروکر، نرخ تتر و تنظیمات ریسک
                </p>
              </div>

              {/* Data Provider Configuration */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-slate-200 text-xs">
                    تامین‌کننده داده‌های قیمت جهانی (Market Data Provider):
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div
                    onClick={() => {
                      updateBrokerSettings({ activeDataProvider: 'kraken_spot' });
                      showToast('تامین‌کننده قیمت روی Kraken Institutional تنظیم شد.');
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      brokerSettings.activeDataProvider === 'kraken_spot'
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white">Kraken Spot (سازمانی)</span>
                      <span className="text-[10px] text-emerald-400 font-mono-numbers bg-emerald-500/20 px-1.5 py-0.5 rounded-full">پیش‌فرض</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      داده‌های لحظه‌ای و دقیق بازار جهانی مطابق تریدینگ‌ویو بدون تحریم
                    </span>
                  </div>

                  <div
                    onClick={() => {
                      updateBrokerSettings({ activeDataProvider: 'coingecko' });
                      showToast('تامین‌کننده قیمت روی CoinGecko Pro تنظیم شد.');
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      brokerSettings.activeDataProvider === 'coingecko'
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs text-white block mb-1">
                      CoinGecko Pro Aggregator
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      میانگین وزنی ۵۰ صرافی بین‌المللی برتر
                    </span>
                  </div>

                  <div
                    onClick={() => {
                      updateBrokerSettings({ activeDataProvider: 'coinbase' });
                      showToast('تامین‌کننده قیمت روی Coinbase Exchange تنظیم شد.');
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      brokerSettings.activeDataProvider === 'coinbase'
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs text-white block mb-1">
                      Coinbase Exchange API
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      شاخص نقدینگی و اسپات ایالات متحده
                    </span>
                  </div>

                  <div
                    onClick={() => {
                      updateBrokerSettings({ activeDataProvider: 'redundant_engine' });
                      showToast('تامین‌کننده روی شبکه سوییچ هوشمند پشتیبان قرار گرفت.');
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      brokerSettings.activeDataProvider === 'redundant_engine'
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs text-white block mb-1">
                      سوییچ چندگانه Redundant Engine
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      فیل‌اور آنی خودکار در صورت بروز کندی شبکه اینترنت
                    </span>
                  </div>
                </div>
              </div>

              {/* Rates & Commission Section */}
              <div className="space-y-4">
                {/* 1. Main USD / Toman Exchange Rate Module */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-500/10 via-slate-900/60 to-slate-950 border border-amber-500/30 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-500/20 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          نرخ مبنا و مرجع دلار / تتر به تومان (USD/IRT)
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-normal">
                            مرجع تمام قیمت‌گذاری‌ها
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          مبنای محاسبه واریز کارت‌به‌کارت، تسویه شبا، جفت‌ارز USDT/IRT، طلا و درهم در سراسر پلتفرم
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">نرخ فعال کنونی:</span>
                      <span className="font-mono-numbers font-black text-amber-400 bg-amber-950/60 border border-amber-700/50 px-2.5 py-1 rounded-lg text-xs">
                        {formatCurrency(brokerSettings.usdToTomanRate || 95000)} تومان
                      </span>
                    </div>
                  </div>

                  {/* Input & Adjustment Controls */}
                  <div className="space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                      <div className="flex-1">
                        <label className="text-slate-300 text-xs block mb-1.5 font-medium">
                          مقدار جدید نرخ دلار (تومان):
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={settingsForm.usdToTomanRate}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^\d]/g, '');
                              setSettingsForm((prev) => ({ ...prev, usdToTomanRate: val }));
                            }}
                            placeholder="مثلا ۹۵۰۰۰"
                            className="w-full bg-slate-950 border-2 border-slate-700 focus:border-amber-500 rounded-xl px-4 py-2.5 text-base font-bold font-mono-numbers text-white outline-none transition-all"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-sans pointer-events-none">
                            تومان
                          </span>
                        </div>
                      </div>

                      {/* Step Increment / Decrement Buttons */}
                      <div className="flex flex-col justify-end">
                        <label className="text-slate-400 text-[11px] block mb-1.5">
                          تغییر پله‌ای سریع:
                        </label>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleAdjustUsd(-1000)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono-numbers transition-colors active:scale-95"
                            title="کاهش ۱۰۰۰ تومان"
                          >
                            -۱,۰۰۰
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjustUsd(-500)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono-numbers transition-colors active:scale-95"
                            title="کاهش ۵۰۰ تومان"
                          >
                            -۵۰۰
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjustUsd(+500)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono-numbers transition-colors active:scale-95"
                            title="افزایش ۵۰۰ تومان"
                          >
                            +۵۰۰
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjustUsd(+1000)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono-numbers transition-colors active:scale-95"
                            title="افزایش ۱۰۰۰ تومان"
                          >
                            +۱,۰۰۰
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjustUsd(+5000)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-mono-numbers transition-colors active:scale-95"
                            title="افزایش ۵۰۰۰ تومان"
                          >
                            +۵,۰۰۰
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Verbal Persian translation */}
                    <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400">معادل به حروف:</span>
                      <span className="font-bold text-amber-300">
                        {numberToWordsFa(Number(settingsForm.usdToTomanRate) || 0)} تومان
                      </span>
                    </div>

                    {/* Presets Grid */}
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1.5">
                        نرخ‌های پیش‌فرض رایج بازار:
                      </span>
                      <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                        {[93000, 94000, 95000, 96000, 97000, 98000, 100000].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleSetUsdPreset(preset)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-mono-numbers font-medium transition-all ${
                              Number(settingsForm.usdToTomanRate) === preset
                                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                            }`}
                          >
                            {preset.toLocaleString('fa-IR')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Fee, Markup & Leverage Parameters */}
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <h4 className="font-bold text-xs text-slate-200 mb-3 flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-blue-400" />
                    تنظیمات کارمزد، اسپرد و مشخصات اهرم معاملاتی
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="text-slate-300 block mb-1 font-medium">
                        درصد کارمزد میکر (Maker Fee %):
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={settingsForm.makerFeePercent}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({ ...prev, makerFeePercent: e.target.value }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-2.5 font-mono-numbers text-white outline-none"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        پیش‌فرض: ۰.۰۴ درصد برای سفارشات میکر
                      </span>
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1 font-medium">
                        درصد کارمزد تیکر (Taker Fee %):
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={settingsForm.takerFeePercent}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({ ...prev, takerFeePercent: e.target.value }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-2.5 font-mono-numbers text-white outline-none"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        پیش‌فرض: ۰.۰۶ درصد برای معاملات مارکت
                      </span>
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1 font-medium">
                        درصد اسپرد اضافه مارکت‌ها (Spread Markup %):
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={settingsForm.spreadMarkupPercent}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({ ...prev, spreadMarkupPercent: e.target.value }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-2.5 font-mono-numbers text-white outline-none"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        پیش‌فرض: ۰.۰۲ درصد اسپرد بروکر
                      </span>
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1 font-medium">
                        سقف اهرم مجاز عمومی پلتفرم:
                      </label>
                      <select
                        value={settingsForm.maxLeverageGlobal}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            maxLeverageGlobal: Number(e.target.value),
                          }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-2.5 text-white outline-none"
                      >
                        <option value={20}>20x (محافظه‌کارانه)</option>
                        <option value={50}>50x</option>
                        <option value={100}>100x</option>
                        <option value={200}>200x</option>
                        <option value={500}>500x</option>
                        <option value={1000}>1000x</option>
                        <option value={2000}>2000x (حداکثر سقف مجاز جهانی)</option>
                      </select>
                      <span className="text-[10px] text-emerald-400 mt-0.5 block">
                        امکان تنظیم تا سقف ۲۰۰۰ برابری
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-slate-300 block mb-1 font-medium">
                        سقف تایید خودکار واریز کارت به کارت (تومان):
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={settingsForm.autoApproveDepositsUnder}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^\d]/g, '');
                            setSettingsForm((prev) => ({
                              ...prev,
                              autoApproveDepositsUnder: val,
                            }));
                          }}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-2.5 font-mono-numbers text-white outline-none"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                          تومان
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        معادل به حروف: {numberToWordsFa(Number(settingsForm.autoApproveDepositsUnder) || 0)} تومان
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Explicit Global Save Action Bar */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <Save className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-white block">
                        اعمال تغییرات در کل سیستم و پایگاه داده
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        پس از ذخیره، تمامی مبالغ، واریزها، برداشت‌ها و چارت‌های تومان بلافاصله همگام می‌شوند.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSettingsForm({
                          usdToTomanRate: String(brokerSettings.usdToTomanRate || 95000),
                          makerFeePercent: String(brokerSettings.makerFeePercent ?? 0.04),
                          takerFeePercent: String(brokerSettings.takerFeePercent ?? 0.06),
                          spreadMarkupPercent: String(brokerSettings.spreadMarkupPercent ?? 0.02),
                          maxLeverageGlobal: brokerSettings.maxLeverageGlobal || 2000,
                          autoApproveDepositsUnder: String(brokerSettings.autoApproveDepositsUnder || 20000000),
                        });
                        showToast('تغییرات به مقادیر کنونی بازنشانی شد.');
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all active:scale-95"
                    >
                      بازنشانی
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                    >
                      {settingsSavedBadge ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>ذخیره شد!</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 text-white" />
                          <span>ذخیره و اعمال سراسری نرخ و تنظیمات</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Emergency Controls */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block text-xs">
                    معاملات اهرمی (Margin Trading):
                  </span>
                  <span className="text-[11px] text-slate-400">
                    امکان فعال یا متوقف کردن فوری تمام معاملات اهرمی برای تمام تریدرها
                  </span>
                </div>
                <button
                  onClick={() => {
                    updateBrokerSettings({
                      allowMarginTrading: !brokerSettings.allowMarginTrading,
                    });
                    showToast('تنظیمات معاملات اهرمی بروز شد.');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${
                    brokerSettings.allowMarginTrading
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {brokerSettings.allowMarginTrading ? 'فعال است' : 'متوقف شده'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

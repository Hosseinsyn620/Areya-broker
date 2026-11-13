/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useBroker } from '../context/BrokerContext';
import {
  X,
  Users,
  Copy,
  Check,
  TrendingUp,
  Award,
  Wallet,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  ChevronRight,
} from 'lucide-react';

export const ReferralModal: React.FC = () => {
  const {
    isReferralModalOpen,
    setReferralModalOpen,
    referralProgram,
    claimReferralEarnings,
  } = useBroker();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);
  const [calcTraders, setCalcTraders] = useState<number>(10);
  const [calcVolumeMln, setCalcVolumeMln] = useState<number>(500); // 500 million Toman volume per trader

  if (!isReferralModalOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralProgram.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralProgram.link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleClaim = () => {
    const res = claimReferralEarnings();
    setClaimMessage(res.message);
    setTimeout(() => setClaimMessage(null), 3000);
  };

  // Estimated monthly passive earnings calculation:
  // Volume * broker fee (0.05%) * user commission (30%)
  const estimatedCommissionPerMonth = Math.round(
    calcTraders * (calcVolumeMln * 1000000) * 0.0005 * (referralProgram.commissionPercent / 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-2xl bg-[#0e131b] border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <span>زیرمجموعه‌گیری و درآمد دائمی (Affiliate Partner)</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  سطح شما: {referralProgram.tierName}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                دریافت سهم مادام‌العمر از کارمزد تمام معاملات تریدرهای دعوت‌شده بدون نیاز به سرمایه
              </p>
            </div>
          </div>
          <button
            onClick={() => setReferralModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs flex-1">
          {claimMessage && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{claimMessage}</span>
            </div>
          )}

          {/* Golden Value Proposition Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-[#1c1811] to-[#121620] border border-amber-500/30 shadow-lg space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>فرصت درآمد منفعل دائمی: تا ۵۰٪ کمیسیون مستقیم معاملات</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              با اشتراک‌گذاری لینک یا کد اختصاصی خود با دوستان و گروه‌های ترید، به صورت مادام‌العمر از هر خرید و فروش آنان (اسپات یا فیوچرز) سهم مستقیم دریافت خواهید کرد. درآمد شما به طور خودکار در لحظه تسویه می‌شود.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 block">تعداد افراد دعوت‌شده:</span>
              <span className="text-lg font-bold font-mono-numbers text-slate-100">
                {referralProgram.totalInvited.toLocaleString('fa-IR')} نفر
              </span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 block">معامله‌گران فعال:</span>
              <span className="text-lg font-bold font-mono-numbers text-emerald-400">
                {referralProgram.activeTradersCount.toLocaleString('fa-IR')} نفر
              </span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 block">مجموع سود کسب‌شده:</span>
              <span className="text-lg font-bold font-mono-numbers text-amber-400">
                {(referralProgram.totalEarnedIRT / 1000000).toFixed(1)} م. تومان
              </span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 block">درآمد آماده برداشت:</span>
              <span className="text-lg font-bold font-mono-numbers text-emerald-400">
                {referralProgram.withdrawableIRT.toLocaleString('fa-IR')} ت
              </span>
            </div>
          </div>

          {/* Claim Withdrawable Earnings Button */}
          {referralProgram.withdrawableIRT > 0 && (
            <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-200 block">
                  مبلغ {referralProgram.withdrawableIRT.toLocaleString('fa-IR')} تومان کمیسیون قابل انتقال است
                </span>
                <span className="text-[10px] text-emerald-400">
                  انتقال آنی به موجودی نقدی کیف پول اصلی جهت ترید یا برداشت شبا
                </span>
              </div>
              <button
                onClick={handleClaim}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shrink-0"
              >
                انتقال به کیف پول
              </button>
            </div>
          )}

          {/* Link and Code Copy Area */}
          <div className="space-y-3 p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">کد معرف اختصاصی شما:</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono-numbers text-amber-300 font-bold text-sm tracking-wider">
                  {referralProgram.code}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition-colors flex items-center gap-1.5 font-bold text-xs"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'کپی شد' : 'کپی کد'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">لینک دعوت مستقیم دوستان:</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono-numbers text-slate-300 text-xs truncate">
                  {referralProgram.link}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition-colors flex items-center gap-1.5 font-bold text-xs"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'کپی شد' : 'کپی لینک'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Earnings Calculator */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/90 space-y-3">
            <span className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>ماشین‌حساب تخمین درآمد ماهانه شما:</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[10px] mb-1">
                  تعداد معامله‌گر فعال: ({calcTraders} نفر)
                </label>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={calcTraders}
                  onChange={(e) => setCalcTraders(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] mb-1">
                  میانگین حجم ماهانه هر نفر: ({calcVolumeMln} میلیون تومان)
                </label>
                <input
                  type="range"
                  min={50}
                  max={2000}
                  step={50}
                  value={calcVolumeMln}
                  onChange={(e) => setCalcVolumeMln(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-lg flex items-center justify-between text-xs">
              <span className="text-slate-300">درآمد خالص تخمینی ماهانه شما:</span>
              <span className="font-bold font-mono-numbers text-emerald-400 text-sm">
                ~ {estimatedCommissionPerMonth.toLocaleString('fa-IR')} تومان در ماه
              </span>
            </div>
          </div>

          {/* Invitees Table */}
          <div>
            <h4 className="font-bold text-xs text-slate-300 mb-2">لیست زیرمجموعه‌های اخیر شما:</h4>
            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
              <table className="w-full text-right text-[11px]">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">کاربر</th>
                    <th className="p-2.5">تاریخ عضویت</th>
                    <th className="p-2.5 text-left">حجم ترید</th>
                    <th className="p-2.5 text-left">کمیسیون واریز شده</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
                  {referralProgram.invitees.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-900/40">
                      <td className="p-2.5 text-slate-200">{inv.maskedPhone}</td>
                      <td className="p-2.5 text-slate-400 font-sans">
                        {new Date(inv.joinedAt).toLocaleDateString('fa-IR')}
                      </td>
                      <td className="p-2.5 text-left text-slate-300">
                        {(inv.totalVolumeIRT / 1000000).toFixed(0)} م.ت
                      </td>
                      <td className="p-2.5 text-left text-emerald-400 font-bold">
                        +{inv.commissionEarnedIRT.toLocaleString('fa-IR')} تومان
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

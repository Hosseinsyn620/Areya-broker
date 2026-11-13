/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useBroker } from '../context/BrokerContext';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getAccessToken,
} from '../services/googleAuth';
import {
  sendGmail,
  listBrokerMessages,
  GmailMessageItem,
} from '../services/gmailService';
import { User } from 'firebase/auth';
import {
  X,
  Mail,
  Send,
  Sparkles,
  Megaphone,
  UserCheck,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Gift,
  TrendingUp,
  ShieldCheck,
  FileText,
} from 'lucide-react';

export const GmailCommunicationsModal: React.FC = () => {
  const { isGmailModalOpen, setGmailModalOpen, kycInfo } = useBroker();

  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'support' | 'campaign' | 'history'>('support');

  // Direct email state
  const [recipient, setRecipient] = useState<string>('pakzadhsyn620@gmail.com');
  const [subject, setSubject] = useState<string>('اطلاعیه مهم حساب کاربری در بروکر آریا تریدر');
  const [bodyText, setBodyText] = useState<string>(
    'کاربر گرامی،\nبا سلام و احترام،\nحساب کاربری شما در بروکر آریا تریدر فعال گردید. شما می‌توانید با استفاده از کارت بانکی یا آدرس تتر TRC20 حساب خود را شارژ نمایید.\n\nبا تشکر,\nتیم پشتیبانی آریا تریدر'
  );

  // Campaign state
  const [campaignType, setCampaignType] = useState<'bonus' | 'gold_analysis' | 'vip' | 'deposit_promo'>('bonus');
  const [campaignRecipient, setCampaignRecipient] = useState<string>('pakzadhsyn620@gmail.com');

  // Confirmation modal state (MANDATORY per workspace integration skill)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    to: string;
    subject: string;
    body: string;
    type: 'direct' | 'campaign';
  } | null>(null);

  // Sending status
  const [isSending, setIsSending] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Message history
  const [messages, setMessages] = useState<GmailMessageItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (u) => {
        setUser(u);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setNeedsAuth(false);
      }
    } catch (err: any) {
      setStatusMessage({
        text: err?.message || 'ورود با حساب گوگل با خطا مواجه شد.',
        type: 'error',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logoutGoogle();
    setUser(null);
    setNeedsAuth(true);
    setMessages([]);
  };

  const handleFetchHistory = async () => {
    if (needsAuth) return;
    setIsLoadingHistory(true);
    const msgs = await listBrokerMessages(8);
    setMessages(msgs);
    setIsLoadingHistory(false);
  };

  useEffect(() => {
    if (activeTab === 'history' && !needsAuth) {
      handleFetchHistory();
    }
  }, [activeTab, needsAuth]);

  if (!isGmailModalOpen) return null;

  // Campaign Templates
  const CAMPAIGN_TEMPLATES = {
    bonus: {
      subject: '🎁 هدیه ویژه آریا تریدر: تا ۵۰ میلیون تومان بونوس نقدی واریز اول',
      text: 'معامله‌گر گرامی،\nبه مناسبت افتتاح حساب در بروکر آریا تریدر، معادل ۱۰۰٪ مبلغ اولین واریز شما تا سقف ۵۰ میلیون تومان به عنوان بونوس نقدی واریز می‌گردد. همچنین برای واریزهای تتری ۵٪ پاداش نقدی افزوده خواهد شد.\n\nهمین حالا در ترمینال معامله کنید!',
    },
    gold_analysis: {
      subject: '📈 تحلیل استراتژیک انس جهانی طلا و نرخ لحظه‌ای طلای ۱۸ عیار',
      text: 'تحلیل اختصاصی بخش مارکتینگ آریا تریدر:\nبا توجه به حرکت صعودی انس جهانی طلا (XAU/USD) در محدوده ۴۰۶۰ دلار و تثبیت هر گرم طلای ۱۸ عیار در ۹,۰۹۵,۰۰۰ تومان، فرصت‌های معاملاتی اهرمی تا ۲۰۰۰ برابر برای شما فراهم است.\n\nمشاهده چارت زنده در بروکر.',
    },
    vip: {
      subject: '💎 دعوت به کلاب طلایی VIP بروکر آریا تریدر با ۵۰٪ تخفیف کمیسیون',
      text: 'کاربر ارجمند،\nشما به کلاب معامله‌گران برتر آریا تریدر دعوت شده‌اید. از این پس کارمزد معاملات شما با ۵۰٪ تخفیف محاسبه شده و تسویه‌های پایا و تتری به صورت اولویت آنی انجام می‌شود.',
    },
    deposit_promo: {
      subject: '⚡ شارژ فوری حساب با کارت اختصاصی و تتر TRC-20 بدون کارمزد',
      text: 'راهنمای سریع شارژ:\nکارت به کارت شتاب به نام حسین پاکزاد کرباسدهی (بانک صادرات) و همچنین واریز تتری به ولت TUVHe19wY3nzeuu6Tacf4tLUV3j2ve85vx به صورت لحظه‌ای با محاسبه نرخ زنده دلار در دسترس شماست.',
    },
  };

  const executeSend = async () => {
    if (!confirmDialog) return;
    setIsSending(true);
    setStatusMessage(null);

    try {
      await sendGmail({
        to: confirmDialog.to,
        subject: confirmDialog.subject,
        bodyText: confirmDialog.body,
        bodyHtml: `
          <div dir="rtl" style="font-family: Arial, Tahoma, sans-serif; background-color: #0b0e14; color: #f1f5f9; padding: 25px; border-radius: 12px; border: 1px solid #334155;">
            <div style="border-bottom: 2px solid #f59e0b; padding-bottom: 12px; margin-bottom: 18px;">
              <h2 style="color: #f59e0b; margin: 0;">بروکر آریا تریدر | سامانه جامع معاملات</h2>
              <span style="font-size: 11px; color: #94a3b8;">اطلاعیه رسمی و مکاتبات مشتریان</span>
            </div>
            <div style="font-size: 14px; line-height: 1.8; color: #e2e8f0; white-space: pre-wrap;">
              ${confirmDialog.body}
            </div>
            <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b;">
              این ایمیل از طریق سامانه رسمی Gmail بروکر ارسال شده است. پشتیبانی: pakzadhsyn620@gmail.com
            </div>
          </div>
        `,
      });

      setStatusMessage({
        text: `ایمیل با موفقیت به آدرس ${confirmDialog.to} ارسال شد!`,
        type: 'success',
      });
      setConfirmDialog(null);
    } catch (err: any) {
      setStatusMessage({
        text: err?.message || 'خطا در ارسال ایمیل. لطفاً اتصال اینترنت را بررسی کنید.',
        type: 'error',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#111724] to-[#090d15] border border-slate-750 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <span>مرکز ارتباط با کاربر و ایمیل مارکتینگ جیمیل (Gmail)</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  Gmail API v1
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                ارتباط مستقیم، پاسخ به تیکت‌ها و ارسال تبلیغات و کمپین‌های بازاریابی
              </p>
            </div>
          </div>
          <button
            onClick={() => setGmailModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Auth Status Header */}
        <div className="px-6 py-3 bg-[#0d131f] border-b border-slate-800/80 flex items-center justify-between">
          {user ? (
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'کاربر'}
                  className="w-8 h-8 rounded-full border border-emerald-500/40"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <span className="font-bold text-xs text-slate-100 block">
                  {user.displayName || 'حساب کاربری متصل'}
                </span>
                <span className="text-[11px] text-emerald-400 font-mono-numbers">{user.email}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>برای ارسال پیام و ایمیل‌های تبلیغاتی با حساب جیمیل متصل شوید:</span>
            </div>
          )}

          {user ? (
            <button
              onClick={handleGoogleLogout}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج از جیمیل</span>
            </button>
          ) : (
            /* OFFICIAL SIGN IN WITH GOOGLE BUTTON (per Workspace Skill Guidelines) */
            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>{isLoggingIn ? 'در حال اتصال...' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-2.5 border-b border-slate-800 flex items-center gap-2 bg-[#090d15] text-xs font-bold">
          <button
            onClick={() => setActiveTab('support')}
            className={`pb-2.5 px-3 rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'support'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>ارتباط با کاربر / پشتیبانی</span>
          </button>
          <button
            onClick={() => setActiveTab('campaign')}
            className={`pb-2.5 px-3 rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'campaign'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>کمپین‌های تبلیغاتی و بونوس</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'history'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>تاریخچه پیام‌های جیمیل</span>
          </button>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div
            className={`mx-6 mt-3 p-3 rounded-2xl text-xs font-bold flex items-center justify-between ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/80 border border-rose-500/50 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {needsAuth ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Mail className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-base text-slate-100">
                اتصال امن به Gmail جهت ارسال ایمیل و تبلیغات
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                با اتصال به حساب جیمیل با مجوز کاربر، می‌توانید مستقیماً به معامله‌گران ایمیل ارسال کرده و پیام‌های تبلیغاتی و اطلاعیه‌های شارژ را مخابره نمایید.
              </p>
              <button
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="mx-auto flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-lg transition-all active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>{isLoggingIn ? 'در حال تایید ورود گوگل...' : 'ورود با حساب گوگل (Sign in with Google)'}</span>
              </button>
            </div>
          ) : activeTab === 'support' ? (
            /* TAB 1: SUPPORT / DIRECT EMAIL */
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">ایمیل گیرنده (کاربر / پشتیبانی):</label>
                <input
                  type="email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-[#080b10] border border-slate-800 focus:border-amber-500 rounded-2xl py-2 px-3 text-slate-100 font-mono-numbers text-xs text-left focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">موضوع پیام (Subject):</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="موضوع ایمیل"
                  className="w-full bg-[#080b10] border border-slate-800 focus:border-amber-500 rounded-2xl py-2 px-3 text-slate-100 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">متن پیام:</label>
                <textarea
                  rows={5}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  className="w-full bg-[#080b10] border border-slate-800 focus:border-amber-500 rounded-2xl py-2.5 px-3 text-slate-100 text-xs leading-relaxed focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  setConfirmDialog({
                    isOpen: true,
                    to: recipient,
                    subject,
                    body: bodyText,
                    type: 'direct',
                  })
                }
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <Send className="w-4 h-4" />
                <span>بررسی و تایید ارسال ایمیل با Gmail</span>
              </button>
            </div>
          ) : activeTab === 'campaign' ? (
            /* TAB 2: PROMOTIONAL MARKETING CAMPAIGNS */
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-slate-300 font-bold block">انتخاب قالب کمپین تبلیغاتی:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div
                    onClick={() => setCampaignType('bonus')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      campaignType === 'bonus'
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-800 bg-[#0d121c] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-amber-400 mb-1">
                      <Gift className="w-4 h-4" />
                      <span>بونوس ۵۰ میلیون تومانی</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      پاداش ۱۰۰٪ واریز اول شتابی و ۵٪ کش‌بک شارژ تتری
                    </p>
                  </div>

                  <div
                    onClick={() => setCampaignType('gold_analysis')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      campaignType === 'gold_analysis'
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-800 bg-[#0d121c] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-emerald-400 mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>تحلیل طلا و بیت‌کوین</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      سیگنال فرصت‌های خرید انس طلا و طلای ۱۸ عیار
                    </p>
                  </div>

                  <div
                    onClick={() => setCampaignType('deposit_promo')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      campaignType === 'deposit_promo'
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-800 bg-[#0d121c] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sky-400 mb-1">
                      <Sparkles className="w-4 h-4" />
                      <span>راهنمای شارژ کارت و تتر</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      اطلاعیه شماره کارت رسمی و آدرس ولت TRC-20
                    </p>
                  </div>

                  <div
                    onClick={() => setCampaignType('vip')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      campaignType === 'vip'
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-800 bg-[#0d121c] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-purple-400 mb-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span>دعوت‌نامه کلاب VIP</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      تخفیف ۵۰٪ کارمزد معاملات و لورج تا ۲۰۰۰x
                    </p>
                  </div>
                </div>
              </div>

              {/* Target recipient */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">ارسال تبلیغات به ایمیل:</label>
                <input
                  type="email"
                  value={campaignRecipient}
                  onChange={(e) => setCampaignRecipient(e.target.value)}
                  placeholder="کاربر یا لیست ایمیل"
                  className="w-full bg-[#080b10] border border-slate-800 focus:border-amber-500 rounded-2xl py-2 px-3 text-slate-100 font-mono-numbers text-xs text-left focus:outline-none"
                />
              </div>

              {/* Live Preview Box */}
              <div className="p-4 rounded-2xl bg-[#090d15] border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 block font-bold">پیش‌نمایش محتوای کمپین:</span>
                <h5 className="font-bold text-slate-100 text-xs">{CAMPAIGN_TEMPLATES[campaignType].subject}</h5>
                <p className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {CAMPAIGN_TEMPLATES[campaignType].text}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setConfirmDialog({
                    isOpen: true,
                    to: campaignRecipient,
                    subject: CAMPAIGN_TEMPLATES[campaignType].subject,
                    body: CAMPAIGN_TEMPLATES[campaignType].text,
                    type: 'campaign',
                  })
                }
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <Megaphone className="w-4 h-4" />
                <span>ارسال این کمپین تبلیغاتی با جیمیل</span>
              </button>
            </div>
          ) : (
            /* TAB 3: GMAIL MESSAGE HISTORY */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold">پیام‌های ارسال‌شده و دریافتی اخیر از طریق جیمیل:</span>
                <button
                  onClick={handleFetchHistory}
                  disabled={isLoadingHistory}
                  className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                  <span>بازآوری پیام‌ها</span>
                </button>
              </div>

              {isLoadingHistory ? (
                <div className="py-8 text-center text-slate-400">در حال دریافت فید پیام‌های جیمیل...</div>
              ) : messages.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800/80">
                  <Mail className="w-8 h-8 mx-auto text-slate-500 mb-2 opacity-50" />
                  <p>هیچ پیامی در سوابق اخیر جیمیل یافت نشد.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-2xl bg-[#0d121c] border border-slate-800 hover:border-slate-700 space-y-1 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-200">{m.subject}</span>
                        <span className="text-[10px] text-slate-500 font-mono-numbers">{m.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{m.snippet}</p>
                      {m.from && (
                        <div className="text-[10px] text-slate-500 font-mono-numbers">از: {m.from}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MANDATORY USER CONFIRMATION MODAL FOR SENDING EMAILS */}
        {confirmDialog && confirmDialog.isOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md bg-[#0f1422] border border-amber-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center gap-2.5 text-amber-400">
                <AlertCircle className="w-5 h-5" />
                <h4 className="font-bold text-sm text-slate-100">تایید نهایی ارسال ایمیل از طریق جیمیل</h4>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                آیا از ارسال این پیام از حساب <strong className="text-white font-mono-numbers">{user?.email}</strong> به مقصد <strong className="text-amber-300 font-mono-numbers">{confirmDialog.to}</strong> اطمینان دارید؟
              </p>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-[11px]">
                <div className="text-slate-400">
                  موضوع: <span className="text-slate-200 font-bold">{confirmDialog.subject}</span>
                </div>
                <div className="text-slate-400 truncate">
                  متن: <span className="text-slate-300">{confirmDialog.body.substring(0, 80)}...</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={executeSend}
                  disabled={isSending}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {isSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{isSending ? 'در حال ارسال به سرور Gmail...' : 'بله، ارسال شود'}</span>
                </button>
                <button
                  onClick={() => setConfirmDialog(null)}
                  disabled={isSending}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

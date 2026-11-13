/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useBroker } from '../context/BrokerContext';
import { liveDataProvider, ProviderSource } from '../services/liveDataProvider';
import {
  X,
  Settings,
  Radio,
  Sliders,
  Palette,
  Check,
  Zap,
  Volume2,
  VolumeX,
  Activity,
  Layers,
  Globe2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsModalOpen,
    setSettingsModalOpen,
    brokerSettings,
    updateBrokerSettings,
    soundEnabled,
    toggleSound,
    refreshHistoricalData,
    chartSuspenseLevel,
    setChartSuspenseLevel,
  } = useBroker();

  const [activeTab, setActiveTab] = useState<'provider' | 'trading' | 'appearance' | 'format'>('provider');
  const [pingTesting, setPingTesting] = useState(false);
  const [pingResult, setPingResult] = useState<number | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isSettingsModalOpen) return null;

  const handleProviderChange = async (source: ProviderSource) => {
    updateBrokerSettings({ activeDataProvider: source });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
    // Refresh candles with new provider
    await refreshHistoricalData();
  };

  const handleTestPing = async () => {
    setPingTesting(true);
    const ms = await liveDataProvider.testPing();
    setPingResult(ms);
    setPingTesting(false);
  };

  const PROVIDERS: {
    id: ProviderSource;
    name: string;
    description: string;
    region: string;
    badge: string;
    accuracy: string;
  }[] = [
    {
      id: 'kraken_spot',
      name: 'Kraken Institutional Network (پیش‌فرض پیشنهادی)',
      description: 'داده‌های زنده مطابق با متاتریدر و بروکرهای رسمی وال‌استریت (طلا، بیت‌کوین، اتریوم)',
      region: 'Frankfurt / London / Tokyo CDN',
      badge: 'دقت ۱۰۰٪ استاندارد',
      accuracy: 'مطابقت کامل با بازار جهانی',
    },
    {
      id: 'coingecko',
      name: 'CoinGecko Global Aggregator',
      description: 'میانگین وزنی بیش از ۸۰۰ صرافی و بازار بین‌المللی بدون هیچ‌گونه انحراف نرخ',
      region: 'Cloudflare Anycast (سرتاسر جهان)',
      badge: 'تجمیع جهانی',
      accuracy: 'میانگین جهانی بازار',
    },
    {
      id: 'coinbase',
      name: 'Coinbase Global Financial Feed',
      description: 'سرورهای اصلی صرافی کوین‌بیس آمریکا با کمترین لتنسی معاملاتی',
      region: 'US-East / Frankfurt',
      badge: 'پرسرعت نهادی',
      accuracy: 'نرخ لحظه‌ای نقدی',
    },
    {
      id: 'bitget_live',
      name: 'Bitget & MEXC Direct Stream',
      description: 'فید مستقیم دفتر سفارشات و جریان معاملات بدون تحریم و بدون افت سرعت',
      region: 'Tokyo / Singapore',
      badge: 'جریان مستقیم اسپات',
      accuracy: 'نقدینگی بالا',
    },
    {
      id: 'redundant_engine',
      name: 'Multi-Source Redundant Engine (موتور توزیع‌شده بین‌المللی)',
      description: 'سوئیچ خودکار هوشمند بین سرورها در صورت قطعی یا کندی اینترنت',
      region: 'Multi-Cluster Distributed',
      badge: 'پایدار و بی‌وقفه',
      accuracy: 'بیشترین قابلیت اطمینان',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md select-none">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#111723] to-[#0a0e16] border border-slate-750/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-slate-900/60 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/25 shadow-sm">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <span>تنظیمات پیشرفته ترمینال معاملاتی</span>
                {savedSuccess && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>تغییرات ذخیره شد</span>
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تغییر ارائه‌دهنده نرخ‌ها، شخصی‌سازی ترید، ظاهر چارت و واحد پولی
              </p>
            </div>
          </div>
          <button
            onClick={() => setSettingsModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab('provider')}
            className={`pb-3 px-3 transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'provider'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            <span>ارائه‌دهنده قیمت‌ها</span>
          </button>

          <button
            onClick={() => setActiveTab('trading')}
            className={`pb-3 px-3 transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'trading'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>ترجیحات ترید و اهرم</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`pb-3 px-3 transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'appearance'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>استایل چارت و رنگ‌ها</span>
          </button>

          <button
            onClick={() => setActiveTab('format')}
            className={`pb-3 px-3 transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'format'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>واحد پولی و اعداد</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* TAB 1: DATA PROVIDER SELECTION */}
          {activeTab === 'provider' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-200 block">
                    تست زنده تاخیر شبکه به ارائه‌دهنده فعال:
                  </span>
                  <span className="text-[11px] text-slate-400">
                    اتصال مستقیم بدون فیلتر و بدون نیاز به پروکسی خارجی
                  </span>
                </div>
                <button
                  onClick={handleTestPing}
                  disabled={pingTesting}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Activity className={`w-3.5 h-3.5 ${pingTesting ? 'animate-spin' : ''}`} />
                  <span>
                    {pingTesting ? 'در حال پینگ...' : pingResult !== null ? `${pingResult} میلی‌ثانیه` : 'تست پینگ'}
                  </span>
                </button>
              </div>

              <div className="space-y-2.5">
                <span className="font-bold text-xs text-slate-300 block">
                  انتخاب ارائه‌دهنده قیمت‌های زنده بازار:
                </span>

                {PROVIDERS.map((prov) => {
                  const isSelected = brokerSettings.activeDataProvider === prov.id;
                  return (
                    <div
                      key={prov.id}
                      onClick={() => handleProviderChange(prov.id)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all text-right ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                          : 'bg-[#0d121c] border-slate-800/90 hover:border-slate-700/80 hover:bg-[#111723]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-amber-400 bg-amber-400' : 'border-slate-600'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                          </div>
                          <span className={`font-bold text-xs ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>
                            {prov.name}
                          </span>
                        </div>

                        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800/80 text-emerald-400 font-mono-numbers">
                          {prov.badge}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 mr-6 mb-2 leading-relaxed">
                        {prov.description}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 mr-6 pt-1 border-t border-slate-800/60">
                        <span>سرورها: {prov.region}</span>
                        <span className="text-amber-400/90 font-medium">{prov.accuracy}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: TRADING & RISK PREFERENCES */}
          {activeTab === 'trading' && (
            <div className="space-y-4">
              {/* Account Leverage Configuration (Up to 2000x) */}
              <div className="p-4 rounded-2xl bg-[#0d121c] border border-slate-800/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200 text-xs">تنظیم ضریب اهرم حساب (Account Leverage):</span>
                    {(brokerSettings.defaultLeverage || 20) >= 1000 ? (
                      <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                        Ultra High (حداکثر ۲۰۰۰x)
                      </span>
                    ) : (brokerSettings.defaultLeverage || 20) >= 200 ? (
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                        اهرم بالا
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                        استاندارد
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-mono-numbers font-black text-amber-400 text-base">
                      {brokerSettings.defaultLeverage || 20}x
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  با تنظیم اهرم حساب، این ضریب به عنوان اهرم پیش‌فرض در تمام معاملات، فرم سفارشات و دکمه‌های خرید/فروش سریع زیر چارت اعمال می‌شود (حداکثر تا ۲۰۰۰ برابر سرمایه).
                </p>

                {/* Range Slider (1 to 2000) */}
                <div className="pt-1 px-1">
                  <input
                    type="range"
                    min="1"
                    max="2000"
                    step="1"
                    value={brokerSettings.defaultLeverage || 20}
                    onChange={(e) =>
                      updateBrokerSettings({ defaultLeverage: Number(e.target.value), maxLeverageGlobal: 2000 })
                    }
                    className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono-numbers mt-1">
                    <span>1x</span>
                    <span>100x</span>
                    <span>500x</span>
                    <span>1000x</span>
                    <span className="text-amber-400 font-bold">2000x</span>
                  </div>
                </div>

                {/* Quick Presets Grid */}
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 pt-1">
                  {[1, 5, 10, 25, 50, 100, 200, 500, 1000, 2000].map((lev) => (
                    <button
                      key={lev}
                      onClick={() =>
                        updateBrokerSettings({ defaultLeverage: lev, maxLeverageGlobal: 2000 })
                      }
                      className={`py-1.5 rounded-xl text-[11px] font-mono-numbers font-bold transition-all ${
                        (brokerSettings.defaultLeverage || 20) === lev
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 ring-1 ring-amber-400'
                          : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750/70'
                      }`}
                    >
                      {lev}x
                    </button>
                  ))}
                </div>

                {/* Direct Custom Leverage Input */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/70 text-xs">
                  <span className="text-slate-400 text-[11px]">یا ورود عدد دلخواه اهرم (۱ تا ۲۰۰۰):</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      max="2000"
                      value={brokerSettings.defaultLeverage || 20}
                      onChange={(e) => {
                        const val = Math.min(2000, Math.max(1, Number(e.target.value) || 1));
                        updateBrokerSettings({ defaultLeverage: val, maxLeverageGlobal: 2000 });
                      }}
                      className="w-20 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-2 py-1 text-center font-mono-numbers font-bold text-amber-400 text-xs focus:outline-none"
                    />
                    <span className="text-slate-500 font-bold text-xs">x</span>
                  </div>
                </div>
              </div>

              {/* One-Click Trading Toggle */}
              <div className="p-4 rounded-2xl bg-[#0d121c] border border-slate-800/90 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 text-xs block">
                    معاملات فوق‌سریع تک‌کلیک (One-Click Execution):
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ثبت فوری سفارشات مارکت بدون نمایش پنجره تایید مجدد
                  </span>
                </div>
                <button
                  onClick={() =>
                    updateBrokerSettings({ oneClickTrading: !brokerSettings.oneClickTrading })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    brokerSettings.oneClickTrading ? 'bg-emerald-600' : 'bg-slate-750'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      brokerSettings.oneClickTrading ? '-translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Sound Effects Toggle */}
              <div className="p-4 rounded-2xl bg-[#0d121c] border border-slate-800/90 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 text-xs block">
                    افکت‌های صوتی ترید و اعلان‌ها:
                  </span>
                  <span className="text-[11px] text-slate-400">
                    پخش صدای ملایم هنگام خرید، فروش، پر شدن سفارشات و کسب سود
                  </span>
                </div>
                <button
                  onClick={toggleSound}
                  className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 font-bold ${
                    soundEnabled
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-850 border-slate-750 text-slate-500'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span>{soundEnabled ? 'فعال' : 'خاموش'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CHART & APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              {/* Candle Colors */}
              <div className="p-4 rounded-2xl bg-[#0d121c] border border-slate-800/90 space-y-2.5">
                <span className="font-bold text-slate-200 text-xs block">پالت رنگی کندل‌های چارت:</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updateBrokerSettings({ candleColorTheme: 'classic' })}
                    className={`p-3 rounded-2xl border text-right transition-all flex items-center justify-between ${
                      (brokerSettings.candleColorTheme || 'classic') === 'classic'
                        ? 'border-emerald-500/50 bg-emerald-500/10'
                        : 'border-slate-800 bg-slate-900/60'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-200 block">کلاسیک مالی</span>
                      <span className="text-[10px] text-slate-400">سبز زمردی / قرمز مرجانی</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-500" />
                      <div className="w-4 h-4 rounded-full bg-rose-500" />
                    </div>
                  </button>

                  <button
                    onClick={() => updateBrokerSettings({ candleColorTheme: 'neon' })}
                    className={`p-3 rounded-2xl border text-right transition-all flex items-center justify-between ${
                      brokerSettings.candleColorTheme === 'neon'
                        ? 'border-cyan-500/50 bg-cyan-500/10'
                        : 'border-slate-800 bg-slate-900/60'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-200 block">سایبرپانک نئون</span>
                      <span className="text-[10px] text-slate-400">فیروزه‌ای / ارغوانی</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-cyan-400" />
                      <div className="w-4 h-4 rounded-full bg-fuchsia-500" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Chart Indicator Toggles */}
              <div className="p-4 rounded-2xl bg-[#0d121c] border border-slate-800/90 space-y-3">
                <span className="font-bold text-slate-200 text-xs block">اندیکاتورها و خطوط راهنما:</span>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-xs">میانگین متحرک MA(7) و MA(25)</span>
                  <input
                    type="checkbox"
                    checked={brokerSettings.showMaLines ?? true}
                    onChange={(e) => updateBrokerSettings({ showMaLines: e.target.checked })}
                    className="w-4 h-4 rounded accent-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-xs">نمودار ستونی حجم معاملات (Volume)</span>
                  <input
                    type="checkbox"
                    checked={brokerSettings.showVolume ?? true}
                    onChange={(e) => updateBrokerSettings({ showVolume: e.target.checked })}
                    className="w-4 h-4 rounded accent-amber-500"
                  />
                </div>
              </div>

              {/* Dynamic Chart Action & Suspense Volatility Level */}
              <div className="p-4 rounded-2xl bg-[#0d121c] border border-amber-500/30 space-y-3">
                <div>
                  <span className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span>نبض و پویایی حرکتی چارت (ایجاد هیجان و حس شک بازار):</span>
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    تعیین شدت نوسانات ثانیه‌ای و ایجاد کشمکش زنده میان خریداران و فروشندگان برای شبیه‌سازی کامل رفتار هیجانی تریدرها
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <button
                    onClick={() => setChartSuspenseLevel('hyper')}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      chartSuspenseLevel === 'hyper'
                        ? 'border-rose-500 bg-rose-500/20 text-rose-300 font-bold shadow-md shadow-rose-500/20'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="block text-xs font-black">طوفانی (Hyper)</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">۲۲۰ms | نوسان حداکثری</span>
                  </button>

                  <button
                    onClick={() => setChartSuspenseLevel('high')}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      chartSuspenseLevel === 'high'
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold shadow-md shadow-amber-500/20'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="block text-xs font-black">پرتحرک (Live)</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">۳۴۰ms | پیش‌فرض هیجانی</span>
                  </button>

                  <button
                    onClick={() => setChartSuspenseLevel('medium')}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      chartSuspenseLevel === 'medium'
                        ? 'border-blue-500 bg-blue-500/20 text-blue-300 font-bold shadow-md shadow-blue-500/20'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="block text-xs font-black">آرام (Standard)</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">۵۸۰ms | نوسان ملایم</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FORMATTING */}
          {activeTab === 'format' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0d121c] border border-slate-800/90 space-y-2.5">
                <span className="font-bold text-slate-200 text-xs block">واحد پول داخلی جهت نمایش:</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updateBrokerSettings({ currencyDisplay: 'IRT' })}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      (brokerSettings.currencyDisplay || 'IRT') === 'IRT'
                        ? 'border-amber-400 bg-amber-500/15 text-amber-300 font-bold'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    تومان (IRT) - استاندارد
                  </button>
                  <button
                    onClick={() => updateBrokerSettings({ currencyDisplay: 'IRR' })}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      brokerSettings.currencyDisplay === 'IRR'
                        ? 'border-amber-400 bg-amber-500/15 text-amber-300 font-bold'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    ریال بانکی (IRR)
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0d121c] border border-slate-800/90 space-y-2.5">
                <span className="font-bold text-slate-200 text-xs block">فرمت نمایش ارقام و قیمت‌ها:</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updateBrokerSettings({ numberFormat: 'fa' })}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      (brokerSettings.numberFormat || 'fa') === 'fa'
                        ? 'border-amber-400 bg-amber-500/15 text-amber-300 font-bold'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    فارسی (مثال: ۷۴,۱۴۶)
                  </button>
                  <button
                    onClick={() => updateBrokerSettings({ numberFormat: 'en' })}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      brokerSettings.numberFormat === 'en'
                        ? 'border-amber-400 bg-amber-500/15 text-amber-300 font-bold'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    انگلیسی (مثال: 74,146)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-[#090d14] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>تنظیمات به صورت خودکار در مرورگر ذخیره و اعمال می‌گردند.</span>
          </div>

          <button
            onClick={() => setSettingsModalOpen(false)}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20 transition-all"
          >
            تایید و بستن
          </button>
        </div>
      </div>
    </div>
  );
};

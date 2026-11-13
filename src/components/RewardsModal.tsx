/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useBroker } from '../context/BrokerContext';
import {
  X,
  Gift,
  Sparkles,
  Trophy,
  Check,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
  RotateCw,
} from 'lucide-react';

interface SpinPrize {
  id: number;
  label: string;
  amount: number;
  currency: 'IRT' | 'USDT' | 'GOLD_GRAM';
  color: string;
}

const SPIN_PRIZES: SpinPrize[] = [
  { id: 1, label: '۵ تتر', amount: 5, currency: 'USDT', color: '#10b981' },
  { id: 2, label: '۵۰۰,۰۰۰ ت', amount: 500000, currency: 'IRT', color: '#3b82f6' },
  { id: 3, label: '۱۰ تتر', amount: 10, currency: 'USDT', color: '#f59e0b' },
  { id: 4, label: '۰.۱ گرم طلا', amount: 0.1, currency: 'GOLD_GRAM', color: '#eab308' },
  { id: 5, label: '۱,۰۰۰,۰۰۰ ت', amount: 1000000, currency: 'IRT', color: '#6366f1' },
  { id: 6, label: '۲۵ تتر', amount: 25, currency: 'USDT', color: '#ec4899' },
  { id: 7, label: '۲,۰۰۰,۰۰۰ ت', amount: 2000000, currency: 'IRT', color: '#06b6d4' },
  { id: 8, label: '۵۰ تتر طلایی', amount: 50, currency: 'USDT', color: '#f97316' },
];

export const RewardsModal: React.FC = () => {
  const {
    isRewardsModalOpen,
    setRewardsModalOpen,
    bonuses,
    claimBonus,
    executeInstantSwap,
  } = useBroker();

  const [activeTab, setActiveTab] = useState<'bonuses' | 'wheel'>('bonuses');
  const [claimNotice, setClaimNotice] = useState<string | null>(null);

  // Wheel state
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<SpinPrize | null>(null);
  const [hasSpunToday, setHasSpunToday] = useState(false);

  if (!isRewardsModalOpen) return null;

  const handleClaimBonus = (bonusId: string) => {
    const res = claimBonus(bonusId);
    setClaimNotice(res.message);
    setTimeout(() => setClaimNotice(null), 3000);
  };

  const spinWheel = () => {
    if (isSpinning || hasSpunToday) return;

    setIsSpinning(true);
    setWonPrize(null);

    // Pick random prize index (0 to 7)
    const prizeIndex = Math.floor(Math.random() * SPIN_PRIZES.length);
    const selectedPrize = SPIN_PRIZES[prizeIndex];

    // Each slice is 360 / 8 = 45 degrees
    const sliceAngle = 45;
    const targetSliceCenter = prizeIndex * sliceAngle + sliceAngle / 2;
    // Extra 5 full rotations (1800 deg) + offset
    const totalRotation = wheelRotation + 1800 + (360 - targetSliceCenter);

    setWheelRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(selectedPrize);
      setHasSpunToday(true);

      // Auto claim bonus into user balances
      claimBonus('bon_spin');
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-2xl bg-[#0e131b] border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <span>مرکز جوایز و بونوس‌های معاملاتی (Rewards Hub)</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                  ویژه تریدرهای آریا
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                اعتبار هدیه افتتاح حساب، جوایز اولین شارژ و گردونه شانس روزانه
              </p>
            </div>
          </div>
          <button
            onClick={() => setRewardsModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-5 pt-3 border-b border-slate-800 flex items-center gap-3">
          <button
            onClick={() => setActiveTab('bonuses')}
            className={`pb-2.5 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'bonuses'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>بونوس‌های فعال</span>
          </button>
          <button
            onClick={() => setActiveTab('wheel')}
            className={`pb-2.5 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'wheel'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>گردونه شانس روزانه (Lucky Wheel)</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs flex-1">
          {claimNotice && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{claimNotice}</span>
            </div>
          )}

          {activeTab === 'bonuses' ? (
            <div className="space-y-3">
              {bonuses.map((bonus) => {
                const isClaimed = bonus.status === 'claimed';
                return (
                  <div
                    key={bonus.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isClaimed
                        ? 'bg-slate-900/40 border-slate-800/60 opacity-70'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">{bonus.title}</span>
                        <span className="px-2 py-0.5 rounded font-bold font-mono-numbers text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {bonus.rewardText}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs">{bonus.description}</p>
                    </div>

                    <div className="shrink-0 w-full sm:w-auto">
                      {isClaimed ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs py-1.5 px-3 rounded-lg bg-emerald-950/50 border border-emerald-800/60">
                          <Check className="w-4 h-4" />
                          <span>دریافت شد</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleClaimBonus(bonus.id)}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5"
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>دریافت بونوس</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Lucky Spin Wheel */
            <div className="py-2 flex flex-col items-center space-y-4">
              <div className="text-center space-y-1">
                <h4 className="font-bold text-sm text-slate-100">گردونه شانس روزانه تریدرها</h4>
                <p className="text-slate-400 text-xs">
                  هر ۲۴ ساعت یک بار بچرخانید و جوایز نقدی بدون قید و شرط دریافت کنید!
                </p>
              </div>

              {/* Wheel Container */}
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Fixed Top Indicator Pointer */}
                <div className="absolute top-0 z-20 -mt-2">
                  <div className="w-4 h-6 bg-amber-400 rounded-b-md shadow-lg border-2 border-slate-900 mx-auto" />
                </div>

                {/* Rotating SVG Wheel */}
                <div
                  className="w-full h-full rounded-full border-4 border-amber-500/50 shadow-2xl overflow-hidden transition-transform ease-out"
                  style={{
                    transform: `rotate(${wheelRotation}deg)`,
                    transitionDuration: isSpinning ? '4000ms' : '0ms',
                  }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {SPIN_PRIZES.map((prize, idx) => {
                      const angle = 45;
                      const startAngle = idx * angle;
                      const endAngle = (idx + 1) * angle;

                      // Convert polar to cartesian
                      const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                      const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                      const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                      const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                      const textAngle = startAngle + angle / 2;
                      const tx = 50 + 32 * Math.cos((Math.PI * textAngle) / 180);
                      const ty = 50 + 32 * Math.sin((Math.PI * textAngle) / 180);

                      return (
                        <g key={prize.id}>
                          <path
                            d={`M50,50 L${x1},${y1} A50,50 0 0,1 ${x2},${y2} Z`}
                            fill={prize.color}
                            stroke="#0e131b"
                            strokeWidth="0.8"
                          />
                          <text
                            x={tx}
                            y={ty}
                            fill="#ffffff"
                            fontSize="4.2"
                            fontWeight="bold"
                            textAnchor="middle"
                            dominantBaseline="central"
                            transform={`rotate(${textAngle + 90}, ${tx}, ${ty})`}
                          >
                            {prize.label}
                          </text>
                        </g>
                      );
                    })}
                    {/* Inner Hub */}
                    <circle cx="50" cy="50" r="12" fill="#0e131b" stroke="#f59e0b" strokeWidth="2" />
                  </svg>
                </div>

                {/* Center Spin Button Icon */}
                <div className="absolute z-10 w-12 h-12 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center text-amber-300 font-bold text-xs pointer-events-none">
                  آریا
                </div>
              </div>

              {/* Prize announcement */}
              {wonPrize && (
                <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl text-center space-y-1 w-full">
                  <span className="font-bold text-sm text-amber-300 flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>تبریک! شما برنده جایزه {wonPrize.label} شدید!</span>
                  </span>
                  <p className="text-[11px] text-slate-300">
                    مبلغ هدیه بلافاصله به کیف پول اصلی شما افزوده شد و قابل استفاده در معاملات است.
                  </p>
                </div>
              )}

              {/* Spin Action Button */}
              <button
                onClick={spinWheel}
                disabled={isSpinning || hasSpunToday}
                className="px-8 py-3 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
              >
                <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>{hasSpunToday ? 'شانس امروز استفاده شده است' : isSpinning ? 'در حال چرخش...' : 'چرخش گردونه شانس'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

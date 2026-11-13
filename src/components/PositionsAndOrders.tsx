/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useBroker } from '../context/BrokerContext';
import { formatCurrency } from '../utils/iranianBanks';
import { X, CheckCircle2, Clock, ShieldAlert, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const PositionsAndOrders: React.FC = () => {
  const { positions, orders, tradeHistory, transactions, closePosition, cancelOrder } = useBroker();
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'history' | 'transactions'>('positions');

  return (
    <div className="bg-[#090d15] border-t border-slate-850 flex flex-col h-full min-h-[220px] select-none text-xs">
      {/* Tabs Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-850 bg-[#0d121c]">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('positions')}
            className={`py-1.5 px-3 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'positions'
                ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>موقعیت‌های باز</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono-numbers font-bold ${
              activeTab === 'positions' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
            }`}>
              {positions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-1.5 px-3 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>سفارش‌های فعال</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono-numbers font-bold ${
              activeTab === 'orders' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
            }`}>
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-1.5 px-3 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>تاریخچه معاملات</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-1.5 px-3 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'transactions'
                ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>تراکنش‌های واریز و برداشت</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-x-auto overflow-y-auto p-2">
        {/* TAB 1: Positions */}
        {activeTab === 'positions' && (
          <div className="min-w-[840px]">
            {positions.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                هیچ پوزیشن بازی وجود ندارد. می‌توانید از بخش ثبت سفارش یک پوزیشن جدید باز کنید.
              </div>
            ) : (
              <table className="w-full text-right border-collapse text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] pb-1 bg-[#0b0f19]">
                    <th className="py-2 px-3 font-semibold">نماد</th>
                    <th className="py-2 px-2.5 font-semibold">جهت / اهرم</th>
                    <th className="py-2 px-2.5 font-semibold">حجم معامله</th>
                    <th className="py-2 px-2.5 font-semibold">قیمت ورود</th>
                    <th className="py-2 px-2.5 font-semibold">قیمت لحظه‌ای</th>
                    <th className="py-2 px-2.5 font-semibold">قیمت لیکوئید</th>
                    <th className="py-2 px-2.5 font-semibold">مارجین (ارزش اولیه)</th>
                    <th className="py-2 px-2.5 font-semibold">سود / زیان شناور (ROE %)</th>
                    <th className="py-2 px-3 text-center font-semibold">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/80">
                  {positions.map((pos) => {
                    const isProfit = pos.unrealizedPnl >= 0;
                    return (
                      <tr
                        key={pos.id}
                        className="hover:bg-slate-900/60 transition-colors whitespace-nowrap h-11"
                      >
                        <td className="py-2 px-3 font-bold text-slate-100 font-mono-numbers">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <span>{pos.marketSymbol}</span>
                          </div>
                        </td>
                        <td className="py-2 px-2.5">
                          <span
                            className={`font-semibold font-mono-numbers px-2 py-0.5 rounded text-[11px] inline-flex items-center gap-1 ${
                              pos.side === 'long'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {pos.side === 'long' ? 'خرید (Long)' : 'فروش (Short)'} {pos.leverage}x
                          </span>
                        </td>
                        <td className="py-2 px-2.5 font-mono-numbers text-slate-200 font-medium">
                          {pos.amount}
                        </td>
                        <td className="py-2 px-2.5 font-mono-numbers text-slate-300">
                          {formatCurrency(pos.entryPrice, 2)}
                        </td>
                        <td className="py-2 px-2.5 font-mono-numbers text-slate-100 font-bold">
                          {formatCurrency(pos.currentPrice, 2)}
                        </td>
                        <td className="py-2 px-2.5 font-mono-numbers text-rose-400 font-medium">
                          {formatCurrency(pos.liquidationPrice, 2)}
                        </td>
                        <td className="py-2 px-2.5 font-mono-numbers text-slate-300">
                          {formatCurrency(pos.margin, 2)}
                        </td>
                        <td className="py-2 px-2.5 font-mono-numbers font-bold">
                          <span className={isProfit ? 'text-emerald-400' : 'text-rose-400'}>
                            {isProfit ? '+' : ''}
                            {pos.unrealizedPnl} ({isProfit ? '+' : ''}
                            {pos.unrealizedPnlPercent.toFixed(2)}%)
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => closePosition(pos.id)}
                            className="px-3 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-600 text-rose-300 hover:text-white transition-all text-xs font-bold shadow-sm cursor-pointer"
                          >
                            بستن معامله
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

        {/* TAB 2: Open Orders */}
        {activeTab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                سفارش بازی وجود ندارد.
              </div>
            ) : (
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] pb-1">
                    <th className="py-1.5 px-3">نماد</th>
                    <th className="py-1.5 px-2">نوع</th>
                    <th className="py-1.5 px-2">جهت</th>
                    <th className="py-1.5 px-2">قیمت سفارش</th>
                    <th className="py-1.5 px-2">حجم</th>
                    <th className="py-1.5 px-2">ارزش کل</th>
                    <th className="py-1.5 px-2">زمان ثبت</th>
                    <th className="py-1.5 px-2 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-900/50">
                      <td className="py-2.5 px-3 font-bold text-slate-200 font-mono-numbers">
                        {ord.marketSymbol}
                      </td>
                      <td className="py-2.5 px-2 text-slate-300">
                        {ord.type === 'limit' ? 'سفارش لیمیت' : 'مارکت'}
                      </td>
                      <td className="py-2.5 px-2">
                        <span
                          className={`font-semibold ${
                            ord.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {ord.side === 'buy' ? 'خرید' : 'فروش'}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 font-mono-numbers text-slate-200">
                        {formatCurrency(ord.price, 2)}
                      </td>
                      <td className="py-2.5 px-2 font-mono-numbers text-slate-300">{ord.amount}</td>
                      <td className="py-2.5 px-2 font-mono-numbers text-slate-300">
                        {formatCurrency(ord.total, 2)}
                      </td>
                      <td className="py-2.5 px-2 font-mono-numbers text-slate-400 text-[11px]">
                        {new Date(ord.createdAt).toLocaleTimeString('fa-IR')}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          onClick={() => cancelOrder(ord.id)}
                          className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/80 border border-slate-700/60 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 transition-all shadow-sm"
                          title="لغو سفارش"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 3: Trade History */}
        {activeTab === 'history' && (
          <div>
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] pb-1">
                  <th className="py-1.5 px-3">نماد</th>
                  <th className="py-1.5 px-2">نوع معامله</th>
                  <th className="py-1.5 px-2">جهت</th>
                  <th className="py-1.5 px-2">قیمت ورود</th>
                  <th className="py-1.5 px-2">قیمت خروج</th>
                  <th className="py-1.5 px-2">حجم</th>
                  <th className="py-1.5 px-2">سود/زیان محقق شده</th>
                  <th className="py-1.5 px-2">کارمزد</th>
                  <th className="py-1.5 px-2">زمان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {tradeHistory.map((th) => (
                  <tr key={th.id} className="hover:bg-slate-900/50">
                    <td className="py-2 px-3 font-bold text-slate-200 font-mono-numbers">
                      {th.marketSymbol}
                    </td>
                    <td className="py-2 px-2 text-slate-400">
                      {th.type === 'margin' ? `اهرمی (${th.leverage || 1}x)` : 'اسپات'}
                    </td>
                    <td className="py-2 px-2">
                      <span className={th.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'}>
                        {th.side === 'buy' ? 'خرید' : 'فروش'}
                      </span>
                    </td>
                    <td className="py-2 px-2 font-mono-numbers text-slate-300">
                      {formatCurrency(th.entryPrice, 2)}
                    </td>
                    <td className="py-2 px-2 font-mono-numbers text-slate-300">
                      {th.exitPrice ? formatCurrency(th.exitPrice, 2) : '-'}
                    </td>
                    <td className="py-2 px-2 font-mono-numbers text-slate-300">{th.amount}</td>
                    <td className="py-2 px-2 font-mono-numbers font-bold">
                      {th.realizedPnl !== undefined ? (
                        <span className={th.realizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {th.realizedPnl >= 0 ? '+' : ''}
                          {formatCurrency(th.realizedPnl, 2)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-2 px-2 font-mono-numbers text-slate-400">
                      {formatCurrency(th.fee, 2)}
                    </td>
                    <td className="py-2 px-2 font-mono-numbers text-slate-400 text-[11px]">
                      {new Date(th.timestamp).toLocaleDateString('fa-IR')}{' '}
                      {new Date(th.timestamp).toLocaleTimeString('fa-IR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: Transactions Ledger */}
        {activeTab === 'transactions' && (
          <div>
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] pb-1">
                  <th className="py-1.5 px-3">نوع تراکنش</th>
                  <th className="py-1.5 px-2">مبلغ</th>
                  <th className="py-1.5 px-2">وضعیت</th>
                  <th className="py-1.5 px-2">بانک / مرجع</th>
                  <th className="py-1.5 px-2">شناسه پرداخت</th>
                  <th className="py-1.5 px-2">کد پیگیری شتاب</th>
                  <th className="py-1.5 px-2">زمان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/50 whitespace-nowrap">
                    <td className="py-2 px-3 font-medium text-slate-200">
                      <div className="flex items-center gap-1.5">
                        {tx.type.startsWith('deposit') || tx.type === 'exchange_buy' || tx.type === 'loan_disbursement' ? (
                          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5 text-sky-400" />
                        )}
                        <span>
                          {tx.type === 'deposit_card'
                            ? 'واریز کارت به کارت شتاب'
                            : tx.type === 'withdraw_sheba'
                            ? 'برداشت شبا بانکی'
                            : tx.type === 'exchange_buy'
                            ? `خرید سرمایه‌گذاری در صرافی (${tx.creditAsset || ''})`
                            : tx.type === 'exchange_sell'
                            ? `فروش دارایی صرافی به تومان (${tx.creditAsset || ''})`
                            : tx.type === 'loan_disbursement'
                            ? 'دریافت وام ۷۰٪ با وثیقه دارایی'
                            : tx.type === 'loan_repayment'
                            ? 'پرداخت قسط / تسویه وام ۱۲٪'
                            : 'تراکنش کیف پول'}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2 font-mono-numbers font-bold text-slate-100">
                      {formatCurrency(tx.amount, tx.currency === 'USDT' ? 2 : 0)}{' '}
                      {tx.currency === 'IRT' ? 'تومان' : tx.currency}
                    </td>
                    <td className="py-2 px-2">
                      {tx.status === 'completed' ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تایید و تسویه شد</span>
                        </span>
                      ) : tx.status === 'pending' ? (
                        <span className="flex items-center gap-1 text-amber-400 font-medium">
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>در حال تطبیق بانکی</span>
                        </span>
                      ) : (
                        <span className="text-rose-400">رد شده</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-slate-300">{tx.destBank || 'صرافی آریا'}</td>
                    <td className="py-2 px-2 font-mono-numbers text-slate-300">{tx.referenceId}</td>
                    <td className="py-2 px-2 font-mono-numbers text-slate-400">
                      {tx.trackingCode || '-'}
                    </td>
                    <td className="py-2 px-2 font-mono-numbers text-slate-400 text-[11px]">
                      {new Date(tx.timestamp).toLocaleDateString('fa-IR')}{' '}
                      {new Date(tx.timestamp).toLocaleTimeString('fa-IR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BrokerProvider, useBroker } from './context/BrokerContext';
import { Header } from './components/Header';
import { TradingViewChart } from './components/TradingViewChart';
import { OrderBook } from './components/OrderBook';
import { RecentTrades } from './components/RecentTrades';
import { TradeForm } from './components/TradeForm';
import { PositionsAndOrders } from './components/PositionsAndOrders';
import { CardToCardDepositModal } from './components/CardToCardDepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { WalletModal } from './components/WalletModal';
import { KycModal } from './components/KycModal';
import { MarketsModal } from './components/MarketsModal';
import { CryptoDepositModal } from './components/CryptoDepositModal';
import { InstantSwapModal } from './components/InstantSwapModal';
import { ReferralModal } from './components/ReferralModal';
import { RewardsModal } from './components/RewardsModal';
import { HamburgerMenu } from './components/HamburgerMenu';
import { SettingsModal } from './components/SettingsModal';
import { GmailCommunicationsModal } from './components/GmailCommunicationsModal';
import { ExchangeAndLoanModal } from './components/ExchangeAndLoanModal';
import { AdminPanel } from './components/admin/AdminPanel';

function BrokerTerminal() {
  const [mobileTab, setMobileTab] = useState<'chart' | 'orderbook' | 'trade'>('chart');
  const {
    isAdminOpen,
    setIsAdminOpen,
    isCryptoDepositModalOpen,
    setCryptoDepositModalOpen,
  } = useBroker();

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col overflow-x-hidden font-sans">
      {/* 1. Header */}
      <Header />

      {/* Mobile Workspace Tabs Switcher */}
      <div className="flex items-center lg:hidden bg-[#0d1117] border-b border-slate-800 text-xs">
        <button
          onClick={() => setMobileTab('chart')}
          className={`flex-1 py-2 text-center font-bold border-b-2 transition-all ${
            mobileTab === 'chart'
              ? 'border-amber-400 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400'
          }`}
        >
          چارت زنده
        </button>
        <button
          onClick={() => setMobileTab('orderbook')}
          className={`flex-1 py-2 text-center font-bold border-b-2 transition-all ${
            mobileTab === 'orderbook'
              ? 'border-amber-400 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400'
          }`}
        >
          دفتر سفارشات
        </button>
        <button
          onClick={() => setMobileTab('trade')}
          className={`flex-1 py-2 text-center font-bold border-b-2 transition-all ${
            mobileTab === 'trade'
              ? 'border-amber-400 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400'
          }`}
        >
          ثبت معامله
        </button>
      </div>

      {/* 2. Main Trading Terminal Grid */}
      <div className="flex-1 flex flex-col">
        {/* Top Split: OrderBook + TradingView Chart + TradeForm */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
          {/* Column 1: OrderBook & RecentTrades (hidden on mobile unless active) */}
          <div
            className={`lg:col-span-3 border-l border-slate-800/80 flex flex-col h-[560px] lg:h-auto ${
              mobileTab === 'orderbook' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <div className="h-3/5 border-b border-slate-800/80">
              <OrderBook />
            </div>
            <div className="h-2/5">
              <RecentTrades />
            </div>
          </div>

          {/* Column 2: TradingView Candlestick Chart (Central focus - expanded size) */}
          <div
            className={`lg:col-span-6 flex flex-col border-l border-slate-800/80 h-[580px] lg:h-auto ${
              mobileTab === 'chart' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <TradingViewChart />
          </div>

          {/* Column 3: Trade Execution Form */}
          <div
            className={`lg:col-span-3 flex flex-col h-[560px] lg:h-auto ${
              mobileTab === 'trade' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <TradeForm />
          </div>
        </div>

        {/* Bottom Split: Positions, Orders, Trade History & Transactions Ledger */}
        <div className="border-t border-slate-800/80">
          <PositionsAndOrders />
        </div>
      </div>

      {/* 4. Modals */}
      <CardToCardDepositModal />
      <WithdrawModal />
      <WalletModal />
      <KycModal />
      <MarketsModal />
      <CryptoDepositModal
        isOpen={isCryptoDepositModalOpen}
        onClose={() => setCryptoDepositModalOpen(false)}
      />
      <InstantSwapModal />
      <ReferralModal />
      <RewardsModal />
      <HamburgerMenu />
      <SettingsModal />
      <GmailCommunicationsModal />
      <ExchangeAndLoanModal />

      {/* 5. Powerful Admin Panel */}
      {isAdminOpen && <AdminPanel onClose={() => setIsAdminOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <BrokerProvider>
      <BrokerTerminal />
    </BrokerProvider>
  );
}

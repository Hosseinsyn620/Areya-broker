/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useBroker } from '../context/BrokerContext';
import { CryptoDepositAsset, CryptoNetworkOption } from '../types/broker';
import {
  X,
  Coins,
  Copy,
  Check,
  QrCode,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const CRYPTO_DEPOSIT_ASSETS: CryptoDepositAsset[] = [
  {
    symbol: 'USDT',
    nameFa: 'تتر (Tether USD)',
    iconBg: 'from-emerald-500 to-teal-700',
    networks: [
      {
        id: 'trc20',
        name: 'TRON (TRC-20)',
        shortName: 'TRC20',
        address: 'TUVHe19wY3nzeuu6Tacf4tLUV3j2ve85vx',
        minDeposit: 5,
        confirmations: 1,
        estimatedTimeMin: 1,
      },
      {
        id: 'bep20',
        name: 'BNB Smart Chain (BEP-20)',
        shortName: 'BEP20',
        address: '0x8b32e01a8849b384d2847932c04f794328b0f71c',
        minDeposit: 2,
        confirmations: 15,
        estimatedTimeMin: 2,
      },
      {
        id: 'erc20',
        name: 'Ethereum (ERC-20)',
        shortName: 'ERC20',
        address: '0x8b32e01a8849b384d2847932c04f794328b0f71c',
        minDeposit: 20,
        confirmations: 12,
        estimatedTimeMin: 5,
      },
      {
        id: 'ton',
        name: 'TON Network',
        shortName: 'TON',
        address: 'EQD2Vp1L-m8m8eHq0k8N4fW3r7tY9uI1oP5aS7dF3gH5jK9l',
        memo: '849201',
        minDeposit: 5,
        confirmations: 1,
        estimatedTimeMin: 1,
      },
    ],
  },
  {
    symbol: 'BTC',
    nameFa: 'بیت‌کوین (Bitcoin)',
    iconBg: 'from-amber-500 to-orange-700',
    networks: [
      {
        id: 'btc',
        name: 'Bitcoin Native SegWit',
        shortName: 'BTC',
        address: 'bc1q9x3d8k4f7m2p5w1n8s6t0v4y7r9e2l5u8a3c6j',
        minDeposit: 0.0002,
        confirmations: 2,
        estimatedTimeMin: 15,
      },
      {
        id: 'bep20_btc',
        name: 'BNB Smart Chain (BEP-20)',
        shortName: 'BEP20',
        address: '0x8b32e01a8849b384d2847932c04f794328b0f71c',
        minDeposit: 0.0001,
        confirmations: 15,
        estimatedTimeMin: 2,
      },
    ],
  },
  {
    symbol: 'ETH',
    nameFa: 'اتریوم (Ethereum)',
    iconBg: 'from-indigo-500 to-purple-700',
    networks: [
      {
        id: 'erc20_eth',
        name: 'Ethereum (Mainnet)',
        shortName: 'ERC20',
        address: '0x8b32e01a8849b384d2847932c04f794328b0f71c',
        minDeposit: 0.005,
        confirmations: 12,
        estimatedTimeMin: 4,
      },
      {
        id: 'arbitrum',
        name: 'Arbitrum One',
        shortName: 'ARB',
        address: '0x8b32e01a8849b384d2847932c04f794328b0f71c',
        minDeposit: 0.002,
        confirmations: 10,
        estimatedTimeMin: 1,
      },
    ],
  },
  {
    symbol: 'TON',
    nameFa: 'تون‌کوین (Toncoin)',
    iconBg: 'from-sky-500 to-blue-700',
    networks: [
      {
        id: 'ton_main',
        name: 'TON Network (The Open Network)',
        shortName: 'TON',
        address: 'EQD2Vp1L-m8m8eHq0k8N4fW3r7tY9uI1oP5aS7dF3gH5jK9l',
        memo: '849201',
        minDeposit: 1,
        confirmations: 1,
        estimatedTimeMin: 1,
      },
    ],
  },
  {
    symbol: 'SOL',
    nameFa: 'سولانا (Solana)',
    iconBg: 'from-purple-500 to-emerald-600',
    networks: [
      {
        id: 'sol_main',
        name: 'Solana SPL',
        shortName: 'SOL',
        address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        minDeposit: 0.05,
        confirmations: 1,
        estimatedTimeMin: 1,
      },
    ],
  },
  {
    symbol: 'TRX',
    nameFa: 'ترون (Tron)',
    iconBg: 'from-red-500 to-rose-700',
    networks: [
      {
        id: 'trx_main',
        name: 'TRON TRC-20',
        shortName: 'TRX',
        address: 'TX9b8dE1p9Y2jA4bK8x7qWz1m5nQ9sR3tU',
        minDeposit: 20,
        confirmations: 1,
        estimatedTimeMin: 1,
      },
    ],
  },
];

export const CryptoDepositModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { depositCryptoBalance } = useBroker();

  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState<string>('USDT');
  const [selectedNetworkId, setSelectedNetworkId] = useState<string>('trc20');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [simulatedAmount, setSimulatedAmount] = useState<number>(100);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAsset =
    CRYPTO_DEPOSIT_ASSETS.find((a) => a.symbol === selectedAssetSymbol) ||
    CRYPTO_DEPOSIT_ASSETS[0];

  const currentNetwork =
    currentAsset.networks.find((n) => n.id === selectedNetworkId) ||
    currentAsset.networks[0];

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSimulateDeposit = async () => {
    if (simulatedAmount <= 0) return;
    setIsProcessing(true);
    setSuccessNotice(null);

    await new Promise((r) => setTimeout(r, 1800));

    depositCryptoBalance(currentAsset.symbol, simulatedAmount, currentNetwork.name);
    setIsProcessing(false);
    setSuccessNotice(
      `واریز ${simulatedAmount} ${currentAsset.symbol} بر روی شبکه ${currentNetwork.shortName} با موفقیت تایید و به کیف پول شما اضافه شد!`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-2xl bg-[#0e131b] border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <span>شارژ با رمزارزها (Multi-Crypto Deposit)</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                  آنی و خودکار
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                واریز مستقیم تتر، بیت‌کوین، اتریوم، تون‌کوین و سولانا به آدرس اختصاصی بروکر
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {successNotice ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h4 className="text-base font-bold text-slate-100">{successNotice}</h4>
              <p className="text-xs text-slate-400">
                موجودی بلافاصله در کیف پول شما بروزرسانی شد و آماده انجام معامله در بازار است.
              </p>
              <button
                onClick={() => setSuccessNotice(null)}
                className="px-6 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                واریز رمزارز جدید
              </button>
            </div>
          ) : (
            <>
              {/* Step 1: Select Crypto Asset */}
              <div>
                <label className="block text-slate-300 font-bold mb-2">
                  ۱. انتخاب رمزارز مورد نظر جهت شارژ:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {CRYPTO_DEPOSIT_ASSETS.map((asset) => (
                    <button
                      key={asset.symbol}
                      onClick={() => {
                        setSelectedAssetSymbol(asset.symbol);
                        setSelectedNetworkId(asset.networks[0].id);
                      }}
                      className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                        selectedAssetSymbol === asset.symbol
                          ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-sm'
                          : 'border-slate-800 bg-[#090d13] text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${asset.iconBg} flex items-center justify-center font-bold text-[10px] text-white`}
                      >
                        {asset.symbol.substring(0, 3)}
                      </div>
                      <span className="font-bold text-xs">{asset.symbol}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Select Network */}
              <div>
                <label className="block text-slate-300 font-bold mb-2">
                  ۲. انتخاب شبکه انتقال (Network):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentAsset.networks.map((net) => (
                    <button
                      key={net.id}
                      onClick={() => setSelectedNetworkId(net.id)}
                      className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between ${
                        selectedNetworkId === net.id
                          ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-sm'
                          : 'border-slate-800 bg-[#090d13] text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs block text-slate-200">
                          {net.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          تایید بلاک‌چین: {net.confirmations} | زمان: ~{net.estimatedTimeMin} دقیقه
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-emerald-400 font-mono-numbers">
                        حداقل: {net.minDeposit} {currentAsset.symbol}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Deposit Address & QR Presentation */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-[#131b26] to-[#0d141e] border border-slate-750 shadow-xl space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Clean Vector QR Code Representation */}
                  <div className="w-28 h-28 bg-white p-2 rounded-xl flex items-center justify-center shrink-0 shadow-md">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                      <rect width="100" height="100" fill="white" />
                      {/* Corner markers */}
                      <path d="M10,10 h24 v24 h-24 z M14,14 v16 h16 v-16 z M18,18 h8 v8 h-8 z" />
                      <path d="M66,10 h24 v24 h-24 z M70,14 v16 h16 v-16 z M74,18 h8 v8 h-8 z" />
                      <path d="M10,66 h24 v24 h-24 z M14,70 v16 h16 v-16 z M18,74 h8 v8 h-8 z" />
                      {/* Data dots pattern */}
                      <rect x="42" y="14" width="6" height="6" />
                      <rect x="52" y="14" width="6" height="6" />
                      <rect x="42" y="24" width="6" height="12" />
                      <rect x="14" y="42" width="12" height="6" />
                      <rect x="30" y="42" width="6" height="6" />
                      <rect x="42" y="42" width="16" height="16" />
                      <rect x="66" y="42" width="6" height="6" />
                      <rect x="78" y="42" width="8" height="6" />
                      <rect x="66" y="52" width="18" height="6" />
                      <rect x="42" y="66" width="6" height="12" />
                      <rect x="54" y="66" width="6" height="6" />
                      <rect x="66" y="66" width="20" height="8" />
                      <rect x="74" y="78" width="12" height="12" />
                    </svg>
                  </div>

                  <div className="flex-1 space-y-2 text-right w-full">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>آدرس کیف پول واریز ({currentNetwork.shortName}):</span>
                      <span className="text-emerald-400 font-bold">شبکه اختصاصی بروکر آریا</span>
                    </div>

                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                      <span className="font-mono-numbers text-xs sm:text-sm font-bold text-amber-300 break-all select-all">
                        {currentNetwork.address}
                      </span>
                      <button
                        onClick={() => handleCopy(currentNetwork.address, 'address')}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition-colors flex items-center gap-1 shrink-0 text-xs"
                      >
                        {copiedField === 'address' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">کپی شد</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>کپی</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Memo / Tag if required (e.g. for TON) */}
                    {currentNetwork.memo && (
                      <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-300 font-bold text-[11px]">
                            تگ / ممو ضروری (Memo/Comment):
                          </span>
                          <span className="font-mono-numbers font-black text-amber-200 text-sm">
                            {currentNetwork.memo}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopy(currentNetwork.memo!, 'memo')}
                          className="text-amber-400 hover:underline text-xs"
                        >
                          {copiedField === 'memo' ? 'کپی شد' : 'کپی ممو'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Important notice */}
                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-amber-500/30 flex items-start gap-2 text-[11px] text-slate-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p>
                    فقط <span className="font-bold text-amber-300">{currentAsset.symbol}</span> بر روی
                    شبکه <span className="font-bold text-emerald-400">{currentNetwork.name}</span> به
                    این آدرس ارسال فرمایید. ارسال دارایی دیگر منجر به از دست رفتن وجه خواهد شد.
                  </p>
                </div>
              </div>

              {/* Simulation Sandbox for Immediate Testing */}
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-200 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>شبیه‌ساز واریز آنی (تست فوری افزایش موجودی):</span>
                  </span>
                  <span className="text-[10px] text-slate-400">بدون نیاز به تراکنش واقعی</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={simulatedAmount}
                    onChange={(e) => setSimulatedAmount(Number(e.target.value))}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono-numbers text-xs text-white"
                  />
                  <button
                    onClick={handleSimulateDeposit}
                    disabled={isProcessing}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1"
                  >
                    {isProcessing ? 'در حال بررسی شبکه...' : `شارژ ${simulatedAmount} ${currentAsset.symbol}`}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

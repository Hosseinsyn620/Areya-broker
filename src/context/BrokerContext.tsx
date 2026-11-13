/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Market,
  Candle,
  Position,
  Order,
  TradeHistoryItem,
  WalletBalances,
  Transaction,
  KycInfo,
  UserBankAccount,
  OrderSide,
  OrderType,
  TradingMode,
  DataProviderStatus,
  BrokerSettings,
  AdminUserRecord,
  BankAccountInfo,
  InvestableAssetSymbol,
  ExchangeInvestmentLot,
  CollateralLoan,
  LoanInstallment,
} from '../types/broker';
import {
  INITIAL_MARKETS,
  generateCandles,
  generateOrderBook,
  generateInitialTrades,
  OrderBookEntry,
  TradeTick,
} from '../services/marketData';
import { liveDataProvider } from '../services/liveDataProvider';
import { OFFICIAL_BROKER_BANK_ACCOUNTS } from '../utils/iranianBanks';

interface PlaceOrderParams {
  side: OrderSide;
  type: OrderType;
  tradingMode: TradingMode;
  price?: number;
  amount: number;
  leverage: number;
  takeProfit?: number;
  stopLoss?: number;
}

interface BrokerContextType {
  markets: Market[];
  activeMarket: Market;
  currentPrice: number;
  candles: Candle[];
  timeframe: string;
  orderBook: { bids: OrderBookEntry[]; asks: OrderBookEntry[]; spread: number };
  recentTrades: TradeTick[];
  accountMode: 'real' | 'demo';
  balances: WalletBalances;
  positions: Position[];
  orders: Order[];
  tradeHistory: TradeHistoryItem[];
  transactions: Transaction[];
  kycInfo: KycInfo;
  userBankAccounts: UserBankAccount[];
  tickDirection: 'up' | 'down' | 'neutral';
  chartSuspenseLevel: 'high' | 'medium' | 'hyper';
  setChartSuspenseLevel: (level: 'high' | 'medium' | 'hyper') => void;
  
  // Data provider & Admin state
  dataProviderStatus: DataProviderStatus;
  refreshHistoricalData: () => Promise<void>;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  brokerSettings: BrokerSettings;
  updateBrokerSettings: (settings: Partial<BrokerSettings>) => void;
  adminUsers: AdminUserRecord[];
  updateAdminUser: (userId: string, updates: Partial<AdminUserRecord>) => void;
  brokerBankAccounts: BankAccountInfo[];
  updateBrokerBankAccount: (cardNum: string, updates: Partial<BankAccountInfo>) => void;
  addBrokerBankAccount: (bank: BankAccountInfo) => void;
  approveDeposit: (txId: string) => void;
  rejectDeposit: (txId: string, reason: string) => void;
  approveWithdrawal: (txId: string, payaCode: string) => void;
  rejectWithdrawal: (txId: string, reason: string) => void;
  adminClosePosition: (positionId: string) => void;

  // Modals state
  isCardDepositModalOpen: boolean;
  isWithdrawModalOpen: boolean;
  isWalletModalOpen: boolean;
  isKycModalOpen: boolean;
  isMarketsModalOpen: boolean;
  isCryptoDepositModalOpen: boolean;
  isSwapModalOpen: boolean;
  isReferralModalOpen: boolean;
  isRewardsModalOpen: boolean;
  isHamburgerMenuOpen: boolean;
  isSettingsModalOpen: boolean;
  isGmailModalOpen: boolean;
  setGmailModalOpen: (open: boolean) => void;
  isExchangeModalOpen: boolean;
  setExchangeModalOpen: (open: boolean) => void;
  soundEnabled: boolean;

  // Exchange Investment & 70% Collateral Loans
  exchangeLots: ExchangeInvestmentLot[];
  loans: CollateralLoan[];
  getAssetUnitPriceToman: (asset: InvestableAssetSymbol) => number;
  getLockedCollateralAmount: (asset: InvestableAssetSymbol) => number;

  // Referral & Bonuses
  referralProgram: import('../types/broker').ReferralProgram;
  bonuses: import('../types/broker').BonusItem[];

  // Actions
  selectMarket: (id: string) => void;
  setTimeframe: (tf: string) => void;
  setAccountMode: (mode: 'real' | 'demo') => void;
  placeOrder: (params: PlaceOrderParams) => { success: boolean; message: string };
  closePosition: (positionId: string) => void;
  cancelOrder: (orderId: string) => void;
  submitCardDeposit: (params: {
    amount: number;
    senderCardLast4: string;
    trackingCode: string;
    destBank: string;
    referenceId: string;
    creditAsUsdt?: boolean;
    usdtAmount?: number;
  }) => Promise<{ success: boolean; message: string }>;
  submitWithdrawal: (params: {
    amount: number;
    cardNumber: string;
    sheba: string;
    bankName: string;
  }) => Promise<{ success: boolean; message: string }>;
  submitCryptoWithdrawal: (params: {
    amount: number;
    address: string;
    network: string;
  }) => Promise<{ success: boolean; message: string }>;
  depositCryptoBalance: (symbol: string, amount: number, networkName: string) => void;
  executeInstantSwap: (
    fromCurrency: string,
    toCurrency: string,
    fromAmount: number,
    toAmount: number
  ) => { success: boolean; message: string };
  claimBonus: (bonusId: string) => { success: boolean; message: string };
  claimReferralEarnings: () => { success: boolean; message: string };
  submitKyc: (data: {
    fullName: string;
    nationalCode: string;
    phoneNumber: string;
    email: string;
    birthDate: string;
    cardNumber: string;
    sheba: string;
    documentType: 'national_card' | 'driving_license' | 'passport';
    idCardImage?: string;
  }) => boolean;
  submitExchangeCardPurchase: (params: {
    asset: InvestableAssetSymbol;
    tomanAmount: number;
    assetAmount: number;
    senderCardLast4: string;
    trackingCode: string;
    destBank: string;
    referenceId: string;
  }) => Promise<{ success: boolean; message: string; autoApproved: boolean }>;
  sellExchangeAssetToToman: (
    asset: InvestableAssetSymbol,
    assetAmount: number
  ) => { success: boolean; message: string; tomanReceived: number };
  requestCollateralLoan: (params: {
    collateralAsset: InvestableAssetSymbol;
    collateralAmount: number;
    loanCurrency: 'IRT' | 'USDT';
    monthsCount: number;
  }) => { success: boolean; message: string; loan?: CollateralLoan };
  payLoanInstallment: (
    loanId: string,
    settleFull?: boolean
  ) => { success: boolean; message: string };
  toggleSound: () => void;
  setCardDepositModalOpen: (open: boolean) => void;
  setWithdrawModalOpen: (open: boolean) => void;
  setWalletModalOpen: (open: boolean) => void;
  setKycModalOpen: (open: boolean) => void;
  setMarketsModalOpen: (open: boolean) => void;
  setCryptoDepositModalOpen: (open: boolean) => void;
  setSwapModalOpen: (open: boolean) => void;
  setReferralModalOpen: (open: boolean) => void;
  setRewardsModalOpen: (open: boolean) => void;
  setHamburgerMenuOpen: (open: boolean) => void;
  setSettingsModalOpen: (open: boolean) => void;
  resetDemoBalance: () => void;
}

const BrokerContext = createContext<BrokerContextType | undefined>(undefined);

// Web Audio sound synthesizer for instant financial UI audio feedback
function playSoundTone(type: 'buy' | 'sell' | 'alert' | 'success') {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'buy') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'sell') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(750, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(380, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'success') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    }
  } catch {
    // ignore audio autoplay restriction
  }
}

export const BrokerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [markets, setMarkets] = useState<Market[]>(INITIAL_MARKETS);
  const [activeMarketId, setActiveMarketId] = useState<string>('xau_usd');
  const [timeframe, setTimeframe] = useState<string>('15m');
  const [accountMode, setAccountMode] = useState<'real' | 'demo'>('real');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Admin & Provider State
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [dataProviderStatus, setDataProviderStatus] = useState<DataProviderStatus>({
    name: 'Kraken Institutional Spot (تامین‌کننده جهانی)',
    source: 'kraken_spot',
    isConnected: true,
    latencyMs: 14,
    lastSyncTimestamp: Date.now(),
    serverRegion: 'Global CDN (Frankfurt / London)',
  });

  const [brokerSettings, setBrokerSettings] = useState<BrokerSettings>({
    makerFeePercent: 0.04,
    takerFeePercent: 0.06,
    spreadMarkupPercent: 0.02,
    usdToTomanRate: 95000,
    autoApproveDepositsUnder: 20000000,
    allowMarginTrading: true,
    maxLeverageGlobal: 2000,
    activeDataProvider: 'kraken_spot',
    maintenanceMode: false,
    oneClickTrading: false,
    defaultLeverage: 20,
    candleColorTheme: 'classic',
    showMaLines: true,
    showVolume: true,
    currencyDisplay: 'IRT',
    numberFormat: 'fa',
  });

  const [brokerBankAccounts, setBrokerBankAccounts] = useState<BankAccountInfo[]>(
    OFFICIAL_BROKER_BANK_ACCOUNTS
  );

  const [adminUsers, setAdminUsers] = useState<AdminUserRecord[]>([
    {
      id: 'usr_1',
      fullName: 'حسین پاکزاد',
      nationalCode: '0021458963',
      phoneNumber: '09123456789',
      email: 'hossein.pakzad@gmail.com',
      balanceIRT: 35000000,
      balanceUSDT: 450.0,
      kycLevel: 2,
      isVerified: true,
      isBanned: false,
      registeredCardLast4: '8154',
      sheba: 'IR450560084380001234567890',
      verificationStatus: 'verified',
      joinedAt: Date.now() - 3600000 * 24 * 14,
      totalTradesCount: 28,
    },
    {
      id: 'usr_2',
      fullName: 'رضا سلیمانی',
      nationalCode: '0082341902',
      phoneNumber: '09351239845',
      email: 'reza.soleimani@gmail.com',
      balanceIRT: 82000000,
      balanceUSDT: 1200.0,
      kycLevel: 2,
      isVerified: true,
      isBanned: false,
      registeredCardLast4: '4563',
      sheba: 'IR780120000000009876543210',
      verificationStatus: 'verified',
      joinedAt: Date.now() - 3600000 * 24 * 30,
      totalTradesCount: 64,
    },
    {
      id: 'usr_3',
      fullName: 'مریم کمالی',
      nationalCode: '0459812401',
      phoneNumber: '09198765432',
      email: 'maryam.kamali@gmail.com',
      balanceIRT: 12500000,
      balanceUSDT: 150.0,
      kycLevel: 1,
      isVerified: true,
      isBanned: false,
      registeredCardLast4: '2130',
      sheba: 'IR120190000000005432198765',
      verificationStatus: 'verified',
      joinedAt: Date.now() - 3600000 * 24 * 5,
      totalTradesCount: 12,
    },
  ]);

  // Modals
  const [isCardDepositModalOpen, setCardDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [isWalletModalOpen, setWalletModalOpen] = useState(false);
  const [isKycModalOpen, setKycModalOpen] = useState(false);
  const [isMarketsModalOpen, setMarketsModalOpen] = useState(false);
  const [isCryptoDepositModalOpen, setCryptoDepositModalOpen] = useState(false);
  const [isSwapModalOpen, setSwapModalOpen] = useState(false);
  const [isReferralModalOpen, setReferralModalOpen] = useState(false);
  const [isRewardsModalOpen, setRewardsModalOpen] = useState(false);
  const [isHamburgerMenuOpen, setHamburgerMenuOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isGmailModalOpen, setGmailModalOpen] = useState(false);
  const [isExchangeModalOpen, setExchangeModalOpen] = useState(false);

  // Exchange investment lots & 70% collateralized loans
  const [exchangeLots, setExchangeLots] = useState<ExchangeInvestmentLot[]>([]);
  const [loans, setLoans] = useState<CollateralLoan[]>([]);

  // Referral Program
  const [referralProgram, setReferralProgram] = useState<import('../types/broker').ReferralProgram>({
    code: 'ARIA-84920',
    link: 'https://ariatrader.ir/join?ref=ARIA-84920',
    commissionPercent: 30,
    tierName: 'نقره‌ای (۳۰٪)',
    totalInvited: 14,
    activeTradersCount: 9,
    totalEarnedIRT: 4850000,
    totalEarnedUSDT: 52.2,
    withdrawableIRT: 2150000,
    invitees: [
      {
        id: 'inv_1',
        maskedPhone: '0912***4812',
        joinedAt: Date.now() - 3600000 * 24 * 3,
        totalVolumeIRT: 380000000,
        commissionEarnedIRT: 1140000,
        tier: 'سطح ۱',
      },
      {
        id: 'inv_2',
        maskedPhone: '0935***9921',
        joinedAt: Date.now() - 3600000 * 24 * 8,
        totalVolumeIRT: 520000000,
        commissionEarnedIRT: 1560000,
        tier: 'سطح ۱',
      },
      {
        id: 'inv_3',
        maskedPhone: '0919***1204',
        joinedAt: Date.now() - 3600000 * 24 * 15,
        totalVolumeIRT: 710000000,
        commissionEarnedIRT: 2130000,
        tier: 'سطح ۱',
      },
      {
        id: 'inv_4',
        maskedPhone: '0930***7730',
        joinedAt: Date.now() - 3600000 * 24 * 21,
        totalVolumeIRT: 65000000,
        commissionEarnedIRT: 195000,
        tier: 'سطح ۱',
      },
    ],
  });

  // Rewards & Bonuses
  const [bonuses, setBonuses] = useState<import('../types/broker').BonusItem[]>([
    {
      id: 'bon_welcome',
      title: 'بونوس خوش‌آمدگویی افتتاح حساب',
      description: '۲,۰۰۰,۰۰۰ تومان اعتبار ترید نقدی رایگان جهت شروع معاملات در بروکر',
      rewardText: '۲,۰۰۰,۰۰۰ تومان',
      rewardAmount: 2000000,
      rewardCurrency: 'IRT',
      status: 'available',
      type: 'welcome',
    },
    {
      id: 'bon_deposit',
      title: 'بونوس ۱۰۰٪ واریز اول شتابی',
      description: 'معادل ۱۰۰٪ مبلغ اولین واریز خود را به عنوان اعتبار معاملاتی هدیه بگیرید',
      rewardText: 'تا ۵۰ میلیون تومان',
      rewardAmount: 5000000,
      rewardCurrency: 'IRT',
      status: 'available',
      type: 'deposit',
    },
    {
      id: 'bon_spin',
      title: 'گردونه شانس روزانه معامله‌گران',
      description: 'هر ۲۴ ساعت یک بار شانس خود را در برنده شدن تتر، طلا یا تومان امتحان کنید',
      rewardText: 'جوایز تا ۵۰ تتر',
      rewardAmount: 15,
      rewardCurrency: 'USDT',
      status: 'available',
      type: 'spin',
    },
    {
      id: 'bon_crypto',
      title: 'پاداش ۵٪ شارژ با تتر TRC20',
      description: '۵٪ کش‌بک مستقیم برای هر بار شارژ کیف پول با رمزارز تتر بدون سقف',
      rewardText: '۵٪ کش‌بک نقدی',
      rewardAmount: 10,
      rewardCurrency: 'USDT',
      status: 'claimed',
      type: 'weekly',
    },
  ]);

  // Wallet balances: Real account has STRICTLY ZERO initial balance (no mock or placeholder funds)
  const [balances, setBalances] = useState<WalletBalances>({
    IRT: 0,
    USDT: 0,
    BTC: 0,
    ETH: 0,
    SOL: 0,
    BNB: 0,
    TON: 0,
    XRP: 0,
    GOLD_GRAM: 0,
    demo_IRT: 150000000, // حساب دمو (آزمایشی)
    demo_USDT: 10000.0,
    demo_BTC: 0.25,
    demo_ETH: 1.5,
    demo_SOL: 20,
    demo_BNB: 2,
    demo_TON: 150,
    demo_XRP: 1000,
    demo_GOLD_GRAM: 15.0,
  });

  // KYC Information
  const [kycInfo, setKycInfo] = useState<KycInfo>({
    fullName: 'حسین پاکزاد کرباسدهی',
    nationalCode: '0021458963',
    phoneNumber: '09123456789',
    email: 'pakzadhsyn620@gmail.com',
    birthDate: '1372/06/15',
    isVerified: true,
    level: 2,
    documentType: 'national_card',
    registeredCardLast4: '1755',
    cardNumber: '6037698112541755',
    sheba: 'IR880190000000334719437007',
    verificationStatus: 'verified',
  });

  // Bank accounts
  const [userBankAccounts, setUserBankAccounts] = useState<UserBankAccount[]>([
    {
      id: 'bank_1',
      bankName: 'بانک صادرات ایران',
      cardNumber: '6037698112541755',
      sheba: 'IR880190000000334719437007',
      accountHolder: 'حسین پاکزاد کرباسدهی',
      isDefault: true,
    },
  ]);

  // Active Market object
  const activeMarket = useMemo(() => {
    return markets.find((m) => m.id === activeMarketId) || markets[0];
  }, [markets, activeMarketId]);

  const [currentPrice, setCurrentPrice] = useState<number>(activeMarket.price);

  // Candles, order book & recent trades
  const [candles, setCandles] = useState<Candle[]>(() =>
    generateCandles(activeMarket.price, 90, timeframe)
  );

  const [orderBook, setOrderBook] = useState(() =>
    generateOrderBook(activeMarket.price, activeMarket.precision)
  );

  const [recentTrades, setRecentTrades] = useState<TradeTick[]>(() =>
    generateInitialTrades(activeMarket.price, activeMarket.precision)
  );

  // Positions, Orders, Transactions & History (Strictly clean for real account)
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tradeHistory, setTradeHistory] = useState<TradeHistoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Connect to live data provider
  const refreshHistoricalData = useCallback(async () => {
    try {
      const fetchedCandles = await liveDataProvider.fetchHistoricalCandles(
        activeMarket.id,
        timeframe,
        activeMarket.price
      );
      if (fetchedCandles && fetchedCandles.length > 0) {
        setCandles(fetchedCandles);
        const latestClose = fetchedCandles[fetchedCandles.length - 1].close;
        setCurrentPrice(latestClose);
      }
    } catch {
      // fallback handled inside liveDataProvider
    }
  }, [activeMarket.id, activeMarket.price, timeframe]);

  // Initialize and switch streams when market or timeframe changes
  useEffect(() => {
    liveDataProvider.init(
      (candle, isClosed) => {
        setCandles((prev) => {
          if (prev.length === 0) return [candle];
          const lastIdx = prev.length - 1;
          const copy = [...prev];
          if (isClosed) {
            return [...copy, candle];
          } else {
            copy[lastIdx] = candle;
            return copy;
          }
        });
      },
      (tickPrice, tickMarketId) => {
        if (tickMarketId === activeMarket.id) {
          setCurrentPrice(tickPrice);
        }
      },
      (status) => {
        setDataProviderStatus(status);
      },
      (statsMap) => {
        setMarkets((prevMarkets) => {
          return prevMarkets.map((m) => {
            if (statsMap[m.id]) {
              const stat = statsMap[m.id];
              return {
                ...m,
                price: stat.price,
                change24h: stat.change24h,
                high24h: stat.high24h,
                low24h: stat.low24h,
              };
            }
            return m;
          });
        });
      }
    );

    refreshHistoricalData();
    liveDataProvider.connectStream(activeMarket.id, timeframe);

    return () => {
      liveDataProvider.closeStream();
    };
  }, [activeMarket.id, timeframe, refreshHistoricalData]);

  const [tickDirection, setTickDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [chartSuspenseLevel, setChartSuspenseLevel] = useState<'high' | 'medium' | 'hyper'>('high');

  // Ref for the dynamic suspense state machine
  const suspenseEngineRef = useRef({
    regime: 'indecision' as 'buyer_push' | 'seller_push' | 'indecision' | 'breakout_test',
    ticksRemaining: 6,
    momentum: 0,
    baseAnchorPrice: activeMarket.price,
    counter: 0,
  });

  // Keep baseAnchorPrice in sync when active market changes or when real ticker updates
  useEffect(() => {
    suspenseEngineRef.current.baseAnchorPrice = activeMarket.price;
    suspenseEngineRef.current.regime = 'indecision';
    suspenseEngineRef.current.ticksRemaining = 6;
  }, [activeMarket.id, activeMarket.price]);

  // Update anchor price when liveDataProvider delivers real external ticker
  useEffect(() => {
    const handleStats = (statsMap: Record<string, any>) => {
      if (statsMap[activeMarket.id]) {
        suspenseEngineRef.current.baseAnchorPrice = statsMap[activeMarket.id].price;
      }
    };
    // hook via provider if active
  }, [activeMarket.id]);

  // HIGH-FREQUENCY MARKET VOLATILITY & SUSPENSE ENGINE
  // Creates realistic micro-fluctuations, candle wicking, buyer/seller battles and hesitation
  useEffect(() => {
    const tickIntervalMs =
      chartSuspenseLevel === 'hyper' ? 220 : chartSuspenseLevel === 'high' ? 340 : 580;

    const interval = setInterval(() => {
      const state = suspenseEngineRef.current;
      state.counter++;

      // 1. Calculate price scale and step
      let step = 0.001;
      const price = activeMarket.price;

      if (activeMarket.quoteAsset === 'IRT') {
        step = Math.max(1200, price * 0.00035);
      } else if (activeMarket.precision === 4) {
        step = 0.00018; // Forex major
      } else if (activeMarket.precision === 8) {
        step = 0.00000008; // PEPE, SHIB
      } else if (price > 20000) {
        step = 16.5; // BTC, US30
      } else if (price > 2000) {
        step = 1.15; // Gold XAU, ETH, S&P, NASDAQ
      } else if (price > 100) {
        step = 0.32; // TSLA, NVDA, AAPL, SOL, BNB
      } else {
        step = Math.max(0.002, price * 0.0008);
      }

      // Suspense multiplier
      const levelMultiplier =
        chartSuspenseLevel === 'hyper' ? 2.2 : chartSuspenseLevel === 'high' ? 1.45 : 0.95;

      // 2. State Machine: Shift regime when ticksRemaining expires
      state.ticksRemaining--;
      if (state.ticksRemaining <= 0) {
        const rand = Math.random();
        if (rand < 0.38) {
          // Indecision: battle near the candle open, hesitating (suspense!)
          state.regime = 'indecision';
          state.ticksRemaining = Math.floor(Math.random() * 5 + 4);
        } else if (rand < 0.68) {
          // Buyer push: pushes price up, testing high, turning green
          state.regime = 'buyer_push';
          state.ticksRemaining = Math.floor(Math.random() * 6 + 3);
        } else if (rand < 0.94) {
          // Seller push: drops price, testing low, leaves upper wick
          state.regime = 'seller_push';
          state.ticksRemaining = Math.floor(Math.random() * 6 + 3);
        } else {
          // Breakout test: quick explosive pulse followed by swift resistance
          state.regime = 'breakout_test';
          state.ticksRemaining = Math.floor(Math.random() * 3 + 2);
        }
      }

      // 3. Compute delta based on active regime
      let bias = 0;
      if (state.regime === 'buyer_push') {
        bias = Math.random() * 0.85 + 0.35;
      } else if (state.regime === 'seller_push') {
        bias = -(Math.random() * 0.85 + 0.35);
      } else if (state.regime === 'indecision') {
        // High frequency micro-jitter around zero
        bias = (Math.random() - 0.49) * 0.9;
      } else if (state.regime === 'breakout_test') {
        bias = (Math.random() > 0.45 ? 1 : -1) * (Math.random() * 1.5 + 1.0);
      }

      // Gentle anchor pull to prevent long-term drift from real benchmark
      const anchor = state.baseAnchorPrice || price;
      const driftBack = (anchor - currentPrice) * 0.07;

      const rawDelta = bias * step * levelMultiplier + driftBack;
      const nextPrice = Number((currentPrice + rawDelta).toFixed(activeMarket.precision));

      if (nextPrice > 0 && Math.abs(nextPrice - currentPrice) > 0) {
        const isUp = nextPrice >= currentPrice;
        setTickDirection(isUp ? 'up' : 'down');
        setCurrentPrice(nextPrice);

        // Update active market in markets list
        setMarkets((prev) =>
          prev.map((m) =>
            m.id === activeMarket.id
              ? {
                  ...m,
                  price: nextPrice,
                  high24h: Math.max(m.high24h, nextPrice),
                  low24h: Math.min(m.low24h, nextPrice),
                }
              : m
          )
        );

        // Update active candle and timeframe rolling
        setCandles((prev) => {
          if (!prev || prev.length === 0) return prev;
          const now = Date.now();
          const lastIdx = prev.length - 1;
          const last = prev[lastIdx];

          let tfMs = 15 * 60 * 1000;
          if (timeframe === '1m') tfMs = 60 * 1000;
          else if (timeframe === '5m') tfMs = 5 * 60 * 1000;
          else if (timeframe === '15m') tfMs = 15 * 60 * 1000;
          else if (timeframe === '1h') tfMs = 60 * 60 * 1000;
          else if (timeframe === '4h') tfMs = 4 * 60 * 60 * 1000;
          else if (timeframe === '1D') tfMs = 24 * 60 * 60 * 1000;

          const microVol = Math.floor(Math.random() * 5 + 1);

          // Check if candle period elapsed -> roll into new live candle
          if (now - last.time >= tfMs) {
            const newCandle: Candle = {
              time: Math.floor(now / tfMs) * tfMs,
              open: last.close,
              high: Math.max(last.close, nextPrice),
              low: Math.min(last.close, nextPrice),
              close: nextPrice,
              volume: microVol,
            };
            return [...prev.slice(-99), newCandle];
          }

          // Otherwise update current candle wicks and close
          const updated = [...prev];
          updated[lastIdx] = {
            ...last,
            high: Math.max(last.high, nextPrice),
            low: Math.min(last.low, nextPrice),
            close: nextPrice,
            volume: last.volume + microVol,
          };
          return updated;
        });

        // Push new trade tick to Recent Trades every 2-3 ticks
        if (state.counter % 2 === 0) {
          const tradeVol = Number((Math.random() * 1.5 + 0.05).toFixed(3));
          setRecentTrades((prevTrades) => [
            {
              id: `tr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              price: nextPrice,
              amount: tradeVol,
              side: isUp ? 'buy' : 'sell',
              time: Date.now(),
            },
            ...prevTrades.slice(0, 24),
          ]);
        }

        // Pulse order book top depth
        if (state.counter % 3 === 0) {
          setOrderBook((prev) => {
            const asks = prev.asks.map((a, i) =>
              i >= prev.asks.length - 2
                ? { ...a, amount: Number((a.amount * (Math.random() * 0.4 + 0.8)).toFixed(3)) }
                : a
            );
            const bids = prev.bids.map((b, i) =>
              i <= 1
                ? { ...b, amount: Number((b.amount * (Math.random() * 0.4 + 0.8)).toFixed(3)) }
                : b
            );
            return { ...prev, asks, bids };
          });
        }
      }
    }, tickIntervalMs);

    return () => clearInterval(interval);
  }, [activeMarket.id, activeMarket.precision, activeMarket.price, activeMarket.quoteAsset, currentPrice, timeframe, chartSuspenseLevel]);

  // Gentle background drift for inactive markets so the entire watchlist stays fresh
  useEffect(() => {
    const bgInterval = setInterval(() => {
      setMarkets((prev) =>
        prev.map((m) => {
          if (m.id === activeMarket.id) return m; // active market updated by high-frequency engine
          const step = m.quoteAsset === 'IRT' ? 800 : m.price * 0.0003;
          const delta = (Math.random() - 0.495) * step;
          const newP = Number((m.price + delta).toFixed(m.precision));
          return {
            ...m,
            price: newP,
            high24h: Math.max(m.high24h, newP),
            low24h: Math.min(m.low24h, newP),
          };
        })
      );
    }, 1200);

    return () => clearInterval(bgInterval);
  }, [activeMarket.id]);

  // Sync activeMarket price & update candle in real-time
  useEffect(() => {
    const price = currentPrice;

    // Update positions PnL
    setPositions((prevPositions) => {
      return prevPositions.map((pos) => {
        if (pos.marketId !== activeMarket.id) return pos;

        const isLong = pos.side === 'long';
        const priceDiff = isLong ? price - pos.entryPrice : pos.entryPrice - price;
        const unrealizedPnl = priceDiff * pos.amount;
        const unrealizedPnlPercent = (unrealizedPnl / pos.margin) * 100;

        return {
          ...pos,
          currentPrice: price,
          unrealizedPnl: Number(unrealizedPnl.toFixed(2)),
          unrealizedPnlPercent: Number(unrealizedPnlPercent.toFixed(2)),
        };
      });
    });

    // Check limit orders execution
    setOrders((prevOrders) => {
      const remaining: Order[] = [];
      prevOrders.forEach((ord) => {
        if (ord.marketId === activeMarket.id && ord.status === 'open') {
          const filled =
            ord.side === 'buy' ? price <= ord.price : price >= ord.price;

          if (filled) {
            if (soundEnabled) playSoundTone(ord.side === 'buy' ? 'buy' : 'sell');
            setTradeHistory((th) => [
              {
                id: `th_${Date.now()}`,
                marketSymbol: ord.marketSymbol,
                type: ord.tradingMode,
                side: ord.side,
                entryPrice: ord.price,
                amount: ord.amount,
                fee: ord.total * (brokerSettings.makerFeePercent / 100),
                timestamp: Date.now(),
              },
              ...th,
            ]);
            return;
          }
        }
        remaining.push(ord);
      });
      return remaining;
    });
  }, [currentPrice, activeMarket.id, soundEnabled, brokerSettings.makerFeePercent]);

  const selectMarket = useCallback((id: string) => {
    setActiveMarketId(id);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  const resetDemoBalance = useCallback(() => {
    setBalances((prev) => ({
      ...prev,
      demo_IRT: 150000000,
      demo_USDT: 10000.0,
      demo_BTC: 0.25,
      demo_ETH: 1.5,
      demo_SOL: 20,
      demo_BNB: 2,
      demo_TON: 150,
      demo_XRP: 1000,
      demo_GOLD_GRAM: 15.0,
    }));
    if (soundEnabled) playSoundTone('success');
  }, [soundEnabled]);

  // Admin & User Settings Actions
  const updateBrokerSettings = useCallback(
    (settings: Partial<BrokerSettings>) => {
      setBrokerSettings((prev) => {
        const next = { ...prev, ...settings };
        if (settings.activeDataProvider && settings.activeDataProvider !== prev.activeDataProvider) {
          liveDataProvider.setProvider(settings.activeDataProvider as any);
        }
        if (settings.usdToTomanRate && settings.usdToTomanRate > 0) {
          const newRate = settings.usdToTomanRate;
          liveDataProvider.setUsdToTomanRate(newRate);

          // Update markets immediately
          setMarkets((prevMarkets) =>
            prevMarkets.map((m) => {
              if (m.id === 'usdt_irt') {
                return {
                  ...m,
                  price: newRate,
                  high24h: Math.max(m.high24h, newRate),
                  low24h: Math.min(m.low24h, newRate),
                };
              }
              if (m.id === 'irtg_irt') {
                const goldPrice = prevMarkets.find((pm) => pm.id === 'xau_usd')?.price || 4065;
                const multiplier = (newRate / 31.1035) * (750 / 999.9);
                const newG = Math.round(goldPrice * multiplier);
                return {
                  ...m,
                  price: newG,
                  high24h: Math.max(m.high24h, newG),
                  low24h: Math.min(m.low24h, newG),
                };
              }
              if (m.id === 'sekeh_irt') {
                const goldPrice = prevMarkets.find((pm) => pm.id === 'xau_usd')?.price || 4065;
                const sekehBase = ((goldPrice * newRate) / 31.1035) * 8.133 * 0.9;
                const newS = Math.round(sekehBase * 1.34);
                return {
                  ...m,
                  price: newS,
                  high24h: Math.max(m.high24h, newS),
                  low24h: Math.min(m.low24h, newS),
                };
              }
              if (m.id === 'aed_irt') {
                const newA = Math.round(newRate / 3.6725);
                return {
                  ...m,
                  price: newA,
                  high24h: Math.max(m.high24h, newA),
                  low24h: Math.min(m.low24h, newA),
                };
              }
              return m;
            })
          );

          // Update base anchor if currently viewing a Toman pair
          if (activeMarket.id === 'usdt_irt') {
            suspenseEngineRef.current.baseAnchorPrice = newRate;
            setCurrentPrice(newRate);
          }
        }
        return next;
      });
    },
    [activeMarket.id]
  );

  const updateAdminUser = useCallback((userId: string, updates: Partial<AdminUserRecord>) => {
    setAdminUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
    );
  }, []);

  const updateBrokerBankAccount = useCallback((cardNum: string, updates: Partial<BankAccountInfo>) => {
    setBrokerBankAccounts((prev) =>
      prev.map((b) => (b.cardNumber === cardNum ? { ...b, ...updates } : b))
    );
  }, []);

  const addBrokerBankAccount = useCallback((bank: BankAccountInfo) => {
    setBrokerBankAccounts((prev) => [bank, ...prev]);
  }, []);

  const approveDeposit = useCallback((txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txId
          ? { ...t, status: 'completed', note: 'تایید دستی توسط مدیر سیستم' }
          : t
      )
    );

    // If this was an Exchange card-to-card asset purchase, credit the crypto/gold asset!
    if (tx.creditAsset && tx.creditAmount && tx.creditAmount > 0) {
      const targetKey = tx.creditAsset as keyof WalletBalances;
      setBalances((prev) => ({
        ...prev,
        [targetKey]: ((prev[targetKey] as number) || 0) + tx.creditAmount!,
      }));

      const tomanCost = tx.tomanPaid || tx.amount;
      setExchangeLots((prev) => [
        {
          id: `lot_${Date.now()}`,
          asset: tx.creditAsset!,
          amount: tx.creditAmount!,
          costToman: tomanCost,
          unitPriceTomanAtBuy: Math.round(tomanCost / tx.creditAmount!),
          purchasedAt: Date.now(),
          accountMode: 'real',
        },
        ...prev,
      ]);
    } else {
      // Credit user's real IRT balance
      setBalances((prev) => ({
        ...prev,
        IRT: prev.IRT + tx.amount,
      }));
    }

    if (soundEnabled) playSoundTone('success');
  }, [transactions, soundEnabled]);

  const rejectDeposit = useCallback((txId: string, reason: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txId
          ? { ...t, status: 'rejected', note: `رد شده توسط مدیر: ${reason}` }
          : t
      )
    );
  }, []);

  const approveWithdrawal = useCallback((txId: string, payaCode: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txId
          ? {
              ...t,
              status: 'completed',
              trackingCode: payaCode,
              note: 'حواله پایا توسط ادمین تسویه و ارسال شد',
            }
          : t
      )
    );
    if (soundEnabled) playSoundTone('success');
  }, [soundEnabled]);

  const rejectWithdrawal = useCallback((txId: string, reason: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;

    // Refund user balance
    setBalances((prev) => ({
      ...prev,
      IRT: prev.IRT + tx.amount,
    }));

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txId
          ? { ...t, status: 'rejected', note: `لغو برداشت: ${reason}` }
          : t
      )
    );
  }, [transactions]);

  const adminClosePosition = useCallback((positionId: string) => {
    const pos = positions.find((p) => p.id === positionId);
    if (!pos) return;

    const returnedAmount = Math.max(0, pos.margin + pos.unrealizedPnl);
    const quoteKey = pos.marketSymbol.endsWith('/IRT') ? 'IRT' : 'USDT';

    setBalances((prev) => ({
      ...prev,
      [quoteKey]: prev[quoteKey as keyof WalletBalances] + returnedAmount,
    }));

    setTradeHistory((th) => [
      {
        id: `th_${Date.now()}`,
        marketSymbol: pos.marketSymbol,
        type: 'margin',
        side: pos.side === 'long' ? 'buy' : 'sell',
        entryPrice: pos.entryPrice,
        exitPrice: pos.currentPrice,
        amount: pos.amount,
        realizedPnl: pos.unrealizedPnl,
        leverage: pos.leverage,
        fee: pos.amount * pos.currentPrice * (brokerSettings.takerFeePercent / 100),
        timestamp: Date.now(),
      },
      ...th,
    ]);

    setPositions((prev) => prev.filter((p) => p.id !== positionId));
  }, [positions, brokerSettings.takerFeePercent]);

  // Place Order
  const placeOrder = useCallback(
    (params: PlaceOrderParams): { success: boolean; message: string } => {
      if (params.tradingMode === 'margin' && !brokerSettings.allowMarginTrading) {
        return {
          success: false,
          message: 'معاملات اهرمی موقتاً توسط مدیریت سیستم متوقف شده است.',
        };
      }

      const isDemo = accountMode === 'demo';
      const isTomanQuote = activeMarket.quoteAsset === 'IRT';
      const quoteCurrencyKey = isDemo
        ? isTomanQuote ? 'demo_IRT' : 'demo_USDT'
        : isTomanQuote ? 'IRT' : 'USDT';

      const currentBalance = balances[quoteCurrencyKey as keyof WalletBalances];
      const executionPrice =
        params.type === 'market' ? currentPrice : params.price || currentPrice;
      const totalCost = executionPrice * params.amount;
      const requiredMargin =
        params.tradingMode === 'margin' ? totalCost / params.leverage : totalCost;

      if (currentBalance < requiredMargin) {
        const unitName = isTomanQuote ? 'تومان' : 'تتر';
        return {
          success: false,
          message: `موجودی ناکافی! موجودی شما ${currentBalance.toLocaleString('fa-IR')} ${unitName} است، اما به ${requiredMargin.toLocaleString('fa-IR')} ${unitName} نیاز است.`,
        };
      }

      // Deduct margin or cost from balance
      setBalances((prev) => ({
        ...prev,
        [quoteCurrencyKey]:
          prev[quoteCurrencyKey as keyof WalletBalances] - requiredMargin,
      }));

      if (params.type === 'market') {
        if (soundEnabled) playSoundTone(params.side === 'buy' ? 'buy' : 'sell');

        if (params.tradingMode === 'margin') {
          const positionSide: 'long' | 'short' =
            params.side === 'buy' ? 'long' : 'short';
          const liqDistance = (executionPrice / params.leverage) * 0.9;
          const liquidationPrice =
            positionSide === 'long'
              ? Math.max(0, executionPrice - liqDistance)
              : executionPrice + liqDistance;

          const newPosition: Position = {
            id: `pos_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            marketId: activeMarket.id,
            marketSymbol: activeMarket.symbol,
            side: positionSide,
            entryPrice: executionPrice,
            currentPrice: executionPrice,
            amount: params.amount,
            margin: Number(requiredMargin.toFixed(2)),
            leverage: params.leverage,
            liquidationPrice: Number(
              liquidationPrice.toFixed(activeMarket.precision)
            ),
            takeProfit: params.takeProfit,
            stopLoss: params.stopLoss,
            unrealizedPnl: 0,
            unrealizedPnlPercent: 0,
            openedAt: Date.now(),
          };

          setPositions((prev) => [newPosition, ...prev]);
        } else {
          const baseKey = isDemo
            ? `demo_${activeMarket.baseAsset}`
            : activeMarket.baseAsset;
          if (params.side === 'buy') {
            setBalances((prev) => ({
              ...prev,
              [baseKey]:
                ((prev[baseKey as keyof WalletBalances] as number) || 0) +
                params.amount,
            }));
          } else {
            setBalances((prev) => ({
              ...prev,
              [quoteCurrencyKey]:
                prev[quoteCurrencyKey as keyof WalletBalances] + totalCost,
            }));
          }

          setTradeHistory((th) => [
            {
              id: `th_${Date.now()}`,
              marketSymbol: activeMarket.symbol,
              type: 'spot',
              side: params.side,
              entryPrice: executionPrice,
              amount: params.amount,
              fee: totalCost * (brokerSettings.takerFeePercent / 100),
              timestamp: Date.now(),
            },
            ...th,
          ]);
        }

        return {
          success: true,
          message: `سفارش مارکت ${params.side === 'buy' ? 'خرید' : 'فروش'} با موفقیت انجام شد.`,
        };
      } else {
        const newOrder: Order = {
          id: `ord_${Date.now()}`,
          marketId: activeMarket.id,
          marketSymbol: activeMarket.symbol,
          type: 'limit',
          side: params.side,
          tradingMode: params.tradingMode,
          price: params.price || executionPrice,
          amount: params.amount,
          total: totalCost,
          leverage: params.leverage,
          filled: 0,
          status: 'open',
          createdAt: Date.now(),
        };

        setOrders((prev) => [newOrder, ...prev]);
        return {
          success: true,
          message: `سفارش لیمیت در قیمت ${params.price?.toLocaleString('fa-IR')} ثبت گردید.`,
        };
      }
    },
    [
      accountMode,
      activeMarket,
      balances,
      currentPrice,
      soundEnabled,
      brokerSettings.allowMarginTrading,
      brokerSettings.takerFeePercent,
    ]
  );

  // Close Position
  const closePosition = useCallback(
    (positionId: string) => {
      const pos = positions.find((p) => p.id === positionId);
      if (!pos) return;

      const isDemo = accountMode === 'demo';
      const market = markets.find((m) => m.id === pos.marketId) || activeMarket;
      const isTomanQuote = market.quoteAsset === 'IRT';
      const quoteCurrencyKey = isDemo
        ? isTomanQuote ? 'demo_IRT' : 'demo_USDT'
        : isTomanQuote ? 'IRT' : 'USDT';

      const returnedAmount = Math.max(0, pos.margin + pos.unrealizedPnl);

      setBalances((prev) => ({
        ...prev,
        [quoteCurrencyKey]:
          prev[quoteCurrencyKey as keyof WalletBalances] + returnedAmount,
      }));

      setTradeHistory((th) => [
        {
          id: `th_${Date.now()}`,
          marketSymbol: pos.marketSymbol,
          type: 'margin',
          side: pos.side === 'long' ? 'buy' : 'sell',
          entryPrice: pos.entryPrice,
          exitPrice: pos.currentPrice,
          amount: pos.amount,
          realizedPnl: pos.unrealizedPnl,
          leverage: pos.leverage,
          fee: pos.amount * pos.currentPrice * (brokerSettings.takerFeePercent / 100),
          timestamp: Date.now(),
        },
        ...th,
      ]);

      if (soundEnabled) playSoundTone('success');
      setPositions((prev) => prev.filter((p) => p.id !== positionId));
    },
    [accountMode, activeMarket, markets, positions, soundEnabled, brokerSettings.takerFeePercent]
  );

  // Cancel Order
  const cancelOrder = useCallback(
    (orderId: string) => {
      const ord = orders.find((o) => o.id === orderId);
      if (!ord) return;

      const isDemo = accountMode === 'demo';
      const isTomanQuote = ord.marketSymbol.endsWith('/IRT');
      const quoteCurrencyKey = isDemo
        ? isTomanQuote ? 'demo_IRT' : 'demo_USDT'
        : isTomanQuote ? 'IRT' : 'USDT';
      const refunded =
        ord.tradingMode === 'margin' ? ord.total / ord.leverage : ord.total;

      setBalances((prev) => ({
        ...prev,
        [quoteCurrencyKey]:
          prev[quoteCurrencyKey as keyof WalletBalances] + refunded,
      }));

      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    },
    [accountMode, orders]
  );

  // Card-to-Card Deposit Submission
  const submitCardDeposit = useCallback(
    async (params: {
      amount: number;
      senderCardLast4: string;
      trackingCode: string;
      destBank: string;
      referenceId: string;
      creditAsUsdt?: boolean;
      usdtAmount?: number;
    }): Promise<{ success: boolean; message: string }> => {
      const isAutoApprove = params.amount <= brokerSettings.autoApproveDepositsUnder;
      const rate = brokerSettings.usdToTomanRate || 92800;
      const calculatedUsdt = params.usdtAmount || Number((params.amount / rate).toFixed(2));

      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        type: 'deposit_card',
        amount: params.creditAsUsdt ? calculatedUsdt : params.amount,
        currency: params.creditAsUsdt ? 'USDT' : 'IRT',
        status: isAutoApprove ? 'completed' : 'pending',
        referenceId: params.referenceId,
        trackingCode: params.trackingCode,
        senderCardLast4: params.senderCardLast4,
        destBank: params.destBank,
        timestamp: Date.now(),
        note: isAutoApprove
          ? params.creditAsUsdt
            ? `واریز ریالی و شارژ مستقیم ${calculatedUsdt} دلار به حساب`
            : 'تطبیق و تایید خودکار شتابی'
          : 'در صف بررسی دستی مدیریت بروکر',
      };

      setTransactions((prev) => [newTx, ...prev]);

      if (isAutoApprove) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setBalances((prev) => ({
          ...prev,
          IRT: params.creditAsUsdt ? prev.IRT : prev.IRT + params.amount,
          USDT: params.creditAsUsdt ? prev.USDT + calculatedUsdt : prev.USDT,
        }));
        if (soundEnabled) playSoundTone('success');
      }

      return {
        success: true,
        message: isAutoApprove
          ? params.creditAsUsdt
            ? `تراکنش تایید شد! معادل ${calculatedUsdt} دلار (USDT) به حساب شما افزوده شد.`
            : `تراکنش با موفقیت تایید شد! مبلغ ${params.amount.toLocaleString('fa-IR')} تومان به حساب افزوده شد.`
          : `فیش واریز ثبت گردید و جهت تایید نهایی به پنل مدیریت ارسال شد.`,
      };
    },
    [brokerSettings.autoApproveDepositsUnder, brokerSettings.usdToTomanRate, soundEnabled]
  );

  // Withdrawal submission (Bank Sheba)
  const submitWithdrawal = useCallback(
    async (params: {
      amount: number;
      cardNumber: string;
      sheba: string;
      bankName: string;
    }): Promise<{ success: boolean; message: string }> => {
      if (balances.IRT < params.amount) {
        return {
          success: false,
          message: 'موجودی تومانی شما برای این مبلغ برداشت کافی نیست.',
        };
      }

      setBalances((prev) => ({
        ...prev,
        IRT: prev.IRT - params.amount,
      }));

      const newTx: Transaction = {
        id: `tx_w_${Date.now()}`,
        type: 'withdraw_sheba',
        amount: params.amount,
        currency: 'IRT',
        status: 'pending',
        referenceId: `WTH-${Math.floor(Math.random() * 900000 + 100000)}`,
        trackingCode: `PAYA-${Date.now().toString().slice(-6)}`,
        senderCardLast4: params.cardNumber.slice(-4),
        destBank: params.bankName,
        timestamp: Date.now(),
        note: `درخواست تسویه ریالی به شبا ${params.sheba}`,
      };

      setTransactions((prev) => [newTx, ...prev]);

      if (soundEnabled) playSoundTone('sell');

      return {
        success: true,
        message: `درخواست برداشت ${params.amount.toLocaleString('fa-IR')} تومان ثبت شد و پس از تایید مدیریت در سیکل پایا واریز خواهد شد.`,
      };
    },
    [balances.IRT, soundEnabled]
  );

  // Tether (USDT) Crypto Withdrawal
  const submitCryptoWithdrawal = useCallback(
    async (params: {
      amount: number;
      address: string;
      network: string;
    }): Promise<{ success: boolean; message: string }> => {
      if (balances.USDT < params.amount) {
        return {
          success: false,
          message: 'موجودی تتری شما برای این مبلغ برداشت کافی نیست.',
        };
      }

      setBalances((prev) => ({
        ...prev,
        USDT: prev.USDT - params.amount,
      }));

      const newTx: Transaction = {
        id: `tx_cw_${Date.now()}`,
        type: 'withdraw_crypto',
        amount: params.amount,
        currency: 'USDT',
        status: 'pending',
        referenceId: `USDT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        trackingCode: `TX-${Date.now().toString().slice(-8)}`,
        timestamp: Date.now(),
        note: `برداشت تتر TRC20 به آدرس ${params.address.slice(0, 8)}...${params.address.slice(-6)}`,
      };

      setTransactions((prev) => [newTx, ...prev]);

      if (soundEnabled) playSoundTone('sell');

      return {
        success: true,
        message: `درخواست برداشت ${params.amount} تتر (شبکه ${params.network}) ثبت شد و پس از تایید مدیریت انتقال می‌یابد.`,
      };
    },
    [balances.USDT, soundEnabled]
  );

  // Deposit Crypto Balance
  const depositCryptoBalance = useCallback(
    (symbol: string, amount: number, networkName: string) => {
      const balanceKey = symbol === 'USDT' ? 'USDT' : symbol === 'BTC' ? 'BTC' : 'USDT';
      setBalances((prev) => ({
        ...prev,
        [balanceKey]: ((prev[balanceKey as keyof WalletBalances] as number) || 0) + amount,
      }));

      const newTx: Transaction = {
        id: `tx_c_${Date.now()}`,
        type: 'deposit_crypto',
        amount: amount,
        currency: (symbol === 'BTC' ? 'BTC' : 'USDT') as any,
        status: 'completed',
        referenceId: `TXID-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        trackingCode: `BLOCK-${Date.now().toString().slice(-6)}`,
        timestamp: Date.now(),
        note: `واریز رمزارزی موفق روی شبکه ${networkName}`,
      };

      setTransactions((prev) => [newTx, ...prev]);
      if (soundEnabled) playSoundTone('success');
    },
    [soundEnabled]
  );

  // Execute Instant Swap between assets
  const executeInstantSwap = useCallback(
    (
      fromCurrency: string,
      toCurrency: string,
      fromAmount: number,
      toAmount: number
    ): { success: boolean; message: string } => {
      const isDemo = accountMode === 'demo';
      const fromKey = isDemo ? `demo_${fromCurrency}` : fromCurrency;
      const toKey = isDemo ? `demo_${toCurrency}` : toCurrency;

      const currentFromBal = (balances[fromKey as keyof WalletBalances] as number) || 0;
      if (currentFromBal < fromAmount) {
        return {
          success: false,
          message: `موجودی ناکافی ${fromCurrency}! موجودی شما: ${currentFromBal}`,
        };
      }

      setBalances((prev) => ({
        ...prev,
        [fromKey]: ((prev[fromKey as keyof WalletBalances] as number) || 0) - fromAmount,
        [toKey]: ((prev[toKey as keyof WalletBalances] as number) || 0) + toAmount,
      }));

      setTransactions((prev) => [
        {
          id: `tx_swap_${Date.now()}`,
          type: 'trade_pnl',
          amount: toAmount,
          currency: (toCurrency === 'IRT' ? 'IRT' : toCurrency === 'BTC' ? 'BTC' : 'USDT') as any,
          status: 'completed',
          referenceId: `SWAP-${Date.now().toString().slice(-6)}`,
          timestamp: Date.now(),
          note: `تبدیل سریع ${fromAmount} ${fromCurrency} به ${toAmount} ${toCurrency} در صرافی داخلی`,
        },
        ...prev,
      ]);

      if (soundEnabled) playSoundTone('success');
      return {
        success: true,
        message: `تبدیل با موفقیت انجام شد: دریافت ${toAmount.toLocaleString('fa-IR')} ${toCurrency}`,
      };
    },
    [accountMode, balances, soundEnabled]
  );

  // Claim Referral Earnings
  const claimReferralEarnings = useCallback((): { success: boolean; message: string } => {
    if (referralProgram.withdrawableIRT <= 0) {
      return {
        success: false,
        message: 'در حال حاضر درآمد قابل برداشتی از زیرمجموعه وجود ندارد.',
      };
    }

    const claimAmt = referralProgram.withdrawableIRT;
    setBalances((prev) => ({
      ...prev,
      IRT: prev.IRT + claimAmt,
    }));

    setReferralProgram((prev) => ({
      ...prev,
      withdrawableIRT: 0,
    }));

    setTransactions((prev) => [
      {
        id: `tx_ref_${Date.now()}`,
        type: 'deposit_card',
        amount: claimAmt,
        currency: 'IRT',
        status: 'completed',
        referenceId: `REF-CLAIM-${Date.now().toString().slice(-6)}`,
        timestamp: Date.now(),
        note: 'تسویه و انتقال کمیسیون دائمی زیرمجموعه‌گیری به کیف پول اصلی',
      },
      ...prev,
    ]);

    if (soundEnabled) playSoundTone('success');
    return {
      success: true,
      message: `مبلغ ${claimAmt.toLocaleString('fa-IR')} تومان کمیسیون با موفقیت به کیف پول اصلی شما اضافه شد.`,
    };
  }, [referralProgram.withdrawableIRT, soundEnabled]);

  // Claim Bonus
  const claimBonus = useCallback(
    (bonusId: string): { success: boolean; message: string } => {
      const bonus = bonuses.find((b) => b.id === bonusId);
      if (!bonus || bonus.status !== 'available') {
        return {
          success: false,
          message: 'این پاداش قبلاً دریافت شده یا در دسترس نمی‌باشد.',
        };
      }

      const balKey = bonus.rewardCurrency === 'IRT' ? 'IRT' : bonus.rewardCurrency === 'USDT' ? 'USDT' : 'GOLD_GRAM';
      setBalances((prev) => ({
        ...prev,
        [balKey]: ((prev[balKey as keyof WalletBalances] as number) || 0) + bonus.rewardAmount,
      }));

      setBonuses((prev) =>
        prev.map((b) => (b.id === bonusId ? { ...b, status: 'claimed' } : b))
      );

      setTransactions((prev) => [
        {
          id: `tx_bon_${Date.now()}`,
          type: 'trade_pnl',
          amount: bonus.rewardAmount,
          currency: bonus.rewardCurrency as any,
          status: 'completed',
          referenceId: `BON-${Date.now().toString().slice(-6)}`,
          timestamp: Date.now(),
          note: `دریافت ${bonus.title}`,
        },
        ...prev,
      ]);

      if (soundEnabled) playSoundTone('success');
      return {
        success: true,
        message: `پاداش ${bonus.rewardText} با موفقیت دریافت و به حساب شما افزوده شد!`,
      };
    },
    [bonuses, soundEnabled]
  );

  // Submit KYC
  const submitKyc = useCallback(
    (data: {
      fullName: string;
      nationalCode: string;
      phoneNumber: string;
      email: string;
      birthDate: string;
      cardNumber: string;
      sheba: string;
      documentType: 'national_card' | 'driving_license' | 'passport';
      idCardImage?: string;
    }): boolean => {
      setKycInfo({
        fullName: data.fullName,
        nationalCode: data.nationalCode,
        phoneNumber: data.phoneNumber,
        email: data.email,
        birthDate: data.birthDate,
        isVerified: true,
        level: 2,
        documentType: data.documentType,
        idCardImage: data.idCardImage,
        registeredCardLast4: data.cardNumber.slice(-4),
        cardNumber: data.cardNumber,
        sheba: data.sheba,
        verificationStatus: 'verified',
      });

      setUserBankAccounts((prev) => [
        {
          id: `bank_${Date.now()}`,
          bankName: 'بانک عضو شتاب',
          cardNumber: data.cardNumber,
          sheba: data.sheba || 'IR000000000000000000000000',
          accountHolder: data.fullName,
          isDefault: true,
        },
        ...prev,
      ]);

      // Also register or update in admin users list so admin can inspect
      setAdminUsers((prev) => {
        const existing = prev.find((u) => u.nationalCode === data.nationalCode);
        if (existing) {
          return prev.map((u) =>
            u.nationalCode === data.nationalCode
              ? {
                  ...u,
                  fullName: data.fullName,
                  phoneNumber: data.phoneNumber,
                  email: data.email,
                  idCardImage: data.idCardImage,
                  registeredCardLast4: data.cardNumber.slice(-4),
                  sheba: data.sheba,
                  verificationStatus: 'verified',
                }
              : u
          );
        } else {
          return [
            {
              id: `usr_${Date.now()}`,
              fullName: data.fullName,
              nationalCode: data.nationalCode,
              phoneNumber: data.phoneNumber,
              email: data.email,
              balanceIRT: 35000000,
              balanceUSDT: 450,
              kycLevel: 2,
              isVerified: true,
              isBanned: false,
              registeredCardLast4: data.cardNumber.slice(-4),
              sheba: data.sheba,
              idCardImage: data.idCardImage,
              verificationStatus: 'verified',
              joinedAt: Date.now(),
              totalTradesCount: 1,
            },
            ...prev,
          ];
        }
      });

      if (soundEnabled) playSoundTone('success');
      return true;
    },
    [soundEnabled]
  );

  // Helper: Get live unit price in Toman for any investable asset
  const getAssetUnitPriceToman = useCallback(
    (asset: InvestableAssetSymbol): number => {
      const usdToToman =
        brokerSettings.usdToTomanRate ||
        markets.find((m) => m.id === 'usdt_irt')?.price ||
        95000;

      if (asset === 'USDT') return usdToToman;
      if (asset === 'GOLD_GRAM') {
        return markets.find((m) => m.id === 'irtg_irt')?.price || 9100000;
      }
      const marketIdMap: Record<string, string> = {
        BTC: 'btc_usdt',
        ETH: 'eth_usdt',
        SOL: 'sol_usdt',
        BNB: 'bnb_usdt',
        TON: 'ton_usdt',
        XRP: 'xrp_usdt',
      };
      const mId = marketIdMap[asset];
      const usdPrice = markets.find((m) => m.id === mId)?.price || 0;
      return Math.round(usdPrice * usdToToman);
    },
    [brokerSettings.usdToTomanRate, markets]
  );

  // Helper: Locked collateral amount for active loans in current account mode
  const getLockedCollateralAmount = useCallback(
    (asset: InvestableAssetSymbol): number => {
      return loans
        .filter(
          (l) =>
            l.status === 'active' &&
            l.accountMode === accountMode &&
            l.collateralAsset === asset
        )
        .reduce((sum, l) => sum + l.collateralAmount, 0);
    },
    [loans, accountMode]
  );

  // Exchange: Buy Crypto or Gold directly by Card-to-Card Rial/Toman deposit
  const submitExchangeCardPurchase = useCallback(
    async (params: {
      asset: InvestableAssetSymbol;
      tomanAmount: number;
      assetAmount: number;
      senderCardLast4: string;
      trackingCode: string;
      destBank: string;
      referenceId: string;
    }): Promise<{ success: boolean; message: string; autoApproved: boolean }> => {
      const isAutoApprove = params.tomanAmount <= brokerSettings.autoApproveDepositsUnder;
      const unitPrice = getAssetUnitPriceToman(params.asset);

      const newTx: Transaction = {
        id: `tx_exb_${Date.now()}`,
        type: 'exchange_buy',
        amount: params.tomanAmount,
        currency: 'IRT',
        status: isAutoApprove ? 'completed' : 'pending',
        referenceId: params.referenceId,
        trackingCode: params.trackingCode,
        senderCardLast4: params.senderCardLast4,
        destBank: params.destBank,
        creditAsset: params.asset,
        creditAmount: params.assetAmount,
        tomanPaid: params.tomanAmount,
        timestamp: Date.now(),
        note: isAutoApprove
          ? `خرید مستقیم ${params.assetAmount} ${params.asset} با واریز ${params.tomanAmount.toLocaleString('fa-IR')} تومان (نگهداری سرمایه‌گذاری)`
          : `درخواست خرید ${params.assetAmount} ${params.asset} به مبلغ ${params.tomanAmount.toLocaleString('fa-IR')} ت (در انتظار تایید مدیر)`,
      };

      setTransactions((prev) => [newTx, ...prev]);

      if (isAutoApprove) {
        await new Promise((resolve) => setTimeout(resolve, 1400));
        const targetKey = (
          accountMode === 'demo' ? `demo_${params.asset}` : params.asset
        ) as keyof WalletBalances;

        setBalances((prev) => ({
          ...prev,
          [targetKey]: ((prev[targetKey] as number) || 0) + params.assetAmount,
        }));

        setExchangeLots((prev) => [
          {
            id: `lot_${Date.now()}`,
            asset: params.asset,
            amount: params.assetAmount,
            costToman: params.tomanAmount,
            unitPriceTomanAtBuy: unitPrice,
            purchasedAt: Date.now(),
            accountMode,
          },
          ...prev,
        ]);

        if (soundEnabled) playSoundTone('success');
      }

      return {
        success: true,
        autoApproved: isAutoApprove,
        message: isAutoApprove
          ? `واریز تایید شد! مقدار ${params.assetAmount} ${params.asset} به کیف پول سرمایه‌گذاری شما واریز گردید.`
          : `فیش واریز ثبت شد و پس از تایید مدیر سیستم، دارایی ${params.asset} به کیف پول شما اضافه خواهد شد.`,
      };
    },
    [
      accountMode,
      brokerSettings.autoApproveDepositsUnder,
      getAssetUnitPriceToman,
      soundEnabled,
    ]
  );

  // Exchange: Sell unlocked Crypto/Gold back to Toman (IRT) for withdrawal or trading
  const sellExchangeAssetToToman = useCallback(
    (
      asset: InvestableAssetSymbol,
      assetAmount: number
    ): { success: boolean; message: string; tomanReceived: number } => {
      if (assetAmount <= 0) {
        return { success: false, message: 'مقدار معتبر برای فروش وارد کنید.', tomanReceived: 0 };
      }

      const balKey = (
        accountMode === 'demo' ? `demo_${asset}` : asset
      ) as keyof WalletBalances;
      const totalHeld = (balances[balKey] as number) || 0;
      const lockedAmt = getLockedCollateralAmount(asset);
      const availableToSell = Math.max(0, totalHeld - lockedAmt);

      if (assetAmount > availableToSell + 1e-9) {
        return {
          success: false,
          message:
            lockedAmt > 0
              ? `مقدار آزاد برای فروش ${availableToSell.toFixed(6)} ${asset} است (${lockedAmt.toFixed(6)} ${asset} در رهن وام ۷۰٪ قرار دارد).`
              : `موجودی ${asset} شما کافی نیست.`,
          tomanReceived: 0,
        };
      }

      const unitPrice = getAssetUnitPriceToman(asset);
      const tomanReceived = Math.round(assetAmount * unitPrice);
      const irtKey = (accountMode === 'demo' ? 'demo_IRT' : 'IRT') as keyof WalletBalances;

      setBalances((prev) => ({
        ...prev,
        [balKey]: Math.max(0, ((prev[balKey] as number) || 0) - assetAmount),
        [irtKey]: ((prev[irtKey] as number) || 0) + tomanReceived,
      }));

      setTransactions((prev) => [
        {
          id: `tx_exs_${Date.now()}`,
          type: 'exchange_sell',
          amount: tomanReceived,
          currency: 'IRT',
          status: 'completed',
          referenceId: `SELL-${Date.now().toString().slice(-6)}`,
          creditAsset: asset,
          creditAmount: assetAmount,
          timestamp: Date.now(),
          note: `فروش ${assetAmount} ${asset} و تبدیل به ${tomanReceived.toLocaleString('fa-IR')} تومان آماده برداشت/معامله`,
        },
        ...prev,
      ]);

      if (soundEnabled) playSoundTone('success');
      return {
        success: true,
        tomanReceived,
        message: `مقدار ${assetAmount} ${asset} با موفقیت به ${tomanReceived.toLocaleString('fa-IR')} تومان تبدیل و به موجودی نقدی شما اضافه شد.`,
      };
    },
    [accountMode, balances, getAssetUnitPriceToman, getLockedCollateralAmount, soundEnabled]
  );

  // 70% Asset-Backed Loan with 12% Interest
  const requestCollateralLoan = useCallback(
    (params: {
      collateralAsset: InvestableAssetSymbol;
      collateralAmount: number;
      loanCurrency: 'IRT' | 'USDT';
      monthsCount: number;
    }): { success: boolean; message: string; loan?: CollateralLoan } => {
      if (params.collateralAmount <= 0) {
        return { success: false, message: 'مقدار وثیقه باید بیشتر از صفر باشد.' };
      }

      const balKey = (
        accountMode === 'demo'
          ? `demo_${params.collateralAsset}`
          : params.collateralAsset
      ) as keyof WalletBalances;
      const totalHeld = (balances[balKey] as number) || 0;
      const lockedAmt = getLockedCollateralAmount(params.collateralAsset);
      const freeAmount = Math.max(0, totalHeld - lockedAmt);

      if (params.collateralAmount > freeAmount + 1e-9) {
        return {
          success: false,
          message: `موجودی آزاد کافی نیست. موجودی قابل وثیقه‌گذاری: ${freeAmount.toFixed(6)} ${params.collateralAsset}`,
        };
      }

      const unitPriceIRT = getAssetUnitPriceToman(params.collateralAsset);
      const collateralValueIRT = Math.round(params.collateralAmount * unitPriceIRT);
      const usdRate =
        brokerSettings.usdToTomanRate ||
        markets.find((m) => m.id === 'usdt_irt')?.price ||
        95000;

      // Strictly 70% LTV of collateral asset value
      const loanPrincipalIRT = Math.round(collateralValueIRT * 0.7);
      const principalAmount =
        params.loanCurrency === 'USDT'
          ? Number((loanPrincipalIRT / usdRate).toFixed(2))
          : loanPrincipalIRT;

      // 12% Interest
      const interestRatePercent = 12;
      const interestAmount =
        params.loanCurrency === 'USDT'
          ? Number((principalAmount * 0.12).toFixed(2))
          : Math.round(principalAmount * 0.12);
      const totalRepaymentAmount =
        params.loanCurrency === 'USDT'
          ? Number((principalAmount + interestAmount).toFixed(2))
          : principalAmount + interestAmount;

      const months = Math.max(1, params.monthsCount || 6);
      const installmentTotal =
        params.loanCurrency === 'USDT'
          ? Number((totalRepaymentAmount / months).toFixed(2))
          : Math.round(totalRepaymentAmount / months);
      const installmentPrincipal =
        params.loanCurrency === 'USDT'
          ? Number((principalAmount / months).toFixed(2))
          : Math.round(principalAmount / months);
      const installmentInterest =
        params.loanCurrency === 'USDT'
          ? Number((interestAmount / months).toFixed(2))
          : Math.round(interestAmount / months);

      const now = Date.now();
      const installments: LoanInstallment[] = Array.from({ length: months }, (_, i) => ({
        installmentNumber: i + 1,
        dueDate: now + (i + 1) * 30 * 24 * 60 * 60 * 1000,
        amount:
          i === months - 1
            ? Number((totalRepaymentAmount - installmentTotal * (months - 1)).toFixed(2))
            : installmentTotal,
        principalPart: installmentPrincipal,
        interestPart: installmentInterest,
        status: 'upcoming',
      }));

      const newLoan: CollateralLoan = {
        id: `loan_${Date.now()}`,
        accountMode,
        collateralAsset: params.collateralAsset,
        collateralAmount: params.collateralAmount,
        collateralValueAtOriginIRT: collateralValueIRT,
        loanCurrency: params.loanCurrency,
        principalAmount,
        interestRatePercent,
        interestAmount,
        totalRepaymentAmount,
        paidAmount: 0,
        remainingAmount: totalRepaymentAmount,
        monthsCount: months,
        installments,
        status: 'active',
        createdAt: now,
      };

      setLoans((prev) => [newLoan, ...prev]);

      // Immediately credit the 70% loan amount to user's trading/withdrawable balance
      const creditKey = (
        accountMode === 'demo' ? `demo_${params.loanCurrency}` : params.loanCurrency
      ) as keyof WalletBalances;
      setBalances((prev) => ({
        ...prev,
        [creditKey]: ((prev[creditKey] as number) || 0) + principalAmount,
      }));

      setTransactions((prev) => [
        {
          id: `tx_ln_${Date.now()}`,
          type: 'loan_disbursement',
          amount: principalAmount,
          currency: params.loanCurrency,
          status: 'completed',
          referenceId: `LOAN-${Date.now().toString().slice(-6)}`,
          creditAsset: params.collateralAsset,
          creditAmount: params.collateralAmount,
          timestamp: now,
          note: `دریافت وام ۷۰٪ (${principalAmount.toLocaleString('fa-IR')} ${params.loanCurrency}) با وثیقه ${params.collateralAmount} ${params.collateralAsset} (سود ۱۲٪)`,
        },
        ...prev,
      ]);

      if (soundEnabled) playSoundTone('success');
      return {
        success: true,
        loan: newLoan,
        message: `وام ۷۰ درصدی به مبلغ ${principalAmount.toLocaleString('fa-IR')} ${params.loanCurrency === 'IRT' ? 'تومان' : 'تتر'} با موفقیت به حساب شما واریز شد و اکنون قابل ترید یا برداشت است!`,
      };
    },
    [
      accountMode,
      balances,
      brokerSettings.usdToTomanRate,
      getAssetUnitPriceToman,
      getLockedCollateralAmount,
      markets,
      soundEnabled,
    ]
  );

  // Repay next installment or settle entire loan
  const payLoanInstallment = useCallback(
    (loanId: string, settleFull = false): { success: boolean; message: string } => {
      const loan = loans.find((l) => l.id === loanId);
      if (!loan || loan.status === 'settled') {
        return { success: false, message: 'این وام یافت نشد یا قبلاً تسویه شده است.' };
      }

      const nextIdx = loan.installments.findIndex((inst) => inst.status === 'upcoming');
      if (nextIdx === -1) {
        return { success: false, message: 'تمام اقساط این وام پرداخت شده است.' };
      }

      const amountToPay = settleFull
        ? loan.remainingAmount
        : loan.installments[nextIdx].amount;

      const payKey = (
        loan.accountMode === 'demo'
          ? `demo_${loan.loanCurrency}`
          : loan.loanCurrency
      ) as keyof WalletBalances;
      const availableBal = (balances[payKey] as number) || 0;

      if (availableBal < amountToPay) {
        const unitLabel = loan.loanCurrency === 'IRT' ? 'تومان' : 'تتر';
        return {
          success: false,
          message: `موجودی ${unitLabel} برای پرداخت ${settleFull ? 'تسویه کامل' : 'این قسط'} کافی نیست. مبلغ مورد نیاز: ${amountToPay.toLocaleString('fa-IR')} ${unitLabel}`,
        };
      }

      setBalances((prev) => ({
        ...prev,
        [payKey]: Math.max(0, ((prev[payKey] as number) || 0) - amountToPay),
      }));

      const now = Date.now();
      const updatedInstallments: LoanInstallment[] = loan.installments.map((inst, idx) => {
        if (settleFull || idx === nextIdx) {
          return inst.status === 'paid'
            ? inst
            : { ...inst, status: 'paid', paidAt: now };
        }
        return inst;
      });

      const newPaid = Number((loan.paidAmount + amountToPay).toFixed(2));
      const newRemaining = Math.max(
        0,
        Number((loan.totalRepaymentAmount - newPaid).toFixed(2))
      );
      const isNowSettled =
        settleFull ||
        newRemaining <= 0.01 ||
        updatedInstallments.every((i) => i.status === 'paid');

      setLoans((prev) =>
        prev.map((l) =>
          l.id === loanId
            ? {
                ...l,
                installments: updatedInstallments,
                paidAmount: isNowSettled ? l.totalRepaymentAmount : newPaid,
                remainingAmount: isNowSettled ? 0 : newRemaining,
                status: isNowSettled ? 'settled' : 'active',
                settledAt: isNowSettled ? now : undefined,
              }
            : l
        )
      );

      setTransactions((prev) => [
        {
          id: `tx_rep_${now}`,
          type: 'loan_repayment',
          amount: amountToPay,
          currency: loan.loanCurrency,
          status: 'completed',
          referenceId: `PAY-${now.toString().slice(-6)}`,
          timestamp: now,
          note: isNowSettled
            ? `تسویه کامل وام و آزادسازی وثیقه ${loan.collateralAmount} ${loan.collateralAsset}`
            : `پرداخت قسط شماره ${nextIdx + 1} از ${loan.monthsCount} وام وثیقه‌دار`,
        },
        ...prev,
      ]);

      if (soundEnabled) playSoundTone('success');
      return {
        success: true,
        message: isNowSettled
          ? `وام شما با موفقیت کامل تسویه شد و دارایی ${loan.collateralAmount} ${loan.collateralAsset} به‌طور کامل آزاد گردید!`
          : `قسط شماره ${nextIdx + 1} به مبلغ ${amountToPay.toLocaleString('fa-IR')} ${loan.loanCurrency === 'IRT' ? 'تومان' : 'تتر'} با موفقیت پرداخت شد.`,
      };
    },
    [balances, loans, soundEnabled]
  );

  return (
    <BrokerContext.Provider
      value={{
        markets,
        activeMarket,
        currentPrice,
        candles,
        timeframe,
        orderBook,
        recentTrades,
        accountMode,
        balances,
        positions,
        orders,
        tradeHistory,
        transactions,
        kycInfo,
        userBankAccounts,
        tickDirection,
        chartSuspenseLevel,
        setChartSuspenseLevel,
        dataProviderStatus,
        refreshHistoricalData,
        isAdminOpen,
        setIsAdminOpen,
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
        isCardDepositModalOpen,
        isWithdrawModalOpen,
        isWalletModalOpen,
        isKycModalOpen,
        isMarketsModalOpen,
        isCryptoDepositModalOpen,
        isSwapModalOpen,
        isReferralModalOpen,
        isRewardsModalOpen,
        isHamburgerMenuOpen,
        isSettingsModalOpen,
        isGmailModalOpen,
        isExchangeModalOpen,
        exchangeLots,
        loans,
        getAssetUnitPriceToman,
        getLockedCollateralAmount,
        referralProgram,
        bonuses,
        soundEnabled,
        selectMarket,
        setTimeframe,
        setAccountMode,
        placeOrder,
        closePosition,
        cancelOrder,
        submitCardDeposit,
        submitWithdrawal,
        submitCryptoWithdrawal,
        depositCryptoBalance,
        executeInstantSwap,
        claimBonus,
        claimReferralEarnings,
        submitKyc,
        submitExchangeCardPurchase,
        sellExchangeAssetToToman,
        requestCollateralLoan,
        payLoanInstallment,
        toggleSound,
        setCardDepositModalOpen,
        setWithdrawModalOpen,
        setWalletModalOpen,
        setKycModalOpen,
        setMarketsModalOpen,
        setCryptoDepositModalOpen,
        setSwapModalOpen,
        setReferralModalOpen,
        setRewardsModalOpen,
        setHamburgerMenuOpen,
        setSettingsModalOpen,
        setGmailModalOpen,
        setExchangeModalOpen,
        resetDemoBalance,
      }}
    >
      {children}
    </BrokerContext.Provider>
  );
};

export const useBroker = (): BrokerContextType => {
  const context = useContext(BrokerContext);
  if (!context) {
    throw new Error('useBroker must be used within a BrokerProvider');
  }
  return context;
};

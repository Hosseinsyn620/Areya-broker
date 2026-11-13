/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MarketCategory =
  | 'all'
  | 'gold'
  | 'commodities'
  | 'crypto'
  | 'forex'
  | 'us_stocks'
  | 'toman';

export interface Market {
  id: string;
  symbol: string;
  nameFa: string;
  category: MarketCategory;
  baseAsset: string;
  quoteAsset: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  precision: number;
  minAmount: number;
  maxLeverage: number;
  iconBg: string;
  isPopular?: boolean;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type OrderType = 'market' | 'limit';
export type OrderSide = 'buy' | 'sell';
export type PositionSide = 'long' | 'short';
export type TradingMode = 'spot' | 'margin';

export interface Position {
  id: string;
  marketId: string;
  marketSymbol: string;
  side: PositionSide;
  entryPrice: number;
  currentPrice: number;
  amount: number; // in base asset
  margin: number; // in quote asset (USDT or IRT)
  leverage: number;
  liquidationPrice: number;
  takeProfit?: number;
  stopLoss?: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  openedAt: number;
}

export interface Order {
  id: string;
  marketId: string;
  marketSymbol: string;
  type: OrderType;
  side: OrderSide;
  tradingMode: TradingMode;
  price: number;
  amount: number;
  total: number;
  leverage: number;
  filled: number;
  status: 'open' | 'filled' | 'cancelled';
  createdAt: number;
}

export interface TradeHistoryItem {
  id: string;
  marketSymbol: string;
  type: 'spot' | 'margin';
  side: OrderSide;
  entryPrice: number;
  exitPrice?: number;
  amount: number;
  realizedPnl?: number;
  leverage?: number;
  fee: number;
  timestamp: number;
}

export type InvestableAssetSymbol =
  | 'USDT'
  | 'BTC'
  | 'ETH'
  | 'SOL'
  | 'BNB'
  | 'TON'
  | 'XRP'
  | 'GOLD_GRAM';

export type CurrencyCode = 'IRT' | InvestableAssetSymbol;

export interface WalletBalances {
  // Real Account
  IRT: number; // Toman
  USDT: number;
  BTC: number;
  ETH: number;
  SOL: number;
  BNB: number;
  TON: number;
  XRP: number;
  GOLD_GRAM: number; // طلای ۱۸ عیار به گرم

  // Demo Account
  demo_IRT: number;
  demo_USDT: number;
  demo_BTC: number;
  demo_ETH: number;
  demo_SOL: number;
  demo_BNB: number;
  demo_TON: number;
  demo_XRP: number;
  demo_GOLD_GRAM: number;
}

export interface ExchangeInvestmentLot {
  id: string;
  asset: InvestableAssetSymbol;
  amount: number;
  costToman: number;
  unitPriceTomanAtBuy: number;
  purchasedAt: number;
  accountMode: 'real' | 'demo';
}

export interface LoanInstallment {
  installmentNumber: number;
  dueDate: number;
  amount: number; // principal + 12% interest share
  principalPart: number;
  interestPart: number;
  status: 'paid' | 'upcoming';
  paidAt?: number;
}

export interface CollateralLoan {
  id: string;
  accountMode: 'real' | 'demo';
  collateralAsset: InvestableAssetSymbol;
  collateralAmount: number;
  collateralValueAtOriginIRT: number;
  loanCurrency: 'IRT' | 'USDT';
  principalAmount: number; // 70% of collateral value
  interestRatePercent: number; // 12%
  interestAmount: number;
  totalRepaymentAmount: number; // principal * 1.12
  paidAmount: number;
  remainingAmount: number;
  monthsCount: number;
  installments: LoanInstallment[];
  status: 'active' | 'settled';
  createdAt: number;
  settledAt?: number;
}

export interface BankAccountInfo {
  id?: string;
  bankName: string;
  bankCode: string;
  cardPrefix: string;
  accountHolder: string;
  cardNumber: string;
  sheba: string;
  accountNumber: string;
  dailyLimit: string;
  active: boolean;
}

export interface UserBankAccount {
  id: string;
  bankName: string;
  cardNumber: string;
  sheba: string;
  accountHolder: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  type:
    | 'deposit_card'
    | 'deposit_crypto'
    | 'withdraw_sheba'
    | 'withdraw_crypto'
    | 'trade_pnl'
    | 'exchange_buy'
    | 'exchange_sell'
    | 'loan_disbursement'
    | 'loan_repayment';
  amount: number;
  currency: CurrencyCode;
  status: 'pending' | 'completed' | 'rejected';
  referenceId: string;
  trackingCode?: string;
  senderCardLast4?: string;
  destBank?: string;
  creditAsset?: InvestableAssetSymbol;
  creditAmount?: number;
  tomanPaid?: number;
  timestamp: number;
  note?: string;
}

export interface KycInfo {
  fullName: string;
  nationalCode: string;
  phoneNumber: string;
  email: string;
  birthDate: string;
  isVerified: boolean;
  level: 1 | 2;
  documentType: 'national_card' | 'driving_license' | 'passport';
  idCardImage?: string; // Base64 or object URL of uploaded identity document
  registeredCardLast4?: string;
  cardNumber?: string;
  sheba?: string;
  verificationStatus: 'unsubmitted' | 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  submittedAt?: number;
}

export interface CryptoNetworkOption {
  id: string;
  name: string;
  shortName: string;
  address: string;
  memo?: string;
  minDeposit: number;
  confirmations: number;
  estimatedTimeMin: number;
}

export interface CryptoDepositAsset {
  symbol: string;
  nameFa: string;
  iconBg: string;
  networks: CryptoNetworkOption[];
}

export interface InstantSwapQuote {
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  fee: number;
}

export interface ReferralInvitee {
  id: string;
  maskedPhone: string;
  joinedAt: number;
  totalVolumeIRT: number;
  commissionEarnedIRT: number;
  tier: string;
}

export interface ReferralProgram {
  code: string;
  link: string;
  commissionPercent: number; // 20% to 50%
  tierName: 'برنزی (۲۰٪)' | 'نقره‌ای (۳۰٪)' | 'طلایی (۴۰٪)' | 'الماس (۵۰٪)';
  totalInvited: number;
  activeTradersCount: number;
  totalEarnedIRT: number;
  totalEarnedUSDT: number;
  withdrawableIRT: number;
  invitees: ReferralInvitee[];
}

export interface BonusItem {
  id: string;
  title: string;
  description: string;
  rewardText: string;
  rewardAmount: number;
  rewardCurrency: 'IRT' | 'USDT' | 'GOLD_GRAM';
  status: 'available' | 'claimed' | 'locked';
  type: 'welcome' | 'deposit' | 'first_trade' | 'spin' | 'weekly';
  expiresInDays?: number;
}

export interface DataProviderStatus {
  name: string;
  source: 'kraken_spot' | 'coingecko' | 'coinbase' | 'bitget_live' | 'redundant_engine';
  isConnected: boolean;
  latencyMs: number;
  lastSyncTimestamp: number;
  serverRegion: string;
}

export interface BrokerSettings {
  makerFeePercent: number; // e.g. 0.04%
  takerFeePercent: number; // e.g. 0.06%
  spreadMarkupPercent: number; // e.g. 0.02%
  usdToTomanRate: number; // e.g. 92800 Toman per USD
  autoApproveDepositsUnder: number; // Toman
  allowMarginTrading: boolean;
  maxLeverageGlobal: number;
  activeDataProvider: 'kraken_spot' | 'coingecko' | 'coinbase' | 'bitget_live' | 'redundant_engine';
  maintenanceMode: boolean;
  
  // User customizable trading & display preferences
  oneClickTrading?: boolean;
  defaultLeverage?: number;
  candleColorTheme?: 'classic' | 'neon';
  showMaLines?: boolean;
  showVolume?: boolean;
  currencyDisplay?: 'IRT' | 'IRR';
  numberFormat?: 'fa' | 'en';
  chartSuspenseLevel?: 'high' | 'medium' | 'hyper';
  chartPulseAnimation?: boolean;
}

export interface AdminUserRecord {
  id: string;
  fullName: string;
  nationalCode: string;
  phoneNumber: string;
  email?: string;
  balanceIRT: number;
  balanceUSDT: number;
  kycLevel: 1 | 2;
  isVerified: boolean;
  isBanned: boolean;
  registeredCardLast4: string;
  sheba?: string;
  idCardImage?: string;
  verificationStatus: 'unsubmitted' | 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  joinedAt: number;
  totalTradesCount: number;
}



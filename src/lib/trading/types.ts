export interface Asset {
  id: string;
  symbol: string;
  name: string;
  category: "crypto" | "precious_metal" | "currency";
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap?: number;
  icon: string;
  sparkline?: number[];
}

export interface PriceHistory {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  sma20: number;
  sma50: number;
  ema12: number;
  ema26: number;
  atr: number;
  stochastic: {
    k: number;
    d: number;
  };
}

export type SignalStrength = "strong_buy" | "buy" | "neutral" | "sell" | "strong_sell";

export interface TradeSignal {
  asset: string;
  signal: SignalStrength;
  confidence: number;
  reasons: string[];
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  riskRewardRatio: number;
  timestamp: number;
}

export interface PortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  category: Asset["category"];
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercent: number;
  allocation: number;
}

export interface Portfolio {
  totalValue: number;
  totalInvested: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  availableBalance: number;
  assets: PortfolioAsset[];
  dailyChange: number;
  dailyChangePercent: number;
}

export interface TradeOrder {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  orderType: "market" | "limit" | "stop_loss" | "take_profit";
  quantity: number;
  price: number;
  total: number;
  status: "pending" | "executed" | "cancelled";
  timestamp: number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface TradeHistory {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  total: number;
  profitLoss?: number;
  timestamp: number;
}

export interface AIAnalysis {
  summary: string;
  sentiment: "bullish" | "bearish" | "neutral";
  indicators: TechnicalIndicators;
  signals: TradeSignal[];
  recommendation: string;
  riskLevel: "low" | "medium" | "high";
  marketTrend: "uptrend" | "downtrend" | "sideways";
  supportLevel: number;
  resistanceLevel: number;
}

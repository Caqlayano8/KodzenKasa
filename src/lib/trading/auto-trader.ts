import type { Asset, AIAnalysis } from "./types";
import { executeBuy, executeSell, getStoredAssets, getStoredBalance } from "./portfolio";

export interface AutoTraderConfig {
  enabled: boolean;
  maxPositionPercent: number;
  minConfidence: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  maxOpenPositions: number;
  tradeInterval: number;
  riskLevel: "conservative" | "moderate" | "aggressive";
}

export interface AutoTradeLog {
  id: string;
  timestamp: number;
  symbol: string;
  action: "buy" | "sell" | "hold" | "skip";
  reason: string;
  price: number;
  quantity: number;
  total: number;
  profitLoss?: number;
  confidence: number;
}

const STORAGE_KEYS = {
  CONFIG: "kodzen_autotrader_config",
  LOGS: "kodzen_autotrader_logs",
  RUNNING: "kodzen_autotrader_running",
} as const;

export function getDefaultConfig(): AutoTraderConfig {
  return {
    enabled: false,
    maxPositionPercent: 20,
    minConfidence: 45,
    stopLossPercent: 5,
    takeProfitPercent: 8,
    maxOpenPositions: 5,
    tradeInterval: 30000,
    riskLevel: "moderate",
  };
}

export function getAutoTraderConfig(): AutoTraderConfig {
  if (typeof window === "undefined") return getDefaultConfig();
  const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
  return stored ? JSON.parse(stored) : getDefaultConfig();
}

export function saveAutoTraderConfig(config: AutoTraderConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
}

export function getAutoTradeLogs(): AutoTradeLog[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.LOGS);
  return stored ? JSON.parse(stored) : [];
}

function addLog(log: AutoTradeLog): void {
  const logs = getAutoTradeLogs();
  logs.unshift(log);
  if (logs.length > 200) logs.splice(200);
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function getRiskMultiplier(riskLevel: AutoTraderConfig["riskLevel"]): number {
  switch (riskLevel) {
    case "conservative": return 0.6;
    case "moderate": return 1.0;
    case "aggressive": return 1.5;
  }
}

export function evaluateAndTrade(
  asset: Asset,
  analysis: AIAnalysis,
  config: AutoTraderConfig
): AutoTradeLog {
  const signal = analysis.signals[0];
  const balance = getStoredBalance();
  const holdings = getStoredAssets();
  const existingPosition = holdings.find((h) => h.symbol === asset.symbol);
  const riskMult = getRiskMultiplier(config.riskLevel);

  const baseLog: AutoTradeLog = {
    id: generateId(),
    timestamp: Date.now(),
    symbol: asset.symbol,
    action: "hold",
    reason: "",
    price: asset.price,
    quantity: 0,
    total: 0,
    confidence: signal?.confidence ?? 0,
  };

  if (!signal) {
    baseLog.action = "skip";
    baseLog.reason = "Analiz verisi bulunamadı";
    addLog(baseLog);
    return baseLog;
  }

  if (signal.confidence < config.minConfidence) {
    baseLog.action = "skip";
    baseLog.reason = `Güven oranı düşük (%${signal.confidence} < %${config.minConfidence})`;
    addLog(baseLog);
    return baseLog;
  }

  if (existingPosition) {
    const plPercent = existingPosition.profitLossPercent;

    if (plPercent <= -config.stopLossPercent) {
      const qty = existingPosition.quantity;
      const result = executeSell(asset.symbol, qty, asset.price);
      baseLog.action = "sell";
      baseLog.reason = `Stop-Loss tetiklendi (Zarar: %${plPercent.toFixed(1)})`;
      baseLog.quantity = qty;
      baseLog.total = qty * asset.price;
      baseLog.profitLoss = existingPosition.profitLoss;
      if (!result.success) {
        baseLog.action = "skip";
        baseLog.reason = `Satış başarısız: ${result.message}`;
      }
      addLog(baseLog);
      return baseLog;
    }

    if (plPercent >= config.takeProfitPercent) {
      const qty = existingPosition.quantity;
      const result = executeSell(asset.symbol, qty, asset.price);
      baseLog.action = "sell";
      baseLog.reason = `Kar Al tetiklendi (Kar: +%${plPercent.toFixed(1)})`;
      baseLog.quantity = qty;
      baseLog.total = qty * asset.price;
      baseLog.profitLoss = existingPosition.profitLoss;
      if (!result.success) {
        baseLog.action = "skip";
        baseLog.reason = `Satış başarısız: ${result.message}`;
      }
      addLog(baseLog);
      return baseLog;
    }

    if (signal.signal === "strong_sell" || signal.signal === "sell") {
      const sellPercent = signal.signal === "strong_sell" ? 1.0 : 0.5;
      const qty = existingPosition.quantity * sellPercent;
      if (qty > 0) {
        const result = executeSell(asset.symbol, qty, asset.price);
        baseLog.action = "sell";
        baseLog.reason = `${signal.signal === "strong_sell" ? "Güçlü satış" : "Satış"} sinyali (Güven: %${signal.confidence})`;
        baseLog.quantity = qty;
        baseLog.total = qty * asset.price;
        baseLog.profitLoss = qty * (asset.price - existingPosition.avgBuyPrice);
        if (!result.success) {
          baseLog.action = "skip";
          baseLog.reason = `Satış başarısız: ${result.message}`;
        }
        addLog(baseLog);
        return baseLog;
      }
    }

    baseLog.action = "hold";
    baseLog.reason = `Pozisyon korunuyor (K/Z: %${plPercent.toFixed(1)})`;
    addLog(baseLog);
    return baseLog;
  }

  if (signal.signal === "strong_buy" || signal.signal === "buy") {
    const openPositions = holdings.length;
    if (openPositions >= config.maxOpenPositions) {
      baseLog.action = "skip";
      baseLog.reason = `Maksimum pozisyon sayısına ulaşıldı (${openPositions}/${config.maxOpenPositions})`;
      addLog(baseLog);
      return baseLog;
    }

    const buyPercent = signal.signal === "strong_buy"
      ? config.maxPositionPercent * riskMult
      : (config.maxPositionPercent * 0.6) * riskMult;

    const maxInvestment = balance * (Math.min(buyPercent, 40) / 100);

    if (maxInvestment < 1) {
      baseLog.action = "skip";
      baseLog.reason = `Yetersiz bakiye (₺${balance.toFixed(2)})`;
      addLog(baseLog);
      return baseLog;
    }

    const quantity = maxInvestment / asset.price;

    const result = executeBuy(asset.symbol, asset.name, asset.category, quantity, asset.price);
    if (result.success) {
      baseLog.action = "buy";
      baseLog.reason = `${signal.signal === "strong_buy" ? "Güçlü alım" : "Alım"} sinyali (Güven: %${signal.confidence})`;
      baseLog.quantity = quantity;
      baseLog.total = quantity * asset.price;
    } else {
      baseLog.action = "skip";
      baseLog.reason = `Alım başarısız: ${result.message}`;
    }
    addLog(baseLog);
    return baseLog;
  }

  baseLog.action = "hold";
  baseLog.reason = `Sinyal nötr, işlem yapılmadı`;
  addLog(baseLog);
  return baseLog;
}

export function clearAutoTradeLogs(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.LOGS);
}

import type { TechnicalIndicators, TradeSignal, SignalStrength } from "./types";

interface SignalScore {
  score: number;
  reason: string;
}

function evaluateRSI(rsi: number): SignalScore {
  if (rsi < 20) return { score: 2, reason: "RSI aşırı satım bölgesinde (< 20) - Güçlü alım fırsatı" };
  if (rsi < 30) return { score: 1, reason: "RSI satım bölgesinde (< 30) - Alım fırsatı" };
  if (rsi > 80) return { score: -2, reason: "RSI aşırı alım bölgesinde (> 80) - Güçlü satım sinyali" };
  if (rsi > 70) return { score: -1, reason: "RSI alım bölgesinde (> 70) - Satım sinyali" };
  return { score: 0, reason: "RSI nötr bölgede" };
}

function evaluateMACD(macd: { macd: number; signal: number; histogram: number }): SignalScore {
  if (macd.histogram > 0 && macd.macd > macd.signal) {
    return { score: 1, reason: "MACD sinyal çizgisinin üzerinde - Yükseliş trendi" };
  }
  if (macd.histogram < 0 && macd.macd < macd.signal) {
    return { score: -1, reason: "MACD sinyal çizgisinin altında - Düşüş trendi" };
  }
  if (macd.histogram > 0 && macd.macd < 0) {
    return { score: 1.5, reason: "MACD kesişim yakın - Potansiyel yükseliş" };
  }
  return { score: 0, reason: "MACD nötr" };
}

function evaluateBollinger(
  price: number,
  bands: { upper: number; middle: number; lower: number }
): SignalScore {
  const range = bands.upper - bands.lower;
  if (range === 0) return { score: 0, reason: "Bollinger bantları hesaplanamadı" };

  const position = (price - bands.lower) / range;

  if (position < 0.1) return { score: 2, reason: "Fiyat alt Bollinger bandına çok yakın - Güçlü alım" };
  if (position < 0.2) return { score: 1, reason: "Fiyat alt Bollinger bandına yakın - Alım fırsatı" };
  if (position > 0.9) return { score: -2, reason: "Fiyat üst Bollinger bandına çok yakın - Güçlü satım" };
  if (position > 0.8) return { score: -1, reason: "Fiyat üst Bollinger bandına yakın - Satım sinyali" };
  return { score: 0, reason: "Fiyat Bollinger bantları ortasında" };
}

function evaluateMovingAverages(indicators: TechnicalIndicators, price: number): SignalScore {
  let score = 0;
  const reasons: string[] = [];

  if (price > indicators.sma20 && price > indicators.sma50) {
    score += 1;
    reasons.push("Fiyat SMA20 ve SMA50 üzerinde");
  } else if (price < indicators.sma20 && price < indicators.sma50) {
    score -= 1;
    reasons.push("Fiyat SMA20 ve SMA50 altında");
  }

  if (indicators.sma20 > indicators.sma50) {
    score += 0.5;
    reasons.push("SMA20 > SMA50 (Golden Cross)");
  } else if (indicators.sma20 < indicators.sma50) {
    score -= 0.5;
    reasons.push("SMA20 < SMA50 (Death Cross)");
  }

  if (indicators.ema12 > indicators.ema26) {
    score += 0.5;
    reasons.push("EMA12 > EMA26 - Kısa vadeli yükseliş");
  } else {
    score -= 0.5;
    reasons.push("EMA12 < EMA26 - Kısa vadeli düşüş");
  }

  return { score, reason: reasons.join(". ") };
}

function evaluateStochastic(stochastic: { k: number; d: number }): SignalScore {
  if (stochastic.k < 20 && stochastic.d < 20) {
    return { score: 1.5, reason: "Stokastik aşırı satım - Alım fırsatı" };
  }
  if (stochastic.k > 80 && stochastic.d > 80) {
    return { score: -1.5, reason: "Stokastik aşırı alım - Satım sinyali" };
  }
  if (stochastic.k > stochastic.d) {
    return { score: 0.5, reason: "Stokastik K > D - Yükseliş sinyali" };
  }
  return { score: -0.5, reason: "Stokastik K < D - Düşüş sinyali" };
}

function getSignalStrength(totalScore: number): SignalStrength {
  if (totalScore >= 4) return "strong_buy";
  if (totalScore >= 1.5) return "buy";
  if (totalScore <= -4) return "strong_sell";
  if (totalScore <= -1.5) return "sell";
  return "neutral";
}

export function generateSignal(
  assetSymbol: string,
  currentPrice: number,
  indicators: TechnicalIndicators
): TradeSignal {
  const evaluations = [
    evaluateRSI(indicators.rsi),
    evaluateMACD(indicators.macd),
    evaluateBollinger(currentPrice, indicators.bollingerBands),
    evaluateMovingAverages(indicators, currentPrice),
    evaluateStochastic(indicators.stochastic),
  ];

  const totalScore = evaluations.reduce((sum, e) => sum + e.score, 0);
  const maxPossibleScore = 7.5;
  const confidence = Math.min(
    Math.round((Math.abs(totalScore) / maxPossibleScore) * 100),
    95
  );

  const signal = getSignalStrength(totalScore);
  const reasons = evaluations
    .filter((e) => e.score !== 0)
    .map((e) => e.reason);

  const atrMultiplier = signal.includes("buy") ? 1.5 : 2;
  const stopLoss =
    signal === "strong_buy" || signal === "buy"
      ? currentPrice - indicators.atr * atrMultiplier
      : currentPrice + indicators.atr * atrMultiplier;

  const riskRewardRatio = 2.5;
  const risk = Math.abs(currentPrice - stopLoss);
  const takeProfit =
    signal === "strong_buy" || signal === "buy"
      ? currentPrice + risk * riskRewardRatio
      : currentPrice - risk * riskRewardRatio;

  return {
    asset: assetSymbol,
    signal,
    confidence,
    reasons,
    entryPrice: currentPrice,
    stopLoss: Math.round(stopLoss * 100) / 100,
    takeProfit: Math.round(takeProfit * 100) / 100,
    riskRewardRatio,
    timestamp: Date.now(),
  };
}

export function getSignalColor(signal: SignalStrength): string {
  switch (signal) {
    case "strong_buy": return "text-emerald-600";
    case "buy": return "text-green-500";
    case "neutral": return "text-gray-500";
    case "sell": return "text-orange-500";
    case "strong_sell": return "text-red-600";
  }
}

export function getSignalBgColor(signal: SignalStrength): string {
  switch (signal) {
    case "strong_buy": return "bg-emerald-100 border-emerald-300";
    case "buy": return "bg-green-50 border-green-300";
    case "neutral": return "bg-gray-50 border-gray-300";
    case "sell": return "bg-orange-50 border-orange-300";
    case "strong_sell": return "bg-red-100 border-red-300";
  }
}

export function getSignalLabel(signal: SignalStrength): string {
  switch (signal) {
    case "strong_buy": return "GÜÇLÜ AL";
    case "buy": return "AL";
    case "neutral": return "NÖTR";
    case "sell": return "SAT";
    case "strong_sell": return "GÜÇLÜ SAT";
  }
}

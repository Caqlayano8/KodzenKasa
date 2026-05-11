import type { PriceHistory, TechnicalIndicators } from "./types";

function sma(data: number[], period: number): number {
  if (data.length < period) return data[data.length - 1] ?? 0;
  const slice = data.slice(-period);
  return slice.reduce((sum, val) => sum + val, 0) / period;
}

function ema(data: number[], period: number): number {
  if (data.length === 0) return 0;
  if (data.length < period) return sma(data, data.length);
  const multiplier = 2 / (period + 1);
  let emaVal = sma(data.slice(0, period), period);
  for (let i = period; i < data.length; i++) {
    emaVal = (data[i] - emaVal) * multiplier + emaVal;
  }
  return emaVal;
}

export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change >= 0) gains += change;
    else losses += Math.abs(change);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export function calculateMACD(prices: number[]): {
  macd: number;
  signal: number;
  histogram: number;
} {
  if (prices.length < 26) return { macd: 0, signal: 0, histogram: 0 };

  const ema12Val = ema(prices, 12);
  const ema26Val = ema(prices, 26);
  const macdLine = ema12Val - ema26Val;

  const macdHistory: number[] = [];
  for (let i = 26; i <= prices.length; i++) {
    const e12 = ema(prices.slice(0, i), 12);
    const e26 = ema(prices.slice(0, i), 26);
    macdHistory.push(e12 - e26);
  }

  const signalLine = ema(macdHistory, 9);
  return {
    macd: macdLine,
    signal: signalLine,
    histogram: macdLine - signalLine,
  };
}

export function calculateBollingerBands(
  prices: number[],
  period: number = 20,
  stdDevMultiplier: number = 2
): { upper: number; middle: number; lower: number } {
  if (prices.length < period) {
    const avg = prices.reduce((s, v) => s + v, 0) / prices.length;
    return { upper: avg, middle: avg, lower: avg };
  }

  const slice = prices.slice(-period);
  const middle = slice.reduce((s, v) => s + v, 0) / period;
  const variance = slice.reduce((s, v) => s + Math.pow(v - middle, 2), 0) / period;
  const stdDev = Math.sqrt(variance);

  return {
    upper: middle + stdDevMultiplier * stdDev,
    middle,
    lower: middle - stdDevMultiplier * stdDev,
  };
}

export function calculateATR(candles: PriceHistory[], period: number = 14): number {
  if (candles.length < 2) return 0;

  const trueRanges: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;
    const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    trueRanges.push(tr);
  }

  if (trueRanges.length < period) {
    return trueRanges.reduce((s, v) => s + v, 0) / trueRanges.length;
  }

  return sma(trueRanges, period);
}

export function calculateStochastic(
  candles: PriceHistory[],
  kPeriod: number = 14,
  dPeriod: number = 3
): { k: number; d: number } {
  if (candles.length < kPeriod) return { k: 50, d: 50 };

  const kValues: number[] = [];
  for (let i = kPeriod - 1; i < candles.length; i++) {
    const slice = candles.slice(i - kPeriod + 1, i + 1);
    const highestHigh = Math.max(...slice.map((c) => c.high));
    const lowestLow = Math.min(...slice.map((c) => c.low));
    const range = highestHigh - lowestLow;
    const k = range === 0 ? 50 : ((candles[i].close - lowestLow) / range) * 100;
    kValues.push(k);
  }

  const currentK = kValues[kValues.length - 1];
  const d = sma(kValues, dPeriod);

  return { k: currentK, d };
}

export function calculateAllIndicators(candles: PriceHistory[]): TechnicalIndicators {
  const closes = candles.map((c) => c.close);

  return {
    rsi: calculateRSI(closes),
    macd: calculateMACD(closes),
    bollingerBands: calculateBollingerBands(closes),
    sma20: sma(closes, 20),
    sma50: sma(closes, 50),
    ema12: ema(closes, 12),
    ema26: ema(closes, 26),
    atr: calculateATR(candles),
    stochastic: calculateStochastic(candles),
  };
}

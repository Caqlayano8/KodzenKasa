import { NextResponse } from "next/server";
import { getAssetPriceHistory } from "@/lib/trading/market-data";
import { calculateAllIndicators } from "@/lib/trading/indicators";
import { generateSignal } from "@/lib/trading/signals";
import type { AIAnalysis } from "@/lib/trading/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const assetId = searchParams.get("asset") ?? "bitcoin";

  const history = getAssetPriceHistory(assetId);
  const indicators = calculateAllIndicators(history);
  const currentPrice = history[history.length - 1]?.close ?? 0;
  const signal = generateSignal(assetId, currentPrice, indicators);

  let sentiment: AIAnalysis["sentiment"] = "neutral";
  if (signal.signal === "strong_buy" || signal.signal === "buy") sentiment = "bullish";
  else if (signal.signal === "strong_sell" || signal.signal === "sell") sentiment = "bearish";

  let marketTrend: AIAnalysis["marketTrend"] = "sideways";
  if (indicators.sma20 > indicators.sma50) marketTrend = "uptrend";
  else if (indicators.sma20 < indicators.sma50) marketTrend = "downtrend";

  let riskLevel: AIAnalysis["riskLevel"] = "medium";
  if (indicators.atr / currentPrice > 0.05) riskLevel = "high";
  else if (indicators.atr / currentPrice < 0.02) riskLevel = "low";

  const analysis: AIAnalysis = {
    summary: generateSummary(sentiment, marketTrend, indicators, signal.confidence),
    sentiment,
    indicators,
    signals: [signal],
    recommendation: generateRecommendation(signal.signal, signal.confidence),
    riskLevel,
    marketTrend,
    supportLevel: indicators.bollingerBands.lower,
    resistanceLevel: indicators.bollingerBands.upper,
  };

  return NextResponse.json(analysis);
}

function generateSummary(
  sentiment: string,
  trend: string,
  indicators: ReturnType<typeof calculateAllIndicators>,
  confidence: number
): string {
  const trendText =
    trend === "uptrend" ? "yükseliş" : trend === "downtrend" ? "düşüş" : "yatay";
  const sentimentText =
    sentiment === "bullish" ? "pozitif" : sentiment === "bearish" ? "negatif" : "nötr";

  return `Piyasa analizi ${sentimentText} görünüm sergiliyor. Genel trend ${trendText} yönünde. RSI ${indicators.rsi.toFixed(1)} seviyesinde. MACD histogram ${indicators.macd.histogram > 0 ? "pozitif" : "negatif"} bölgede. Güven oranı: %${confidence}.`;
}

function generateRecommendation(signal: string, confidence: number): string {
  if (confidence < 30) return "Piyasa belirsiz, beklemede kalın.";

  switch (signal) {
    case "strong_buy":
      return "Güçlü alım sinyali! Teknik göstergeler alım yönünde. Stop-loss seviyelerini belirleyerek pozisyon açabilirsiniz.";
    case "buy":
      return "Alım fırsatı görünüyor. Kademeli alım stratejisi ile pozisyon oluşturabilirsiniz.";
    case "neutral":
      return "Piyasa kararsız. Mevcut pozisyonlarınızı koruyun, yeni giriş için bekleyin.";
    case "sell":
      return "Satım sinyali mevcut. Kar realizasyonu düşünebilirsiniz.";
    case "strong_sell":
      return "Güçlü satım sinyali! Stop-loss seviyelerinizi sıkılaştırın, pozisyon kapatmayı düşünün.";
    default:
      return "Analiz devam ediyor...";
  }
}

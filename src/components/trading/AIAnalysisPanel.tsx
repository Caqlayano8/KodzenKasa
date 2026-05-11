"use client";

import { useState, useEffect } from "react";
import type { Asset, AIAnalysis } from "@/lib/trading/types";
import { getSignalColor, getSignalBgColor, getSignalLabel } from "@/lib/trading/signals";

interface AIAnalysisPanelProps {
  asset: Asset;
}

function useAssetAnalysis(assetId: string, refreshKey: number) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    fetch(`/api/trading/analysis?asset=${assetId}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) { setAnalysis(data); setLoading(false); }
      })
      .catch(() => {
        if (!cancelled) { setAnalysis(null); setLoading(false); }
      });
    return () => { cancelled = true; controller.abort(); };
  }, [assetId, refreshKey]);

  return { analysis, loading };
}

export function AIAnalysisPanel({ asset }: AIAnalysisPanelProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const { analysis, loading } = useAssetAnalysis(asset.id, refreshKey);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="grid grid-cols-3 gap-4 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center text-gray-500">
        Analiz yüklenemedi. Tekrar deneyin.
      </div>
    );
  }

  const signal = analysis.signals[0];
  const indicators = analysis.indicators;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            Yapay Zeka Analizi - {asset.name}
          </h2>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            🔄 Yenile
          </button>
        </div>

        {signal && (
          <div className={`p-4 rounded-xl border-2 ${getSignalBgColor(signal.signal)}`}>
            <div className="flex items-center justify-between">
              <div>
                <span className={`text-2xl font-bold ${getSignalColor(signal.signal)}`}>
                  {getSignalLabel(signal.signal)}
                </span>
                <span className="ml-3 text-sm text-gray-600">
                  Güven: %{signal.confidence}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Risk/Ödül Oranı</div>
                <div className="font-bold text-gray-900">1:{signal.riskRewardRatio}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">📊 Özet</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{analysis.summary}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">💡 Öneri</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{analysis.recommendation}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <IndicatorCard label="RSI (14)" value={indicators.rsi.toFixed(1)} status={getIndicatorStatus("rsi", indicators.rsi)} />
          <IndicatorCard label="MACD" value={indicators.macd.histogram > 0 ? "Pozitif" : "Negatif"} status={indicators.macd.histogram > 0 ? "positive" : "negative"} />
          <IndicatorCard label="Trend" value={analysis.marketTrend === "uptrend" ? "Yükseliş" : analysis.marketTrend === "downtrend" ? "Düşüş" : "Yatay"} status={analysis.marketTrend === "uptrend" ? "positive" : analysis.marketTrend === "downtrend" ? "negative" : "neutral"} />
          <IndicatorCard label="Risk" value={analysis.riskLevel === "low" ? "Düşük" : analysis.riskLevel === "high" ? "Yüksek" : "Orta"} status={analysis.riskLevel === "low" ? "positive" : analysis.riskLevel === "high" ? "negative" : "neutral"} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-500">SMA 20</div>
            <div className="font-mono font-semibold text-gray-900">₺{indicators.sma20.toFixed(2)}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-500">SMA 50</div>
            <div className="font-mono font-semibold text-gray-900">₺{indicators.sma50.toFixed(2)}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-500">ATR</div>
            <div className="font-mono font-semibold text-gray-900">₺{indicators.atr.toFixed(2)}</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <div className="text-xs text-green-600">Destek Seviyesi</div>
            <div className="font-mono font-semibold text-green-700">₺{analysis.supportLevel.toFixed(2)}</div>
          </div>
          <div className="bg-red-50 rounded-xl p-3">
            <div className="text-xs text-red-600">Direnç Seviyesi</div>
            <div className="font-mono font-semibold text-red-700">₺{analysis.resistanceLevel.toFixed(2)}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-500">Stokastik K/D</div>
            <div className="font-mono font-semibold text-gray-900">
              {indicators.stochastic.k.toFixed(1)}/{indicators.stochastic.d.toFixed(1)}
            </div>
          </div>
        </div>

        {signal && signal.reasons.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">📋 Sinyal Sebepleri</h3>
            <ul className="space-y-1">
              {signal.reasons.map((reason, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {signal && (
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <div className="text-xs text-blue-600">Giriş Fiyatı</div>
              <div className="font-mono font-bold text-blue-700">₺{signal.entryPrice.toFixed(2)}</div>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <div className="text-xs text-red-600">Stop Loss</div>
              <div className="font-mono font-bold text-red-700">₺{signal.stopLoss.toFixed(2)}</div>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <div className="text-xs text-green-600">Kar Al</div>
              <div className="font-mono font-bold text-green-700">₺{signal.takeProfit.toFixed(2)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getIndicatorStatus(type: string, value: number): "positive" | "negative" | "neutral" {
  if (type === "rsi") {
    if (value < 30) return "positive";
    if (value > 70) return "negative";
    return "neutral";
  }
  return "neutral";
}

function IndicatorCard({ label, value, status }: { label: string; value: string; status: "positive" | "negative" | "neutral" }) {
  const colors = {
    positive: "bg-green-50 text-green-700 border-green-200",
    negative: "bg-red-50 text-red-700 border-red-200",
    neutral: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <div className={`rounded-xl p-3 border ${colors[status]}`}>
      <div className="text-xs opacity-70">{label}</div>
      <div className="font-bold text-lg">{value}</div>
    </div>
  );
}

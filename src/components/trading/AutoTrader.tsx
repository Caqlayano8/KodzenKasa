"use client";

import { useState, useEffect, useRef } from "react";
import type { Asset, AIAnalysis } from "@/lib/trading/types";
import {
  getAutoTraderConfig,
  saveAutoTraderConfig,
  evaluateAndTrade,
  getAutoTradeLogs,
  clearAutoTradeLogs,
} from "@/lib/trading/auto-trader";
import type { AutoTraderConfig, AutoTradeLog } from "@/lib/trading/auto-trader";

interface AutoTraderProps {
  assets: Asset[];
  onTradeComplete: () => void;
}

export function AutoTrader({ assets, onTradeComplete }: AutoTraderProps) {
  const [config, setConfig] = useState<AutoTraderConfig>(getAutoTraderConfig);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<AutoTradeLog[]>(() => getAutoTradeLogs());
  const [currentAsset, setCurrentAsset] = useState<string>("");
  const [showConfig, setShowConfig] = useState(false);
  const [stats, setStats] = useState(() => {
    const allLogs = getAutoTradeLogs();
    const trades = allLogs.filter((l) => l.action === "buy" || l.action === "sell");
    const sellTrades = allLogs.filter((l) => l.action === "sell" && l.profitLoss !== undefined);
    const winTrades = sellTrades.filter((l) => (l.profitLoss ?? 0) > 0);
    const totalPL = sellTrades.reduce((sum, l) => sum + (l.profitLoss ?? 0), 0);
    return {
      trades: trades.length,
      profit: totalPL,
      winRate: sellTrades.length > 0 ? (winTrades.length / sellTrades.length) * 100 : 0,
    };
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runningRef = useRef(false);

  function updateStats() {
    const allLogs = getAutoTradeLogs();
    const trades = allLogs.filter((l) => l.action === "buy" || l.action === "sell");
    const sellTrades = allLogs.filter((l) => l.action === "sell" && l.profitLoss !== undefined);
    const winTrades = sellTrades.filter((l) => (l.profitLoss ?? 0) > 0);
    const totalPL = sellTrades.reduce((sum, l) => sum + (l.profitLoss ?? 0), 0);
    setStats({
      trades: trades.length,
      profit: totalPL,
      winRate: sellTrades.length > 0 ? (winTrades.length / sellTrades.length) * 100 : 0,
    });
  }

  async function runCycle() {
    if (!runningRef.current || assets.length === 0) return;

    const tradableAssets = assets.filter((a) => a.category === "crypto" || a.category === "precious_metal");

    for (const asset of tradableAssets) {
      if (!runningRef.current) break;
      setCurrentAsset(asset.symbol);

      try {
        const res = await fetch(`/api/trading/analysis?asset=${asset.id}`);
        const analysis: AIAnalysis = await res.json();
        evaluateAndTrade(asset, analysis, config);
      } catch {
        // skip this asset
      }
    }

    setCurrentAsset("");
    setLogs(getAutoTradeLogs());
    updateStats();
    onTradeComplete();
  }

  function startBot() {
    runningRef.current = true;
    setRunning(true);
    saveAutoTraderConfig({ ...config, enabled: true });
    runCycle();
    intervalRef.current = setInterval(runCycle, config.tradeInterval);
  }

  function stopBot() {
    runningRef.current = false;
    setRunning(false);
    saveAutoTraderConfig({ ...config, enabled: false });
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCurrentAsset("");
  }

  function updateConfig(updates: Partial<AutoTraderConfig>) {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    saveAutoTraderConfig(newConfig);
  }

  function handleClearLogs() {
    clearAutoTradeLogs();
    setLogs([]);
    updateStats();
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const actionColors: Record<string, string> = {
    buy: "bg-green-100 text-green-700",
    sell: "bg-red-100 text-red-700",
    hold: "bg-blue-100 text-blue-700",
    skip: "bg-gray-100 text-gray-500",
  };

  const actionLabels: Record<string, string> = {
    buy: "ALIM",
    sell: "SATIM",
    hold: "BEKLE",
    skip: "GEÇ",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            Otomatik Trading Bot
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ⚙️ Ayarlar
            </button>
            {running ? (
              <button
                onClick={stopBot}
                className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold flex items-center gap-1"
              >
                <span className="w-2 h-2 bg-white rounded-sm" />
                DURDUR
              </button>
            ) : (
              <button
                onClick={startBot}
                className="px-4 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold flex items-center gap-1"
              >
                <span className="w-0 h-0 border-l-[8px] border-l-white border-y-[5px] border-y-transparent" />
                BAŞLAT
              </button>
            )}
          </div>
        </div>

        {running && (
          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-700 font-medium text-sm">
              Bot çalışıyor{currentAsset ? ` - ${currentAsset} analiz ediliyor...` : " - piyasalar taranıyor..."}
            </span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-500">Toplam İşlem</div>
            <div className="text-xl font-bold text-gray-900">{stats.trades}</div>
          </div>
          <div className={`rounded-xl p-3 text-center ${stats.profit >= 0 ? "bg-green-50" : "bg-red-50"}`}>
            <div className={`text-xs ${stats.profit >= 0 ? "text-green-600" : "text-red-600"}`}>Toplam K/Z</div>
            <div className={`text-xl font-bold ${stats.profit >= 0 ? "text-green-700" : "text-red-700"}`}>
              {stats.profit >= 0 ? "+" : ""}₺{stats.profit.toFixed(2)}
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <div className="text-xs text-blue-600">Kazanma Oranı</div>
            <div className="text-xl font-bold text-blue-700">%{stats.winRate.toFixed(0)}</div>
          </div>
        </div>
      </div>

      {showConfig && (
        <div className="p-4 border-b border-gray-100 bg-gray-50 space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm">Bot Ayarları</h3>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Risk Seviyesi</label>
            <div className="flex gap-2">
              {(["conservative", "moderate", "aggressive"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => updateConfig({ riskLevel: level })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    config.riskLevel === level
                      ? level === "conservative" ? "bg-blue-500 text-white"
                        : level === "moderate" ? "bg-yellow-500 text-white"
                        : "bg-red-500 text-white"
                      : "bg-white text-gray-600 border border-gray-200"
                  }`}
                >
                  {level === "conservative" ? "Düşük" : level === "moderate" ? "Orta" : "Yüksek"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Min. Güven Oranı (%)</label>
              <input
                type="number"
                value={config.minConfidence}
                onChange={(e) => updateConfig({ minConfidence: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                min={20} max={90}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Maks. Pozisyon (%)</label>
              <input
                type="number"
                value={config.maxPositionPercent}
                onChange={(e) => updateConfig({ maxPositionPercent: parseInt(e.target.value) || 10 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                min={5} max={50}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Stop-Loss (%)</label>
              <input
                type="number"
                value={config.stopLossPercent}
                onChange={(e) => updateConfig({ stopLossPercent: parseInt(e.target.value) || 3 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                min={1} max={20}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Kar Al (%)</label>
              <input
                type="number"
                value={config.takeProfitPercent}
                onChange={(e) => updateConfig({ takeProfitPercent: parseInt(e.target.value) || 5 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                min={2} max={50}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Maks. Pozisyon Sayısı</label>
              <input
                type="number"
                value={config.maxOpenPositions}
                onChange={(e) => updateConfig({ maxOpenPositions: parseInt(e.target.value) || 3 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                min={1} max={15}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Tarama Aralığı (sn)</label>
              <input
                type="number"
                value={config.tradeInterval / 1000}
                onChange={(e) => updateConfig({ tradeInterval: (parseInt(e.target.value) || 30) * 1000 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                min={10} max={300}
              />
            </div>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">İşlem Geçmişi</h3>
          {logs.length > 0 && (
            <button
              onClick={handleClearLogs}
              className="text-xs text-red-500 hover:text-red-600"
            >
              Temizle
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">🤖</div>
            <p className="text-sm">Bot henüz çalışmadı.</p>
            <p className="text-xs mt-1">Botu başlatarak otomatik al-sat işlemlerini başlatın.</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {logs.slice(0, 50).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${actionColors[log.action]}`}>
                    {actionLabels[log.action]}
                  </span>
                  <div>
                    <span className="font-semibold text-gray-900 text-sm">{log.symbol}</span>
                    <span className="text-gray-400 text-xs ml-2">
                      {new Date(log.timestamp).toLocaleTimeString("tr-TR")}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  {log.total > 0 && (
                    <div className="text-xs font-mono text-gray-700">₺{log.total.toFixed(2)}</div>
                  )}
                  {log.profitLoss !== undefined && (
                    <div className={`text-[10px] font-mono ${log.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {log.profitLoss >= 0 ? "+" : ""}₺{log.profitLoss.toFixed(2)}
                    </div>
                  )}
                  {log.total === 0 && (
                    <div className="text-[10px] text-gray-400 max-w-[200px] truncate">{log.reason}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

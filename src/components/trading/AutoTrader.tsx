"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  const [cycleCount, setCycleCount] = useState(0);
  const [lastAction, setLastAction] = useState<AutoTradeLog | null>(null);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [stats, setStats] = useState(() => {
    const allLogs = getAutoTradeLogs();
    const trades = allLogs.filter((l) => l.action === "buy" || l.action === "sell");
    const buyTrades = allLogs.filter((l) => l.action === "buy");
    const sellTrades = allLogs.filter((l) => l.action === "sell" && l.profitLoss !== undefined);
    const winTrades = sellTrades.filter((l) => (l.profitLoss ?? 0) > 0);
    const totalPL = sellTrades.reduce((sum, l) => sum + (l.profitLoss ?? 0), 0);
    const totalBought = buyTrades.reduce((sum, l) => sum + l.total, 0);
    return {
      trades: trades.length,
      profit: totalPL,
      winRate: sellTrades.length > 0 ? (winTrades.length / sellTrades.length) * 100 : 0,
      totalBought,
      buyCount: buyTrades.length,
      sellCount: sellTrades.length,
    };
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runningRef = useRef(false);
  const startTimeRef = useRef(0);

  const updateStats = useCallback(() => {
    const allLogs = getAutoTradeLogs();
    const trades = allLogs.filter((l) => l.action === "buy" || l.action === "sell");
    const buyTrades = allLogs.filter((l) => l.action === "buy");
    const sellTrades = allLogs.filter((l) => l.action === "sell" && l.profitLoss !== undefined);
    const winTrades = sellTrades.filter((l) => (l.profitLoss ?? 0) > 0);
    const totalPL = sellTrades.reduce((sum, l) => sum + (l.profitLoss ?? 0), 0);
    const totalBought = buyTrades.reduce((sum, l) => sum + l.total, 0);
    setStats({
      trades: trades.length,
      profit: totalPL,
      winRate: sellTrades.length > 0 ? (winTrades.length / sellTrades.length) * 100 : 0,
      totalBought,
      buyCount: buyTrades.length,
      sellCount: sellTrades.length,
    });
  }, []);

  async function runCycle() {
    if (!runningRef.current || assets.length === 0) return;

    const tradableAssets = assets.filter((a) => a.category === "crypto" || a.category === "precious_metal");
    setScanProgress({ current: 0, total: tradableAssets.length });

    for (let i = 0; i < tradableAssets.length; i++) {
      if (!runningRef.current) break;
      const asset = tradableAssets[i];
      setCurrentAsset(asset.symbol);
      setScanProgress({ current: i + 1, total: tradableAssets.length });

      try {
        const res = await fetch(`/api/trading/analysis?asset=${asset.id}`);
        const analysis: AIAnalysis = await res.json();
        const result = evaluateAndTrade(asset, analysis, config);
        setLastAction(result);
        setLogs(getAutoTradeLogs());
        updateStats();
      } catch {
        // skip this asset on error
      }
    }

    setCurrentAsset("");
    setScanProgress({ current: 0, total: 0 });
    setCycleCount((c) => c + 1);
    setLogs(getAutoTradeLogs());
    updateStats();
    onTradeComplete();
  }

  function startBot() {
    runningRef.current = true;
    setRunning(true);
    setCycleCount(0);
    startTimeRef.current = Date.now();
    setElapsedTime(0);
    saveAutoTraderConfig({ ...config, enabled: true });

    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

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
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCurrentAsset("");
    setScanProgress({ current: 0, total: 0 });
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
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  const actionColors: Record<string, string> = {
    buy: "bg-green-100 text-green-700 border border-green-200",
    sell: "bg-red-100 text-red-700 border border-red-200",
    hold: "bg-blue-100 text-blue-700 border border-blue-200",
    skip: "bg-gray-100 text-gray-500 border border-gray-200",
  };

  const actionLabels: Record<string, string> = {
    buy: "ALIM",
    sell: "SATIM",
    hold: "BEKLE",
    skip: "GEÇ",
  };

  const actionEmojis: Record<string, string> = {
    buy: "🟢",
    sell: "🔴",
    hold: "🔵",
    skip: "⚪",
  };

  return (
    <div className="space-y-4">
      {/* Bot Control Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              Otomatik Trading Bot
              {running && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-green-500 text-white rounded-full animate-pulse">
                  CANLI
                </span>
              )}
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
                  className="px-5 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-bold flex items-center gap-2 shadow-lg shadow-red-200"
                >
                  <span className="w-2.5 h-2.5 bg-white rounded-sm" />
                  DURDUR
                </button>
              ) : (
                <button
                  onClick={startBot}
                  className="px-5 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-bold flex items-center gap-2 shadow-lg shadow-green-200"
                >
                  <span className="w-0 h-0 border-l-[10px] border-l-white border-y-[6px] border-y-transparent" />
                  BAŞLAT
                </button>
              )}
            </div>
          </div>

          {/* Live Status Panel */}
          {running && (
            <div className="space-y-3 mb-4">
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-800 font-bold text-sm">Bot Aktif</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-green-700">
                    <span>⏱ {formatTime(elapsedTime)}</span>
                    <span>🔄 Döngü: {cycleCount}</span>
                    <span>📡 {config.tradeInterval / 1000}sn aralık</span>
                  </div>
                </div>

                {currentAsset ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-green-700 font-medium text-sm">
                          🔍 {currentAsset} analiz ediliyor...
                        </span>
                        <span className="text-green-600 text-xs">
                          {scanProgress.current}/{scanProgress.total}
                        </span>
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-1.5">
                        <div
                          className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${scanProgress.total > 0 ? (scanProgress.current / scanProgress.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-green-600 text-sm">
                    ⏳ Sonraki tarama bekleniyor... ({config.tradeInterval / 1000} saniye)
                  </div>
                )}
              </div>

              {/* Last Action Notification */}
              {lastAction && (
                <div className={`p-3 rounded-xl flex items-center justify-between ${
                  lastAction.action === "buy" ? "bg-green-50 border border-green-200" :
                  lastAction.action === "sell" ? "bg-red-50 border border-red-200" :
                  "bg-gray-50 border border-gray-200"
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{actionEmojis[lastAction.action]}</span>
                    <div>
                      <span className="font-bold text-sm text-gray-900">
                        Son İşlem: {actionLabels[lastAction.action]} - {lastAction.symbol}
                      </span>
                      <p className="text-xs text-gray-500">{lastAction.reason}</p>
                    </div>
                  </div>
                  {lastAction.total > 0 && (
                    <span className="font-mono font-bold text-sm">₺{lastAction.total.toFixed(2)}</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-500">Toplam İşlem</div>
              <div className="text-xl font-bold text-gray-900">{stats.trades}</div>
              <div className="text-[10px] text-gray-400">{stats.buyCount} alım / {stats.sellCount} satım</div>
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
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <div className="text-xs text-purple-600">Toplam Yatırım</div>
              <div className="text-xl font-bold text-purple-700">₺{stats.totalBought.toFixed(0)}</div>
            </div>
          </div>
        </div>

        {/* Config Panel */}
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
                  min={5} max={90}
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

        {/* Trade History Log */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Canlı İşlem Akışı</h3>
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
              <p className="text-xs mt-1">Yukarıdaki <strong>BAŞLAT</strong> butonuna basarak otomatik al-sat işlemlerini başlatın.</p>
            </div>
          ) : (
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {logs.slice(0, 50).map((log) => (
                <div key={log.id} className={`flex items-center justify-between p-2.5 rounded-lg ${
                  log.action === "buy" || log.action === "sell" ? "bg-white border border-gray-200 shadow-sm" : "bg-gray-50"
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{actionEmojis[log.action]}</span>
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
                      <div className="text-xs font-mono font-bold text-gray-700">₺{log.total.toFixed(2)}</div>
                    )}
                    {log.profitLoss !== undefined && (
                      <div className={`text-[10px] font-mono font-bold ${log.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {log.profitLoss >= 0 ? "+" : ""}₺{log.profitLoss.toFixed(2)}
                      </div>
                    )}
                    {log.total === 0 && (
                      <div className="text-[10px] text-gray-400 max-w-[220px] truncate">{log.reason}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Integration Guide */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <details className="group">
          <summary className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-colors">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span>🔗</span> Gerçek Piyasa Entegrasyonu Rehberi
            </h3>
            <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="p-4 pt-0 border-t border-gray-100 space-y-4 text-sm text-gray-700">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="font-semibold text-amber-800">⚠️ Önemli Uyarı</p>
              <p className="text-amber-700 text-xs mt-1">
                Gerçek parayla işlem yapmak risk içerir. Hiçbir sistem %100 kâr garantisi veremez.
                Yatırabileceğinizden fazlasını riske atmayın.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-2">📋 Adım 1: Borsa Hesabı Açın</h4>
              <p>Türkiye&apos;den erişilebilen borsalar:</p>
              <ul className="list-disc ml-5 mt-1 space-y-1 text-xs">
                <li><strong>Binance</strong> - binance.com (En büyük kripto borsası)</li>
                <li><strong>BtcTurk</strong> - btcturk.com (Türk lirası desteği)</li>
                <li><strong>Paribu</strong> - paribu.com (Türk lirası desteği)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-2">🔑 Adım 2: API Anahtarı Oluşturun</h4>
              <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-2">
                <p><strong>Binance için:</strong></p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>binance.com → Hesap → API Yönetimi</li>
                  <li>&quot;API Oluştur&quot; butonuna tıklayın</li>
                  <li>API Key ve Secret Key&apos;i kopyalayın</li>
                  <li>IP kısıtlaması ekleyin (sunucu IP&apos;nizi)</li>
                  <li>&quot;Spot Trading&quot; iznini aktif edin</li>
                  <li>&quot;Çekim&quot; iznini <strong>kapalı</strong> tutun (güvenlik)</li>
                </ol>
                <p className="mt-2"><strong>BtcTurk için:</strong></p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>pro.btcturk.com → Ayarlar → API Anahtarları</li>
                  <li>Yeni API anahtarı oluşturun</li>
                  <li>Public ve Private key&apos;leri kopyalayın</li>
                </ol>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-2">⚙️ Adım 3: Projeye Entegre Edin</h4>
              <div className="bg-gray-900 rounded-lg p-3 text-xs text-green-400 font-mono">
                <p className="text-gray-500"># .env dosyasına ekleyin:</p>
                <p>BINANCE_API_KEY=&quot;api_anahtarınız&quot;</p>
                <p>BINANCE_SECRET_KEY=&quot;gizli_anahtarınız&quot;</p>
                <p className="mt-1 text-gray-500"># veya BtcTurk için:</p>
                <p>BTCTURK_PUBLIC_KEY=&quot;public_key&quot;</p>
                <p>BTCTURK_PRIVATE_KEY=&quot;private_key&quot;</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-2">🚀 Adım 4: Canlıya Geçirin</h4>
              <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-2">
                <p><strong>Vercel ile deploy:</strong></p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>vercel.com&apos;a GitHub ile giriş yapın</li>
                  <li>KodzenKasa reposunu import edin</li>
                  <li>Environment Variables&apos;a API anahtarlarını ekleyin</li>
                  <li>&quot;Deploy&quot; butonuna basın</li>
                </ol>
                <p className="mt-2"><strong>VPS ile deploy:</strong></p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>Bir VPS kiralayın (DigitalOcean, Hetzner, vb.)</li>
                  <li>Node.js 18+ yükleyin</li>
                  <li><code>git clone</code> + <code>npm install</code> + <code>npm run build</code></li>
                  <li><code>npm start</code> ile uygulamayı başlatın</li>
                  <li>PM2 ile sürekli çalışmasını sağlayın: <code>pm2 start npm -- start</code></li>
                </ol>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-2">💡 Gerçek Trading İçin Gerekli Kod Değişiklikleri</h4>
              <p className="text-xs text-gray-600">
                Şu an simülasyon modunda çalışıyor. Gerçek trading için <code>market-data.ts</code> dosyasında
                borsa API&apos;sine bağlantı ve <code>portfolio.ts</code> dosyasında gerçek emirlerin
                borsaya gönderilmesi gerekiyor. Bu entegrasyon için Binance veya BtcTurk API SDK&apos;sı kullanılabilir:
              </p>
              <div className="bg-gray-900 rounded-lg p-3 text-xs text-green-400 font-mono mt-2">
                <p className="text-gray-500"># Binance SDK yükleyin:</p>
                <p>npm install binance-api-node</p>
                <p className="mt-1 text-gray-500"># veya ccxt (çoklu borsa desteği):</p>
                <p>npm install ccxt</p>
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

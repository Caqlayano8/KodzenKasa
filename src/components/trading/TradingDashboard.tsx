"use client";

import { useState, useEffect, useRef } from "react";
import type { Asset, Portfolio } from "@/lib/trading/types";
import { getPortfolio } from "@/lib/trading/portfolio";
import { AssetTable } from "./AssetTable";
import { AIAnalysisPanel } from "./AIAnalysisPanel";
import { TradePanel } from "./TradePanel";
import { PortfolioPanel } from "./PortfolioPanel";

function usePriceFetcher() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const assetsRef = useRef<Asset[]>([]);

  useEffect(() => {
    let cancelled = false;

    function doFetch() {
      fetch("/api/trading/prices")
        .then((res) => res.json())
        .then((data: Asset[]) => {
          if (cancelled) return;
          setAssets(data);
          assetsRef.current = data;
          setLastUpdate(new Date());
          const priceMap: Record<string, number> = {};
          data.forEach((a) => { priceMap[a.symbol] = a.price; });
          setPortfolio(getPortfolio(priceMap));
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    doFetch();
    const interval = setInterval(doFetch, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  function refreshPortfolio() {
    const priceMap: Record<string, number> = {};
    assetsRef.current.forEach((a) => { priceMap[a.symbol] = a.price; });
    setPortfolio(getPortfolio(priceMap));
  }

  function manualRefresh() {
    setLoading(true);
    fetch("/api/trading/prices")
      .then((res) => res.json())
      .then((data: Asset[]) => {
        setAssets(data);
        assetsRef.current = data;
        setLastUpdate(new Date());
        const priceMap: Record<string, number> = {};
        data.forEach((a) => { priceMap[a.symbol] = a.price; });
        setPortfolio(getPortfolio(priceMap));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  return { assets, portfolio, loading, lastUpdate, refreshPortfolio, manualRefresh };
}

export function TradingDashboard() {
  const { assets, portfolio, loading, lastUpdate, refreshPortfolio, manualRefresh } = usePriceFetcher();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Piyasa verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <span className="text-3xl">📊</span>
                KodzenKasa Trading
              </h1>
              <p className="text-blue-200 text-sm mt-1">
                Yapay Zeka Destekli Akıllı Yatırım Platformu
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-blue-300">Son Güncelleme</div>
              <div className="text-sm font-mono">{lastUpdate.toLocaleTimeString("tr-TR")}</div>
              <button
                onClick={manualRefresh}
                className="mt-1 px-3 py-1 text-xs bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                🔄 Yenile
              </button>
            </div>
          </div>

          {portfolio && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              <QuickStat label="Portföy Değeri" value={`₺${portfolio.totalValue.toFixed(2)}`} />
              <QuickStat label="Kullanılabilir" value={`₺${portfolio.availableBalance.toFixed(2)}`} />
              <QuickStat
                label="Toplam K/Z"
                value={`${portfolio.totalProfitLoss >= 0 ? "+" : ""}₺${portfolio.totalProfitLoss.toFixed(2)}`}
                positive={portfolio.totalProfitLoss >= 0}
              />
              <QuickStat
                label="K/Z Oranı"
                value={`${portfolio.totalProfitLossPercent >= 0 ? "+" : ""}${portfolio.totalProfitLossPercent.toFixed(2)}%`}
                positive={portfolio.totalProfitLossPercent >= 0}
              />
              <QuickStat label="Varlık Sayısı" value={`${portfolio.assets.length}`} />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {portfolio && <PortfolioPanel portfolio={portfolio} onRefresh={refreshPortfolio} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AssetTable
              assets={assets}
              onSelectAsset={setSelectedAsset}
              selectedAssetId={selectedAsset?.id}
            />
          </div>
          <div className="space-y-6">
            {selectedAsset ? (
              <>
                <TradePanel asset={selectedAsset} onTradeComplete={refreshPortfolio} />
                <AIAnalysisPanel asset={selectedAsset} />
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="text-6xl mb-4">👈</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Varlık Seçin</h3>
                <p className="text-gray-500 text-sm">
                  Piyasalar tablosundan bir varlık seçerek yapay zeka analizini görüntüleyin ve alım-satım yapın.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickStat({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-xl p-3">
      <div className="text-xs text-blue-200">{label}</div>
      <div className={`text-lg font-bold font-mono ${
        positive === true ? "text-green-400" : positive === false ? "text-red-400" : "text-white"
      }`}>
        {value}
      </div>
    </div>
  );
}

"use client";

import type { Portfolio } from "@/lib/trading/types";
import { getTradeHistory, resetPortfolio } from "@/lib/trading/portfolio";
import { useState } from "react";

interface PortfolioPanelProps {
  portfolio: Portfolio;
  onRefresh: () => void;
}

export function PortfolioPanel({ portfolio, onRefresh }: PortfolioPanelProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const history = getTradeHistory();

  function handleReset() {
    resetPortfolio(100);
    setShowResetConfirm(false);
    onRefresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">💼 Portföy</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {showHistory ? "Portföy" : "Geçmiş"}
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              Sıfırla
            </button>
          </div>
        </div>

        {showResetConfirm && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700 mb-2">Portföyü sıfırlamak istediğinize emin misiniz? (100 TL başlangıç)</p>
            <div className="flex gap-2">
              <button onClick={handleReset} className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                Evet, Sıfırla
              </button>
              <button onClick={() => setShowResetConfirm(false)} className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                İptal
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
            <div className="text-xs opacity-80">Toplam Değer</div>
            <div className="text-xl font-bold font-mono">₺{portfolio.totalValue.toFixed(2)}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-500">Kullanılabilir</div>
            <div className="text-xl font-bold font-mono text-gray-900">₺{portfolio.availableBalance.toFixed(2)}</div>
          </div>
          <div className={`rounded-xl p-4 ${portfolio.totalProfitLoss >= 0 ? "bg-green-50" : "bg-red-50"}`}>
            <div className={`text-xs ${portfolio.totalProfitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
              Toplam K/Z
            </div>
            <div className={`text-xl font-bold font-mono ${portfolio.totalProfitLoss >= 0 ? "text-green-700" : "text-red-700"}`}>
              {portfolio.totalProfitLoss >= 0 ? "+" : ""}₺{portfolio.totalProfitLoss.toFixed(2)}
            </div>
          </div>
          <div className={`rounded-xl p-4 ${portfolio.totalProfitLossPercent >= 0 ? "bg-green-50" : "bg-red-50"}`}>
            <div className={`text-xs ${portfolio.totalProfitLossPercent >= 0 ? "text-green-600" : "text-red-600"}`}>
              K/Z Oranı
            </div>
            <div className={`text-xl font-bold font-mono ${portfolio.totalProfitLossPercent >= 0 ? "text-green-700" : "text-red-700"}`}>
              {portfolio.totalProfitLossPercent >= 0 ? "+" : ""}{portfolio.totalProfitLossPercent.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {!showHistory ? (
        <div className="p-4">
          {portfolio.assets.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">📭</div>
              <p>Henüz varlığınız bulunmuyor.</p>
              <p className="text-sm">Piyasalardan alım yaparak portföyünüzü oluşturun.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {portfolio.assets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-semibold text-gray-900">{asset.symbol}</div>
                    <div className="text-xs text-gray-500">{asset.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-gray-600">{asset.quantity.toFixed(6)}</div>
                    <div className="text-xs text-gray-400">Ort: ₺{asset.avgBuyPrice.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold text-gray-900">₺{asset.totalValue.toFixed(2)}</div>
                    <div className={`text-xs font-mono ${asset.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {asset.profitLoss >= 0 ? "+" : ""}₺{asset.profitLoss.toFixed(2)} ({asset.profitLossPercent.toFixed(1)}%)
                    </div>
                  </div>
                  <div className="w-16">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min(100, asset.allocation)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 text-center mt-0.5">%{asset.allocation.toFixed(1)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4">
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">📋</div>
              <p>Henüz işlem geçmişi bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {history.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      trade.type === "buy" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {trade.type === "buy" ? "AL" : "SAT"}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{trade.symbol}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(trade.timestamp).toLocaleString("tr-TR")}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-gray-900">₺{trade.total.toFixed(2)}</div>
                    {trade.profitLoss !== undefined && (
                      <div className={`text-xs font-mono ${trade.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {trade.profitLoss >= 0 ? "+" : ""}₺{trade.profitLoss.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

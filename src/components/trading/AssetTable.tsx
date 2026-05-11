"use client";

import { useState } from "react";
import type { Asset } from "@/lib/trading/types";
import { SparklineChart } from "./SparklineChart";

interface AssetTableProps {
  assets: Asset[];
  onSelectAsset: (asset: Asset) => void;
  selectedAssetId?: string;
}

type SortField = "name" | "price" | "change" | "volume";
type SortDir = "asc" | "desc";

function formatPrice(price: number): string {
  if (price >= 1000000) return `₺${(price / 1000000).toFixed(2)}M`;
  if (price >= 1000) return `₺${price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 1) return `₺${price.toFixed(2)}`;
  return `₺${price.toFixed(4)}`;
}

function formatVolume(volume: number): string {
  if (volume >= 1e9) return `₺${(volume / 1e9).toFixed(1)}B`;
  if (volume >= 1e6) return `₺${(volume / 1e6).toFixed(1)}M`;
  if (volume >= 1e3) return `₺${(volume / 1e3).toFixed(1)}K`;
  return `₺${volume.toFixed(0)}`;
}

export function AssetTable({ assets, onSelectAsset, selectedAssetId }: AssetTableProps) {
  const [filter, setFilter] = useState<"all" | Asset["category"]>("all");
  const [sortField, setSortField] = useState<SortField>("volume");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = filter === "all" ? assets : assets.filter((a) => a.category === filter);

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case "name": cmp = a.name.localeCompare(b.name); break;
      case "price": cmp = a.price - b.price; break;
      case "change": cmp = a.priceChangePercent24h - b.priceChangePercent24h; break;
      case "volume": cmp = a.volume24h - b.volume24h; break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  function handleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  }

  const categoryLabels: Record<string, string> = {
    all: "Tümü",
    crypto: "Kripto",
    precious_metal: "Değerli Maden",
    currency: "Döviz",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Piyasalar</h2>
        </div>
        <div className="flex gap-2">
          {(["all", "crypto", "precious_metal", "currency"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-500 border-b border-gray-100">
              <th className="text-left px-4 py-3 cursor-pointer hover:text-gray-900" onClick={() => handleSort("name")}>
                Varlık {sortField === "name" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th className="text-right px-4 py-3 cursor-pointer hover:text-gray-900" onClick={() => handleSort("price")}>
                Fiyat {sortField === "price" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th className="text-right px-4 py-3 cursor-pointer hover:text-gray-900" onClick={() => handleSort("change")}>
                24s Değişim {sortField === "change" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th className="text-right px-4 py-3 hidden md:table-cell">Grafik</th>
              <th className="text-right px-4 py-3 cursor-pointer hover:text-gray-900 hidden sm:table-cell" onClick={() => handleSort("volume")}>
                Hacim {sortField === "volume" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th className="text-right px-4 py-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((asset) => (
              <tr
                key={asset.id}
                onClick={() => onSelectAsset(asset)}
                className={`border-b border-gray-50 cursor-pointer transition-colors ${
                  selectedAssetId === asset.id ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{asset.icon}</span>
                    <div>
                      <div className="font-semibold text-gray-900">{asset.symbol}</div>
                      <div className="text-xs text-gray-500">{asset.name}</div>
                    </div>
                  </div>
                </td>
                <td className="text-right px-4 py-3 font-mono font-semibold text-gray-900">
                  {formatPrice(asset.price)}
                </td>
                <td className="text-right px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium ${
                      asset.priceChangePercent24h >= 0
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {asset.priceChangePercent24h >= 0 ? "+" : ""}
                    {asset.priceChangePercent24h.toFixed(2)}%
                  </span>
                </td>
                <td className="text-right px-4 py-3 hidden md:table-cell">
                  {asset.sparkline && <SparklineChart data={asset.sparkline} />}
                </td>
                <td className="text-right px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                  {formatVolume(asset.volume24h)}
                </td>
                <td className="text-right px-4 py-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelectAsset(asset); }}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Analiz
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

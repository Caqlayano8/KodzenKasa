"use client";

import { useState } from "react";
import type { Asset } from "@/lib/trading/types";
import { executeBuy, executeSell, getStoredAssets, getStoredBalance } from "@/lib/trading/portfolio";

interface TradePanelProps {
  asset: Asset;
  onTradeComplete: () => void;
}

export function TradePanel({ asset, onTradeComplete }: TradePanelProps) {
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const balance = getStoredBalance();
  const holdings = getStoredAssets().find((a) => a.symbol === asset.symbol);
  const numericAmount = parseFloat(amount) || 0;
  const total = numericAmount * asset.price;

  function handleTrade() {
    if (numericAmount <= 0) {
      setMessage({ text: "Geçerli bir miktar giriniz.", type: "error" });
      return;
    }

    let result;
    if (mode === "buy") {
      result = executeBuy(asset.symbol, asset.name, asset.category, numericAmount, asset.price);
    } else {
      result = executeSell(asset.symbol, numericAmount, asset.price);
    }

    setMessage({ text: result.message, type: result.success ? "success" : "error" });
    if (result.success) {
      setAmount("");
      onTradeComplete();
    }
  }

  function setMaxAmount() {
    if (mode === "buy") {
      const maxQty = balance / asset.price;
      setAmount(maxQty.toFixed(6));
    } else if (holdings) {
      setAmount(holdings.quantity.toString());
    }
  }

  function setPercentage(pct: number) {
    if (mode === "buy") {
      const maxQty = (balance * pct) / 100 / asset.price;
      setAmount(maxQty.toFixed(6));
    } else if (holdings) {
      const qty = (holdings.quantity * pct) / 100;
      setAmount(qty.toFixed(6));
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => { setMode("buy"); setMessage(null); }}
          className={`flex-1 py-3 text-center font-semibold transition-colors ${
            mode === "buy" ? "bg-green-500 text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          }`}
        >
          AL
        </button>
        <button
          onClick={() => { setMode("sell"); setMessage(null); }}
          className={`flex-1 py-3 text-center font-semibold transition-colors ${
            mode === "sell" ? "bg-red-500 text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          }`}
        >
          SAT
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {mode === "buy" ? "Kullanılabilir Bakiye" : `${asset.symbol} Miktarı`}
          </span>
          <span className="font-semibold text-gray-900">
            {mode === "buy" ? `₺${balance.toFixed(2)}` : `${holdings?.quantity.toFixed(6) ?? "0"} ${asset.symbol}`}
          </span>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Fiyat
          </label>
          <div className="relative">
            <input
              type="text"
              value={`₺${asset.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`}
              readOnly
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Miktar ({asset.symbol})
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setMessage(null); }}
              placeholder="0.00"
              step="any"
              min="0"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
            <button
              onClick={setMaxAmount}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
            >
              MAX
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              onClick={() => setPercentage(pct)}
              className="flex-1 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              %{pct}
            </button>
          ))}
        </div>

        <div className="bg-gray-50 rounded-xl p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Toplam</span>
            <span className="font-semibold font-mono text-gray-900">₺{total.toFixed(2)}</span>
          </div>
          {mode === "buy" && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Kalan Bakiye</span>
              <span className="font-mono text-gray-600">₺{Math.max(0, balance - total).toFixed(2)}</span>
            </div>
          )}
        </div>

        {message && (
          <div className={`p-3 rounded-xl text-sm ${
            message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            {message.text}
          </div>
        )}

        <button
          onClick={handleTrade}
          disabled={numericAmount <= 0}
          className={`w-full py-3 rounded-xl font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            mode === "buy"
              ? "bg-green-500 hover:bg-green-600"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {mode === "buy" ? `${asset.symbol} AL` : `${asset.symbol} SAT`}
        </button>
      </div>
    </div>
  );
}

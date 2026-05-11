import type { PortfolioAsset, TradeHistory } from "./types";

const STORAGE_KEYS = {
  PORTFOLIO: "kodzen_portfolio",
  ORDERS: "kodzen_orders",
  HISTORY: "kodzen_history",
  BALANCE: "kodzen_balance",
} as const;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function getStoredBalance(): number {
  if (typeof window === "undefined") return 100;
  const stored = localStorage.getItem(STORAGE_KEYS.BALANCE);
  return stored ? parseFloat(stored) : 100;
}

export function setStoredBalance(balance: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.BALANCE, balance.toString());
}

export function getStoredAssets(): PortfolioAsset[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.PORTFOLIO);
  return stored ? JSON.parse(stored) : [];
}

export function setStoredAssets(assets: PortfolioAsset[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(assets));
}

export function getTradeHistory(): TradeHistory[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
  return stored ? JSON.parse(stored) : [];
}

function addToHistory(trade: TradeHistory): void {
  const history = getTradeHistory();
  history.unshift(trade);
  if (history.length > 100) history.pop();
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

export function executeBuy(
  symbol: string,
  name: string,
  category: PortfolioAsset["category"],
  quantity: number,
  price: number
): { success: boolean; message: string } {
  const total = quantity * price;
  const balance = getStoredBalance();

  if (total > balance) {
    return { success: false, message: `Yetersiz bakiye. Mevcut: ₺${balance.toFixed(2)}, Gerekli: ₺${total.toFixed(2)}` };
  }

  const assets = getStoredAssets();
  const existing = assets.find((a) => a.symbol === symbol);

  if (existing) {
    const newTotal = existing.quantity * existing.avgBuyPrice + total;
    existing.quantity += quantity;
    existing.avgBuyPrice = newTotal / existing.quantity;
  } else {
    assets.push({
      id: generateId(),
      symbol,
      name,
      category,
      quantity,
      avgBuyPrice: price,
      currentPrice: price,
      totalValue: total,
      profitLoss: 0,
      profitLossPercent: 0,
      allocation: 0,
    });
  }

  setStoredAssets(assets);
  setStoredBalance(balance - total);

  addToHistory({
    id: generateId(),
    symbol,
    type: "buy",
    quantity,
    price,
    total,
    timestamp: Date.now(),
  });

  return { success: true, message: `${quantity} ${symbol} başarıyla satın alındı. Toplam: ₺${total.toFixed(2)}` };
}

export function executeSell(
  symbol: string,
  quantity: number,
  price: number
): { success: boolean; message: string; profitLoss?: number } {
  const assets = getStoredAssets();
  const existing = assets.find((a) => a.symbol === symbol);

  if (!existing || existing.quantity < quantity) {
    return { success: false, message: `Yetersiz ${symbol} miktarı.` };
  }

  const total = quantity * price;
  const costBasis = quantity * existing.avgBuyPrice;
  const profitLoss = total - costBasis;
  const balance = getStoredBalance();

  existing.quantity -= quantity;

  const updatedAssets = assets.filter((a) => a.quantity > 0);
  setStoredAssets(updatedAssets);
  setStoredBalance(balance + total);

  addToHistory({
    id: generateId(),
    symbol,
    type: "sell",
    quantity,
    price,
    total,
    profitLoss,
    timestamp: Date.now(),
  });

  const plText = profitLoss >= 0 ? `+₺${profitLoss.toFixed(2)}` : `-₺${Math.abs(profitLoss).toFixed(2)}`;
  return {
    success: true,
    message: `${quantity} ${symbol} satıldı. Toplam: ₺${total.toFixed(2)} (K/Z: ${plText})`,
    profitLoss,
  };
}

export function getPortfolio(currentPrices: Record<string, number>): Portfolio {
  const assets = getStoredAssets();
  const balance = getStoredBalance();

  let totalInvested = 0;
  let totalCurrentValue = 0;

  const updatedAssets = assets.map((asset) => {
    const currentPrice = currentPrices[asset.symbol] ?? asset.currentPrice;
    const totalValue = asset.quantity * currentPrice;
    const costBasis = asset.quantity * asset.avgBuyPrice;
    const profitLoss = totalValue - costBasis;
    const profitLossPercent = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;

    totalInvested += costBasis;
    totalCurrentValue += totalValue;

    return {
      ...asset,
      currentPrice,
      totalValue,
      profitLoss,
      profitLossPercent,
      allocation: 0,
    };
  });

  const portfolioTotal = totalCurrentValue + balance;
  updatedAssets.forEach((asset) => {
    asset.allocation = portfolioTotal > 0 ? (asset.totalValue / portfolioTotal) * 100 : 0;
  });

  const totalProfitLoss = totalCurrentValue - totalInvested;
  const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  return {
    totalValue: portfolioTotal,
    totalInvested,
    totalProfitLoss,
    totalProfitLossPercent,
    availableBalance: balance,
    assets: updatedAssets,
    dailyChange: totalProfitLoss * 0.1,
    dailyChangePercent: totalProfitLossPercent * 0.1,
  };
}

export function resetPortfolio(initialBalance: number = 100): void {
  setStoredBalance(initialBalance);
  setStoredAssets([]);
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
  }
}

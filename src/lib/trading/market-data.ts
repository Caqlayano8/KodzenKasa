import type { Asset, PriceHistory } from "./types";

const CRYPTO_API = "https://api.coingecko.com/api/v3";

interface CoinGeckoMarket {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  market_cap: number;
  sparkline_in_7d?: { price: number[] };
}

const ASSET_ICONS: Record<string, string> = {
  BTC: "₿",
  ETH: "Ξ",
  BNB: "🔶",
  SOL: "◎",
  XRP: "✕",
  ADA: "₳",
  DOGE: "Ð",
  DOT: "●",
  AVAX: "🔺",
  MATIC: "⬡",
  GOLD: "🥇",
  SILVER: "🥈",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

const TRY_RATE = 38.5;

function generateRealisticSparkline(basePrice: number, volatility: number): number[] {
  const points: number[] = [];
  let price = basePrice * (0.95 + Math.random() * 0.1);
  for (let i = 0; i < 24; i++) {
    const change = (Math.random() - 0.48) * volatility * price;
    price = Math.max(price * 0.9, price + change);
    points.push(price);
  }
  points.push(basePrice);
  return points;
}

function generatePriceHistory(basePrice: number, days: number, volatility: number): PriceHistory[] {
  const history: PriceHistory[] = [];
  let price = basePrice * (0.85 + Math.random() * 0.3);
  const now = Date.now();

  for (let i = days; i >= 0; i--) {
    const change = (Math.random() - 0.48) * volatility * price;
    price = Math.max(price * 0.8, price + change);
    const high = price * (1 + Math.random() * volatility * 0.5);
    const low = price * (1 - Math.random() * volatility * 0.5);
    const open = low + Math.random() * (high - low);
    const volume = basePrice * (500000 + Math.random() * 2000000);

    history.push({
      timestamp: now - i * 86400000,
      open,
      high,
      low,
      close: price,
      volume,
    });
  }

  return history;
}

export async function fetchCryptoPrices(): Promise<Asset[]> {
  try {
    const response = await fetch(
      `${CRYPTO_API}/coins/markets?vs_currency=try&order=market_cap_desc&per_page=10&page=1&sparkline=true`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) throw new Error("API error");

    const data: CoinGeckoMarket[] = await response.json();

    return data.map((coin) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      category: "crypto" as const,
      price: coin.current_price,
      priceChange24h: coin.price_change_24h,
      priceChangePercent24h: coin.price_change_percentage_24h,
      high24h: coin.high_24h,
      low24h: coin.low_24h,
      volume24h: coin.total_volume,
      marketCap: coin.market_cap,
      icon: ASSET_ICONS[coin.symbol.toUpperCase()] ?? "🪙",
      sparkline: coin.sparkline_in_7d?.price.slice(-24),
    }));
  } catch {
    return getSimulatedCryptoPrices();
  }
}

function getSimulatedCryptoPrices(): Asset[] {
  const cryptos = [
    { id: "bitcoin", symbol: "BTC", name: "Bitcoin", basePrice: 3850000 },
    { id: "ethereum", symbol: "ETH", name: "Ethereum", basePrice: 142000 },
    { id: "binancecoin", symbol: "BNB", name: "BNB", basePrice: 25000 },
    { id: "solana", symbol: "SOL", name: "Solana", basePrice: 6800 },
    { id: "ripple", symbol: "XRP", name: "XRP", basePrice: 95 },
    { id: "cardano", symbol: "ADA", name: "Cardano", basePrice: 28 },
    { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", basePrice: 8.5 },
    { id: "polkadot", symbol: "DOT", name: "Polkadot", basePrice: 280 },
    { id: "avalanche", symbol: "AVAX", name: "Avalanche", basePrice: 1550 },
    { id: "polygon", symbol: "MATIC", name: "Polygon", basePrice: 38 },
  ];

  return cryptos.map((c) => {
    const volatility = 0.03;
    const change = (Math.random() - 0.48) * volatility * c.basePrice;
    const price = c.basePrice + change;
    const changePercent = (change / c.basePrice) * 100;

    return {
      id: c.id,
      symbol: c.symbol,
      name: c.name,
      category: "crypto" as const,
      price,
      priceChange24h: change,
      priceChangePercent24h: changePercent,
      high24h: price * 1.02,
      low24h: price * 0.98,
      volume24h: price * (1000000 + Math.random() * 5000000),
      marketCap: price * (10000000 + Math.random() * 100000000),
      icon: ASSET_ICONS[c.symbol] ?? "🪙",
      sparkline: generateRealisticSparkline(price, volatility),
    };
  });
}

export function getPreciousMetalPrices(): Asset[] {
  const metals = [
    { id: "gold", symbol: "GOLD", name: "Altın (gram)", basePrice: 3250 },
    { id: "silver", symbol: "SILVER", name: "Gümüş (gram)", basePrice: 42 },
    { id: "gold-quarter", symbol: "GOLD_Q", name: "Çeyrek Altın", basePrice: 5300 },
    { id: "gold-half", symbol: "GOLD_H", name: "Yarım Altın", basePrice: 10600 },
    { id: "gold-full", symbol: "GOLD_F", name: "Tam Altın", basePrice: 21200 },
  ];

  return metals.map((m) => {
    const volatility = 0.015;
    const change = (Math.random() - 0.45) * volatility * m.basePrice;
    const price = m.basePrice + change;
    const changePercent = (change / m.basePrice) * 100;

    return {
      id: m.id,
      symbol: m.symbol,
      name: m.name,
      category: "precious_metal" as const,
      price,
      priceChange24h: change,
      priceChangePercent24h: changePercent,
      high24h: price * 1.01,
      low24h: price * 0.99,
      volume24h: price * (50000 + Math.random() * 200000),
      icon: ASSET_ICONS[m.symbol] ?? "🥇",
      sparkline: generateRealisticSparkline(price, volatility),
    };
  });
}

export function getCurrencyPrices(): Asset[] {
  const currencies = [
    { id: "usd-try", symbol: "USD", name: "ABD Doları", basePrice: TRY_RATE },
    { id: "eur-try", symbol: "EUR", name: "Euro", basePrice: TRY_RATE * 1.08 },
    { id: "gbp-try", symbol: "GBP", name: "İngiliz Sterlini", basePrice: TRY_RATE * 1.27 },
  ];

  return currencies.map((c) => {
    const volatility = 0.008;
    const change = (Math.random() - 0.48) * volatility * c.basePrice;
    const price = c.basePrice + change;
    const changePercent = (change / c.basePrice) * 100;

    return {
      id: c.id,
      symbol: c.symbol,
      name: c.name,
      category: "currency" as const,
      price,
      priceChange24h: change,
      priceChangePercent24h: changePercent,
      high24h: price * 1.005,
      low24h: price * 0.995,
      volume24h: price * (10000000 + Math.random() * 50000000),
      icon: ASSET_ICONS[c.symbol] ?? "💱",
      sparkline: generateRealisticSparkline(price, volatility),
    };
  });
}

export async function getAllAssets(): Promise<Asset[]> {
  const [cryptoPrices, metalPrices, currencyPrices] = await Promise.all([
    fetchCryptoPrices(),
    Promise.resolve(getPreciousMetalPrices()),
    Promise.resolve(getCurrencyPrices()),
  ]);

  return [...cryptoPrices, ...metalPrices, ...currencyPrices];
}

export function getAssetPriceHistory(assetId: string): PriceHistory[] {
  const volatilityMap: Record<string, number> = {
    bitcoin: 0.04,
    ethereum: 0.05,
    solana: 0.06,
    gold: 0.015,
    silver: 0.02,
    "usd-try": 0.008,
    "eur-try": 0.01,
  };

  const basePriceMap: Record<string, number> = {
    bitcoin: 3850000,
    ethereum: 142000,
    binancecoin: 25000,
    solana: 6800,
    ripple: 95,
    cardano: 28,
    dogecoin: 8.5,
    polkadot: 280,
    avalanche: 1550,
    polygon: 38,
    gold: 3250,
    silver: 42,
    "gold-quarter": 5300,
    "gold-half": 10600,
    "gold-full": 21200,
    "usd-try": 38.5,
    "eur-try": 41.6,
    "gbp-try": 48.9,
  };

  const basePrice = basePriceMap[assetId] ?? 100;
  const volatility = volatilityMap[assetId] ?? 0.03;

  return generatePriceHistory(basePrice, 90, volatility);
}

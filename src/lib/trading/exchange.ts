import ccxt from "ccxt";

type BtcTurkExchange = InstanceType<typeof ccxt.btcturk>;
let exchangeInstance: BtcTurkExchange | null = null;

export function isExchangeConfigured(): boolean {
  return !!(process.env.BTCTURK_PUBLIC_KEY && process.env.BTCTURK_PRIVATE_KEY);
}

export function getExchange(): BtcTurkExchange | null {
  if (!isExchangeConfigured()) return null;

  if (!exchangeInstance) {
    exchangeInstance = new ccxt.btcturk({
      apiKey: process.env.BTCTURK_PUBLIC_KEY,
      secret: process.env.BTCTURK_PRIVATE_KEY,
    });
  }

  return exchangeInstance;
}

export interface ExchangeStatus {
  connected: boolean;
  exchange: string;
  mode: "live" | "simulation";
  error?: string;
}

export async function checkExchangeConnection(): Promise<ExchangeStatus> {
  const exchange = getExchange();

  if (!exchange) {
    return {
      connected: false,
      exchange: "BtcTurk",
      mode: "simulation",
      error: "API anahtarları tanımlı değil",
    };
  }

  try {
    await exchange.fetchBalance();
    return {
      connected: true,
      exchange: "BtcTurk",
      mode: "live",
    };
  } catch (err) {
    return {
      connected: false,
      exchange: "BtcTurk",
      mode: "simulation",
      error: err instanceof Error ? err.message : "Bağlantı hatası",
    };
  }
}

const BTCTURK_PAIRS: Record<string, string> = {
  BTC: "BTC/TRY",
  ETH: "ETH/TRY",
  BNB: "BNB/TRY",
  SOL: "SOL/TRY",
  XRP: "XRP/TRY",
  ADA: "ADA/TRY",
  DOGE: "DOGE/TRY",
  DOT: "DOT/TRY",
  AVAX: "AVAX/TRY",
  MATIC: "MATIC/TRY",
};

export interface LiveTicker {
  symbol: string;
  pair: string;
  last: number;
  high: number;
  low: number;
  volume: number;
  change: number;
  changePercent: number;
}

export async function fetchLiveTickers(): Promise<LiveTicker[]> {
  const exchange = getExchange();
  if (!exchange) return [];

  const results: LiveTicker[] = [];

  try {
    const tickers = await exchange.fetchTickers(Object.values(BTCTURK_PAIRS));

    for (const [symbol, pair] of Object.entries(BTCTURK_PAIRS)) {
      const ticker = tickers[pair];
      if (ticker) {
        results.push({
          symbol,
          pair,
          last: ticker.last ?? 0,
          high: ticker.high ?? 0,
          low: ticker.low ?? 0,
          volume: ticker.baseVolume ?? 0,
          change: ticker.change ?? 0,
          changePercent: ticker.percentage ?? 0,
        });
      }
    }
  } catch {
    // return empty on error
  }

  return results;
}

export interface ExchangeBalance {
  currency: string;
  free: number;
  used: number;
  total: number;
}

export async function fetchExchangeBalance(): Promise<ExchangeBalance[]> {
  const exchange = getExchange();
  if (!exchange) return [];

  try {
    const balance = await exchange.fetchBalance();
    const result: ExchangeBalance[] = [];

    const totalObj = balance.total as unknown as Record<string, number> | undefined;
    const freeObj = balance.free as unknown as Record<string, number> | undefined;
    const usedObj = balance.used as unknown as Record<string, number> | undefined;

    for (const currency of Object.keys(totalObj ?? {})) {
      const total = totalObj?.[currency] ?? 0;
      if (total > 0) {
        result.push({
          currency,
          free: freeObj?.[currency] ?? 0,
          used: usedObj?.[currency] ?? 0,
          total,
        });
      }
    }

    return result;
  } catch {
    return [];
  }
}

export async function executeLiveBuy(
  symbol: string,
  amountInTRY: number
): Promise<{ success: boolean; orderId?: string; message: string; filled?: number; cost?: number }> {
  const exchange = getExchange();
  if (!exchange) {
    return { success: false, message: "Borsa bağlantısı yok. API anahtarlarını kontrol edin." };
  }

  const pair = BTCTURK_PAIRS[symbol];
  if (!pair) {
    return { success: false, message: `${symbol} BtcTurk'te desteklenmiyor.` };
  }

  try {
    const ticker = await exchange.fetchTicker(pair);
    const price = ticker.last ?? 0;
    if (price <= 0) {
      return { success: false, message: "Fiyat bilgisi alınamadı." };
    }

    const quantity = amountInTRY / price;

    const order = await exchange.createMarketBuyOrder(pair, quantity);

    return {
      success: true,
      orderId: order.id,
      message: `${quantity.toFixed(8)} ${symbol} alındı (₺${amountInTRY.toFixed(2)})`,
      filled: order.filled ?? quantity,
      cost: order.cost ?? amountInTRY,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Alım emri başarısız",
    };
  }
}

export async function executeLiveSell(
  symbol: string,
  quantity: number
): Promise<{ success: boolean; orderId?: string; message: string; filled?: number; cost?: number }> {
  const exchange = getExchange();
  if (!exchange) {
    return { success: false, message: "Borsa bağlantısı yok. API anahtarlarını kontrol edin." };
  }

  const pair = BTCTURK_PAIRS[symbol];
  if (!pair) {
    return { success: false, message: `${symbol} BtcTurk'te desteklenmiyor.` };
  }

  try {
    const order = await exchange.createMarketSellOrder(pair, quantity);

    return {
      success: true,
      orderId: order.id,
      message: `${quantity.toFixed(8)} ${symbol} satıldı`,
      filled: order.filled ?? quantity,
      cost: order.cost ?? 0,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Satış emri başarısız",
    };
  }
}

import { NextResponse } from "next/server";
import { executeLiveBuy, executeLiveSell, isExchangeConfigured } from "@/lib/trading/exchange";

interface TradeRequest {
  action: "buy" | "sell";
  symbol: string;
  amount: number;
}

export async function POST(request: Request) {
  if (!isExchangeConfigured()) {
    return NextResponse.json(
      { success: false, message: "Borsa API bağlantısı yok. .env dosyasına API anahtarlarını ekleyin." },
      { status: 400 }
    );
  }

  const body: TradeRequest = await request.json();

  if (!body.symbol || !body.amount || body.amount <= 0) {
    return NextResponse.json(
      { success: false, message: "Geçersiz parametreler." },
      { status: 400 }
    );
  }

  if (body.action === "buy") {
    const result = await executeLiveBuy(body.symbol, body.amount);
    return NextResponse.json(result);
  }

  if (body.action === "sell") {
    const result = await executeLiveSell(body.symbol, body.amount);
    return NextResponse.json(result);
  }

  return NextResponse.json(
    { success: false, message: "Geçersiz işlem tipi." },
    { status: 400 }
  );
}

import { NextResponse } from "next/server";
import { checkExchangeConnection, isExchangeConfigured } from "@/lib/trading/exchange";

export async function GET() {
  if (!isExchangeConfigured()) {
    return NextResponse.json({
      connected: false,
      exchange: "BtcTurk",
      mode: "simulation",
      error: "API anahtarları tanımlı değil. .env dosyasına BTCTURK_PUBLIC_KEY ve BTCTURK_PRIVATE_KEY ekleyin.",
    });
  }

  const status = await checkExchangeConnection();
  return NextResponse.json(status);
}

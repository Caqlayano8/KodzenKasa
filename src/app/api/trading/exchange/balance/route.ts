import { NextResponse } from "next/server";
import { fetchExchangeBalance, isExchangeConfigured } from "@/lib/trading/exchange";

export async function GET() {
  if (!isExchangeConfigured()) {
    return NextResponse.json({ balances: [], mode: "simulation" });
  }

  const balances = await fetchExchangeBalance();
  return NextResponse.json({ balances, mode: "live" });
}

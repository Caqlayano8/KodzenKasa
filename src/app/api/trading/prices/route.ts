import { NextResponse } from "next/server";
import { getAllAssets } from "@/lib/trading/market-data";

export async function GET() {
  const assets = await getAllAssets();
  return NextResponse.json(assets);
}

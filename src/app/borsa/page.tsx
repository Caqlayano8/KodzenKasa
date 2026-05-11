import type { Metadata } from "next";
import { TradingDashboard } from "@/components/trading/TradingDashboard";

export const metadata: Metadata = {
  title: "Borsa - KodzenKasa | Akıllı Yatırım Platformu",
  description: "BTC, altın, gümüş, dolar, euro al-sat. Yapay zeka destekli analiz ile akıllı yatırım yapın.",
};

export default function BorsaPage() {
  return <TradingDashboard />;
}

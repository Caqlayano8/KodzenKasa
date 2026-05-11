import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getSiteSettings } from "@/app/actions/site-settings";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KodzenKasa - Akıllı Yatırım Platformu",
  description: "Kripto, altın, gümüş, döviz al-sat platformu. Yapay zeka destekli analiz ile akıllı yatırım.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html lang="tr" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 font-[family-name:var(--font-geist)]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
        <WhatsAppButton
          phoneNumber={settings.whatsappNumber}
          message={settings.whatsappMessage}
          enabled={settings.whatsappEnabled}
        />
      </body>
    </html>
  );
}

# KodzenKasa - Akıllı Yatırım Platformu

Yapay zeka destekli kripto, değerli maden ve döviz al-sat platformu.

## Özellikler

### 📊 Borsa & Piyasalar
- **Kripto Para**: BTC, ETH, BNB, SOL, XRP, ADA, DOGE ve daha fazlası
- **Değerli Madenler**: Altın (gram/çeyrek/yarım/tam), Gümüş
- **Döviz**: USD, EUR, GBP
- Gerçek zamanlı fiyat takibi ve sparkline grafikleri

### 🤖 Yapay Zeka Analizi
- **RSI (Relative Strength Index)**: Aşırı alım/satım bölgesi tespiti
- **MACD**: Trend yönü ve momentum analizi
- **Bollinger Bantları**: Fiyat volatilitesi ve destek/direnç seviyeleri
- **Hareketli Ortalamalar**: SMA20, SMA50, EMA12, EMA26
- **Stokastik Osilatör**: K/D çizgileri ile alım/satım sinyalleri
- **ATR (Average True Range)**: Volatilite ölçümü

### 💰 Al-Sat Sistemi
- Otomatik AL/SAT sinyalleri (GÜÇLÜ AL, AL, NÖTR, SAT, GÜÇLÜ SAT)
- Stop-Loss ve Take-Profit seviyeleri
- Risk/Ödül oranı hesaplama
- Market order desteği

### 💼 Portföy Yönetimi
- 100 TL minimum başlangıç sermayesi
- Gerçek zamanlı portföy değeri takibi
- Varlık bazlı kâr/zarar analizi
- İşlem geçmişi
- Portföy dağılımı (allocation)

## Başlangıç

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) adresini tarayıcınızda açın.

## Teknolojiler

- **Next.js 16** - React framework
- **React 19** - UI kütüphanesi
- **TypeScript** - Tip güvenliği
- **Tailwind CSS 4** - Stil
- **Prisma** - ORM
- **CoinGecko API** - Kripto fiyatları

export function formatPrice(price: number, currency: string = "TRY"): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return formatDate(date);
  if (days > 0) return `${days} gün önce`;
  if (hours > 0) return `${hours} saat önce`;
  if (minutes > 0) return `${minutes} dakika önce`;
  return "Az önce";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const CITIES = [
  "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya",
  "Gaziantep", "Mersin", "Diyarbakır", "Kayseri", "Eskişehir", "Samsun",
  "Denizli", "Trabzon", "Malatya", "Erzurum", "Sakarya", "Muğla", "Tekirdağ",
  "Balıkesir", "Manisa", "Kocaeli", "Aydın", "Hatay", "Kahramanmaraş",
  "Van", "Mardin", "Şanlıurfa", "Elazığ"
];

export const CATEGORIES = [
  { value: "daire", label: "Daire" },
  { value: "villa", label: "Villa" },
  { value: "konut", label: "Konut" },
  { value: "arsa", label: "Arsa" },
  { value: "arazi", label: "Arazi" },
  { value: "dukkan", label: "Dükkan" },
  { value: "ofis", label: "Ofis" },
  { value: "depo", label: "Depo" },
];

export const ROOM_OPTIONS = [
  "1+0", "1+1", "2+1", "2+2", "3+1", "3+2", "4+1", "4+2", "5+1", "5+2", "6+", 
];

export const HEATING_OPTIONS = [
  { value: "dogalgaz", label: "Doğalgaz" },
  { value: "kombi", label: "Kombi" },
  { value: "merkezi", label: "Merkezi" },
  { value: "soba", label: "Soba" },
  { value: "klima", label: "Klima" },
  { value: "yerden", label: "Yerden Isıtma" },
];

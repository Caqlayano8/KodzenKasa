import Link from "next/link";
import { prisma } from "@/lib/db";
import { PropertyCard } from "@/components/PropertyCard";
import { getSession } from "@/lib/auth";
import { CATEGORIES, CITIES } from "@/lib/utils";
import { HeroSearch } from "@/components/HeroSearch";

export default async function HomePage() {
  const session = await getSession();

  const [featuredProperties, latestProperties, stats] = await Promise.all([
    prisma.property.findMany({
      where: { status: "active", featured: true },
      include: {
        images: { orderBy: { order: "asc" }, take: 5 },
        user: { select: { name: true, avatar: true } },
      },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
    prisma.property.findMany({
      where: { status: "active" },
      include: {
        images: { orderBy: { order: "asc" }, take: 5 },
        user: { select: { name: true, avatar: true } },
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    Promise.all([
      prisma.property.count({ where: { status: "active" } }),
      prisma.user.count(),
      prisma.property.count({ where: { status: "active", type: "satilik" } }),
      prisma.property.count({ where: { status: "active", type: "kiralik" } }),
    ]),
  ]);

  const userFavorites = session
    ? await prisma.favorite.findMany({
        where: { userId: session.id },
        select: { propertyId: true },
      })
    : [];

  const favoriteIds = new Set(userFavorites.map((f) => f.propertyId));
  const [totalProperties, totalUsers, satilikCount, kiralikCount] = stats;

  const displayProperties = featuredProperties.length > 0 ? featuredProperties : latestProperties.slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
              Hayalinizdeki Evi
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                Hemen Bulun
              </span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
              Kripto, altın, gümüş, döviz ve daha fazlası - yapay zeka destekli akıllı yatırım platformu.
            </p>
          </div>

          <HeroSearch />

          <div className="flex items-center justify-center gap-8 mt-10 text-white/80">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{totalProperties}+</div>
              <div className="text-sm">Aktif İlan</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{totalUsers}+</div>
              <div className="text-sm">Kullanıcı</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{CITIES.length}+</div>
              <div className="text-sm">Şehir</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              href={`/ilanlar?category=${cat.value}`}
              className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-blue-200 group"
            >
              <div className="w-12 h-12 mx-auto mb-2 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <CategoryIcon category={cat.value} />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/ilanlar?type=satilik"
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-white group hover:shadow-lg transition-shadow"
          >
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Satılık İlanlar</h3>
              <p className="text-emerald-100 mb-4">{satilikCount} aktif ilan</p>
              <span className="inline-flex items-center gap-2 font-medium">
                İlanları Gör
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
            <div className="absolute right-0 top-0 w-32 h-full opacity-10">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          </Link>

          <Link
            href="/ilanlar?type=kiralik"
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 p-8 text-white group hover:shadow-lg transition-shadow"
          >
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Kiralık İlanlar</h3>
              <p className="text-orange-100 mb-4">{kiralikCount} aktif ilan</p>
              <span className="inline-flex items-center gap-2 font-medium">
                İlanları Gör
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
            <div className="absolute right-0 top-0 w-32 h-full opacity-10">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured/Latest Properties */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {featuredProperties.length > 0 ? "Öne Çıkan İlanlar" : "Son Eklenen İlanlar"}
            </h2>
            <p className="text-gray-500 mt-1">En güncel fırsatları kaçırmayın</p>
          </div>
          <Link
            href="/ilanlar"
            className="hidden sm:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Tümünü Gör
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isFavorited={favoriteIds.has(property.id)}
            />
          ))}
        </div>

        {displayProperties.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz ilan yok</h3>
            <p className="text-gray-500 mb-4">İlk ilanı siz oluşturun!</p>
            <Link
              href="/ilan-ver"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              İlan Ver
            </Link>
          </div>
        )}
      </section>

      {/* Latest Properties */}
      {latestProperties.length > 4 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Son Eklenen İlanlar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestProperties.slice(4).map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isFavorited={favoriteIds.has(property.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!session && (
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Hemen Ücretsiz Üye Olun
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              İlan verin, mesaj gönderin, favorilerinizi kaydedin ve daha fazlası!
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/kayit"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
              >
                Üye Ol
              </Link>
              <Link
                href="/ilanlar"
                className="border-2 border-white/30 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                İlanları Keşfet
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function CategoryIcon({ category }: { category: string }) {
  const iconClass = "w-6 h-6 text-blue-600";
  switch (category) {
    case "daire":
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
    case "villa":
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
    case "arsa":
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>;
    case "arazi":
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
    case "dukkan":
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
    case "ofis":
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
    default:
      return <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
  }
}

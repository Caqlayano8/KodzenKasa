import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatPrice, formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PropertyGallery } from "./PropertyGallery";
import { ContactForm } from "./ContactForm";
import { FavoriteButton } from "./FavoriteButton";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id },
    select: { title: true, city: true, district: true, price: true },
  });
  if (!property) return { title: "İlan Bulunamadı" };
  return {
    title: `${property.title} - ${property.city} | KodzenKasa`,
    description: `${property.title} - ${property.district}, ${property.city}`,
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      user: { select: { id: true, name: true, avatar: true, phone: true, email: true, createdAt: true } },
      _count: { select: { favorites: true } },
    },
  });

  if (!property) notFound();

  // Increment views
  await prisma.property.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  const isFavorited = session
    ? !!(await prisma.favorite.findUnique({
        where: { userId_propertyId: { userId: session.id, propertyId: id } },
      }))
    : false;

  const details = [
    { label: "Oda Sayısı", value: property.rooms },
    { label: "Banyo", value: property.bathrooms ? `${property.bathrooms}` : null },
    { label: "Alan", value: property.area ? `${property.area} m²` : null },
    { label: "Kat", value: property.floor !== null ? `${property.floor}/${property.totalFloors || "?"}` : null },
    { label: "Bina Yaşı", value: property.buildingAge !== null ? `${property.buildingAge} yıl` : null },
    { label: "Isıtma", value: property.heating },
  ].filter((d) => d.value);

  const features = [
    { label: "Eşyalı", active: property.furnished },
    { label: "Otopark", active: property.parking },
    { label: "Asansör", active: property.elevator },
    { label: "Balkon", active: property.balcony },
    { label: "Bahçe", active: property.garden },
    { label: "Havuz", active: property.pool },
    { label: "Güvenlik", active: property.security },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">Ana Sayfa</Link>
        <span>/</span>
        <Link href="/ilanlar" className="hover:text-blue-600">İlanlar</Link>
        <span>/</span>
        <Link href={`/ilanlar?type=${property.type}`} className="hover:text-blue-600">
          {property.type === "satilik" ? "Satılık" : "Kiralık"}
        </Link>
        <span>/</span>
        <span className="text-gray-900">{property.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery */}
          <PropertyGallery images={property.images} />

          {/* Title & Price */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                    property.type === "satilik" ? "bg-emerald-500" : "bg-orange-500"
                  }`}>
                    {property.type === "satilik" ? "Satılık" : "Kiralık"}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                    {property.category.charAt(0).toUpperCase() + property.category.slice(1)}
                  </span>
                  {property.status !== "active" && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                      {property.status === "sold" ? "Satıldı" : property.status === "rented" ? "Kiralandı" : "Pasif"}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{property.title}</h1>
              </div>
              <FavoriteButton propertyId={property.id} isFavorited={isFavorited} />
            </div>

            <div className="flex items-center gap-2 text-gray-500 mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {property.neighborhood && `${property.neighborhood}, `}
              {property.district}, {property.city}
            </div>

            <div className="text-3xl font-bold text-blue-600">
              {formatPrice(property.price, property.currency)}
              {property.type === "kiralik" && <span className="text-lg font-normal text-gray-500">/ay</span>}
            </div>

            <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
              <span>{property.views} görüntülenme</span>
              <span>{property._count.favorites} favori</span>
              <span>{formatDate(property.createdAt)}</span>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">İlan Detayları</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {details.map((detail) => (
                <div key={detail.label} className="bg-gray-50 rounded-xl p-3">
                  <div className="text-sm text-gray-500">{detail.label}</div>
                  <div className="font-semibold text-gray-900">{detail.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Özellikler</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {features.map((feature) => (
                <div
                  key={feature.label}
                  className={`flex items-center gap-2 p-3 rounded-xl ${
                    feature.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-400"
                  }`}
                >
                  <svg
                    className={`w-5 h-5 ${feature.active ? "text-emerald-500" : "text-gray-300"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {feature.active ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    )}
                  </svg>
                  <span className="text-sm font-medium">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Açıklama</h2>
            <div className="text-gray-600 whitespace-pre-wrap leading-relaxed">
              {property.description}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Owner Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                {property.user.avatar ? (
                  <img src={property.user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  property.user.name.charAt(0)
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{property.user.name}</h3>
                <p className="text-sm text-gray-500">
                  Üye: {formatDate(property.user.createdAt)}
                </p>
              </div>
            </div>

            {property.user.phone && (
              <a
                href={`tel:${property.user.phone}`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors mb-3"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Ara: {property.user.phone}
              </a>
            )}

            {session && session.id !== property.user.id && (
              <ContactForm
                receiverId={property.user.id}
                propertyId={property.id}
                propertyTitle={property.title}
              />
            )}

            {!session && (
              <Link
                href="/giris"
                className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Mesaj göndermek için giriş yapın
              </Link>
            )}

            {session && session.id === property.user.id && (
              <Link
                href={`/ilan-duzenle/${property.id}`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                İlanı Düzenle
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

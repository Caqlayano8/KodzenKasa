import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { PropertyCard } from "@/components/PropertyCard";
import Link from "next/link";

export const metadata = { title: "İlanlarım - KodzenKasa" };

export default async function MyListingsPage() {
  const session = await getSession();
  if (!session) redirect("/giris");

  const properties = await prisma.property.findMany({
    where: { userId: session.id },
    include: {
      images: { orderBy: { order: "asc" }, take: 5 },
      user: { select: { name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">İlanlarım</h1>
          <p className="text-gray-500 mt-1">{properties.length} ilan</p>
        </div>
        <Link
          href="/ilan-ver"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni İlan
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz ilanınız yok</h3>
          <p className="text-gray-500 mb-4">İlk ilanınızı hemen oluşturun!</p>
          <Link href="/ilan-ver" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            İlan Ver
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              showFavorite={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { PropertyCard } from "@/components/PropertyCard";

export const metadata = { title: "Favorilerim - KodzenKasa" };

export default async function FavoritesPage() {
  const session = await getSession();
  if (!session) redirect("/giris");

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.id },
    include: {
      property: {
        include: {
          images: { orderBy: { order: "asc" }, take: 5 },
          user: { select: { name: true, avatar: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Favorilerim</h1>
        <p className="text-gray-500 mt-1">{favorites.length} favori ilan</p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Favori ilan yok</h3>
          <p className="text-gray-500">Beğendiğiniz ilanları favorilere ekleyin</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((fav) => (
            <PropertyCard
              key={fav.id}
              property={fav.property}
              isFavorited={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

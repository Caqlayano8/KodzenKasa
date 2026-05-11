import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { PropertyCard } from "@/components/PropertyCard";
import { FilterSidebar } from "./FilterSidebar";
import { Prisma } from "@/generated/prisma/client";

export const metadata = { title: "İlanlar - KodzenKasa" };

interface Props {
  searchParams: Promise<{
    type?: string;
    category?: string;
    city?: string;
    minPrice?: string;
    maxPrice?: string;
    rooms?: string;
    minArea?: string;
    maxArea?: string;
    sort?: string;
    page?: string;
    q?: string;
  }>;
}

export default async function ListingsPage({ searchParams }: Props) {
  const params = await searchParams;
  const session = await getSession();
  const page = parseInt(params.page || "1");
  const perPage = 12;

  const where: Prisma.PropertyWhereInput = { status: "active" };

  if (params.type) where.type = params.type;
  if (params.category) where.category = params.category;
  if (params.city) where.city = params.city;
  if (params.rooms) where.rooms = params.rooms;
  if (params.q) {
    where.OR = [
      { title: { contains: params.q } },
      { description: { contains: params.q } },
      { city: { contains: params.q } },
      { district: { contains: params.q } },
    ];
  }
  if (params.minPrice || params.maxPrice) {
    where.price = {};
    if (params.minPrice) where.price.gte = parseFloat(params.minPrice);
    if (params.maxPrice) where.price.lte = parseFloat(params.maxPrice);
  }
  if (params.minArea || params.maxArea) {
    where.area = {};
    if (params.minArea) where.area.gte = parseFloat(params.minArea);
    if (params.maxArea) where.area.lte = parseFloat(params.maxArea);
  }

  let orderBy: Prisma.PropertyOrderByWithRelationInput = { createdAt: "desc" };
  if (params.sort === "price_asc") orderBy = { price: "asc" };
  if (params.sort === "price_desc") orderBy = { price: "desc" };
  if (params.sort === "area_asc") orderBy = { area: "asc" };
  if (params.sort === "area_desc") orderBy = { area: "desc" };
  if (params.sort === "oldest") orderBy = { createdAt: "asc" };

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        images: { orderBy: { order: "asc" }, take: 5 },
        user: { select: { name: true, avatar: true } },
      },
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.property.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  const userFavorites = session
    ? await prisma.favorite.findMany({
        where: { userId: session.id },
        select: { propertyId: true },
      })
    : [];
  const favoriteIds = new Set(userFavorites.map((f) => f.propertyId));

  const typeLabel = params.type === "satilik" ? "Satılık" : params.type === "kiralik" ? "Kiralık" : "Tüm";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {typeLabel} İlanlar
          </h1>
          <p className="text-gray-500 mt-1">{total} ilan bulundu</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <FilterSidebar currentParams={params} />

        <div className="flex-1">
          {/* Sort Bar */}
          <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-3 border border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sırala:</span>
              <SortLink label="En Yeni" value="newest" current={params.sort} params={params} />
              <SortLink label="Fiyat ↑" value="price_asc" current={params.sort} params={params} />
              <SortLink label="Fiyat ↓" value="price_desc" current={params.sort} params={params} />
              <SortLink label="m² ↑" value="area_asc" current={params.sort} params={params} />
            </div>
            <span className="text-sm text-gray-400">
              Sayfa {page}/{totalPages || 1}
            </span>
          </div>

          {/* Property Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isFavorited={favoriteIds.has(property.id)}
              />
            ))}
          </div>

          {properties.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">İlan bulunamadı</h3>
              <p className="text-gray-500">Filtreleri değiştirmeyi deneyin</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {page > 1 && (
                <PaginationLink page={page - 1} params={params} label="Önceki" />
              )}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + 1;
                return (
                  <PaginationLink
                    key={p}
                    page={p}
                    params={params}
                    label={String(p)}
                    active={p === page}
                  />
                );
              })}
              {page < totalPages && (
                <PaginationLink page={page + 1} params={params} label="Sonraki" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SortLink({ label, value, current, params }: { label: string; value: string; current?: string; params: Record<string, string | undefined> }) {
  const isActive = current === value || (!current && value === "newest");
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v && k !== "sort" && k !== "page") searchParams.set(k, v); });
  if (value !== "newest") searchParams.set("sort", value);

  return (
    <a
      href={`/ilanlar?${searchParams.toString()}`}
      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
        isActive ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-500 hover:bg-gray-100"
      }`}
    >
      {label}
    </a>
  );
}

function PaginationLink({ page, params, label, active }: { page: number; params: Record<string, string | undefined>; label: string; active?: boolean }) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v && k !== "page") searchParams.set(k, v); });
  if (page > 1) searchParams.set("page", String(page));

  return (
    <a
      href={`/ilanlar?${searchParams.toString()}`}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
      }`}
    >
      {label}
    </a>
  );
}

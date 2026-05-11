"use client";

import { useState } from "react";
import Link from "next/link";
import { updatePropertyStatusAction, togglePropertyFeaturedAction, adminDeletePropertyAction } from "@/app/actions/admin";

interface Property {
  id: string;
  title: string;
  price: number;
  type: string;
  category: string;
  status: string;
  city: string;
  district: string;
  featured: boolean;
  views: number;
  createdAt: Date;
  user: { name: string; email: string };
  images: { url: string }[];
  _count: { favorites: number; messages: number };
}

const statusLabels: Record<string, string> = { active: "Aktif", inactive: "Pasif", sold: "Satıldı", rented: "Kiralandı" };
const typeLabels: Record<string, string> = { satilik: "Satılık", kiralik: "Kiralık" };
const categoryLabels: Record<string, string> = { daire: "Daire", villa: "Villa", konut: "Konut", arsa: "Arsa", arazi: "Arazi", dukkan: "Dükkan", ofis: "Ofis", depo: "Depo" };

export function PropertiesClient({ initialProperties }: { initialProperties: Property[] }) {
  const [properties, setProperties] = useState(initialProperties);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filtered = properties.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function showMsg(text: string, type: "success" | "error" = "success") {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleStatusChange(propertyId: string, newStatus: string) {
    const result = await updatePropertyStatusAction(propertyId, newStatus);
    if ("success" in result && result.success) {
      setProperties(properties.map((p) => (p.id === propertyId ? { ...p, status: newStatus } : p)));
      showMsg(result.success);
    }
  }

  async function handleToggleFeatured(propertyId: string) {
    const result = await togglePropertyFeaturedAction(propertyId);
    if ("success" in result && result.success) {
      setProperties(properties.map((p) => (p.id === propertyId ? { ...p, featured: !p.featured } : p)));
      showMsg(result.success);
    }
  }

  async function handleDelete(propertyId: string, title: string) {
    if (!confirm(`"${title}" ilanını silmek istediğinize emin misiniz?`)) return;
    const result = await adminDeletePropertyAction(propertyId);
    if ("success" in result && result.success) {
      setProperties(properties.filter((p) => p.id !== propertyId));
      showMsg(result.success);
    }
  }

  return (
    <>
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="İlan ara (başlık, şehir)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="active">Aktif</option>
          <option value="inactive">Pasif</option>
          <option value="sold">Satıldı</option>
          <option value="rented">Kiralandı</option>
        </select>
      </div>

      <div className="space-y-4">
        {filtered.map((property) => (
          <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Image */}
              <div className="w-full md:w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {property.images[0] ? (
                  <img src={property.images[0].url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link href={`/ilan/${property.id}`} className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-1">
                      {property.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                      <span>{property.user.name}</span>
                      <span>-</span>
                      <span>{property.city}, {property.district}</span>
                      <span>-</span>
                      <span className="font-semibold text-gray-900">{property.price.toLocaleString("tr-TR")} TL</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full ${property.type === "satilik" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                      {typeLabels[property.type]}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      {categoryLabels[property.category]}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                  <span title="Görüntülenme">
                    <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {property.views}
                  </span>
                  <span title="Favori">
                    <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {property._count.favorites}
                  </span>
                  <span title="Mesaj">
                    <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    {property._count.messages}
                  </span>
                  <span>{new Date(property.createdAt).toLocaleDateString("tr-TR")}</span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <select
                    value={property.status}
                    onChange={(e) => handleStatusChange(property.id, e.target.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium ${
                      property.status === "active" ? "border-green-300 bg-green-50 text-green-700" :
                      property.status === "inactive" ? "border-gray-300 bg-gray-50 text-gray-700" :
                      "border-yellow-300 bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                    <option value="sold">Satıldı</option>
                    <option value="rented">Kiralandı</option>
                  </select>

                  <button
                    onClick={() => handleToggleFeatured(property.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                      property.featured
                        ? "border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                        : "border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {property.featured ? "Oene Cikarildi" : "One Cikar"}
                  </button>

                  <button
                    onClick={() => handleDelete(property.id, property.title)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 font-medium transition-colors"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
            Sonuc bulunamadi.
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Toplam {filtered.length} ilan
      </div>
    </>
  );
}

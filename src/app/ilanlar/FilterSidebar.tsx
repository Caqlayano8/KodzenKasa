"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CITIES, CATEGORIES, ROOM_OPTIONS, HEATING_OPTIONS } from "@/lib/utils";

interface FilterSidebarProps {
  currentParams: Record<string, string | undefined>;
}

export function FilterSidebar({ currentParams }: FilterSidebarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    formData.forEach((value, key) => {
      if (value && typeof value === "string" && value.trim()) {
        params.set(key, value.trim());
      }
    });

    router.push(`/ilanlar?${params.toString()}`);
    setIsOpen(false);
  };

  const clearFilters = () => {
    router.push("/ilanlar");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 mb-4"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filtrele
      </button>

      <div className={`${isOpen ? "fixed inset-0 z-50 bg-black/50 lg:relative lg:bg-transparent" : "hidden lg:block"}`}>
        <form
          onSubmit={handleFilter}
          className={`${
            isOpen
              ? "fixed right-0 top-0 h-full w-80 bg-white overflow-y-auto lg:relative lg:h-auto lg:w-72"
              : "w-72"
          } bg-white rounded-2xl border border-gray-200 p-5 space-y-5 shrink-0`}
        >
          {isOpen && (
            <div className="flex items-center justify-between lg:hidden">
              <h3 className="font-semibold text-lg">Filtreler</h3>
              <button type="button" onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="hidden lg:flex items-center justify-between">
            <h3 className="font-semibold text-lg text-gray-900">Filtreler</h3>
            <button type="button" onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-700">
              Temizle
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Arama</label>
            <input
              name="q"
              type="text"
              defaultValue={currentParams.q}
              placeholder="Anahtar kelime..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">İlan Türü</label>
            <select
              name="type"
              defaultValue={currentParams.type}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
            >
              <option value="">Tümü</option>
              <option value="satilik">Satılık</option>
              <option value="kiralik">Kiralık</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
            <select
              name="category"
              defaultValue={currentParams.category}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
            >
              <option value="">Tümü</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Şehir</label>
            <select
              name="city"
              defaultValue={currentParams.city}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
            >
              <option value="">Tümü</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Oda Sayısı</label>
            <select
              name="rooms"
              defaultValue={currentParams.rooms}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
            >
              <option value="">Tümü</option>
              {ROOM_OPTIONS.map((room) => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Fiyat Aralığı (TL)</label>
            <div className="flex gap-2">
              <input
                name="minPrice"
                type="number"
                defaultValue={currentParams.minPrice}
                placeholder="Min"
                className="w-1/2 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
              />
              <input
                name="maxPrice"
                type="number"
                defaultValue={currentParams.maxPrice}
                placeholder="Max"
                className="w-1/2 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Alan (m²)</label>
            <div className="flex gap-2">
              <input
                name="minArea"
                type="number"
                defaultValue={currentParams.minArea}
                placeholder="Min"
                className="w-1/2 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
              />
              <input
                name="maxArea"
                type="number"
                defaultValue={currentParams.maxArea}
                placeholder="Max"
                className="w-1/2 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            Filtrele
          </button>
        </form>
      </div>
    </>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CITIES, CATEGORIES } from "@/lib/utils";

export function HeroSearch() {
  const router = useRouter();
  const [type, setType] = useState("satilik");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (city) params.set("city", city);
    if (category) params.set("category", category);
    router.push(`/ilanlar?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-2">
        <div className="flex gap-1 mb-2 p-1">
          <button
            type="button"
            onClick={() => setType("satilik")}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
              type === "satilik"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Satılık
          </button>
          <button
            type="button"
            onClick={() => setType("kiralik")}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
              type === "kiralik"
                ? "bg-orange-500 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Kiralık
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          >
            <option value="">Tüm Şehirler</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          >
            <option value="">Tüm Kategoriler</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Ara
          </button>
        </div>
      </div>
    </form>
  );
}

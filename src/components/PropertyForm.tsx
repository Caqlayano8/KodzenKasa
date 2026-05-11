"use client";

import { useState } from "react";
import { createPropertyAction } from "@/app/actions/property";
import { CITIES, CATEGORIES, ROOM_OPTIONS, HEATING_OPTIONS } from "@/lib/utils";

export function PropertyForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      urls.push(URL.createObjectURL(files[i]));
    }
    setPreviews(urls);
  };

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError("");
    try {
      const result = await createPropertyAction(formData);
      if (result && "error" in result) {
        setError(result.error || "Bir hata oluştu");
      }
    } catch {
      // redirect
    } finally {
      setLoading(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Temel Bilgiler</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">İlan Başlığı *</label>
          <input
            name="title"
            type="text"
            required
            placeholder="Örn: Deniz Manzaralı 3+1 Daire"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">İlan Türü *</label>
            <select
              name="type"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
            >
              <option value="satilik">Satılık</option>
              <option value="kiralik">Kiralık</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori *</label>
            <select
              name="category"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Fiyat (TL) *</label>
          <input
            name="price"
            type="number"
            required
            min="0"
            placeholder="0"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Açıklama *</label>
          <textarea
            name="description"
            required
            rows={5}
            placeholder="İlan detaylarını yazın..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none text-gray-900"
          />
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Konum</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Şehir *</label>
            <select
              name="city"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
            >
              <option value="">Seçiniz</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">İlçe *</label>
            <input
              name="district"
              type="text"
              required
              placeholder="İlçe adı"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mahalle</label>
            <input
              name="neighborhood"
              type="text"
              placeholder="Mahalle adı"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Adres</label>
            <input
              name="address"
              type="text"
              placeholder="Tam adres"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Detaylar</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Alan (m²)</label>
            <input name="area" type="number" min="0" placeholder="0" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Oda Sayısı</label>
            <select name="rooms" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900">
              <option value="">Seçiniz</option>
              {ROOM_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Banyo</label>
            <input name="bathrooms" type="number" min="0" placeholder="0" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Kat</label>
            <input name="floor" type="number" placeholder="0" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Toplam Kat</label>
            <input name="totalFloors" type="number" min="0" placeholder="0" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bina Yaşı</label>
            <input name="buildingAge" type="number" min="0" placeholder="0" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Isıtma</label>
          <select name="heating" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900">
            <option value="">Seçiniz</option>
            {HEATING_OPTIONS.map((h) => <option key={h.value} value={h.value}>{h.label}</option>)}
          </select>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Özellikler</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: "furnished", label: "Eşyalı" },
            { name: "parking", label: "Otopark" },
            { name: "elevator", label: "Asansör" },
            { name: "balcony", label: "Balkon" },
            { name: "garden", label: "Bahçe" },
            { name: "pool", label: "Havuz" },
            { name: "security", label: "Güvenlik" },
          ].map((feature) => (
            <label
              key={feature.name}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-blue-300 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 transition-all"
            >
              <input type="hidden" name={feature.name} value="false" />
              <input
                type="checkbox"
                name={feature.name}
                value="true"
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">{feature.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Görseller & Video</h2>
        <div>
          <label className="block mb-3">
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600 font-medium">Görselleri sürükleyin veya tıklayın</p>
              <p className="text-sm text-gray-400 mt-1">JPG, PNG, MP4 • Maks 10 dosya</p>
              <input
                type="file"
                name="images"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </label>

          {previews.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {previews.map((url, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm disabled:opacity-50"
      >
        {loading ? "İlan oluşturuluyor..." : "İlanı Yayınla"}
      </button>
    </form>
  );
}

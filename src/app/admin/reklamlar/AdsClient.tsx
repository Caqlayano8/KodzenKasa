"use client";

import { useState, useCallback } from "react";
import {
  createAdvertisementAction,
  updateAdvertisementAction,
  deleteAdvertisementAction,
  toggleAdvertisementAction,
} from "@/app/actions/site-settings";

interface Advertisement {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  position: string;
  isActive: boolean;
  order: number;
  startDate: Date | null;
  endDate: Date | null;
  clicks: number;
  views: number;
}

const positionLabels: Record<string, string> = {
  header: "Header (Ust Kisim)",
  sidebar: "Sidebar (Yan Panel)",
  footer: "Footer (Alt Kisim)",
  "between-listings": "Ilan Arasi",
  popup: "Popup (Acilir Pencere)",
};

export function AdsClient({ initialAds }: { initialAds: Advertisement[] }) {
  const [ads, setAds] = useState(initialAds);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [dragItem, setDragItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleDragStart = useCallback((index: number) => setDragItem(index), []);
  const handleDragEnter = useCallback((index: number) => setDragOverItem(index), []);
  const handleDragEnd = useCallback(() => {
    if (dragItem === null || dragOverItem === null || dragItem === dragOverItem) {
      setDragItem(null);
      setDragOverItem(null);
      return;
    }
    const newAds = [...ads];
    const draggedAd = newAds[dragItem];
    newAds.splice(dragItem, 1);
    newAds.splice(dragOverItem, 0, draggedAd);
    setAds(newAds.map((a, i) => ({ ...a, order: i })));
    setDragItem(null);
    setDragOverItem(null);
  }, [dragItem, dragOverItem, ads]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await createAdvertisementAction(formData);
      if ("success" in result && result.success) {
        setMessage({ type: "success", text: result.success });
        setShowForm(false);
        setImagePreview(null);
        window.location.reload();
      } else if ("error" in result) {
        setMessage({ type: "error", text: result.error as string });
      }
    } catch {
      setMessage({ type: "error", text: "Bir hata olustu" });
    }
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await updateAdvertisementAction(formData);
      if ("success" in result && result.success) {
        setMessage({ type: "success", text: result.success });
        setEditingAd(null);
        setImagePreview(null);
        window.location.reload();
      } else if ("error" in result) {
        setMessage({ type: "error", text: result.error as string });
      }
    } catch {
      setMessage({ type: "error", text: "Bir hata olustu" });
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu reklami silmek istediginize emin misiniz?")) return;
    try {
      const result = await deleteAdvertisementAction(id);
      if ("success" in result && result.success) {
        setAds(ads.filter((a) => a.id !== id));
        setMessage({ type: "success", text: result.success });
      }
    } catch {
      setMessage({ type: "error", text: "Bir hata olustu" });
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const result = await toggleAdvertisementAction(id);
      if ("success" in result && result.success) {
        setAds(ads.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a)));
        setMessage({ type: "success", text: result.success });
      }
    } catch {
      setMessage({ type: "error", text: "Bir hata olustu" });
    }
  };

  const handleImagePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reklam Yonetimi</h1>
          <p className="text-gray-500 mt-1">Sitenize reklam alanlari ekleyin ve yonetin. Surukle birak ile siralama degistirin.</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingAd(null); setImagePreview(null); }}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Reklam
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Form Modal */}
      {(showForm || editingAd) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">{editingAd ? "Reklam Duzenle" : "Yeni Reklam Ekle"}</h2>
            </div>
            <form onSubmit={editingAd ? handleUpdate : handleCreate} className="p-6 space-y-4">
              {editingAd && <input type="hidden" name="id" value={editingAd.id} />}
              {editingAd && <input type="hidden" name="isActive" value={editingAd.isActive ? "true" : "false"} />}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reklam Basligi</label>
                <input type="text" name="title" required defaultValue={editingAd?.title || ""}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reklam Gorseli</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  {(imagePreview || editingAd?.imageUrl) && (
                    <div className="mb-3">
                      <img src={imagePreview || editingAd?.imageUrl} alt="Reklam" className="max-h-32 mx-auto object-contain rounded" />
                    </div>
                  )}
                  <input type="file" name="image" accept="image/*" onChange={handleImagePreview}
                    className="hidden" id="ad-image-upload" required={!editingAd} />
                  <label htmlFor="ad-image-upload" className="cursor-pointer">
                    <div className="text-blue-600 font-medium">Gorsel yukle</div>
                    <div className="text-xs text-gray-400 mt-1">PNG, JPG, GIF (maks. 5MB)</div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Konum</label>
                  <select name="position" required defaultValue={editingAd?.position || "header"}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    {Object.entries(positionLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sira</label>
                  <input type="number" name="order" defaultValue={editingAd?.order || ads.length}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link URL (Opsiyonel)</label>
                <input type="url" name="linkUrl" defaultValue={editingAd?.linkUrl || ""} placeholder="https://..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => { setShowForm(false); setEditingAd(null); setImagePreview(null); }}
                  className="px-4 py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Iptal</button>
                <button type="submit" disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {loading ? "Kaydediliyor..." : editingAd ? "Guncelle" : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{ads.length}</p>
            <p className="text-sm text-gray-500">Toplam Reklam</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{ads.filter((a) => a.isActive).length}</p>
            <p className="text-sm text-gray-500">Aktif</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{ads.filter((a) => !a.isActive).length}</p>
            <p className="text-sm text-gray-500">Pasif</p>
          </div>
        </div>
      </div>

      {/* Ads List with Drag & Drop */}
      <div className="space-y-2">
        {ads.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 font-medium">Henuz reklam eklenmemis</p>
            <p className="text-gray-400 text-sm mt-1">Yeni reklam ekleyerek baslayabilirsiniz</p>
          </div>
        ) : (
          ads.map((ad, index) => (
            <div
              key={ad.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`bg-white rounded-xl border p-4 transition-all cursor-grab active:cursor-grabbing ${
                dragItem === index ? "opacity-50 border-blue-400" : dragOverItem === index ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Drag Handle */}
                <div className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 6a2 2 0 112-2 2 2 0 01-2 2zm0 6a2 2 0 112-2 2 2 0 01-2 2zm0 6a2 2 0 112-2 2 2 0 01-2 2zm6-14a2 2 0 112-2 2 2 0 01-2 2zm0 6a2 2 0 112-2 2 2 0 01-2 2zm0 6a2 2 0 112-2 2 2 0 01-2 2z" />
                  </svg>
                </div>

                {/* Thumbnail */}
                <div className="w-20 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{ad.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${ad.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {ad.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{positionLabels[ad.position] || ad.position}</span>
                    {ad.linkUrl && <span className="text-xs text-blue-500 truncate max-w-[200px]">{ad.linkUrl}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleToggle(ad.id)} title={ad.isActive ? "Devre Disi Birak" : "Aktif Et"}
                    className={`p-2 rounded-lg transition-colors ${ad.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-50"}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ad.isActive ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"} />
                    </svg>
                  </button>
                  <button onClick={() => { setEditingAd(ad); setImagePreview(null); }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(ad.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

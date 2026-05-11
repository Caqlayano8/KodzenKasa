"use client";

import { useState, useCallback } from "react";
import {
  createCustomPageAction,
  updateCustomPageAction,
  deleteCustomPageAction,
  togglePagePublishAction,
} from "@/app/actions/site-settings";

interface CustomPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  order: number;
  showInNav: boolean;
  showInFooter: boolean;
  createdAt: Date;
}

export function PagesClient({ initialPages }: { initialPages: CustomPage[] }) {
  const [pages, setPages] = useState(initialPages);
  const [showForm, setShowForm] = useState(false);
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [dragItem, setDragItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    setDragItem(index);
  }, []);

  const handleDragEnter = useCallback((index: number) => {
    setDragOverItem(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragItem === null || dragOverItem === null || dragItem === dragOverItem) {
      setDragItem(null);
      setDragOverItem(null);
      return;
    }
    const newPages = [...pages];
    const draggedPage = newPages[dragItem];
    newPages.splice(dragItem, 1);
    newPages.splice(dragOverItem, 0, draggedPage);
    setPages(newPages.map((p, i) => ({ ...p, order: i })));
    setDragItem(null);
    setDragOverItem(null);
  }, [dragItem, dragOverItem, pages]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await createCustomPageAction(formData);
      if ("success" in result && result.success) {
        setMessage({ type: "success", text: result.success });
        setShowForm(false);
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
      const result = await updateCustomPageAction(formData);
      if ("success" in result && result.success) {
        setMessage({ type: "success", text: result.success });
        setEditingPage(null);
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
    if (!confirm("Bu sayfayi silmek istediginize emin misiniz?")) return;
    setLoading(true);
    try {
      const result = await deleteCustomPageAction(id);
      if ("success" in result && result.success) {
        setPages(pages.filter((p) => p.id !== id));
        setMessage({ type: "success", text: result.success });
      }
    } catch {
      setMessage({ type: "error", text: "Bir hata olustu" });
    }
    setLoading(false);
  };

  const handleTogglePublish = async (id: string) => {
    try {
      const result = await togglePagePublishAction(id);
      if ("success" in result && result.success) {
        setPages(pages.map((p) => (p.id === id ? { ...p, isPublished: !p.isPublished } : p)));
        setMessage({ type: "success", text: result.success });
      }
    } catch {
      setMessage({ type: "error", text: "Bir hata olustu" });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sayfa Yonetimi</h1>
          <p className="text-gray-500 mt-1">Sitenize ozel sayfalar ekleyin ve yonetin. Surukle birak ile siralama degistirin.</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingPage(null); }}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Sayfa
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Form Modal */}
      {(showForm || editingPage) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">{editingPage ? "Sayfa Duzenle" : "Yeni Sayfa Olustur"}</h2>
            </div>
            <form onSubmit={editingPage ? handleUpdate : handleCreate} className="p-6 space-y-4">
              {editingPage && <input type="hidden" name="id" value={editingPage.id} />}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sayfa Basligi</label>
                  <input type="text" name="title" required defaultValue={editingPage?.title || ""}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                  <input type="text" name="slug" required defaultValue={editingPage?.slug || ""} placeholder="hakkimizda"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  <p className="text-xs text-gray-400 mt-1">ornek: /sayfa/hakkimizda</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sayfa Icerigi</label>
                <textarea name="content" rows={10} required defaultValue={editingPage?.content || ""}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm" placeholder="HTML icerik yazabilirsiniz..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sira</label>
                  <input type="number" name="order" defaultValue={editingPage?.order || pages.length}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input type="hidden" name="showInNav" value={editingPage?.showInNav ? "true" : "false"} />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked={editingPage?.showInNav || false}
                      onChange={(e) => {
                        const hidden = e.target.parentElement?.previousElementSibling as HTMLInputElement;
                        hidden.value = e.target.checked ? "true" : "false";
                      }}
                      className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm text-gray-700">Menude Goster</span>
                  </label>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input type="hidden" name="showInFooter" value={editingPage?.showInFooter !== false ? "true" : "false"} />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked={editingPage?.showInFooter !== false}
                      onChange={(e) => {
                        const hidden = e.target.parentElement?.previousElementSibling as HTMLInputElement;
                        hidden.value = e.target.checked ? "true" : "false";
                      }}
                      className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm text-gray-700">Footer&apos;da Goster</span>
                  </label>
                </div>
              </div>

              {editingPage && (
                <div className="flex items-center gap-3">
                  <input type="hidden" name="isPublished" value={editingPage.isPublished ? "true" : "false"} />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked={editingPage.isPublished}
                      onChange={(e) => {
                        const hidden = e.target.parentElement?.previousElementSibling as HTMLInputElement;
                        hidden.value = e.target.checked ? "true" : "false";
                      }}
                      className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm text-gray-700">Yayinda</span>
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => { setShowForm(false); setEditingPage(null); }}
                  className="px-4 py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Iptal</button>
                <button type="submit" disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {loading ? "Kaydediliyor..." : editingPage ? "Guncelle" : "Olustur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pages List with Drag & Drop */}
      <div className="space-y-2">
        {pages.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 font-medium">Henuz sayfa eklenmemis</p>
            <p className="text-gray-400 text-sm mt-1">Yeni sayfa ekleyerek baslayabilirsiniz</p>
          </div>
        ) : (
          pages.map((page, index) => (
            <div
              key={page.id}
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

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{page.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${page.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {page.isPublished ? "Yayinda" : "Taslak"}
                    </span>
                    {page.showInNav && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Menu</span>}
                    {page.showInFooter && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Footer</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">/sayfa/{page.slug}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => handleTogglePublish(page.id)} title={page.isPublished ? "Yayindan Kaldir" : "Yayinla"}
                    className={`p-2 rounded-lg transition-colors ${page.isPublished ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-50"}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={page.isPublished ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"} />
                    </svg>
                  </button>
                  <button onClick={() => setEditingPage(page)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(page.id)}
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

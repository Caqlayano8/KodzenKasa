"use client";

import { useState } from "react";
import { registerAction } from "@/app/actions/auth";

export function RegisterForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError("");
    try {
      const result = await registerAction(formData);
      if (result && "error" in result) {
        setError(result.error || "Bir hata oluştu");
      }
    } catch {
      // redirect throws
    } finally {
      setLoading(false);
    }
  };

  return (
    <form action={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-5">
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
          Ad Soyad
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900"
          placeholder="Adınız Soyadınız"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
          E-posta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900"
          placeholder="ornek@email.com"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
          Telefon <span className="text-gray-400">(Opsiyonel)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900"
          placeholder="0555 123 45 67"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
          Şifre
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900"
          placeholder="En az 6 karakter"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Hesap Türü</label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-blue-300 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 transition-all">
            <input type="radio" name="role" value="user" defaultChecked className="text-blue-600" />
            <div>
              <div className="font-medium text-gray-900 text-sm">Alıcı</div>
              <div className="text-xs text-gray-500">Ev arıyorum</div>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-blue-300 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 transition-all">
            <input type="radio" name="role" value="agent" className="text-blue-600" />
            <div>
              <div className="font-medium text-gray-900 text-sm">Satıcı</div>
              <div className="text-xs text-gray-500">İlan vereceğim</div>
            </div>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm disabled:opacity-50"
      >
        {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
      </button>
    </form>
  );
}

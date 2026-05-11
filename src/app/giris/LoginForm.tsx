"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions/auth";

export function LoginForm() {
  const [error, setError] = useState("");
  const [requires2FA, setRequires2FA] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError("");
    try {
      const result = await loginAction(formData);
      if (result && "error" in result && result.error) {
        setError(result.error);
        if ("requires2FA" in result && result.requires2FA) {
          setRequires2FA(true);
        }
      }
      if (result && "requires2FA" in result && result.requires2FA && !("error" in result)) {
        setRequires2FA(true);
      }
    } catch {
      // redirect throws, this is expected
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
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
          Şifre
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900"
          placeholder="••••••••"
        />
      </div>

      {requires2FA && (
        <div>
          <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700 mb-1.5">
            Doğrulama Kodu (2FA)
          </label>
          <input
            id="twoFactorCode"
            name="twoFactorCode"
            type="text"
            required
            maxLength={6}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 text-center text-2xl tracking-widest"
            placeholder="000000"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm disabled:opacity-50"
      >
        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
      </button>
    </form>
  );
}

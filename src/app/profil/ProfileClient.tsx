"use client";

import { useState } from "react";
import {
  updateProfileAction,
  changePasswordAction,
  uploadAvatarAction,
  enable2FAAction,
  verify2FAAction,
  disable2FAAction,
} from "@/app/actions/auth";
import { CITIES } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  bio: string | null;
  city: string | null;
  twoFactorEnabled: boolean;
}

export function ProfileClient({ user }: { user: User }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"profile" | "password" | "2fa">("profile");
  const [twoFAData, setTwoFAData] = useState<{ secret: string; otpauth: string } | null>(null);

  const handleProfile = async (formData: FormData) => {
    const result = await updateProfileAction(formData);
    if ("error" in result) setError(result.error || "");
    else { setMessage(result.success || "Güncellendi"); setError(""); }
  };

  const handlePassword = async (formData: FormData) => {
    const result = await changePasswordAction(formData);
    if ("error" in result) { setError(result.error || ""); setMessage(""); }
    else { setMessage(result.success || "Güncellendi"); setError(""); }
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.set("avatar", file);
    const result = await uploadAvatarAction(formData);
    if ("error" in result) setError(result.error || "");
    else setMessage(result.success || "Güncellendi");
  };

  const handleEnable2FA = async () => {
    const result = await enable2FAAction();
    if ("error" in result) setError(result.error || "");
    else setTwoFAData(result as { secret: string; otpauth: string });
  };

  const handleVerify2FA = async (formData: FormData) => {
    const result = await verify2FAAction(formData);
    if ("error" in result) setError(result.error || "");
    else { setMessage(result.success || "Etkinleştirildi"); setTwoFAData(null); }
  };

  const handleDisable2FA = async () => {
    const result = await disable2FAAction();
    if ("error" in result) setError(result.error || "");
    else setMessage(result.success || "Güncellendi");
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {[
          { key: "profile" as const, label: "Profil" },
          { key: "password" as const, label: "Şifre" },
          { key: "2fa" as const, label: "2FA Güvenlik" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setMessage(""); setError(""); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.key ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {message && (
        <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm border border-emerald-100">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      {tab === "profile" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          {/* Avatar Upload */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <label className="cursor-pointer">
              <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">Fotoğraf Değiştir</span>
              <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
            </label>
          </div>

          <form action={handleProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ad Soyad</label>
              <input name="name" type="text" defaultValue={user.name} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefon</label>
              <input name="phone" type="tel" defaultValue={user.phone || ""} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Şehir</label>
              <select name="city" defaultValue={user.city || ""} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900">
                <option value="">Seçiniz</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Hakkımda</label>
              <textarea name="bio" rows={3} defaultValue={user.bio || ""} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none text-gray-900" />
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
              Kaydet
            </button>
          </form>
        </div>
      )}

      {tab === "password" && (
        <form action={handlePassword} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mevcut Şifre</label>
            <input name="currentPassword" type="password" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Yeni Şifre</label>
            <input name="newPassword" type="password" required minLength={6} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900" />
          </div>
          <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
            Şifreyi Değiştir
          </button>
        </form>
      )}

      {tab === "2fa" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">İki Faktörlü Doğrulama (2FA)</h3>
          <p className="text-sm text-gray-500">
            Hesabınızı ekstra güvenlik katmanı ile koruyun. Google Authenticator veya benzeri bir uygulama kullanın.
          </p>

          {user.twoFactorEnabled ? (
            <div>
              <div className="flex items-center gap-2 text-emerald-600 mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="font-medium">2FA Aktif</span>
              </div>
              <button
                onClick={handleDisable2FA}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-medium hover:bg-red-200 transition-colors"
              >
                2FA Devre Dışı Bırak
              </button>
            </div>
          ) : twoFAData ? (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-2">Bu kodu Google Authenticator uygulamanıza ekleyin:</p>
                <code className="text-sm bg-white px-3 py-2 rounded-lg border block break-all">{twoFAData.secret}</code>
              </div>
              <form action={handleVerify2FA} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Doğrulama Kodu</label>
                  <input
                    name="code"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="000000"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-center text-2xl tracking-widest text-gray-900"
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                  Doğrula ve Etkinleştir
                </button>
              </form>
            </div>
          ) : (
            <button
              onClick={handleEnable2FA}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              2FA Etkinleştir
            </button>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { updateUserRoleAction, deleteUserAction, createUserAction } from "@/app/actions/admin";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  city: string | null;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  _count: {
    properties: number;
    sentMessages: number;
    favorites: number;
  };
}

const roleLabels: Record<string, string> = { user: "Alıcı", agent: "Satıcı", admin: "Yönetici" };

export function UsersClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  async function handleRoleChange(userId: string, newRole: string) {
    const result = await updateUserRoleAction(userId, newRole);
    if ("success" in result && result.success) {
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      setMessage({ type: "success", text: result.success });
    }
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleDelete(userId: string, userName: string) {
    if (!confirm(`"${userName}" kullanıcısını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;

    const result = await deleteUserAction(userId);
    if ("success" in result && result.success) {
      setUsers(users.filter((u) => u.id !== userId));
      setMessage({ type: "success", text: result.success });
    } else if ("error" in result && result.error) {
      setMessage({ type: "error", text: result.error });
    }
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleCreate(formData: FormData) {
    const result = await createUserAction(formData);
    if ("success" in result && result.success) {
      setMessage({ type: "success", text: result.success });
      setShowCreate(false);
      window.location.reload();
    } else if ("error" in result && result.error) {
      setMessage({ type: "error", text: result.error });
    }
    setTimeout(() => setMessage(null), 3000);
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
          placeholder="Kullanıcı ara (ad, e-posta)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Kullanıcı
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Yeni Kullanıcı Oluştur</h2>
          <form action={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input name="name" placeholder="Ad Soyad" required className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            <input name="email" type="email" placeholder="E-posta" required className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            <input name="password" type="password" placeholder="Şifre" required className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            <input name="phone" placeholder="Telefon (opsiyonel)" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            <select name="role" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="user">Alıcı</option>
              <option value="agent">Satıcı</option>
              <option value="admin">Yönetici</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Oluştur
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanıcı</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Şehir</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">İlan</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Mesaj</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">2FA</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kayıt</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${
                        user.role === "admin" ? "bg-red-100 text-red-700" :
                        user.role === "agent" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <option value="user">Alıcı</option>
                      <option value="agent">Satıcı</option>
                      <option value="admin">Yönetici</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.city || "-"}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{user._count.properties}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{user._count.sentMessages}</td>
                  <td className="px-4 py-3 text-center">
                    {user.twoFactorEnabled ? (
                      <span className="text-green-500">
                        <svg className="w-5 h-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(user.id, user.name)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
          Toplam {filteredUsers.length} kullanıcı
        </div>
      </div>
    </>
  );
}

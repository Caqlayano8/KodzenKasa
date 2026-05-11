import { getAdminStats } from "@/app/actions/admin";
import Link from "next/link";

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const statCards = [
    { label: "Toplam Kullanıcı", value: stats.totalUsers, href: "/admin/kullanicilar", color: "from-blue-500 to-blue-600", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { label: "Toplam İlan", value: stats.totalProperties, href: "/admin/ilanlar", color: "from-green-500 to-green-600", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    { label: "Aktif İlan", value: stats.activeProperties, href: "/admin/ilanlar", color: "from-emerald-500 to-emerald-600", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Toplam Mesaj", value: stats.totalMessages, href: "/admin/mesajlar", color: "from-purple-500 to-purple-600", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
    { label: "Bildirimler", value: stats.totalNotifications, href: "/admin/bildirimler", color: "from-orange-500 to-orange-600", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
    { label: "Favoriler", value: stats.totalFavorites, href: "/admin", color: "from-red-500 to-red-600", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
  ];

  const roleLabels: Record<string, string> = { user: "Alıcı", agent: "Satıcı", admin: "Yönetici" };
  const typeLabels: Record<string, string> = { satilik: "Satılık", kiralik: "Kiralık" };
  const statusLabels: Record<string, string> = { active: "Aktif", inactive: "Pasif", sold: "Satıldı", rented: "Kiralandı" };
  const categoryLabels: Record<string, string> = { daire: "Daire", villa: "Villa", konut: "Konut", arsa: "Arsa", arazi: "Arazi", dukkan: "Dükkan", ofis: "Ofis", depo: "Depo" };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-lg flex items-center justify-center`}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Users by Role */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Kullanıcı Dağılımı</h2>
          <div className="space-y-3">
            {stats.usersByRole.map((item) => (
              <div key={item.role} className="flex items-center justify-between">
                <span className="text-gray-600">{roleLabels[item.role] || item.role}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(item._count.id / stats.totalUsers) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">{item._count.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Properties by Type */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">İlan Türü Dağılımı</h2>
          <div className="space-y-3">
            {stats.propertiesByType.map((item) => (
              <div key={item.type} className="flex items-center justify-between">
                <span className="text-gray-600">{typeLabels[item.type] || item.type}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(item._count.id / stats.totalProperties) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">{item._count.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Properties by Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">İlan Durumu</h2>
          <div className="space-y-3">
            {stats.propertiesByStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className="text-gray-600">{statusLabels[item.status] || item.status}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${(item._count.id / stats.totalProperties) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">{item._count.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Properties by Category */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Kategori Dağılımı</h2>
          <div className="space-y-3">
            {stats.propertiesByCategory.map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <span className="text-gray-600">{categoryLabels[item.category] || item.category}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(item._count.id / stats.totalProperties) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">{item._count.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Son Kayıt Olan Kullanıcılar</h2>
            <Link href="/admin/kullanicilar" className="text-sm text-blue-600 hover:text-blue-700">
              Tümünü Gör
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  user.role === "admin" ? "bg-red-100 text-red-700" :
                  user.role === "agent" ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {roleLabels[user.role] || user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Properties */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Son Eklenen İlanlar</h2>
            <Link href="/admin/ilanlar" className="text-sm text-blue-600 hover:text-blue-700">
              Tümünü Gör
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentProperties.map((property) => (
              <div key={property.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{property.title}</p>
                  <p className="text-xs text-gray-500">{property.user.name} - {property.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {property.price.toLocaleString("tr-TR")} TL
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    property.status === "active" ? "bg-green-100 text-green-700" :
                    property.status === "inactive" ? "bg-gray-100 text-gray-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {statusLabels[property.status] || property.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

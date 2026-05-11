import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { ProfileClient } from "./ProfileClient";

export const metadata = { title: "Profilim - KodzenKasa" };

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/giris");

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      bio: true,
      city: true,
      twoFactorEnabled: true,
      createdAt: true,
      _count: {
        select: {
          properties: true,
          favorites: true,
          sentMessages: true,
        },
      },
    },
  });

  if (!user) redirect("/giris");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Profilim</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0)
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-gray-500 text-sm">{user.email}</p>
          <p className="text-gray-400 text-xs mt-1">Üye: {formatDate(user.createdAt)}</p>

          <div className="grid grid-cols-3 gap-2 mt-6">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-lg font-bold text-gray-900">{user._count.properties}</div>
              <div className="text-xs text-gray-500">İlan</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-lg font-bold text-gray-900">{user._count.favorites}</div>
              <div className="text-xs text-gray-500">Favori</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-lg font-bold text-gray-900">{user._count.sentMessages}</div>
              <div className="text-xs text-gray-500">Mesaj</div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <ProfileClient user={user} />
        </div>
      </div>
    </div>
  );
}

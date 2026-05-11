import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NavbarClient } from "./NavbarClient";

export async function Navbar() {
  const session = await getSession();
  let unreadCount = 0;
  let unreadMessages = 0;

  if (session) {
    [unreadCount, unreadMessages] = await Promise.all([
      prisma.notification.count({
        where: { userId: session.id, read: false },
      }),
      prisma.message.count({
        where: { receiverId: session.id, read: false },
      }),
    ]);
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                KodzenKasa
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/borsa" className="text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-1">
                <span>📊</span> Borsa
              </Link>
              <Link href="/ilanlar?type=satilik" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                Satılık
              </Link>
              <Link href="/ilanlar?type=kiralik" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                Kiralık
              </Link>
              <Link href="/ilanlar" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                Tüm İlanlar
              </Link>
            </div>
          </div>

          <NavbarClient
            session={session}
            unreadCount={unreadCount}
            unreadMessages={unreadMessages}
          />
        </div>
      </nav>
    </header>
  );
}

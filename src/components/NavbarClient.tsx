"use client";

import Link from "next/link";
import { useState } from "react";
import { logoutAction } from "@/app/actions/auth";
import type { SessionUser } from "@/lib/auth";

interface NavbarClientProps {
  session: SessionUser | null;
  unreadCount: number;
  unreadMessages: number;
}

export function NavbarClient({ session, unreadCount, unreadMessages }: NavbarClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3">
        {session ? (
          <>
            <Link
              href="/ilan-ver"
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              İlan Ver
            </Link>

            <Link href="/mesajlar" className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </Link>

            <Link href="/bildirimler" className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                  {session.avatar ? (
                    <img src={session.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    session.name.charAt(0).toUpperCase()
                  )}
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{session.name}</p>
                    <p className="text-sm text-gray-500">{session.email}</p>
                  </div>
                  <Link
                    href="/profil"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profilim
                  </Link>
                  <Link
                    href="/ilanlarim"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    İlanlarım
                  </Link>
                  <Link
                    href="/favoriler"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Favorilerim
                  </Link>
                  {session.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-indigo-600 hover:bg-indigo-50 font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Admin Paneli
                    </Link>
                  )}
                  <hr className="my-1 border-gray-100" />
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Çıkış Yap
                    </button>
                  </form>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/giris" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Giriş Yap
            </Link>
            <Link
              href="/kayit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
            >
              Kayıt Ol
            </Link>
          </div>
        )}

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-gray-500 hover:text-blue-600"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 py-3 space-y-1">
          <Link href="/borsa" className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setMobileOpen(false)}>
            📊 Borsa
          </Link>
          <Link href="/ilanlar?type=satilik" className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg" onClick={() => setMobileOpen(false)}>
            Satılık
          </Link>
          <Link href="/ilanlar?type=kiralik" className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg" onClick={() => setMobileOpen(false)}>
            Kiralık
          </Link>
          <Link href="/ilanlar" className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg" onClick={() => setMobileOpen(false)}>
            Tüm İlanlar
          </Link>
          {session && (
            <Link href="/ilan-ver" className="block px-3 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg" onClick={() => setMobileOpen(false)}>
              İlan Ver
            </Link>
          )}
        </div>
      )}
    </>
  );
}

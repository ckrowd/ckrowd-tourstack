"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface TopNavProps {
  showSearch?: boolean;
}

const NOTIFICATIONS = [
  { id: "n1", icon: "task_alt", color: "text-emerald-500", title: "EOI Approved", body: "Aria Velvet — Accra, Ghana", time: "2h ago" },
  { id: "n2", icon: "edit_note", color: "text-[#FF5A30]", title: "Revision Requested", body: "Frequency Shift — budget too low", time: "Yesterday" },
  { id: "n3", icon: "send", color: "text-blue-500", title: "EOI Submitted", body: "Vanguard Echo — pending review", time: "3 days ago" },
];

export default function TopNav({ showSearch = false }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { auth, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);

  const activeLink =
    pathname.startsWith("/dashboard")
      ? "platform"
      : pathname.startsWith("/discovery")
      ? "discovery"
      : pathname.startsWith("/financing")
      ? "financing"
      : null;

  const linkClass = (key: string) =>
    `transition-colors font-(family-name:--font-manrope) font-semibold ${
      activeLink === key
        ? "text-[#FF5A30] font-bold border-b-2 border-[#FF5A30] pb-1"
        : "text-slate-500 hover:text-[#FF5A30]"
    }`;

  const userInitial = auth?.email ? auth.email[0].toUpperCase() : "U";

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-orange-100/10 shadow-sm">
        <div className="flex justify-between items-center h-16 px-6 md:px-12 w-full mx-auto">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-2xl font-black tracking-tight text-[#FF5A30] font-(family-name:--font-manrope)"
            >
              Tour Stack by Crowd
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className={linkClass("platform")}>
                Platform
              </Link>
              <Link href="/discovery" className={linkClass("discovery")}>
                Discovery
              </Link>
              <Link href="/financing" className={linkClass("financing")}>
                Financing
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {showSearch && (
              <div className="relative hidden sm:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search tours..."
                  className="bg-[#e0e3e5] border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#FF5A30]/20 w-64 outline-none"
                />
              </div>
            )}

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                aria-label="Open notifications"
                aria-expanded={notifOpen}
                onClick={() => setNotifOpen((v) => !v)}
                className="p-2 hover:bg-slate-50/50 rounded-lg transition-all active:scale-95 relative"
              >
                <span className="material-symbols-outlined text-[#494455]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF5A30] rounded-full" />
              </button>
            </div>

            {/* Settings */}
            <Link
              href="/settings"
              aria-label="Settings"
              className="p-2 hover:bg-slate-50/50 rounded-lg transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[#494455]">settings</span>
            </Link>

            {/* Avatar / logout */}
            {auth?.authenticated ? (
              <div className="flex items-center gap-2 ml-2">
                <div className="h-8 w-8 rounded-full bg-[#FF5A30] flex items-center justify-center text-white text-xs font-bold select-none">
                  {userInitial}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs font-semibold text-slate-500 hover:text-[#FF5A30] transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="ml-2 px-4 py-2 bg-[#FF5A30] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Notifications slide-in panel */}
      {notifOpen && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-40 w-full h-full cursor-default bg-transparent border-none"
            onClick={() => setNotifOpen(false)}
          />
          {/* Panel */}
          <div
            className="fixed top-16 right-4 md:right-12 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-(family-name:--font-manrope) font-bold text-sm text-slate-900">
                Notifications
              </h3>
              <button
                type="button"
                onClick={() => setNotifOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Close notifications"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <ul className="divide-y divide-slate-50">
              {NOTIFICATIONS.map((n) => (
                <li key={n.id} className="flex items-start gap-3 px-5 py-4 hover:bg-slate-50 transition-colors">
                  <span className={`material-symbols-outlined text-lg mt-0.5 shrink-0 ${n.color}`}>
                    {n.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0 mt-0.5">{n.time}</span>
                </li>
              ))}
            </ul>
            <div className="px-5 py-3 border-t border-slate-100">
              <button
                type="button"
                className="text-xs font-semibold text-[#FF5A30] hover:underline"
                onClick={() => setNotifOpen(false)}
              >
                Mark all as read
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { key: "overview", label: "Overview", icon: "dashboard", href: "/admin" },
  { key: "tours", label: "Tour Projects", icon: "confirmation_number", href: "/admin/tours" },
  { key: "eoi", label: "EOI Reviews", icon: "send", href: "/admin/eoi" },
  { key: "financing", label: "Financing", icon: "account_balance", href: "/admin/financing" },
  { key: "reports", label: "Reports", icon: "bar_chart", href: "/admin/reports" },
  { key: "settings", label: "Settings", icon: "settings", href: "/admin/settings" },
];

export default function AdminSideNav() {
  const pathname = usePathname();

  // Highlight the current route
  const activeItem = navItems.find((item) => {
    if (item.href === "/admin") return pathname === "/admin";
    return pathname.startsWith(item.href);
  })?.key || "overview";

  return (
    <aside className="hidden lg:flex flex-col gap-2 py-6 h-full w-64 border-r border-slate-200 bg-slate-50 shrink-0">
      <nav className="flex-1 space-y-1 mt-2">
        {navItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl mx-2 transition-all duration-200 font-(family-name:--font-manrope) font-semibold text-sm ${
              activeItem === item.key
                ? "bg-orange-50 text-[#FF5A30]"
                : "text-slate-600 hover:bg-slate-200/50 hover:translate-x-1"
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="px-4 mt-auto">
        <Link
          href="/admin/tours/create"
          className="block w-full py-4 bg-[#FF5A30] text-white rounded-xl font-(family-name:--font-manrope) font-bold text-sm shadow-lg shadow-[#FF5A30]/20 hover:scale-[1.02] transition-transform active:scale-95 text-center flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Tour Project
        </Link>
      </div>
    </aside>
  );
}

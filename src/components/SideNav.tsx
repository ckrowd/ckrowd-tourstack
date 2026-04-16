"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navItems = [
  { key: "overview", label: "Dashboard", icon: "dashboard", href: "/dashboard" },
  { key: "tours", label: "Tours", icon: "confirmation_number", href: "/tours" },
  { key: "requests", label: "Requests", icon: "send", href: "/eoi" },
  { key: "onboarding", label: "Onboarding", icon: "how_to_reg", href: "/onboarding" },
  { key: "profile", label: "Profile", icon: "person", href: "/profile" },
  { key: "settings", label: "Settings", icon: "settings", href: "/settings" },
];

export default function SideNav() {
  const pathname = usePathname();

  const activeItem = navItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  )?.key;

  return (
    <aside className="hidden lg:flex flex-col gap-2 py-6 h-full w-64 border-r border-slate-200 bg-slate-50 shrink-0">
      <div className="px-6 mb-8 flex items-center gap-3">
        <Image src="/ckrowd-logo.png" alt="Ckrowd logo" width={36} height={36} />
        <div className="flex flex-col leading-tight">
          <span className="font-(family-name:--font-manrope) font-black text-base text-[#FF5A30]">Tourstack</span>
          <span className="text-[10px] font-semibold text-black font-(family-name:--font-manrope)">by Ckrowd</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
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
          href="/eoi"
          className="block w-full py-4 bg-[#FF5A30] text-white rounded-xl font-(family-name:--font-manrope) font-bold text-sm shadow-lg shadow-[#FF5A30]/20 hover:scale-[1.02] transition-transform active:scale-95 text-center"
        >
          Start New Tour
        </Link>
      </div>
    </aside>
  );
}

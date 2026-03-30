import Link from "next/link";

interface SideNavProps {
  activeItem?: "overview" | "tours" | "requests" | "financing" | "settings";
}

const navItems = [
  { key: "overview", label: "Overview", icon: "dashboard", href: "/dashboard" },
  { key: "tours", label: "Tours", icon: "confirmation_number", href: "#" },
  { key: "requests", label: "Requests", icon: "send", href: "/eoi" },
  { key: "financing", label: "Financing", icon: "payments", href: "#" },
  { key: "settings", label: "Settings", icon: "settings", href: "#" },
];

export default function SideNav({ activeItem = "overview" }: SideNavProps) {
  return (
    <aside className="hidden lg:flex flex-col gap-2 py-6 h-full w-64 border-r border-slate-200 bg-slate-50 shrink-0">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="h-10 w-10 bg-[#FF5A30] rounded-xl flex items-center justify-center text-white">
          <span className="material-symbols-outlined">confirmation_number</span>
        </div>
        <div>
          <h3 className="font-[family-name:var(--font-manrope)] font-bold text-sm text-[#191c1e]">
            Tour Manager
          </h3>
          <p className="text-[10px] uppercase tracking-wider text-[#494455] font-semibold">
            Global Stage Pro
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl mx-2 transition-all duration-200 font-[family-name:var(--font-manrope)] font-semibold text-sm ${
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
        <button className="w-full py-4 bg-[#FF5A30] text-white rounded-xl font-[family-name:var(--font-manrope)] font-bold text-sm shadow-lg shadow-[#FF5A30]/20 hover:scale-[1.02] transition-transform active:scale-95">
          Start New Tour
        </button>
      </div>
    </aside>
  );
}

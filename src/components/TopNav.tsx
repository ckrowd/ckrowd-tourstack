import Link from "next/link";

interface TopNavProps {
  activeLink?: "platform" | "discovery" | "financing";
  showSearch?: boolean;
}

export default function TopNav({
  activeLink = "platform",
  showSearch = false,
}: TopNavProps) {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-orange-100/10 shadow-sm">
      <div className="flex justify-between items-center h-16 px-6 md:px-12 w-full mx-auto">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-[#FF5A30] font-[family-name:var(--font-manrope)]"
          >
            The Global Stage
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className={`transition-colors font-[family-name:var(--font-manrope)] font-semibold ${
                activeLink === "platform"
                  ? "text-[#FF5A30] font-bold border-b-2 border-[#FF5A30] pb-1"
                  : "text-slate-500 hover:text-[#FF5A30]"
              }`}
            >
              Platform
            </Link>
            <Link
              href="/discovery"
              className={`transition-colors font-[family-name:var(--font-manrope)] font-semibold ${
                activeLink === "discovery"
                  ? "text-[#FF5A30] font-bold border-b-2 border-[#FF5A30] pb-1"
                  : "text-slate-500 hover:text-[#FF5A30]"
              }`}
            >
              Discovery
            </Link>
            <Link
              href="#"
              className={`transition-colors font-[family-name:var(--font-manrope)] font-semibold ${
                activeLink === "financing"
                  ? "text-[#FF5A30] font-bold border-b-2 border-[#FF5A30] pb-1"
                  : "text-slate-500 hover:text-[#FF5A30]"
              }`}
            >
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
          <button className="p-2 hover:bg-slate-50/50 rounded-lg transition-all active:scale-95">
            <span className="material-symbols-outlined text-[#494455]">
              notifications
            </span>
          </button>
          <button className="p-2 hover:bg-slate-50/50 rounded-lg transition-all active:scale-95">
            <span className="material-symbols-outlined text-[#494455]">
              settings
            </span>
          </button>
          <div className="h-8 w-8 rounded-full overflow-hidden bg-[#FF5A30]/10 ml-2">
            <div className="w-full h-full bg-[#FF5A30] flex items-center justify-center text-white text-xs font-bold">
              U
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

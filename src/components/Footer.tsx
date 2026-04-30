import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full mt-16 py-12 px-6 md:px-12 border-t border-slate-200 bg-slate-50">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start max-w-7xl mx-auto">
        <div className="md:col-span-1">
          <div className="font-[family-name:var(--font-manrope)] font-bold text-slate-900 text-xl mb-4">
            Tour Stack by Crowd
          </div>
          <p className="font-[family-name:var(--font-inter)] text-xs uppercase tracking-widest text-slate-500 leading-relaxed">
            Empowering the live music industry with modern tools.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#494455]">
            Platform
          </h4>
          <Link href="/discovery" className="font-[family-name:var(--font-inter)] text-xs uppercase tracking-widest text-slate-400 hover:text-[#FF5A30] transition-colors">
            Discovery
          </Link>
          <Link href="/analytics" className="font-[family-name:var(--font-inter)] text-xs uppercase tracking-widest text-slate-400 hover:text-[#FF5A30] transition-colors">
            Analytics
          </Link>
          <Link href="/financing" className="font-[family-name:var(--font-inter)] text-xs uppercase tracking-widest text-slate-400 hover:text-[#FF5A30] transition-colors">
            Financing
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#494455]">
            Company
          </h4>
          <Link href="/contact" className="font-[family-name:var(--font-inter)] text-xs uppercase tracking-widest text-slate-400 hover:text-[#FF5A30] transition-colors">
            Contact
          </Link>
          <Link href="/privacy" className="font-[family-name:var(--font-inter)] text-xs uppercase tracking-widest text-slate-400 hover:text-[#FF5A30] transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="font-[family-name:var(--font-inter)] text-xs uppercase tracking-widest text-slate-400 hover:text-[#FF5A30] transition-colors">
            Terms of Service
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#494455]">
            Stay Updated
          </h4>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Email address"
              className="bg-white border-none rounded-lg focus:ring-2 focus:ring-[#FF5A30] text-sm w-full px-3 py-2 outline-none"
            />
            <button type="submit" className="bg-[#FF5A30] text-white p-2 rounded-lg hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
          <div className="flex gap-4 mt-2">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter / X"
              className="p-2 bg-[#eceef0] rounded-lg hover:scale-110 transition-transform"
            >
              <span className="material-symbols-outlined text-sm">alternate_email</span>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-2 bg-[#eceef0] rounded-lg hover:scale-110 transition-transform"
            >
              <span className="material-symbols-outlined text-sm">share</span>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="p-2 bg-[#eceef0] rounded-lg hover:scale-110 transition-transform"
            >
              <span className="material-symbols-outlined text-sm">public</span>
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
        <p className="font-[family-name:var(--font-inter)] text-xs uppercase tracking-widest text-slate-500">
          &copy; 2024 Tour Stack by Crowd. All rights reserved.
        </p>

      </div>
    </footer>
  );
}

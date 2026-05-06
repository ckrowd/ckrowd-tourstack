import { Link } from "@/i18n/routing";
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');
  const tCommon = useTranslations('Common');

  return (
    <footer className="w-full mt-16 py-12 px-6 md:px-12 border-t border-slate-200 bg-slate-50">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start max-w-7xl mx-auto">
        <div className="md:col-span-1">
          <div className="font-[family-name:var(--font-manrope)] font-bold text-slate-900 text-xl mb-4">
            {t('title')}
          </div>
          <p className="font-[family-name:var(--font-inter)] text-xs uppercase tracking-widest text-slate-500 leading-relaxed">
            {t('tagline')}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#494455]">
            {t('platform.heading')}
          </h4>
          <Link href="/discovery" className="font-[family-name:var(--font-inter)] text-xs uppercase tracking-widest text-slate-400 hover:text-[#FF5A30] transition-colors">
            {t('platform.discovery')}
          </Link>
          <Link href="/dashboard" className="font-[family-name:var(--font-inter)] text-xs uppercase tracking-widest text-slate-400 hover:text-[#FF5A30] transition-colors">
            {t('platform.analytics')}
          </Link>
          <Link href="/financing" className="font-[family-name:var(--font-inter)] text-xs uppercase tracking-widest text-slate-400 hover:text-[#FF5A30] transition-colors">
            {t('platform.financing')}
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#494455]">
            {t('company.heading')}
          </h4>
          <Link href="/contact" className="font-[family-name:var(--font-inter)] text-xs uppercase tracking-widest text-slate-400 hover:text-[#FF5A30] transition-colors">
            {t('company.contact')}
          </Link>
          <Link href="/privacy" className="font-[family-name:var(--font-inter)] text-xs uppercase tracking-widest text-slate-400 hover:text-[#FF5A30] transition-colors">
            {t('company.privacy')}
          </Link>
          <Link href="/terms" className="font-[family-name:var(--font-inter)] text-xs uppercase tracking-widest text-slate-400 hover:text-[#FF5A30] transition-colors">
            {t('company.terms')}
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#494455]">
            {t('stayUpdated.heading')}
          </h4>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder={t('stayUpdated.placeholder')}
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
          {t('copyright', { 
            year: new Date().getFullYear(),
            brandName: tCommon('brandName'),
            brandBy: tCommon('brandBy')
          })}
        </p>

      </div>
    </footer>
  );
}

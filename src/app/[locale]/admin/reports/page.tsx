import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function AdminReportsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('AdminReportsPage');

  return (
    <>
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-2">
            {t('badge')}
          </span>
          <h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
            {t('title')}
          </h1>
          <p className="text-on-surface-variant font-medium">
            {t('description')}
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-6 py-3 bg-surface-container-high text-on-surface rounded-xl font-(family-name:--font-manrope) font-bold hover:bg-surface-container-highest transition-colors"
        >
          <span className="material-symbols-outlined text-sm">download</span>
          {t('exportCsv')}
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-12 text-center shadow-sm border border-outline-variant/10">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant block mb-6">
          query_stats
        </span>
        <h2 className="text-2xl font-(family-name:--font-manrope) font-black text-on-surface mb-2">
          {t('comingSoon')}
        </h2>
        <p className="text-on-surface-variant">
          {t('comingSoonDesc')}
        </p>
      </div>
    </>
  );
}

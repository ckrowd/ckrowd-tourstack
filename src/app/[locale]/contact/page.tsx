import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import { useTranslations } from 'next-intl';

export default function ContactPage() {
  const t = useTranslations('ContactPage');

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 pt-28 pb-20 px-6 md:px-12 max-w-4xl mx-auto w-full">
        <span className="text-[#FF5A30] font-bold uppercase tracking-widest text-xs mb-4 block">
          {t('getInTouch')}
        </span>
        <h1 className="font-(family-name:--font-manrope) text-4xl font-extrabold tracking-tight text-on-surface mb-4">
          {t('title')}
        </h1>
        <p className="text-on-surface-variant text-lg mb-12 max-w-xl leading-relaxed">
          {t('description')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {[
            {
              icon: "mail",
              title: t('items.general'),
              value: "hello@ckrowd.africa",
              href: "mailto:hello@ckrowd.africa",
            },
            {
              icon: "groups",
              title: t('items.workforce'),
              value: "workforce@ckrowd.africa",
              href: "mailto:workforce@ckrowd.africa",
            },
            {
              icon: "account_balance",
              title: t('items.financing'),
              value: "finance@ckrowd.africa",
              href: "mailto:finance@ckrowd.africa",
            },
            {
              icon: "gavel",
              title: t('items.legal'),
              value: "legal@ckrowd.africa",
              href: "mailto:legal@ckrowd.africa",
            },
          ].map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="flex items-start gap-4 p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm hover:shadow-md hover:border-[#FF5A30]/20 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#FF5A30]/10 flex items-center justify-center shrink-0 group-hover:bg-[#FF5A30]/20 transition-colors">
                <span className="material-symbols-outlined text-[#FF5A30]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {item.icon}
                </span>
              </div>
              <div>
                <p className="font-bold text-on-surface mb-1">{item.title}</p>
                <p className="text-[#FF5A30] font-semibold text-sm group-hover:underline">{item.value}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10 text-center">
          <span className="material-symbols-outlined text-[#FF5A30] text-3xl mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>
            location_on
          </span>
          <h2 className="font-(family-name:--font-manrope) font-bold text-lg text-on-surface mb-1">
            {t('location.title')}
          </h2>
          <p className="text-on-surface-variant text-sm">{t('location.subtitle')}</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

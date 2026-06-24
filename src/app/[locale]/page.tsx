import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import CountUp from "@/components/landing/CountUp";
import Faq from "@/components/landing/Faq";
import FundingSlider from "@/components/landing/FundingSlider";
import Reveal from "@/components/landing/Reveal";
import SpotlightCard from "@/components/landing/SpotlightCard";
import Footer from "@/components/Footer";
import TopNav from "@/components/TopNav";
import { Link } from "@/i18n/routing";

/**
 * Landing imagery — art-directed African live-entertainment photography
 * sourced from Pexels (royalty-free, free for commercial use). Files live in
 * /public and are served locally, so no remote image config is required.
 *  - heroPortrait: Afrobeats artist gripping the mic, dark cinematic close-up
 *    (pexels.com/photo/13552377)
 *  - promoter: packed young African crowd at night, phones raised
 *    (pexels.com/photo/29705399)
 *  - artist: editorial portrait of an artist backstage, warm light, crowd bokeh
 *    (pexels.com/photo/25365037)
 *  - band: drone shot of a massive African city concert — conveys market scale
 *    (pexels.com/photo/31265787)
 */
const IMAGES = {
	heroPortrait: "/landing-hero.jpg",
	promoter: "/landing-promoter.jpg",
	artist: "/landing-artist.jpg",
	band: "/landing-market.jpg",
} as const;

export default async function LandingPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("LandingPage");
	const tWhy = await getTranslations("LandingPage.WhyCkrowd");
	const tHow = await getTranslations("LandingPage.HowItWorks");

	const heroStats = [
		{ key: "payroll", prefix: "₦", end: 320, suffix: "M", icon: "payments" },
		{ key: "defaults", prefix: "", end: 0, suffix: "", icon: "verified" },
		{ key: "promoters", prefix: "", end: 230, suffix: "+", icon: "groups" },
		{ key: "markets", prefix: "", end: 45, suffix: "", icon: "public" },
	] as const;

	const marketStats = [
		{ key: "em", prefix: "$", end: 28.4, suffix: "B", decimals: 1 },
		{ key: "creative", prefix: "$", end: 58.4, suffix: "B", decimals: 1 },
		{ key: "shows", prefix: "+", end: 400, suffix: "%", decimals: 0 },
		{ key: "financing", prefix: "$", end: 2, suffix: "B", decimals: 0 },
	] as const;

	const howKeys = ["announcement", "submission", "matching", "decision"] as const;

	const partners = [
		{ name: "Access Bank", logo: "/access-bank.png", width: 108 },
		{ name: "Sanlam Allianz", logo: "/sanlam-allianz.png", width: 126 },
	];
	const partnerMarks = ["AFREXIMBANK", "PAPSS", "COWRIS"];

	const faqItems = (["q1", "q2", "q3", "q4"] as const).map((k) => ({
		q: t(`faq.items.${k}.q`),
		a: t(`faq.items.${k}.a`),
	}));

	return (
		<div
			className="bg-[#0a0a0a] text-neutral-100 overflow-x-hidden"
			// Landing-scoped type system: Archivo Black display headers (loaded via
			// next/font as --font-display, Helvetica/Arial fallback), Inter for body.
			// `--font-manrope` is what every heading on this page resolves to.
			style={
				{
					"--font-manrope":
						'var(--font-display), "Helvetica Neue", Arial, sans-serif',
				} as React.CSSProperties
			}
		>
			<TopNav />

			{/* ── HERO — cinematic, stat row at the base ───────────────────────── */}
			<section className="relative min-h-[100dvh] flex flex-col justify-end overflow-hidden pt-16">
				<div className="absolute inset-0 z-0">
					<Image
						alt={t("hero.imageAlt")}
						fill
						priority
						className="object-cover object-[58%_18%]"
						src={IMAGES.heroPortrait}
					/>
					<div className="absolute inset-0 bg-[linear-gradient(105deg,#0a0a0a_30%,rgba(10,10,10,0.6)_55%,rgba(10,10,10,0.2)_100%)]" />
					<div className="absolute inset-0 bg-[linear-gradient(to_top,#0a0a0a_2%,transparent_45%)]" />
				</div>
				<div className="aurora absolute top-[-10%] right-[5%] w-[50%] h-[70%] z-0 opacity-50 blur-[80px] rounded-full bg-[radial-gradient(circle,rgba(255,90,48,0.5),transparent_65%)] mix-blend-screen" aria-hidden="true" />
				<div className="aurora absolute top-[10%] right-0 w-[45%] h-[60%] z-0 opacity-40 blur-[90px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.45),transparent_65%)] mix-blend-screen" style={{ animationDelay: "-6s" }} aria-hidden="true" />

				<div className="relative z-10 w-full">
					<div className="max-w-7xl mx-auto px-6 md:px-12 pb-14">
						<Reveal>
							<div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#FF5A30]/30 bg-[#FF5A30]/10 mb-7">
								<span className="w-1.5 h-1.5 rounded-full bg-[#FF5A30]" aria-hidden="true" />
								<span className="text-[#FF5A30] text-[11px] font-bold tracking-[0.15em] uppercase">{t("hero.badge")}</span>
							</div>
						</Reveal>
						<Reveal delay={80}>
							<h1 className="font-(family-name:--font-manrope) font-extrabold text-white leading-[0.98] tracking-tight text-6xl md:text-7xl xl:text-[92px] max-w-[14ch] mb-7">
								{t.rich("hero.title", {
									spanTag: (chunks) => <span className="text-[#FF5A30]">{chunks}</span>,
								})}
							</h1>
						</Reveal>
						<Reveal delay={160}>
							<p className="text-slate-300 text-lg md:text-xl max-w-[54ch] leading-relaxed mb-9">{t("hero.description")}</p>
						</Reveal>
						<Reveal delay={240}>
							<div className="flex flex-col sm:flex-row gap-3">
								<Link href="/discovery" className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#FF5A30] text-white rounded-xl font-bold text-base hover:bg-[#e04e28] hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-lg shadow-[#FF5A30]/35">
									{t("hero.ctaPrimary")}
									<span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
								</Link>
								<Link href="/login" className="inline-flex items-center justify-center px-8 py-4 bg-white/7 text-white rounded-xl font-bold text-base border border-white/15 backdrop-blur-sm hover:bg-white/12 transition-all">{t("hero.ctaSecondary")}</Link>
							</div>
						</Reveal>
					</div>

					<Reveal delay={300} className="border-t border-white/10 bg-[#000000]/50 backdrop-blur-md">
						<div className="max-w-7xl mx-auto px-6 md:px-12 py-7 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6">
							{heroStats.map(({ key, prefix, end, suffix, icon }, i) => (
								<div key={key} className={`flex items-center gap-4 ${i > 0 ? "lg:border-l lg:border-white/10 lg:pl-6" : ""}`}>
									<div className="w-11 h-11 rounded-xl bg-[#FF5A30]/12 flex items-center justify-center text-[#FF5A30] shrink-0">
										<span className="material-symbols-outlined text-[22px]">{icon}</span>
									</div>
									<div>
										<div className="font-(family-name:--font-manrope) text-2xl md:text-3xl font-black text-white leading-none tabular-nums">
											<CountUp end={end} prefix={prefix} suffix={suffix} />
										</div>
										<div className="text-xs text-slate-400 mt-1 leading-tight">{t(`stats.${key}`)}</div>
									</div>
								</div>
							))}
						</div>
					</Reveal>
				</div>
			</section>

			{/* ── LOGO WALL ────────────────────────────────────────────────────── */}
			<div className="marquee-row py-11 border-b border-white/10 overflow-hidden bg-[#0a0a0a]">
				<p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-7">{t("partners.title")}</p>
				<div className="overflow-hidden">
					<div className="flex items-center gap-[72px] animate-marquee" style={{ width: "max-content" }} aria-hidden="true">
						{[0, 1].map((copy) => (
							<div key={copy} className="flex items-center gap-[72px] shrink-0">
								{partners.map(({ name, logo, width }) => (
									<div key={name} className="bg-white/95 rounded-lg px-5 py-3 flex items-center opacity-85 hover:opacity-100 transition-opacity">
										<Image src={logo} alt={name} width={width} height={28} className="object-contain h-7 w-auto" />
									</div>
								))}
								{partnerMarks.map((m) => (
									<span key={m} className="text-lg font-extrabold text-white/30 hover:text-white/55 transition-colors">{m}</span>
								))}
							</div>
						))}
					</div>
				</div>
				<Reveal className="text-center mt-7 px-6">
					<p className="text-slate-500 text-sm max-w-2xl mx-auto leading-relaxed">{t("partners.eoi")}</p>
				</Reveal>
			</div>

			{/* ── BENTO — embedded product UI ──────────────────────────────────── */}
			<section className="py-28 px-6 md:px-12 bg-[#0a0a0a]">
				<div className="max-w-7xl mx-auto">
					<Reveal className="mb-16 max-w-2xl">
						<span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF5A30] block mb-4">{t("why.badge")}</span>
						<h2 className="font-(family-name:--font-manrope) font-extrabold text-4xl md:text-5xl text-white tracking-tight mb-4 leading-[1.05]">{t("why.title")}</h2>
						<p className="text-slate-400 text-base leading-relaxed">{t("why.description")}</p>
					</Reveal>

					<div className="grid grid-cols-1 md:grid-cols-6 gap-4">
						{/* centralized + pipeline mini-UI */}
						<Reveal className="md:col-span-4">
							<SpotlightCard className="h-full bg-[#161616] border border-white/10 rounded-[20px] p-8 hover:border-[#FF5A30]/30 transition-colors duration-500">
								<div className="flex gap-7 items-center justify-between flex-wrap">
									<div className="flex-1 min-w-[240px]">
										<div className="w-12 h-12 rounded-xl bg-[#FF5A30]/14 flex items-center justify-center text-[#FF5A30] mb-5"><span className="material-symbols-outlined text-2xl">{tWhy("centralized.icon")}</span></div>
										<h3 className="font-(family-name:--font-manrope) font-bold text-xl text-white mb-2.5">{tWhy("centralized.title")}</h3>
										<p className="text-slate-400 text-sm leading-relaxed max-w-[40ch]">{tWhy("centralized.desc")}</p>
									</div>
									<div className="flex-1 min-w-[260px] bg-[#000000] border border-white/10 rounded-2xl p-5">
										<div className="flex justify-between items-center mb-3.5"><span className="text-xs font-semibold text-slate-400">Tour pipeline</span><span className="text-xs font-semibold text-[#FF5A30]">+18%</span></div>
										<div className="flex items-end gap-2 h-[90px]">
											{[40, 60, 52, 78, 95, 70].map((h, idx) => (
												<div key={idx} className="flex-1 rounded-t-md" style={{ height: `${h}%`, background: idx < 2 ? "rgba(255,255,255,0.1)" : "linear-gradient(to top,rgba(255,90,48,0.3),rgba(255,90,48,0.8))" }} />
											))}
										</div>
										<div className="flex gap-2 mt-3.5">
											<span className="text-[11px] font-bold px-2.5 py-1.5 rounded-md bg-[#FF5A30]/12 text-[#FF5A30]">12 active</span>
											<span className="text-[11px] font-bold px-2.5 py-1.5 rounded-md bg-emerald-400/14 text-emerald-400">38 approved</span>
										</div>
									</div>
								</div>
							</SpotlightCard>
						</Reveal>

						{/* matching accent */}
						<Reveal className="md:col-span-2" delay={80}>
							<SpotlightCard className="h-full bg-[#FF5A30]/10 border border-[#FF5A30]/20 rounded-[20px] p-8 hover:border-[#FF5A30]/40 transition-colors duration-500">
								<div className="w-12 h-12 rounded-xl bg-[#FF5A30]/20 flex items-center justify-center text-[#FF5A30] mb-5"><span className="material-symbols-outlined text-2xl">{tWhy("matching.icon")}</span></div>
								<h3 className="font-(family-name:--font-manrope) font-bold text-lg text-white mb-2.5">{tWhy("matching.title")}</h3>
								<p className="text-slate-300/80 text-sm leading-relaxed">{tWhy("matching.desc")}</p>
							</SpotlightCard>
						</Reveal>

						{/* data-driven */}
						<Reveal className="md:col-span-2">
							<SpotlightCard className="h-full bg-[#161616] border border-white/10 rounded-[20px] p-8 hover:border-white/20 transition-colors duration-500">
								<div className="w-12 h-12 rounded-xl bg-[#FF5A30]/14 flex items-center justify-center text-[#FF5A30] mb-5"><span className="material-symbols-outlined text-2xl">{tWhy("dataDriven.icon")}</span></div>
								<h3 className="font-(family-name:--font-manrope) font-bold text-lg text-white mb-2.5">{tWhy("dataDriven.title")}</h3>
								<p className="text-slate-400 text-sm leading-relaxed">{tWhy("dataDriven.desc")}</p>
							</SpotlightCard>
						</Reveal>

						{/* financing + approval mini-UI */}
						<Reveal className="md:col-span-4" delay={80}>
							<SpotlightCard className="h-full bg-[#161616] border border-white/10 rounded-[20px] p-8 hover:border-[#FF5A30]/30 transition-colors duration-500">
								<div className="flex gap-7 items-center justify-between flex-wrap">
									<div className="flex-1 min-w-[230px]">
										<div className="w-12 h-12 rounded-xl bg-[#FF5A30]/14 flex items-center justify-center text-[#FF5A30] mb-5"><span className="material-symbols-outlined text-2xl">{tWhy("financing.icon")}</span></div>
										<h3 className="font-(family-name:--font-manrope) font-bold text-xl text-white mb-2.5">{tWhy("financing.title")}</h3>
										<p className="text-slate-400 text-sm leading-relaxed max-w-[40ch]">{tWhy("financing.desc")}</p>
									</div>
									<div className="flex-1 min-w-[240px] bg-[#000000] border border-white/10 rounded-2xl p-5">
										{[
											["Facility", "$240,000"],
											["Coverage", "Event cancellation"],
											["Settlement", "PAPSS · 17 mkts"],
										].map(([k, v]) => (
											<div key={k} className="flex justify-between items-center py-2.5 border-b border-white/10 last:border-0 text-[13px]">
												<span className="text-slate-400">{k}</span>
												<span className="text-white font-bold">{v}</span>
											</div>
										))}
										<div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-400/12 px-3 py-1.5 rounded-lg mt-3">
											<span className="material-symbols-outlined text-[15px]">check_circle</span>Approved in principle
										</div>
									</div>
								</div>
							</SpotlightCard>
						</Reveal>
					</div>
				</div>
			</section>

			{/* ── TRANSPARENT FINANCING ────────────────────────────────────────── */}
			<section className="bg-[#000000] border-y border-white/10">
				<div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-28">
					<Reveal>
						<span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF5A30] block mb-4">{t("transparent.badge")}</span>
						<h2 className="font-(family-name:--font-manrope) font-extrabold text-4xl md:text-5xl text-white leading-[1.08] mb-5">
							{t("transparent.title")}<span className="text-[#FF5A30]">{t("transparent.titleAccent")}</span>{t("transparent.titleEnd")}
						</h2>
						<p className="text-slate-400 text-base leading-relaxed mb-7 max-w-[48ch]">{t("transparent.description")}</p>
						<div className="flex flex-col gap-3.5">
							{(["a", "b", "c"] as const).map((p) => (
								<div key={p} className="flex gap-3 items-start">
									<span className="material-symbols-outlined text-[#FF5A30] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
									<span className="text-slate-300 text-[15px] font-medium">{t(`transparent.points.${p}`)}</span>
								</div>
							))}
						</div>
					</Reveal>
					<Reveal delay={100}>
						<FundingSlider
							cardTitle={t("transparent.cardTitle")}
							rangeLabel={t("transparent.rangeLabel")}
							feeLabel={t("transparent.feeLabel")}
						/>
					</Reveal>
				</div>
			</section>

			{/* ── AUDIENCES ────────────────────────────────────────────────────── */}
			<section className="py-28 px-6 md:px-12 bg-[#0a0a0a]">
				<div className="max-w-7xl mx-auto">
					<Reveal className="mb-12 max-w-2xl">
						<span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF5A30] block mb-4">{t("audiences.badge")}</span>
						<h2 className="font-(family-name:--font-manrope) font-extrabold text-4xl md:text-5xl text-white tracking-tight leading-[1.05]">{t("audiences.title")}</h2>
					</Reveal>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
						{([
							{ kind: "promoters", img: IMAGES.promoter, href: "/discovery", chips: ["stop", "discovery", "financing"] },
							{ kind: "artists", img: IMAGES.artist, href: "/discovery", chips: ["intent", "matching", "eoi"] },
						] as const).map((a, i) => (
							<Reveal key={a.kind} delay={i * 100}>
								<div className="relative rounded-3xl overflow-hidden min-h-[480px] flex flex-col justify-end p-10 border border-white/10">
									<Image src={a.img} alt={t(`${a.kind}.imageAlt`)} fill className="object-cover" />
									<div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,8,8,0.96)_18%,rgba(8,8,8,0.5)_60%,rgba(8,8,8,0.3))]" />
									<div className="relative">
										<div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#FF5A30] mb-3.5">{t(`${a.kind}.badge`)}</div>
										<h3 className="font-(family-name:--font-manrope) font-extrabold text-3xl text-white leading-[1.1] mb-3.5">{t(`${a.kind}.title`)}</h3>
										<p className="text-slate-300 text-[15px] leading-relaxed mb-5 max-w-[38ch]">{t(`${a.kind}.description`)}</p>
										<div className="flex flex-wrap gap-2 mb-6">
											{a.chips.map((c) => (
												<span key={c} className="text-xs font-semibold text-slate-200 bg-white/8 border border-white/12 rounded-full px-3.5 py-1.5 backdrop-blur-sm">{t(`${a.kind}.features.${c}`)}</span>
											))}
										</div>
										<Link href={a.href} className="inline-flex items-center gap-2 font-bold text-sm text-[#FF5A30] group">
											{t(`${a.kind}.cta`)}
											<span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
										</Link>
									</div>
								</div>
							</Reveal>
						))}
					</div>
				</div>
			</section>

			{/* ── MARKET BAND ──────────────────────────────────────────────────── */}
			<div className="relative overflow-hidden py-28">
				<div className="absolute inset-0 z-0">
					<Image src={IMAGES.band} alt="" fill className="object-cover opacity-[0.22]" />
					<div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,90,48,0.22),rgba(10,10,10,0.85)_55%),#000000]" />
				</div>
				<div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
					<Reveal className="max-w-2xl">
						<span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF5A30] block mb-4">{t("market.badge")}</span>
						<h2 className="font-(family-name:--font-manrope) font-extrabold text-4xl md:text-5xl text-white tracking-tight leading-[1.05]">{t("market.title")}</h2>
					</Reveal>
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-10 mt-12">
						{marketStats.map((s, i) => (
							<Reveal key={s.key} delay={i * 80}>
								<div className="font-(family-name:--font-manrope) text-5xl md:text-6xl font-black text-white tracking-tight tabular-nums leading-none mb-3">
									<CountUp end={s.end} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals} />
								</div>
								<div className="text-sm text-slate-300 leading-snug">{t(`market.items.${s.key}`)}</div>
							</Reveal>
						))}
					</div>
				</div>
			</div>

			{/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
			<section className="py-28 px-6 md:px-12 bg-[#0a0a0a]">
				<div className="max-w-5xl mx-auto">
					<Reveal className="mb-14 text-center">
						<span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF5A30] block mb-4">{t("how.badge")}</span>
						<h2 className="font-(family-name:--font-manrope) font-extrabold text-4xl md:text-5xl text-white tracking-tight">{t("how.title")}</h2>
					</Reveal>
					<div className="flex flex-col gap-4">
						{howKeys.map((key, i) => (
							<Reveal key={key} delay={i * 70}>
								<div className="group grid grid-cols-[72px_1fr] md:grid-cols-[96px_1fr] gap-6 items-start bg-[#161616] border border-white/10 rounded-2xl p-6 md:p-8 hover:border-[#FF5A30]/25 transition-colors duration-300">
									<div className="font-(family-name:--font-manrope) font-black text-5xl md:text-6xl text-white/10 group-hover:text-[#FF5A30]/25 transition-colors leading-none tabular-nums" aria-hidden="true">{String(i + 1).padStart(2, "0")}</div>
									<div className="pt-1">
										<div className="flex items-center gap-3 mb-3">
											<div className="w-8 h-8 rounded-lg bg-[#FF5A30]/14 flex items-center justify-center"><span className="material-symbols-outlined text-[#FF5A30] text-[15px]">{tHow(`${key}.icon`)}</span></div>
											<span className="text-[10px] font-black text-[#FF5A30] tracking-[0.18em] uppercase">{t("how.step", { number: i + 1 })}</span>
										</div>
										<h4 className="font-(family-name:--font-manrope) font-bold text-xl text-white mb-2">{tHow(`${key}.title`)}</h4>
										<p className="text-slate-400 text-sm leading-relaxed max-w-lg">{tHow(`${key}.desc`)}</p>
									</div>
								</div>
							</Reveal>
						))}
					</div>
				</div>
			</section>

			{/* ── FAQ ──────────────────────────────────────────────────────────── */}
			<section className="py-28 px-6 md:px-12 bg-[#000000] border-t border-white/10">
				<div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-14 items-start">
					<Reveal>
						<span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF5A30] block mb-4">{t("faq.badge")}</span>
						<h2 className="font-(family-name:--font-manrope) font-extrabold text-4xl text-white tracking-tight mb-4">{t("faq.title")}</h2>
						<p className="text-slate-400 text-base leading-relaxed">{t("faq.description")}</p>
					</Reveal>
					<Reveal delay={80}>
						<Faq items={faqItems} />
					</Reveal>
				</div>
			</section>

			{/* ── FINAL CTA ────────────────────────────────────────────────────── */}
			<section className="relative py-32 px-6 md:px-12 overflow-hidden bg-[#0a0a0a] text-center">
				<div className="aurora absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[740px] h-[440px] bg-[#FF5A30] opacity-[0.1] blur-[150px] rounded-full" aria-hidden="true" />
				<Reveal className="max-w-3xl mx-auto relative z-10">
					<h2 className="font-(family-name:--font-manrope) font-extrabold text-4xl md:text-5xl xl:text-6xl text-white mb-6 tracking-tight leading-[1.06]">{t("cta.title")}</h2>
					<p className="text-slate-400 text-lg mb-11 leading-relaxed max-w-2xl mx-auto">{t("cta.description")}</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link href="/login" className="px-10 py-4 bg-[#FF5A30] text-white rounded-xl font-bold text-base hover:bg-[#e04e28] hover:-translate-y-0.5 transition-all shadow-xl shadow-[#FF5A30]/25">{t("cta.ctaPromoter")}</Link>
						<Link href="/contact" className="px-10 py-4 bg-white/7 text-white rounded-xl font-bold text-base border border-white/15 hover:bg-white/12 transition-all">{t("cta.ctaContact")}</Link>
					</div>
				</Reveal>
			</section>

			<Footer />
		</div>
	);
}

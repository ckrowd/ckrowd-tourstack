import Image from "next/image";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Footer from "@/components/Footer";
import JoinHeroSlider from "@/components/JoinHeroSlider";
import TopNav from "@/components/TopNav";

type Props = {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ s?: string; w?: string; a?: string }>;
};

export default async function JoinPage({ params, searchParams }: Props) {
	const { locale } = await params;
	const { s, w, a } = await searchParams;
	setRequestLocale(locale);

	const t = await getTranslations("JoinPage");

	const roles = [
		{
			key: "service" as const,
			token: s ?? null,
			icon: "business_center",
			headerBg: "bg-gradient-to-br from-[#FF5A30] to-[#cc4826]",
			accentBg: "bg-[#FF5A30]/8",
			accentText: "text-[#FF5A30]",
			accentBorder: "border-[#FF5A30]/30",
			accentBtn: "bg-[#FF5A30] hover:bg-[#cc4826]",
			checkIcon: "text-[#FF5A30]",
		},
		{
			key: "workforce" as const,
			token: w ?? null,
			icon: "engineering",
			headerBg: "bg-gradient-to-br from-blue-700 to-blue-900",
			accentBg: "bg-blue-600/8",
			accentText: "text-blue-700",
			accentBorder: "border-blue-600/30",
			accentBtn: "bg-blue-700 hover:bg-blue-800",
			checkIcon: "text-blue-600",
		},
		{
			key: "artmgmt" as const,
			token: a ?? null,
			icon: "queue_music",
			headerBg: "bg-gradient-to-br from-violet-600 to-violet-900",
			accentBg: "bg-violet-600/8",
			accentText: "text-violet-700",
			accentBorder: "border-violet-600/30",
			accentBtn: "bg-violet-700 hover:bg-violet-800",
			checkIcon: "text-violet-600",
		},
	];

	const steps = ["register", "verified", "opportunities"] as const;
	const pillars = ["data", "finance", "insurance", "training"] as const;
	const statItems = ["economy", "fans", "markets", "financing"] as const;
	const modelPillars = ["certify", "bank", "finance", "operate"] as const;

	// One hero slide per category — a promoter token routes to attributed
	// onboarding, otherwise the visitor self-onboards independently.
	const heroSlides = roles.map((r) => ({
		key: r.key,
		icon: r.icon,
		title: t(`roles.${r.key}.title`),
		tagline: t(`roles.${r.key}.tagline`),
		cta: t(`roles.${r.key}.cta`),
		href: r.token
			? `/${locale}/stakeholders/${r.token}`
			: `/${locale}/onboard/${r.key}`,
		examplesLabel: t("roles.examplesLabel"),
		examples: (t.raw(`roles.${r.key}.examples`) as string[]).slice(0, 6),
	}));

	return (
		<div className="bg-[#f7f9fb] text-[#191c1e]">
			<TopNav />

			{/* ── Hero (full-height category slider) ───────────────────────── */}
			<section className="relative min-h-[100dvh] flex items-center py-24 overflow-hidden">
				{/* Background — cinematic image + shared hero gradient, matching the
				    main landing page's hero treatment. */}
				<div className="absolute inset-0 z-0">
					<Image
						src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzmBZ4sptM2EkEigkgVtZoQswUChDcxcN0l6igDH_EBa2GLtVN7P1I0t88pF31shR8wCgzj8mSaIu9AyJPvDpAhc2Zn1ivhXJDcBLGQ5AzaptLJr7T6fzIAIrhumj7UB4lHs54qvzSr8qd20qkkM4-u_3ZS16w8T0TYa-lLii8xmKgEmUtd-6QMIxrtRTa2qj4P3QBHJI6nBv1QRVZg0oWkiaWSXSeE06motFRMGPuzO9rrRsgINcAeTbd-6DNlL26ZgKLmyAsnjE"
						alt=""
						fill
						className="object-cover"
						priority
					/>
					<div className="absolute inset-0 hero-gradient" />
				</div>

				<div className="relative z-10 px-6 md:px-12 max-w-7xl mx-auto w-full text-white">
					{/* The hero IS the slider — a home-style panel per category */}
					<JoinHeroSlider
						slides={heroSlides}
						joinAsLabel={t("hero.joinAs")}
						readMoreLabel={t("hero.readMore")}
						readMoreHref="#learn-more"
						prevLabel={t("hero.sliderPrev")}
						nextLabel={t("hero.sliderNext")}
					/>
				</div>
			</section>

			{/* ── Proof / market stats ────────────────────────────────────── */}
			<section
				id="learn-more"
				className="scroll-mt-20 py-24 px-6 md:px-12 bg-white border-b border-slate-100"
			>
				<div className="max-w-5xl mx-auto">
					<div className="max-w-3xl mb-10">
						<h2 className="text-2xl md:text-3xl font-extrabold font-(family-name:--font-manrope) text-[#191c1e] mb-3 leading-tight">
							{t("stats.title")}
						</h2>
						<p className="text-base text-slate-600 leading-relaxed">
							{t("stats.subtitle")}
						</p>
					</div>
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
						{statItems.map((key) => (
							<div
								key={key}
								className="p-6 rounded-2xl bg-slate-50 border border-slate-100"
							>
								<p className="text-3xl md:text-4xl font-black text-[#FF5A30] font-(family-name:--font-manrope) mb-2">
									{t(`stats.${key}.value`)}
								</p>
								<p className="text-xs font-semibold text-slate-500 leading-relaxed">
									{t(`stats.${key}.label`)}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── CTaaS model ─────────────────────────────────────────────── */}
			<section className="py-24 px-6 md:px-12">
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-10">
						<span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-3">
							{t("model.eyebrow")}
						</span>
						<h2 className="text-3xl font-extrabold font-(family-name:--font-manrope) text-[#191c1e] mb-3">
							{t("model.title")}
						</h2>
						<p className="text-slate-500 max-w-2xl mx-auto">
							{t("model.subtitle")}
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
						{modelPillars.map((key, i) => (
							<div
								key={key}
								className="relative p-6 rounded-2xl bg-white border border-slate-100 shadow-sm"
							>
								<div className="flex items-center gap-3 mb-3">
									<div className="w-9 h-9 rounded-xl bg-[#FF5A30]/10 flex items-center justify-center shrink-0">
										<span
											className="material-symbols-outlined text-[#FF5A30]"
											style={{ fontVariationSettings: "'FILL' 1" }}
										>
											{key === "certify"
												? "verified"
												: key === "bank"
													? "account_balance"
													: key === "finance"
														? "payments"
														: "hub"}
										</span>
									</div>
									<span className="text-sm font-black text-slate-300 font-(family-name:--font-manrope)">
										{`0${i + 1}`}
									</span>
								</div>
								<p className="font-extrabold text-[#191c1e] mb-1.5 font-(family-name:--font-manrope)">
									{t(`model.pillars.${key}.title`)}
								</p>
								<p className="text-sm text-slate-500 leading-relaxed">
									{t(`model.pillars.${key}.body`)}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── What is TourStack ───────────────────────────────────────── */}
			<section className="py-24 px-6 md:px-12 bg-white">
				<div className="max-w-5xl mx-auto">
					<div className="max-w-2xl">
						<span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-3">
							{t("about.eyebrow")}
						</span>
						<h2 className="text-3xl font-extrabold font-(family-name:--font-manrope) text-[#191c1e] mb-4">
							{t("about.title")}
						</h2>
						<p className="text-base text-slate-600 leading-relaxed mb-8">
							{t("about.body")}
						</p>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
						{pillars.map((key) => (
							<div
								key={key}
								className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100"
							>
								<div className="w-10 h-10 rounded-xl bg-[#FF5A30]/10 flex items-center justify-center shrink-0">
									<span
										className="material-symbols-outlined text-[#FF5A30]"
										style={{ fontVariationSettings: "'FILL' 1" }}
									>
										{key === "data"
											? "hub"
											: key === "finance"
												? "payments"
												: key === "insurance"
													? "security"
													: "school"}
									</span>
								</div>
								<div>
									<p className="font-extrabold text-[#191c1e] mb-1 font-(family-name:--font-manrope)">
										{t(`about.pillars.${key}.title`)}
									</p>
									<p className="text-sm text-slate-500 leading-relaxed">
										{t(`about.pillars.${key}.body`)}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── How it works ───────────────────────────────────────────── */}
			<section className="py-24 px-6 md:px-12">
				<div className="max-w-5xl mx-auto">
					<h2 className="text-2xl font-extrabold font-(family-name:--font-manrope) text-[#191c1e] mb-10 text-center">
						{t("howItWorks.title")}
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{steps.map((key, i) => (
							<div key={key} className="relative flex flex-col items-start">
								<div className="w-12 h-12 rounded-2xl bg-[#FF5A30] text-white flex items-center justify-center font-extrabold text-lg font-(family-name:--font-manrope) mb-4 shadow-lg shadow-[#FF5A30]/30">
									{i + 1}
								</div>
								<h3 className="font-extrabold text-[#191c1e] mb-2 font-(family-name:--font-manrope)">
									{t(`howItWorks.steps.${key}.title`)}
								</h3>
								<p className="text-sm text-slate-500 leading-relaxed">
									{t(`howItWorks.steps.${key}.body`)}
								</p>
								{i < steps.length - 1 && (
									<div className="hidden md:block absolute top-6 left-full w-6 -translate-x-3">
										<div className="h-px bg-slate-200 w-full" />
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── Role cards / slider ─────────────────────────────────────── */}
			<section className="py-24 px-6 md:px-12 bg-white">
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-10">
						<span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-3">
							{t("roles.eyebrow")}
						</span>
						<h2 className="text-3xl font-extrabold font-(family-name:--font-manrope) text-[#191c1e] mb-3">
							{t("roles.title")}
						</h2>
						<p className="text-slate-500 max-w-xl mx-auto">
							{t("roles.subtitle")}
						</p>
					</div>

					{/*
						Mobile: horizontal scroll-snap — each card is a "slide".
						Desktop: 3-column grid.
					*/}
					<div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 md:grid md:grid-cols-3 md:overflow-visible md:snap-none -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide">
						{roles.map((role) => {
							const examples = t.raw(`roles.${role.key}.examples`) as string[];
							const benefits = t.raw(`roles.${role.key}.benefits`) as string[];
							// Promoter-issued token → attributed onboarding; otherwise the
							// visitor self-onboards independently. Either way the path is open.
							const href = role.token
								? `/${locale}/stakeholders/${role.token}`
								: `/${locale}/onboard/${role.key}`;
							return (
								<div
									key={role.key}
									className={`flex-none w-[88vw] md:w-auto snap-center md:snap-align-none flex flex-col rounded-2xl bg-white border shadow-sm overflow-hidden transition-shadow ${role.accentBorder} hover:shadow-lg`}
								>
									{/* Coloured header strip */}
									<div className={`${role.headerBg} px-6 py-6`}>
										<div className="flex items-center gap-3 mb-2">
											<div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
												<span
													className="material-symbols-outlined text-white text-xl"
													style={{ fontVariationSettings: "'FILL' 1" }}
												>
													{role.icon}
												</span>
											</div>
											<h3 className="text-white font-extrabold font-(family-name:--font-manrope) text-xl leading-tight">
												{t(`roles.${role.key}.title`)}
											</h3>
										</div>
										<p className="text-white/80 text-sm leading-relaxed">
											{t(`roles.${role.key}.tagline`)}
										</p>
									</div>

									{/* Body */}
									<div className="flex flex-col flex-1 p-6 gap-5">
										<p className="text-sm text-slate-600 leading-relaxed">
											{t(`roles.${role.key}.description`)}
										</p>

										{/* Who qualifies */}
										<div className={`rounded-xl ${role.accentBg} p-4`}>
											<p className={`text-[10px] font-bold uppercase tracking-widest ${role.accentText} mb-2.5`}>
												{t("roles.examplesLabel")}
											</p>
											<ul className="space-y-1.5">
												{examples.map((ex: string) => (
													<li key={ex} className="flex items-center gap-2 text-xs text-[#191c1e] font-medium">
														<span
															className={`material-symbols-outlined text-base shrink-0 ${role.checkIcon}`}
															style={{ fontVariationSettings: "'FILL' 1" }}
														>
															check_circle
														</span>
														{ex}
													</li>
												))}
											</ul>
										</div>

										{/* What you unlock */}
										<div>
											<p className={`text-[10px] font-bold uppercase tracking-widest ${role.accentText} mb-2.5`}>
												{t("roles.benefitsLabel")}
											</p>
											<ul className="space-y-1.5">
												{benefits.map((b: string) => (
													<li key={b} className="flex items-start gap-2 text-xs text-slate-600">
														<span className="material-symbols-outlined text-sm shrink-0 text-[#FF5A30] mt-px">
															arrow_forward
														</span>
														{b}
													</li>
												))}
											</ul>
										</div>

										<div className="mt-auto pt-2">
											<Link
												href={href}
												className={`flex items-center justify-center gap-2 w-full py-4 rounded-xl text-sm font-extrabold text-white transition-opacity ${role.accentBtn} shadow-sm`}
											>
												{t(`roles.${role.key}.cta`)}
												<span className="material-symbols-outlined text-sm">arrow_forward</span>
											</Link>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* ── Markets / pan-African rollout ───────────────────────────── */}
			<section className="py-24 px-6 md:px-12">
				<div className="max-w-5xl mx-auto">
					<div className="max-w-2xl mb-8">
						<span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-3">
							{t("markets.eyebrow")}
						</span>
						<h2 className="text-3xl font-extrabold font-(family-name:--font-manrope) text-[#191c1e] mb-4">
							{t("markets.title")}
						</h2>
						<p className="text-base text-slate-600 leading-relaxed">
							{t("markets.body")}
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
						{(["phase1", "phase2"] as const).map((p) => (
							<div
								key={p}
								className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm"
							>
								<div className="flex items-center gap-2 mb-3">
									<span
										className="material-symbols-outlined text-[#FF5A30]"
										style={{ fontVariationSettings: "'FILL' 1" }}
									>
										public
									</span>
									<p className="text-sm font-extrabold text-[#191c1e] font-(family-name:--font-manrope)">
										{t(`markets.${p}Label`)}
									</p>
								</div>
								<p className="text-sm text-slate-500 leading-relaxed">
									{t(`markets.${p}`)}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── Why data matters ───────────────────────────────────────── */}
			<section className="py-24 px-6 md:px-12 bg-slate-900 text-white">
				<div className="max-w-5xl mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
						<div>
							<span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-3">
								{t("vision.eyebrow")}
							</span>
							<h2 className="text-3xl font-extrabold font-(family-name:--font-manrope) mb-5 leading-tight">
								{t("vision.title")}
							</h2>
							<p className="text-white/70 leading-relaxed mb-6">
								{t("vision.body")}
							</p>
							<p className="text-white/70 leading-relaxed">
								{t("vision.body2")}
							</p>
						</div>
						<div className="grid grid-cols-2 gap-4">
							{(["promoters", "banks", "insurance", "sponsors"] as const).map((key) => (
								<div
									key={key}
									className="p-5 rounded-2xl bg-white/5 border border-white/10"
								>
									<span
										className="material-symbols-outlined text-[#FF5A30] block mb-3"
										style={{ fontVariationSettings: "'FILL' 1" }}
									>
										{key === "promoters"
											? "campaign"
											: key === "banks"
												? "account_balance"
												: key === "insurance"
													? "shield"
													: "handshake"}
									</span>
									<p className="text-sm font-bold text-white font-(family-name:--font-manrope) mb-1">
										{t(`vision.stakeholders.${key}.title`)}
									</p>
									<p className="text-xs text-white/50 leading-relaxed">
										{t(`vision.stakeholders.${key}.body`)}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
}

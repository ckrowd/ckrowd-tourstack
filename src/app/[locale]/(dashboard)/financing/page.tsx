import { getTranslations, setRequestLocale } from "next-intl/server";
import { getFinancingApplications, getFinancingPartners } from "@/app/actions";
import FinancingQuickApply from "@/components/FinancingQuickApply";
import TopNav from "@/components/TopNav";
import { Link } from "@/i18n/routing";

type Props = {
	params: Promise<{ locale: string }>;
};

export default async function FinancingPage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("FinancingPage");

	const [appsResult, partnersResult] = await Promise.all([
		getFinancingApplications(),
		getFinancingPartners(),
	]);
	const applications = appsResult.data ?? [];
	const partners = partnersResult.data ?? [];

	const products = [
		{
			icon: "account_balance",
			name: t("products.p1.name"),
			tag: t("products.p1.tag"),
			tagColor: "bg-[#FF5A30]/10 text-[#FF5A30]",
			description: t("products.p1.description"),
			amount: t("products.p1.amount"),
			term: t("products.p1.term"),
			rate: t("products.p1.rate"),
			eligibility: t("products.p1.eligibility"),
		},
		{
			icon: "groups",
			name: t("products.p2.name"),
			tag: t("products.p2.tag"),
			tagColor: "bg-tertiary-fixed text-on-tertiary-fixed",
			description: t("products.p2.description"),
			amount: t("products.p2.amount"),
			term: t("products.p2.term"),
			rate: t("products.p2.rate"),
			eligibility: t("products.p2.eligibility"),
		},
		{
			icon: "shield",
			name: t("products.p3.name"),
			tag: t("products.p3.tag"),
			tagColor: "bg-surface-container-high text-on-surface-variant",
			description: t("products.p3.description"),
			amount: t("products.p3.amount"),
			term: t("products.p3.term"),
			rate: t("products.p3.rate"),
			eligibility: t("products.p3.eligibility"),
		},
		{
			icon: "trending_up",
			name: t("products.p4.name"),
			tag: t("products.p4.tag"),
			tagColor: "bg-[#FF5A30]/10 text-[#FF5A30]",
			description: t("products.p4.description"),
			amount: t("products.p4.amount"),
			term: t("products.p4.term"),
			rate: t("products.p4.rate"),
			eligibility: t("products.p4.eligibility"),
		},
	];

	const steps = [
		{
			step: "01",
			title: t("steps.s1.title"),
			desc: t("steps.s1.description"),
		},
		{
			step: "02",
			title: t("steps.s2.title"),
			desc: t("steps.s2.description"),
		},
		{
			step: "03",
			title: t("steps.s3.title"),
			desc: t("steps.s3.description"),
		},
		{
			step: "04",
			title: t("steps.s4.title"),
			desc: t("steps.s4.description"),
		},
		{
			step: "05",
			title: t("steps.s5.title"),
			desc: t("steps.s5.description"),
		},
	];

	const faqs = [
		{
			q: t("faqs.f1.q"),
			a: t("faqs.f1.a"),
		},
		{
			q: t("faqs.f2.q"),
			a: t("faqs.f2.a"),
		},
		{
			q: t("faqs.f3.q"),
			a: t("faqs.f3.a"),
		},
		{
			q: t("faqs.f4.q"),
			a: t("faqs.f4.a"),
		},
	];

	return (
		<div className="bg-surface text-on-surface antialiased">
			<TopNav />

			<main className="pt-24 pb-20 px-6 md:px-12 max-w-screen-2xl mx-auto flex flex-col gap-16">
				{/* Hero */}
				<header className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
					<div className="lg:col-span-7">
						<span className="text-[#FF5A30] font-bold uppercase tracking-widest text-xs mb-4 block">
							{t("hero.platform")}
						</span>
						<h1 className="font-(family-name:--font-manrope) text-5xl md:text-6xl font-extrabold text-on-surface leading-tight tracking-tighter">
							{t.rich("hero.title", {
								spanNode: (chunks) => (
									<span className="text-[#FF5A30]">{chunks}</span>
								),
							})}
						</h1>
						<p className="mt-6 text-on-surface-variant text-lg max-w-xl leading-relaxed">
							{t("hero.description")}
						</p>
						<div className="mt-8 flex flex-wrap gap-4">
							<a
								href="#quick-apply"
								className="bg-[#FF5A30] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all"
							>
								{t("hero.applyButton")}
							</a>
							<a
								href="#products"
								className="border border-outline-variant px-8 py-3.5 rounded-xl font-bold text-on-surface hover:bg-surface-container-low transition-all"
							>
								{t("hero.exploreProducts")}
							</a>
						</div>
					</div>

					{/* Stats strip */}
					<div className="lg:col-span-5 grid grid-cols-2 gap-4">
						{[
							{ value: "$2.4M", label: t("stats.disbursed") },
							{ value: "94%", label: t("stats.repayment") },
							{ value: "48h", label: t("stats.decision") },
							{ value: "18", label: t("stats.markets") },
						].map((s) => (
							<div
								key={s.label}
								className="bg-surface-container-lowest rounded-2xl p-6 text-center border border-[#FF5A30]/5 shadow-sm"
							>
								<p className="text-3xl font-black font-(family-name:--font-manrope) text-[#FF5A30]">
									{s.value}
								</p>
								<p className="text-xs uppercase font-bold text-on-surface-variant mt-1 tracking-wider">
									{s.label}
								</p>
							</div>
						))}
					</div>
				</header>

				{/* My Applications */}
				<section>
					<h2 className="font-(family-name:--font-manrope) text-2xl font-bold mb-8">
						{t("myApplications")}
					</h2>
					<div id="quick-apply" className="mb-8">
						<FinancingQuickApply />
					</div>
					{applications.length === 0 ? (
						<div className="bg-surface-container-lowest rounded-2xl p-12 text-center shadow-sm">
							<span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-4">
								account_balance
							</span>
							<h3 className="font-(family-name:--font-manrope) font-bold text-on-surface text-lg mb-2">
								{t("noApplications.title")}
							</h3>
							<p className="text-on-surface-variant text-sm max-w-xs mx-auto mb-6">
								{t("noApplications.description")}
							</p>
							<a
								href="#products"
								className="inline-flex items-center gap-2 bg-[#FF5A30] text-white px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
							>
								{t("hero.exploreProducts")}
							</a>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{applications.map((app) => {
								const appTour = app.tour;
								const appArtist = appTour?.artist;
								const appStatus = String(app.status ?? "pending");
								const statusColor =
									appStatus === "approved"
										? "bg-emerald-100 text-emerald-800"
										: appStatus === "declined"
											? "bg-red-100 text-red-800"
											: "bg-yellow-100 text-yellow-800";
								return (
									<div
										key={String(app.id)}
										className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-transparent hover:border-outline-variant/20 transition-all"
									>
										<div className="flex items-start justify-between gap-4 mb-4">
											<div>
												<p className="font-(family-name:--font-manrope) font-bold text-on-surface">
													{String(app.product ?? t("application"))}
												</p>
												<p className="text-sm text-on-surface-variant mt-0.5">
													{String(appArtist?.name ?? "")}
													{appArtist?.tour_name
														? ` — ${String(appArtist.tour_name)}`
														: ""}
												</p>
											</div>
											<span
												className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shrink-0 ${statusColor}`}
											>
												{t(`statuses.${appStatus}`)}
											</span>
										</div>
										<div className="grid grid-cols-2 gap-3">
											<div className="p-3 bg-surface-container-low rounded-lg">
												<p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">
													{t("requested")}
												</p>
												<p className="font-bold text-on-surface">
													{String(app.currency ?? "USD")}{" "}
													{Number(app.amount_requested).toLocaleString(locale)}
												</p>
											</div>
											<div className="p-3 bg-surface-container-low rounded-lg">
												<p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">
													{t("applied")}
												</p>
												<p className="font-bold text-on-surface">
													{app.created_at
														? new Date(
																String(app.created_at),
															).toLocaleDateString(locale, {
																month: "short",
																day: "numeric",
																year: "numeric",
															})
														: "—"}
												</p>
											</div>
										</div>
										<div className="mt-4">
											<Link
												href={`/financing/${String(app.id)}`}
												className="text-sm font-bold text-[#FF5A30] hover:underline"
											>
												{t("viewDetails")}
											</Link>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</section>

				{/* Products */}
				<section id="products">
					<h2 className="font-(family-name:--font-manrope) text-2xl font-bold mb-8">
						{t("financingProducts")}
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{products.map((p) => (
							<div
								key={p.name}
								className="bg-surface-container-lowest rounded-2xl p-8 border border-transparent hover:border-outline-variant/20 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col gap-5"
							>
								<div className="flex items-start justify-between gap-4">
									<div className="w-12 h-12 rounded-xl bg-[#FF5A30]/10 flex items-center justify-center shrink-0">
										<span
											className="material-symbols-outlined text-[#FF5A30] text-2xl"
											style={{ fontVariationSettings: "'FILL' 1" }}
										>
											{p.icon}
										</span>
									</div>
									<span
										className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${p.tagColor}`}
									>
										{p.tag}
									</span>
								</div>

								<div>
									<h3 className="font-(family-name:--font-manrope) text-xl font-extrabold">
										{p.name}
									</h3>
									<p className="text-on-surface-variant text-sm mt-2 leading-relaxed">
										{p.description}
									</p>
								</div>

								<div className="grid grid-cols-3 gap-3 pt-2 border-t border-outline-variant/20">
									{[
										{ label: t("tableLabels.amount"), value: p.amount },
										{ label: t("tableLabels.term"), value: p.term },
										{ label: t("tableLabels.cost"), value: p.rate },
									].map((d) => (
										<div key={d.label}>
											<p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
												{d.label}
											</p>
											<p className="text-sm font-bold text-on-surface mt-0.5">
												{d.value}
											</p>
										</div>
									))}
								</div>

								<div className="flex items-center justify-between pt-1">
									<span className="text-xs text-on-surface-variant flex items-center gap-1.5">
										<span className="material-symbols-outlined text-sm">
											verified
										</span>
										{p.eligibility}
									</span>
									<a
										href="#quick-apply"
										className="text-[#FF5A30] font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
									>
										{t("apply")}
										<span className="material-symbols-outlined text-sm">
											arrow_forward
										</span>
									</a>
								</div>
							</div>
						))}
					</div>
				</section>

				{/* How it Works + Partners */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
					{/* Steps */}
					<section className="lg:col-span-7">
						<h2 className="font-(family-name:--font-manrope) text-2xl font-bold mb-8">
							{t("howItWorksTitle")}
						</h2>
						<div className="relative pl-8">
							<div className="absolute left-[14px] top-2 bottom-2 w-px bg-outline-variant/40" />
							<div className="space-y-8">
								{steps.map((s, i) => (
									<div key={s.step} className="relative flex gap-6">
										<div
											className={`absolute -left-8 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 border-2 ${
												i === 0
													? "bg-[#FF5A30] text-white border-[#FF5A30]"
													: "bg-surface text-[#FF5A30] border-[#FF5A30]/40"
											}`}
										>
											{s.step}
										</div>
										<div>
											<p className="font-(family-name:--font-manrope) font-bold text-on-surface">
												{s.title}
											</p>
											<p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
												{s.desc}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</section>

					{/* Capital Partners */}
					<section className="lg:col-span-5 space-y-6">
						<h2 className="font-(family-name:--font-manrope) text-2xl font-bold">
							{t("capitalPartners")}
						</h2>
						<div className="space-y-3">
							{partners.length === 0 ? (
								<p className="text-sm text-on-surface-variant bg-surface-container-lowest rounded-xl p-5 shadow-sm">
									{t("noPartners")}
								</p>
							) : (
								partners.map((p) => (
									<div
										key={String(p.id)}
										className="bg-surface-container-lowest rounded-xl p-5 flex items-center gap-4 border border-transparent hover:border-outline-variant/20 transition-all shadow-sm"
									>
										<div className="w-10 h-10 rounded-full bg-[#FF5A30]/10 flex items-center justify-center shrink-0">
											<span
												className="material-symbols-outlined text-[#FF5A30]"
												style={{ fontVariationSettings: "'FILL' 1" }}
											>
												corporate_fare
											</span>
										</div>
										<div className="flex-1 min-w-0">
											<p className="font-bold text-sm text-on-surface truncate">
												{String(p.name)}
											</p>
											<p className="text-xs text-on-surface-variant mt-0.5 capitalize">
												{p.markets.length > 0
													? `${p.markets.join(", ")} · `
													: ""}
												{String(p.type).replace(/_/g, " ")}
											</p>
										</div>
										<span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
									</div>
								))
							)}
						</div>

						{/* CTA card */}
						<div className="bg-linear-to-br from-[#FF5A30] to-[#cc4826] rounded-2xl p-8 text-white relative overflow-hidden">
							<div className="relative z-10">
								<h4 className="font-(family-name:--font-manrope) text-lg font-bold leading-tight">
									{t("cta.title")}
								</h4>
								<p className="text-white/90 text-sm mt-2 leading-relaxed">
									{t("cta.description")}
								</p>
								<a
									href="#quick-apply"
									className="mt-5 inline-block bg-white text-[#FF5A30] px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:scale-105 transition-transform"
								>
									{t("cta.button")}
								</a>
							</div>
							<span className="material-symbols-outlined absolute -bottom-4 -right-4 text-white/10 text-[120px] rotate-12">
								payments
							</span>
						</div>
					</section>
				</div>

				{/* FAQ */}
				<section>
					<h2 className="font-(family-name:--font-manrope) text-2xl font-bold mb-8">
						{t("faqTitle")}
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{faqs.map((f) => (
							<div
								key={f.q}
								className="bg-surface-container-lowest rounded-2xl p-7 border border-outline-variant/10 shadow-sm"
							>
								<p className="font-(family-name:--font-manrope) font-bold text-on-surface mb-2">
									{f.q}
								</p>
								<p className="text-sm text-on-surface-variant leading-relaxed">
									{f.a}
								</p>
							</div>
						))}
					</div>
				</section>
			</main>
		</div>
	);
}

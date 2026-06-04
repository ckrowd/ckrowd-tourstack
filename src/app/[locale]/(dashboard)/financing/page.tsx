import { getTranslations, setRequestLocale } from "next-intl/server";
import {
	getFinancingApplications,
	getFinancingPartners,
	getStakeholders,
	getTourstackProfile,
} from "@/app/actions";
import EcosystemReadiness from "@/components/EcosystemReadiness";
import FinancingApplyButton from "@/components/FinancingApplyButton";
import { computeEcosystemReadiness } from "@/lib/eligibility";
import type { ProductId } from "@/components/FinancingApplyModal";
import FinancingFaq from "@/components/FinancingFaq";
import FinancingQuickApply from "@/components/FinancingQuickApply";
import HowItWorksModal from "@/components/HowItWorksModal";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import { Link } from "@/i18n/routing";
import PageTour from "@/components/PageTour";
import Image from "next/image";

const PARTNER_LOGOS: Record<string, string> = {
	"access bank": "/access-bank.png",
	"sanlam": "/sanlam-allianz.png",
	"allianz": "/sanlam-allianz.png",
	"sanlamallianz": "/sanlam-allianz.png",
};

function getPartnerLogo(name: string): string | null {
	const key = name.toLowerCase().replace(/\s+/g, " ").trim();
	for (const [pattern, logo] of Object.entries(PARTNER_LOGOS)) {
		if (key.includes(pattern)) return logo;
	}
	return null;
}

type Props = {
	params: Promise<{ locale: string }>;
};

export default async function FinancingPage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("FinancingPage");

	const [appsResult, partnersResult, profileResult, stakeholdersResult] =
		await Promise.all([
			getFinancingApplications(),
			getFinancingPartners(),
			getTourstackProfile(),
			getStakeholders(),
		]);
	const applications = appsResult.data ?? [];
	const partners = partnersResult.data ?? [];
	const readiness = computeEcosystemReadiness(
		stakeholdersResult.data ?? [],
		applications,
	);
	const applicantName =
		profileResult.data?.contact_person ??
		profileResult.data?.company_name ??
		undefined;

	const products: {
		productId: ProductId;
		icon: string;
		name: string;
		tag: string;
		tagColor: string;
		description: string;
		amount: string;
		term: string;
		rate: string;
		eligibility: string;
	}[] = [
		{
			productId: "Tour Stop Advance",
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
			productId: "Venue Build-Out Credit",
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
			productId: "Event Insurance Bundle",
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
			productId: "Marketing & Ticketing Float",
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

			<div className="flex pt-16 h-screen">
				<SideNav />

				<main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-10 no-scrollbar">
					<PageTour pageId="financing" />
					{/* Header */}
					<div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
						<div>
							<span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-2">
								{t("hero.platform")}
							</span>
							<h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
								{t("header.title")}
							</h1>
							<p className="text-on-surface-variant font-medium max-w-xl">
								{t("hero.description")}
							</p>
						</div>
						<div className="flex items-center gap-2 flex-wrap">
						<HowItWorksModal
							title={t("howItWorksTitle")}
							steps={steps.map((s) => ({ step: s.step, title: s.title, desc: s.desc }))}
							buttonLabel={t("howItWorksButton")}
						/>
						<FinancingFaq faqs={faqs} />
					</div>
					</div>

					{/* Ecosystem readiness / financing eligibility */}
					<div className="mb-10">
						<EcosystemReadiness readiness={readiness} />
					</div>

					{/* My Applications */}
					<section className="mb-10">
					<h2 className="font-(family-name:--font-manrope) text-2xl font-bold mb-8">
						{t("myApplications")}
					</h2>
					<div id="quick-apply" data-tour="financing-apply" className="mb-8">
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
				<section id="products" data-tour="financing-products" className="mb-10">
					<h2 className="font-(family-name:--font-manrope) text-2xl font-bold mb-8">
						{t("financingProducts")}
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
						{products.map((p) => (
							<div
								key={p.name}
								className="bg-surface-container-lowest rounded-2xl p-5 md:p-8 border border-transparent hover:border-outline-variant/20 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col gap-4 md:gap-5"
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
									<FinancingApplyButton
										defaultProduct={p.productId}
										applicantName={applicantName}
										className="text-[#FF5A30] font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
									>
										{t("apply")}
										<span className="material-symbols-outlined text-sm">
											arrow_forward
										</span>
									</FinancingApplyButton>
								</div>
							</div>
						))}
					</div>
				</section>

				{/* Capital Partners */}
				<section className="mb-14 space-y-6">
					<h2 className="font-(family-name:--font-manrope) text-2xl font-bold">
						{t("capitalPartners")}
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{partners.length === 0 ? (
							<p className="text-sm text-on-surface-variant bg-surface-container-lowest rounded-xl p-5 shadow-sm col-span-full">
								{t("noPartners")}
							</p>
						) : (
							partners.map((p) => {
								const logo = getPartnerLogo(String(p.name));
								return (
									<div
										key={String(p.id)}
										className="bg-surface-container-lowest rounded-xl p-4 flex items-center gap-4 border border-transparent hover:border-outline-variant/20 transition-all shadow-sm"
									>
										<div className="w-12 h-12 rounded-xl bg-white border border-outline-variant/10 flex items-center justify-center shrink-0 overflow-hidden">
											{logo ? (
												<Image
													src={logo}
													alt={String(p.name)}
													width={48}
													height={48}
													className="object-contain w-full h-full p-1"
												/>
											) : (
												<span
													className="material-symbols-outlined text-[#FF5A30]"
													style={{ fontVariationSettings: "'FILL' 1" }}
												>
													corporate_fare
												</span>
											)}
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
								);
							})
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

				</main>
			</div>
		</div>
	);
}

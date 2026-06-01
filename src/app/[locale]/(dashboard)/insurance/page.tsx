"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import FinancingApplyButton from "@/components/FinancingApplyButton";
import { INSURANCE_PRODUCT_IDS } from "@/components/FinancingApplyModal";
import SideNav from "@/components/SideNav";
import StepForm from "@/components/StepForm";
import TopNav from "@/components/TopNav";
import { Link, useRouter } from "@/i18n/routing";

// Insurance applications are stored as financing applications under one of the
// six named insurance products, which is what the insurance-admin queue lists.
// Applying for insurance goes through the financing apply modal scoped to the
// insurance suite, defaulting to this product.
const INSURANCE_DEFAULT_PRODUCT = INSURANCE_PRODUCT_IDS[0];

// ─── Component ────────────────────────────────────────────────────────────────

export default function InsurancePage() {
	const t = useTranslations("InsurancePage");
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("overview");
	const [activeStakeholder, setActiveStakeholder] = useState("promoter");
	const [activeStep, setActiveStep] = useState(1);

	const TABS = [
		{ id: "overview", label: t("tabs.overview") },
		{ id: "onboarding", label: t("tabs.onboarding") },
		{ id: "products", label: t("tabs.products") },
		{ id: "profile", label: t("tabs.profile") },
	];

	const ECOSYSTEM_FLOW = [
		{
			step: "01",
			label: t("ecosystemFlow.0.label"),
			desc: t("ecosystemFlow.0.desc"),
			icon: "description",
		},
		{
			step: "02",
			label: t("ecosystemFlow.1.label"),
			desc: t("ecosystemFlow.1.desc"),
			icon: "fact_check",
		},
		{
			step: "03",
			label: t("ecosystemFlow.2.label"),
			desc: t("ecosystemFlow.2.desc"),
			icon: "school",
		},
		{
			step: "04",
			label: t("ecosystemFlow.3.label"),
			desc: t("ecosystemFlow.3.desc"),
			icon: "account_balance",
		},
		{
			step: "05",
			label: t("ecosystemFlow.4.label"),
			desc: t("ecosystemFlow.4.desc"),
			icon: "shield",
		},
		{
			step: "06",
			label: t("ecosystemFlow.5.label"),
			desc: t("ecosystemFlow.5.desc"),
			icon: "payments",
		},
	];

	const INSURANCE_PRODUCTS = [
		{
			productId: INSURANCE_PRODUCT_IDS[0],
			name: t("productSuite.0.name"),
			tag: t("productTags.event"),
			icon: "event_busy",
			who: ["promoter", "talent"],
			desc: t("productSuite.0.desc"),
			highlight: false,
		},
		{
			productId: INSURANCE_PRODUCT_IDS[1],
			name: t("productSuite.1.name"),
			tag: t("productTags.highest"),
			icon: "account_balance",
			who: ["promoter"],
			desc: t("productSuite.1.desc"),
			highlight: true,
		},
		{
			productId: INSURANCE_PRODUCT_IDS[2],
			name: t("productSuite.2.name"),
			tag: t("productTags.sme"),
			icon: "business",
			who: ["promoter", "vendor"],
			desc: t("productSuite.2.desc"),
			highlight: false,
		},
		{
			productId: INSURANCE_PRODUCT_IDS[3],
			name: t("productSuite.3.name"),
			tag: t("productTags.group"),
			icon: "groups",
			who: ["workforce"],
			desc: t("productSuite.3.desc"),
			highlight: false,
		},
		{
			productId: INSURANCE_PRODUCT_IDS[4],
			name: t("productSuite.4.name"),
			tag: t("productTags.specialty"),
			icon: "flight",
			who: ["promoter", "vendor"],
			desc: t("productSuite.4.desc"),
			highlight: false,
		},
		{
			productId: INSURANCE_PRODUCT_IDS[5],
			name: t("productSuite.5.name"),
			tag: t("productTags.embedded"),
			icon: "confirmation_number",
			who: ["promoter", "talent"],
			desc: t("productSuite.5.desc"),
			highlight: false,
		},
	];

	interface Step {
		id: number;
		label: string;
		detail: string;
	}

	interface Coverage {
		product: string;
		type: string;
		desc: string;
		premium: string;
		term: string;
	}

	interface FinanceProduct {
		name: string;
		amount: string;
		term: string;
		cost: string;
	}

	interface FAQ {
		q: string;
		a: string;
	}

	const STAKEHOLDERS = [
		{
			id: "promoter",
			label: t("stakeholders.promoter.label"),
			icon: "celebration",
			tag: t("stakeholders.promoter.tag"),
			description: t("stakeholders.promoter.description"),
			products: t.raw("stakeholders.promoter.products") as string[],
			steps: (t.raw("stakeholders.promoter.steps") as Omit<Step, "id">[]).map(
				(s, i) => ({ id: i + 1, ...s }),
			),
			coverage: t.raw("stakeholders.promoter.coverage") as Coverage[],
			financeProducts: t.raw(
				"stakeholders.promoter.financeProducts",
			) as FinanceProduct[],
			color: "bg-[#FF5A30]",
			accent: "#FF5A30",
		},
		{
			id: "workforce",
			label: t("stakeholders.workforce.label"),
			icon: "engineering",
			tag: t("stakeholders.workforce.tag"),
			description: t("stakeholders.workforce.description"),
			products: t.raw("stakeholders.workforce.products") as string[],
			steps: (t.raw("stakeholders.workforce.steps") as Omit<Step, "id">[]).map(
				(s, i) => ({ id: i + 1, ...s }),
			),
			coverage: t.raw("stakeholders.workforce.coverage") as Coverage[],
			financeProducts: t.raw(
				"stakeholders.workforce.financeProducts",
			) as FinanceProduct[],
			color: "bg-[#2D5A8E]",
			accent: "#2D5A8E",
		},
		{
			id: "vendor",
			label: t("stakeholders.vendor.label"),
			icon: "warehouse",
			tag: t("stakeholders.vendor.tag"),
			description: t("stakeholders.vendor.description"),
			products: t.raw("stakeholders.vendor.products") as string[],
			steps: (t.raw("stakeholders.vendor.steps") as Omit<Step, "id">[]).map(
				(s, i) => ({ id: i + 1, ...s }),
			),
			coverage: t.raw("stakeholders.vendor.coverage") as Coverage[],
			financeProducts: t.raw(
				"stakeholders.vendor.financeProducts",
			) as FinanceProduct[],
			color: "bg-[#3D6B2E]",
			accent: "#3D6B2E",
		},
		{
			id: "talent",
			label: t("stakeholders.talent.label"),
			icon: "mic",
			tag: t("stakeholders.talent.tag"),
			description: t("stakeholders.talent.description"),
			products: t.raw("stakeholders.talent.products") as string[],
			steps: (t.raw("stakeholders.talent.steps") as Omit<Step, "id">[]).map(
				(s, i) => ({ id: i + 1, ...s }),
			),
			coverage: t.raw("stakeholders.talent.coverage") as Coverage[],
			financeProducts: t.raw(
				"stakeholders.talent.financeProducts",
			) as FinanceProduct[],
			color: "bg-[#7B3F8E]",
			accent: "#7B3F8E",
		},
	];

	const current = STAKEHOLDERS.find((s) => s.id === activeStakeholder)!;

	return (
		<div className="bg-surface text-on-surface antialiased min-h-screen">
			<TopNav />

			<div className="flex pt-16 h-screen">
				<SideNav />

				<main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-10 no-scrollbar">
					{/* Header */}
					<div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
						<div>
							<span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-2 font-(family-name:--font-manrope)">
								{t("hub")}
							</span>
							<h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
								{t.rich("hero.title", {
									spanHighlight: (chunks) => (
										<span className="text-[#FF5A30]">{chunks}</span>
									),
									br: () => <br />,
								})}
							</h1>
							<p className="text-on-surface-variant font-medium max-w-xl">
								{t("hero.description")}
							</p>
						</div>
						<FinancingApplyButton
							defaultProduct={INSURANCE_DEFAULT_PRODUCT}
							products={INSURANCE_PRODUCT_IDS}
							className="flex items-center gap-2 bg-[#FF5A30] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all self-start md:self-auto shrink-0"
						>
							<span className="material-symbols-outlined text-sm">
								how_to_reg
							</span>
							{t("hero.startOnboarding")}
						</FinancingApplyButton>
					</div>

					{/* Stats strip */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
						{[
							{
								value: t("stats.values.portfolio"),
								label: t("stats.portfolio"),
							},
							{ value: t("stats.values.markets"), label: t("stats.markets") },
							{ value: t("stats.values.lines"), label: t("stats.lines") },
							{ value: t("stats.values.roles"), label: t("stats.roles") },
						].map((s) => (
							<div
								key={s.label}
								className="bg-surface-container-lowest rounded-2xl p-6 text-center border border-[#FF5A30]/5 shadow-sm"
							>
								<p className="text-2xl font-black font-(family-name:--font-manrope) text-[#FF5A30]">
									{s.value}
								</p>
								<p className="text-xs uppercase font-bold text-on-surface-variant mt-1 tracking-wider">
									{s.label}
								</p>
							</div>
						))}
					</div>

					{/* ── Tab Bar ── */}
					<div className="flex gap-0 border-b border-outline-variant/30 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
					{TABS.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`px-6 py-3 text-sm font-semibold font-(family-name:--font-manrope) border-b-2 transition-colors -mb-px shrink-0 ${
								activeTab === tab.id
									? "border-[#FF5A30] text-[#FF5A30]"
									: "border-transparent text-on-surface-variant hover:text-on-surface"
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>

				{/* ══════════════════════════════════════════
            TAB: ECOSYSTEM OVERVIEW
        ══════════════════════════════════════════ */}
				{activeTab === "overview" && (
					<div className="flex flex-col gap-16">
						{/* Pipeline flow */}
						<section>
							<h2 className="font-(family-name:--font-manrope) text-2xl font-bold mb-8">
								{t("overview.pipelineTitle")}
							</h2>
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
								{ECOSYSTEM_FLOW.map((step, i) => (
									<div
										key={i}
										className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10 shadow-sm flex flex-col gap-3 relative"
									>
										<div className="w-10 h-10 rounded-xl bg-[#FF5A30]/10 flex items-center justify-center">
											<span
												className="material-symbols-outlined text-[#FF5A30] text-xl"
												style={{ fontVariationSettings: "'FILL' 1" }}
											>
												{step.icon}
											</span>
										</div>
										<span className="text-[10px] font-black tracking-widest text-[#FF5A30] uppercase">
											{step.step}
										</span>
										<p className="font-(family-name:--font-manrope) font-bold text-sm">
											{step.label}
										</p>
										<p className="text-xs text-on-surface-variant leading-relaxed">
											{step.desc}
										</p>
										{i < ECOSYSTEM_FLOW.length - 1 && (
											<span className="material-symbols-outlined absolute -right-2 top-1/2 -translate-y-1/2 text-outline-variant text-base hidden lg:block">
												chevron_right
											</span>
										)}
									</div>
								))}
							</div>
						</section>

						{/* Stakeholder cards */}
						<section>
							<h2 className="font-(family-name:--font-manrope) text-2xl font-bold mb-8">
								{t("overview.stakeholdersTitle")}
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
								{STAKEHOLDERS.map((s) => (
									<button
										key={s.id}
										onClick={() => {
											setActiveStakeholder(s.id);
											setActiveTab("profile");
										}}
										className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10 shadow-sm hover:shadow-xl hover:border-outline-variant/30 transition-all duration-300 text-left flex flex-col"
									>
										<div className={`${s.color} p-6`}>
											<div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
												<span
													className="material-symbols-outlined text-white text-2xl"
													style={{ fontVariationSettings: "'FILL' 1" }}
												>
													{s.icon}
												</span>
											</div>
											<span className="text-[9px] font-black tracking-widest text-white/70 uppercase block mb-1">
												{s.tag}
											</span>
											<p className="font-(family-name:--font-manrope) font-bold text-lg text-white">
												{s.label}
											</p>
										</div>
										<div className="p-6 flex flex-col gap-4 flex-1">
											<p className="text-sm text-on-surface-variant leading-relaxed">
												{s.description}
											</p>
											<div>
												<p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
													{t("profile.coverageTitle")}
												</p>
												<div className="flex flex-col gap-1.5">
													{s.products.map((p: string, i: number) => (
														<div key={i} className="flex items-center gap-2">
															<div className="w-1.5 h-1.5 rounded-full bg-[#FF5A30] shrink-0" />
															<span className="text-xs text-on-surface-variant">
																{p}
															</span>
														</div>
													))}
												</div>
											</div>
											<div className="mt-auto flex items-center gap-1 text-[#FF5A30] text-xs font-bold">
												{t("tabs.profile")}
												<span className="material-symbols-outlined text-sm">
													arrow_forward
												</span>
											</div>
										</div>
									</button>
								))}
							</div>
						</section>

						{/* Insurance products grid */}
						<section>
							<h2 className="font-(family-name:--font-manrope) text-2xl font-bold mb-8">
								{t("overview.productsTitle")}
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{INSURANCE_PRODUCTS.map((p, i) => (
									<div
										key={i}
										className={`rounded-2xl p-6 border shadow-sm flex flex-col gap-4 ${p.highlight ? "bg-[#FF5A30] text-white border-[#FF5A30]" : "bg-surface-container-lowest border-outline-variant/10"}`}
									>
										<div className="flex items-start justify-between gap-4">
											<div
												className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${p.highlight ? "bg-white/20" : "bg-[#FF5A30]/10"}`}
											>
												<span
													className={`material-symbols-outlined text-2xl ${p.highlight ? "text-white" : "text-[#FF5A30]"}`}
													style={{ fontVariationSettings: "'FILL' 1" }}
												>
													{p.icon}
												</span>
											</div>
											<span
												className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${p.highlight ? "bg-white/20 text-white" : "bg-surface-container text-on-surface-variant"}`}
											>
												{p.tag}
											</span>
										</div>
										<div>
											<h3
												className={`font-(family-name:--font-manrope) text-lg font-extrabold mb-1 ${p.highlight ? "text-white" : "text-on-surface"}`}
											>
												{p.name}
											</h3>
											<p
												className={`text-sm leading-relaxed ${p.highlight ? "text-white/80" : "text-on-surface-variant"}`}
											>
												{p.desc}
											</p>
										</div>
										<div className="flex gap-2 flex-wrap mt-auto">
											{p.who.map((w) => {
												const sh = STAKEHOLDERS.find((s) => s.id === w);
												return (
													<span
														key={w}
														className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${p.highlight ? "bg-white/20 text-white" : "bg-surface-container text-on-surface-variant"}`}
													>
														{sh?.label}
													</span>
												);
											})}
										</div>
									</div>
								))}
							</div>
						</section>

						{/* CTA */}
						<div className="bg-linear-to-br from-[#FF5A30] to-[#cc4826] rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
							<div className="relative z-10">
								<h3 className="font-(family-name:--font-manrope) text-2xl font-bold text-white mb-2">
									{t("overview.cta.title")}
								</h3>
								<p className="text-white/80 text-sm">
									{t("overview.cta.description")}
								</p>
							</div>
							<FinancingApplyButton
								defaultProduct={INSURANCE_DEFAULT_PRODUCT}
								products={INSURANCE_PRODUCT_IDS}
								className="relative z-10 bg-white text-[#FF5A30] px-8 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-transform shrink-0"
							>
								{t("overview.cta.button")} →
							</FinancingApplyButton>
							<span className="material-symbols-outlined absolute -bottom-6 -right-6 text-white/10 text-[160px] rotate-12 select-none">
								shield
							</span>
						</div>
					</div>
				)}

				{/* ══════════════════════════════════════════
            TAB: ONBOARDING FLOW
        ══════════════════════════════════════════ */}
				{activeTab === "onboarding" && (
					<div className="flex flex-col gap-10">
						<div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
							<div className="flex items-start gap-3">
								<span
									className="material-symbols-outlined text-amber-600 mt-0.5"
									style={{ fontVariationSettings: "'FILL' 1" }}
								>
									info
								</span>
								<div>
									<p className="font-(family-name:--font-manrope) font-bold text-amber-900 text-sm">
										{t("onboarding.previewNotice.title")}
									</p>
									<p className="text-xs text-amber-800 mt-0.5">
										{t("onboarding.previewNotice.description")}
									</p>
								</div>
							</div>
							<Link
								href="/apply"
								className="bg-[#FF5A30] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all shrink-0"
							>
								{t("onboarding.previewNotice.cta")}
							</Link>
						</div>
						{/* Role selector */}
						<div>
							<p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">
								{t("onboarding.selectRole")}
							</p>
							<div className="flex flex-wrap gap-3">
								{STAKEHOLDERS.map((s) => (
									<button
										key={s.id}
										onClick={() => {
											setActiveStakeholder(s.id);
											setActiveStep(1);
										}}
										className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all font-(family-name:--font-manrope) ${
											activeStakeholder === s.id
												? "border-[#FF5A30] bg-[#FF5A30] text-white"
												: "border-outline-variant text-on-surface-variant hover:border-[#FF5A30]/40"
										}`}
									>
										<span
											className="material-symbols-outlined text-base"
											style={{ fontVariationSettings: "'FILL' 1" }}
										>
											{s.icon}
										</span>
										{s.label}
									</button>
								))}
							</div>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
							{/* Step list */}
							<div className="lg:col-span-4 flex flex-col gap-4">
								<div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10 shadow-sm">
									<div className={`${current.color} p-5`}>
										<span className="text-[9px] font-black tracking-widest text-white/70 uppercase block mb-1">
											{current.tag}
										</span>
										<p className="font-(family-name:--font-manrope) font-bold text-white">
											{current.label} — {t("tabs.onboarding")}
										</p>
									</div>
									<div className="relative pl-10 pr-4 py-4 flex flex-col gap-0">
										<div className="absolute left-[38px] top-6 bottom-6 w-px bg-outline-variant/30" />
										{current.steps.map((step, i) => (
											<button
												key={step.id}
												onClick={() => setActiveStep(step.id)}
												className={`relative flex gap-4 items-start py-3 text-left group transition-all`}
											>
												<div
													className={`absolute -left-4 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 shrink-0 transition-all ${
														i < activeStep - 1
															? "bg-green-500 border-green-500 text-white"
															: activeStep === step.id
																? "bg-[#FF5A30] border-[#FF5A30] text-white"
																: "bg-surface border-outline-variant/40 text-on-surface-variant"
													}`}
												>
													{i < activeStep - 1 ? (
														<span className="material-symbols-outlined text-sm">
															check
														</span>
													) : (
														step.id
													)}
												</div>
												<div className="pl-6">
													<p
														className={`text-sm font-bold font-(family-name:--font-manrope) ${activeStep === step.id ? "text-[#FF5A30]" : "text-on-surface"}`}
													>
														{step.label}
													</p>
													<p className="text-xs text-on-surface-variant">
														{t("onboarding.step", {
															current: step.id,
															total: current.steps.length,
														})}
													</p>
												</div>
											</button>
										))}
									</div>
								</div>

								{/* Partners */}
								<div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
									<div className="px-5 py-4 border-b border-outline-variant/10">
										<p className="font-(family-name:--font-manrope) font-bold text-sm">
											{t("onboarding.partners")}
										</p>
									</div>
									{(
										t.raw("onboarding.partnersList") as {
											name: string;
											sub: string;
										}[]
									).map((p, i) => (
										<div
											key={i}
											className="flex items-center gap-4 px-5 py-4 border-b border-outline-variant/10 last:border-0"
										>
											<div className="w-8 h-8 rounded-full bg-[#FF5A30]/10 flex items-center justify-center shrink-0">
												<span
													className="material-symbols-outlined text-[#FF5A30] text-base"
													style={{ fontVariationSettings: "'FILL' 1" }}
												>
													corporate_fare
												</span>
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-bold text-on-surface">
													{p.name}
												</p>
												<p className="text-xs text-on-surface-variant">
													{p.sub}
												</p>
											</div>
											<span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
										</div>
									))}
								</div>
							</div>

							{/* Step detail */}
							<div className="lg:col-span-8 flex flex-col gap-4">
								{current.steps
									.filter((s) => s.id === activeStep)
									.map((step) => (
										<div key={step.id} className="flex flex-col gap-4">
											<div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 shadow-sm">
												<div className="flex items-start justify-between gap-4 mb-6">
													<div>
														<span className="text-[10px] font-black uppercase tracking-widest text-[#FF5A30] block mb-2">
															{t("onboarding.step", {
																current: step.id,
																total: current.steps.length,
															})}
														</span>
														<h2 className="font-(family-name:--font-manrope) text-3xl font-extrabold">
															{step.label}
														</h2>
													</div>
													<div
														className={`${current.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black font-(family-name:--font-manrope) shrink-0`}
													>
														{step.id}
													</div>
												</div>
												<p className="text-on-surface-variant leading-relaxed mb-8">
													{step.detail}
												</p>

												<form
													onSubmit={(e) => {
														e.preventDefault();
														if (activeStep < current.steps.length)
															setActiveStep(activeStep + 1);
														else router.push("/apply");
													}}
												>
													<StepForm
														stakeholderId={current.id}
														stepId={step.id}
													/>

													{step.id === 4 && (
														<div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6 flex gap-4 items-start">
															<span
																className="material-symbols-outlined text-green-600 text-xl mt-0.5"
																style={{ fontVariationSettings: "'FILL' 1" }}
															>
																shield
															</span>
															<div>
																<p className="font-(family-name:--font-manrope) font-bold text-green-800 text-sm mb-1">
																	{t("onboarding.activates.title")}
																</p>
																<p className="text-xs text-green-700 leading-relaxed">
																	{t("onboarding.activates.description")}
																</p>
															</div>
														</div>
													)}

													{step.id === 5 && (
														<div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 flex gap-4 items-start">
															<span
																className="material-symbols-outlined text-amber-600 text-xl mt-0.5"
																style={{ fontVariationSettings: "'FILL' 1" }}
															>
																payments
															</span>
															<div>
																<p className="font-(family-name:--font-manrope) font-bold text-amber-800 text-sm mb-1">
																	{t("onboarding.finance.title")}
																</p>
																<p className="text-xs text-amber-700 leading-relaxed">
																	{t("onboarding.finance.description")}
																</p>
															</div>
														</div>
													)}

													<div className="flex gap-3">
														{activeStep > 1 && (
															<button
																type="button"
																onClick={() => setActiveStep(activeStep - 1)}
																className="px-6 py-2.5 rounded-xl border border-outline-variant text-sm font-bold text-on-surface hover:bg-surface-container-low transition-all"
															>
																← {t("onboarding.actions.previous")}
															</button>
														)}
														{activeStep < current.steps.length && (
															<button
																type="submit"
																className="px-6 py-2.5 rounded-xl bg-[#FF5A30] text-white text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-[#FF5A30]/20"
															>
																{t("onboarding.actions.continue", {
																	next: activeStep + 1,
																})}
															</button>
														)}
														{activeStep === current.steps.length && (
															<button
																type="submit"
																className="px-6 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:opacity-90 transition-all"
															>
																✓ {t("onboarding.actions.complete")}
															</button>
														)}
													</div>
												</form>
											</div>

											{/* Progress bar */}
											<div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10 shadow-sm">
												<p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">
													{t("onboarding.progress")}
												</p>
												<div className="flex gap-1.5 mb-2">
													{current.steps.map((s) => (
														<div
															key={s.id}
															className={`flex-1 h-1.5 rounded-full transition-all ${s.id <= activeStep ? "bg-[#FF5A30]" : "bg-outline-variant/30"}`}
														/>
													))}
												</div>
												<p className="text-xs text-on-surface-variant">
													{t("onboarding.progressDetail", {
														current: activeStep,
														total: current.steps.length,
													})}
												</p>
											</div>
										</div>
									))}
							</div>
						</div>

						{/* FAQ */}
						<section>
							<h2 className="font-(family-name:--font-manrope) text-2xl font-bold mb-6">
								{t("faq.title")}
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{(t.raw("faq.items") as FAQ[]).map((faq, i) => (
									<div
										key={i}
										className="bg-surface-container-lowest rounded-2xl p-7 border border-outline-variant/10 shadow-sm"
									>
										<p className="font-(family-name:--font-manrope) font-bold text-on-surface mb-2">
											{faq.q}
										</p>
										<p className="text-sm text-on-surface-variant leading-relaxed">
											{faq.a}
										</p>
									</div>
								))}
							</div>
						</section>
					</div>
				)}

				{/* ══════════════════════════════════════════
            TAB: INSURANCE PRODUCTS
        ══════════════════════════════════════════ */}
				{activeTab === "products" && (
					<div className="flex flex-col gap-12">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{INSURANCE_PRODUCTS.map((p, i) => (
								<div
									key={i}
									className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10 shadow-sm hover:shadow-xl transition-all duration-300"
								>
									<div
										className={`p-6 flex items-start justify-between gap-4 ${i % 2 === 0 ? "bg-on-surface/5" : "bg-surface-container"}`}
									>
										<div>
											<span
												className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-3 inline-block ${p.highlight ? "bg-[#FF5A30] text-white" : "bg-surface-container-highest text-on-surface-variant"}`}
											>
												{p.tag}
											</span>
											<h3 className="font-(family-name:--font-manrope) text-xl font-extrabold">
												{p.name}
											</h3>
										</div>
										<div className="w-12 h-12 rounded-xl bg-[#FF5A30]/10 flex items-center justify-center shrink-0">
											<span
												className="material-symbols-outlined text-[#FF5A30] text-2xl"
												style={{ fontVariationSettings: "'FILL' 1" }}
											>
												{p.icon}
											</span>
										</div>
									</div>
									<div className="p-6 flex flex-col gap-4">
										<p className="text-sm text-on-surface-variant leading-relaxed">
											{p.desc}
										</p>
										<div>
											<p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
												{t("onboarding.selectRole")}
											</p>
											<div className="flex gap-2 flex-wrap">
												{p.who.map((w) => {
													const sh = STAKEHOLDERS.find((s) => s.id === w);
													return (
														<span
															key={w}
															className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FF5A30]/10 text-[#FF5A30]"
														>
															{sh?.label}
														</span>
													);
												})}
											</div>
										</div>
										<FinancingApplyButton
											defaultProduct={p.productId}
											products={INSURANCE_PRODUCT_IDS}
											className="text-[#FF5A30] font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all mt-auto"
										>
											{t("products.apply")}
											<span className="material-symbols-outlined text-sm">
												arrow_forward
											</span>
										</FinancingApplyButton>
									</div>
								</div>
							))}
						</div>

						{/* Underwriter banner */}
						<div className="bg-linear-to-br from-on-surface to-on-surface/80 rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
							<div className="relative z-10">
								<span className="text-[10px] font-black uppercase tracking-widest text-[#FF5A30] block mb-2">
									{t("products.underwriter.title")}
								</span>
								<h3 className="font-(family-name:--font-manrope) text-2xl font-bold text-white mb-2">
									{t("products.underwriter.brand")}
								</h3>
								<p className="text-white/60 text-sm max-w-md">
									{t("products.underwriter.description")}
								</p>
							</div>
							<div className="relative z-10 text-right shrink-0">
								<p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">
									{t("products.underwriter.portfolio")}
								</p>
								<p className="font-(family-name:--font-manrope) text-5xl font-black text-[#FF5A30] leading-none">
									{t("products.underwriter.portfolioValue")}
								</p>
								<p className="text-xs text-white/40 mt-1">
									{t("products.underwriter.scale")}
								</p>
							</div>
							<span className="material-symbols-outlined absolute -bottom-8 -right-8 text-white/5 text-[180px] select-none">
								verified_user
							</span>
						</div>
					</div>
				)}

				{/* ══════════════════════════════════════════
            TAB: MY INSURANCE PROFILE
        ══════════════════════════════════════════ */}
				{activeTab === "profile" && (
					<div className="flex flex-col gap-8">
						{/* Stakeholder switcher */}
						<div className="flex flex-wrap gap-3">
							{STAKEHOLDERS.map((s) => (
								<button
									key={s.id}
									onClick={() => setActiveStakeholder(s.id)}
									className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all font-(family-name:--font-manrope) ${
										activeStakeholder === s.id
											? "border-[#FF5A30] bg-[#FF5A30] text-white"
											: "border-outline-variant text-on-surface-variant hover:border-[#FF5A30]/40"
									}`}
								>
									<span
										className="material-symbols-outlined text-base"
										style={{ fontVariationSettings: "'FILL' 1" }}
									>
										{s.icon}
									</span>
									{s.label}
								</button>
							))}
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
							{/* Left column */}
							<div className="lg:col-span-5 flex flex-col gap-5">
								{/* Profile header */}
								<div className={`${current.color} rounded-2xl p-8`}>
									<span className="text-[9px] font-black tracking-widest text-white/60 uppercase block mb-2">
										{current.tag}
									</span>
									<h2 className="font-(family-name:--font-manrope) text-3xl font-extrabold text-white mb-2">
										{current.label}
									</h2>
									<p className="text-white/70 text-sm leading-relaxed">
										{current.description}
									</p>
								</div>

								{/* Certification pathway */}
								<div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
									<h3 className="font-(family-name:--font-manrope) font-bold mb-5">
										{t("profile.certification")}
									</h3>
									<div className="relative pl-8 flex flex-col gap-0">
										<div className="absolute left-[30px] top-2 bottom-2 w-px bg-outline-variant/30" />
										{current.steps.map((step, i) => (
											<div key={step.id} className="relative flex gap-4 py-3">
												<div
													className={`absolute -left-4 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 shrink-0 ${
														i === 0
															? "bg-green-500 border-green-500 text-white"
															: "bg-surface border-outline-variant/40 text-on-surface-variant"
													}`}
												>
													{i === 0 ? (
														<span className="material-symbols-outlined text-sm">
															check
														</span>
													) : (
														step.id
													)}
												</div>
												<div className="flex-1 pl-6">
													<div className="flex items-center justify-between gap-2">
														<p className="text-sm font-bold font-(family-name:--font-manrope)">
															{step.label}
														</p>
														<span
															className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${i === 0 ? "bg-green-100 text-green-700" : "bg-surface-container text-on-surface-variant"}`}
														>
															{i === 0
																? t("profile.status.complete")
																: t("profile.status.pending")}
														</span>
													</div>
													<p className="text-xs text-on-surface-variant mt-0.5">
														{step.detail.slice(0, 75)}…
													</p>
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Finance products */}
								<div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
									<h3 className="font-(family-name:--font-manrope) font-bold mb-5">
										{t("profile.financeTitle")}
									</h3>
									<div className="flex flex-col gap-4">
										{current.financeProducts.map((fp, i) => (
											<div
												key={i}
												className="border border-outline-variant/20 rounded-xl p-5"
											>
												<div className="flex items-center justify-between mb-4">
													<p className="font-(family-name:--font-manrope) font-bold">
														{fp.name}
													</p>
													<span className="text-[9px] font-black uppercase tracking-widest bg-surface-container text-on-surface-variant px-2.5 py-1 rounded-full">
														{t("profile.bankName")}
													</span>
												</div>
												<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-outline-variant/20">
													{(
														[
															[t("profile.tableLabels.amount"), fp.amount],
															[t("profile.tableLabels.term"), fp.term],
															[t("profile.tableLabels.cost"), fp.cost],
														] as [string, string][]
													).map(([label, val]: [string, string]) => (
														<div key={label}>
															<p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
																{label}
															</p>
															<p className="text-sm font-bold text-on-surface mt-0.5">
																{val}
															</p>
														</div>
													))}
												</div>
												<Link
													href="/financing"
													className="mt-4 flex items-center gap-1 text-[#FF5A30] text-xs font-bold hover:gap-2 transition-all"
												>
													{t("onboarding.finance.description")}
													<span className="material-symbols-outlined text-sm">
														arrow_forward
													</span>
												</Link>
											</div>
										))}
									</div>
								</div>
							</div>

							{/* Right column */}
							<div className="lg:col-span-7 flex flex-col gap-5">
								{/* Coverage detail */}
								<div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
									<p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-6">
										{t("profile.coverageTitle")}
									</p>
									<div className="flex flex-col gap-6">
										{current.coverage.map((c, i) => (
											<div
												key={i}
												className={`pl-4 border-l-4 ${i === 0 ? "border-[#FF5A30]" : "border-outline-variant/30"}`}
											>
												<div className="flex items-start justify-between gap-4 mb-2">
													<h4 className="font-(family-name:--font-manrope) font-bold">
														{c.product}
													</h4>
													<span
														className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0 ${i === 0 ? "bg-[#FF5A30]/10 text-[#FF5A30]" : "bg-surface-container text-on-surface-variant"}`}
													>
														{c.type}
													</span>
												</div>
												<p className="text-sm text-on-surface-variant leading-relaxed mb-3">
													{c.desc}
												</p>
												<div className="grid grid-cols-2 gap-4">
													{(
														[
															[t("profile.tableLabels.premium"), c.premium],
															[t("profile.tableLabels.term"), c.term],
														] as [string, string][]
													).map(([label, val]: [string, string]) => (
														<div key={label}>
															<p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
																{label}
															</p>
															<p className="text-sm font-bold text-on-surface mt-0.5">
																{val}
															</p>
														</div>
													))}
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Activate CTA */}
								<div className="bg-linear-to-br from-on-surface to-on-surface/80 rounded-2xl p-8 relative overflow-hidden">
									<div className="relative z-10">
										<span className="text-[10px] font-black uppercase tracking-widest text-[#FF5A30] block mb-2">
											{t("profile.status.pending")}
										</span>
										<h3 className="font-(family-name:--font-manrope) text-xl font-bold text-white mb-2">
											{t("profile.cta.title")}
										</h3>
										<p className="text-white/60 text-sm mb-6">
											{t("profile.cta.description")}
										</p>
										<FinancingApplyButton
											defaultProduct={INSURANCE_DEFAULT_PRODUCT}
											products={INSURANCE_PRODUCT_IDS}
											className="bg-[#FF5A30] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all"
										>
											{t("profile.cta.button")} →
										</FinancingApplyButton>
									</div>
									<span className="material-symbols-outlined absolute -bottom-6 -right-6 text-white/5 text-[140px] select-none">
										shield
									</span>
								</div>
							</div>
						</div>
					</div>
				)}
				</main>
			</div>
		</div>
	);
}

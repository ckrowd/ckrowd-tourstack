"use client";

import { useMutation } from "@tanstack/react-query";
import Icon from "@/components/icons";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { registerCrewMember } from "@/app/actions";
import { Link } from "@/i18n/routing";

/* ─────────────────────────── constants ─────────────────────────── */

function useCrewConstants() {
	const t = useTranslations("CrewPage");

	const STEPS = [
		{ label: t("steps.personal") },
		{ label: t("steps.role") },
		{ label: t("steps.touring") },
		{ label: t("steps.credentials") },
		{ label: t("steps.wcs") },
	];

	const ROLES = [
		t("roles.stageManager"),
		t("roles.productionManager"),
		t("roles.tourManager"),
		t("roles.fohEngineer"),
		t("roles.monitorEngineer"),
		t("roles.lightingDesigner"),
		t("roles.rigger"),
		t("roles.backlineTech"),
		t("roles.pyrotechnics"),
		t("roles.logisticsCoordinator"),
		t("roles.securityLead"),
		t("roles.merchandiseManager"),
		t("roles.hospitalityManager"),
		t("roles.videoTech"),
		t("roles.photographer"),
		t("roles.other"),
	];

	const TIER_CONFIG = [
		{
			tier: 1,
			label: t("tiers.tier1.label"),
			range: t("tiers.tier1.range"),
			color: "slate",
			bg: "bg-slate-100",
			text: "text-slate-700",
			border: "border-slate-300",
			ring: "ring-slate-300",
			perks: [
				t("tiers.tier1.perks.database"),
				t("tiers.tier1.perks.noDeployment"),
				t("tiers.tier1.perks.training"),
				t("tiers.tier1.perks.assessment"),
			],
			aya: null,
		},
		{
			tier: 2,
			label: t("tiers.tier2.label"),
			range: t("tiers.tier2.range"),
			color: "emerald",
			bg: "bg-emerald-100",
			text: "text-emerald-800",
			border: "border-emerald-300",
			ring: "ring-emerald-400",
			perks: [
				t("tiers.tier2.perks.local"),
				t("tiers.tier2.perks.payment"),
				t("tiers.tier2.perks.insurance"),
			],
			aya: t("tiers.tier2.aya"),
		},
		{
			tier: 3,
			label: t("tiers.tier3.label"),
			range: t("tiers.tier3.range"),
			color: "blue",
			bg: "bg-blue-100",
			text: "text-blue-800",
			border: "border-blue-300",
			ring: "ring-blue-400",
			perks: [
				t("tiers.tier3.perks.cluster"),
				t("tiers.tier3.perks.preferred"),
				t("tiers.tier3.perks.terms"),
				t("tiers.tier3.perks.perDiem"),
			],
			aya: t("tiers.tier3.aya"),
		},
		{
			tier: 4,
			label: t("tiers.tier4.label"),
			range: t("tiers.tier4.range"),
			color: "amber",
			bg: "bg-amber-100",
			text: "text-amber-800",
			border: "border-amber-400",
			ring: "ring-amber-500",
			perks: [
				t("tiers.tier4.perks.panAfrican"),
				t("tiers.tier4.perks.leadRole"),
				t("tiers.tier4.perks.fastTerms"),
				t("tiers.tier4.perks.equipmentInsurance"),
				t("tiers.tier4.perks.mentorship"),
			],
			aya: t("tiers.tier4.aya"),
		},
	];

	return { STEPS, ROLES, TIER_CONFIG };
}

/* ─────────────────────────── scoring ─────────────────────────── */

function calcWCS(form: FormData, t: ReturnType<typeof useTranslations>) {
	const yearsOptions = t.raw("sections.touring.options.years");
	const scaleOptions = t.raw("sections.touring.options.scale");
	const availabilityOptions = t.raw("sections.touring.options.availability");
	const yesNoOptions = t.raw("sections.touring.options.deploy48h");
	const passportOptions = t.raw("sections.touring.options.passport");

	const expMap: Record<string, number> = {
		[yearsOptions[0]]: 5,
		[yearsOptions[1]]: 14,
		[yearsOptions[2]]: 21,
		[yearsOptions[3]]: 28,
		[yearsOptions[4]]: 35,
	};
	const expPts = expMap[form.yearsExperience] ?? 0;

	const scaleMap: Record<string, number> = {
		[scaleOptions[0]]: 5,
		[scaleOptions[1]]: 15,
		[scaleOptions[2]]: 25,
		[scaleOptions[3]]: 33,
		[scaleOptions[4]]: 40,
	};
	const scalePts = scaleMap[form.largestEvent] ?? 0;

	const tourMap: Record<string, number> = {
		[availabilityOptions[0]]: 25,
		[availabilityOptions[1]]: 14,
		[availabilityOptions[2]]: 5,
	};
	const tourPts = tourMap[form.tourAvailability] ?? 0;

	const base = expPts + scalePts + tourPts;

	const bonusItems: { label: string; pts: number; earned: boolean }[] = [
		{
			label: t("sections.wcs.bonuses.deployment"),
			pts: 10,
			earned: form.deployIn48h === yesNoOptions[0],
		},
		{
			label: t("sections.wcs.bonuses.passport"),
			pts: 10,
			earned: form.validPassport === passportOptions[0],
		},
		{
			label: t("sections.wcs.bonuses.reference"),
			pts: 15,
			earned: form.refereeName.trim().length > 0,
		},
		{
			label: t("sections.wcs.bonuses.portfolio"),
			pts: 10,
			earned: form.portfolioLinks.trim().length > 0,
		},
	];

	const bonus = bonusItems
		.filter((b) => b.earned)
		.reduce((s, b) => s + b.pts, 0);
	const total = base + bonus;

	const tierIndex = total >= 86 ? 3 : total >= 71 ? 2 : total >= 51 ? 1 : 0;

	return {
		base,
		bonus,
		total,
		expPts,
		scalePts,
		tourPts,
		bonusItems,
		tierIndex,
	};
}

/* ─────────────────────────── types ─────────────────────────── */

type FormData = {
	fullName: string;
	preferredName: string;
	phone: string;
	whatsapp: string;
	email: string;
	cityBase: string;
	country: string;
	nationality: string;
	nationalId: string;
	roles: string[];
	otherRole: string;
	yearsExperience: string;
	largestEvent: string;
	tourAvailability: string;
	deployIn48h: string;
	validPassport: string;
	marketsWorked: string;
	dayRate: string;
	refereeName: string;
	refereeCompany: string;
	refereeContact: string;
	refereeRelationship: string;
	portfolioLinks: string;
	equipment: string;
	declarationName: string;
	declarationDate: string;
};

const defaultForm: FormData = {
	fullName: "",
	preferredName: "",
	phone: "",
	whatsapp: "",
	email: "",
	cityBase: "",
	country: "",
	nationality: "",
	nationalId: "",
	roles: [],
	otherRole: "",
	yearsExperience: "",
	largestEvent: "",
	tourAvailability: "",
	deployIn48h: "",
	validPassport: "",
	marketsWorked: "",
	dayRate: "",
	refereeName: "",
	refereeCompany: "",
	refereeContact: "",
	refereeRelationship: "",
	portfolioLinks: "",
	equipment: "",
	declarationName: "",
	declarationDate: "",
};

/* ─────────────────────────── shared UI ─────────────────────────── */

const inputClass =
	"w-full px-4 py-3 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-primary transition-all text-on-surface outline-none text-sm";

function Label({
	htmlFor,
	children,
	optional,
}: {
	htmlFor?: string;
	children: React.ReactNode;
	optional?: boolean;
}) {
	return (
		<label
			htmlFor={htmlFor}
			className="block text-sm font-semibold text-on-surface-variant mb-1.5"
		>
			{children}
			{optional && (
				<span className="ml-1 font-normal italic text-xs">(optional)</span>
			)}
		</label>
	);
}

function RadioGroup({
	options,
	value,
	onChange,
}: {
	options: string[];
	value: string;
	onChange: (v: string) => void;
}) {
	return (
		<div className="flex flex-col gap-2">
			{options.map((opt) => {
				const checked = value === opt;
				return (
					<button
						key={opt}
						type="button"
						onClick={() => onChange(opt)}
						className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold border transition-all text-left ${
							checked
								? "bg-primary/10 border-primary text-primary"
								: "bg-surface-container-highest border-outline-variant/20 text-on-surface-variant hover:border-primary/40"
						}`}
					>
						<span
							className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
								checked ? "border-primary" : "border-current"
							}`}
						>
							{checked && (
								<span className="w-2.5 h-2.5 rounded-full bg-primary block" />
							)}
						</span>
						{opt}
					</button>
				);
			})}
		</div>
	);
}

function Stepper({
	current,
	steps,
}: {
	current: number;
	steps: { label: string }[];
}) {
	const progress = (current / (steps.length - 1)) * 100;
	return (
		<div className="mb-12">
			<div className="flex justify-between items-center relative">
				<div className="absolute top-1/2 left-0 w-full h-0.5 bg-surface-variant -translate-y-1/2 z-0" />
				<div
					className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
					style={{ width: `${progress}%` }}
				/>
				{steps.map((step, i) => {
					const done = i < current;
					const active = i === current;
					return (
						<div
							key={step.label}
							className="relative z-10 flex flex-col items-center"
						>
							<div
								className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ring-4 ring-surface-container-low ${
									done || active
										? "bg-primary text-white"
										: "bg-surface-variant text-on-surface-variant"
								}`}
							>
								{done ? (
									<Icon name="check" size={14} />
								) : (
									i + 1
								)}
							</div>
							<span
								className={`mt-2 text-[10px] font-semibold uppercase tracking-wider text-center  leading-tight ${
									active
										? "text-primary"
										: done
											? "text-primary/70"
											: "text-on-surface-variant"
								}`}
							>
								{step.label}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}

/* ─────────────────────────── WCS score display ─────────────────────────── */

function ScoreGauge({
	score,
	max = 145,
	tierConfig,
	labels,
}: {
	score: number;
	max?: number;
	tierConfig: ReturnType<typeof useCrewConstants>["TIER_CONFIG"];
	labels: { tier: string };
}) {
	const pct = Math.min((score / max) * 100, 100);
	const tier =
		tierConfig[score >= 86 ? 3 : score >= 71 ? 2 : score >= 51 ? 1 : 0];

	const barColor =
		score >= 86
			? "bg-amber-500"
			: score >= 71
				? "bg-blue-500"
				: score >= 51
					? "bg-emerald-500"
					: "bg-slate-400";

	return (
		<div className="text-center">
			<div className="relative inline-flex flex-col items-center">
				<div
					className={`w-36 h-36 rounded-full flex items-center justify-center ring-8 ${tier.ring} ring-offset-4 ring-offset-surface-container-lowest mb-4`}
					style={{
						background: `conic-gradient(${score >= 86 ? "#f59e0b" : score >= 71 ? "#3b82f6" : score >= 51 ? "#10b981" : "#94a3b8"} ${pct * 3.6}deg, #e2e8f0 0deg)`,
					}}
				>
					<div className="w-24 h-24 rounded-full bg-surface-container-lowest flex flex-col items-center justify-center">
						<span className="text-4xl font-black text-on-surface leading-none">
							{score}
						</span>
						<span className="text-xs text-on-surface-variant font-semibold">
							/ {max}
						</span>
					</div>
				</div>
				<div
					className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold ${tier.bg} ${tier.text}`}
				>
					<Icon name={score >= 86 ? "medal" : score >= 71 ? "check-circle" : score >= 51 ? "id-card" : "profile"} size={14} />
					{labels.tier} {tier.tier} — {tier.label}
				</div>
			</div>

			<div className="mt-4 h-2 bg-surface-container-highest rounded-full overflow-hidden">
				<div
					className={`h-full rounded-full transition-all duration-700 ${barColor}`}
					style={{ width: `${pct}%` }}
				/>
			</div>
			<div className="flex justify-between text-[10px] text-on-surface-variant font-semibold mt-1">
				<span>0</span>
				<span>50</span>
				<span>70</span>
				<span>85</span>
				<span>145</span>
			</div>
		</div>
	);
}

/* ─────────────────────────── main component ─────────────────────────── */

export default function CrewClient() {
	const t = useTranslations("CrewPage");
	const { STEPS, ROLES, TIER_CONFIG } = useCrewConstants();
	const [step, setStep] = useState(0);
	const [form, setForm] = useState<FormData>(defaultForm);

	const submitMutation = useMutation({
		mutationFn: registerCrewMember,
	});

	// Guard on the server's success flag, not just a resolved request — the
	// backend can return { success: false } inside a 200 response.
	const submitted = submitMutation.data?.success === true;
	const submitting = submitMutation.isPending;
	const submitError = submitMutation.error
		? submitMutation.error instanceof Error
			? submitMutation.error.message
			: "Submission failed."
		: submitMutation.data && !submitMutation.data.success
			? (submitMutation.data.error ?? "Submission failed.")
			: null;

	function set<K extends keyof FormData>(field: K, value: FormData[K]) {
		setForm((prev) => ({ ...prev, [field]: value }));
	}

	const wcs = calcWCS(form, t);
	const { tierIndex } = wcs;
	const tier = TIER_CONFIG[tierIndex];

	if (submitted) {
		return (
			<main className="flex-1 lg:ml-64 bg-surface p-6 md:p-12 flex items-center justify-center">
				<div className="text-center">
					<ScoreGauge
						score={wcs.total}
						tierConfig={TIER_CONFIG}
						labels={{ tier: "Tier" }}
					/>
					<div className="mt-8 mb-4">
						<h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2 font-(family-name:--font-manrope)">
							{t("success.title")}
						</h1>
						<p className="text-on-surface-variant">
							{t("success.description")}
						</p>
					</div>

					<div
						className={`rounded-2xl p-5 border mb-6 text-left ${tier.bg} ${tier.border}`}
					>
						<div className="flex items-center gap-2 mb-3">
							<Icon name={wcs.total >= 86 ? "medal" : wcs.total >= 71 ? "check-circle" : wcs.total >= 51 ? "id-card" : "profile"} size={14} />
							<h4 className={`text-sm font-semibold ${tier.text}`}>
								Tier {tier.tier} — {tier.label}
							</h4>
						</div>
						<ul className="space-y-1.5">
							{tier.perks.map((p: string) => (
								<li
									key={p}
									className={`flex items-start gap-2 text-xs ${tier.text}`}
								>
									<Icon name="check-circle" size={12} className="mt-0.5" />
									{p}
								</li>
							))}
						</ul>
						{tier.aya && (
							<div className="mt-3 pt-3 border-t border-current/20 flex items-center gap-2">
								<Icon name="star" size={12} />
								<span className={`text-xs font-semibold ${tier.text}`}>
									{t("success.aya")}: {tier.aya}
								</span>
							</div>
						)}
					</div>

					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link
							href="/dashboard"
							className="px-8 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
						>
							{t("actions.dashboard")}
						</Link>
						<Link
							href="/discovery"
							className="px-8 py-3 bg-surface-container-lowest text-on-surface rounded-xl font-semibold border border-outline-variant/20 hover:bg-surface-container-low transition-colors"
						>
							{t("actions.discovery")}
						</Link>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className="flex-1 lg:ml-64 bg-surface p-6 md:p-12">
			<div className="w-full">
				{/* Header */}
				<header className="mb-10">
					<div className="flex items-start justify-between gap-4">
						<div>
							<span className="text-xs font-semibold uppercase tracking-widest text-primary block mb-3">
								{t("registry")}
							</span>
							<h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
								{t("title")}
							</h1>
							<p className="text-on-surface-variant">{t("description")}</p>
						</div>
						{/* Live score pill */}
						{step > 0 && (
							<div
								className={`shrink-0 flex flex-col items-center px-5 py-3 rounded-2xl border-2 ${tier.bg} ${tier.border} min-w-24`}
							>
								<span className={`text-3xl font-black ${tier.text}`}>
									{wcs.total}
								</span>
								<span
									className={`text-[10px] font-semibold uppercase tracking-wider ${tier.text} opacity-70`}
								>
									WCS Score
								</span>
								<span
									className={`text-[10px] font-semibold ${tier.text} mt-0.5`}
								>
									Tier {tier.tier}
								</span>
							</div>
						)}
					</div>
				</header>

				<Stepper current={step} steps={STEPS} />

				{/* Form Card */}
				<div className="tsd-card p-8 md:p-10">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							if (step < STEPS.length - 1) {
								setStep((s) => s + 1);
							} else {
								submitMutation.mutate({
									fullName: form.fullName,
									email: form.email,
									phone: form.phone || undefined,
									country: form.country || undefined,
									city: form.cityBase || undefined,
									role:
										form.roles.length > 0
											? form.roles.join(", ")
											: form.otherRole || "General Crew",
									yearsExperience: form.yearsExperience,
									largestEvent: form.largestEvent,
									tourAvailability: form.tourAvailability,
									deployIn48h:
										form.deployIn48h ===
										t.raw("sections.touring.options.deploy48h")[0],
									crossBorderDocs:
										form.validPassport ===
										t.raw("sections.touring.options.passport")[0],
								});
							}
						}}
					>
						{/* Step 0: Personal Info */}
						{step === 0 && (
							<div className="space-y-8">
								<div className="flex items-center gap-2 mb-2">
									<Icon name="profile" size={18} className="text-primary" />
									<h3 className="text-xl font-semibold font-(family-name:--font-manrope)">
										{t("sections.personal.title")}
									</h3>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<Label htmlFor="full-name">
											{t("sections.personal.fields.fullName")}
										</Label>
										<input
											id="full-name"
											type="text"
											placeholder={t(
												"sections.personal.fields.fullNamePlaceholder",
											)}
											className={inputClass}
											required
											value={form.fullName}
											onChange={(e) => set("fullName", e.target.value)}
										/>
									</div>
									<div>
										<Label htmlFor="pref-name" optional>
											{t("sections.personal.fields.preferredName")}
										</Label>
										<input
											id="pref-name"
											type="text"
											placeholder={t(
												"sections.personal.fields.preferredNamePlaceholder",
											)}
											className={inputClass}
											value={form.preferredName}
											onChange={(e) => set("preferredName", e.target.value)}
										/>
									</div>
									<div>
										<Label htmlFor="phone">
											{t("sections.personal.fields.phone")}
										</Label>
										<input
											id="phone"
											type="tel"
											placeholder={t(
												"sections.personal.fields.phonePlaceholder",
											)}
											className={inputClass}
											required
											value={form.phone}
											onChange={(e) => set("phone", e.target.value)}
										/>
									</div>
									<div>
										<Label htmlFor="whatsapp" optional>
											{t("sections.personal.fields.whatsapp")}
										</Label>
										<input
											id="whatsapp"
											type="tel"
											placeholder={t(
												"sections.personal.fields.whatsappPlaceholder",
											)}
											className={inputClass}
											value={form.whatsapp}
											onChange={(e) => set("whatsapp", e.target.value)}
										/>
									</div>
									<div className="md:col-span-2">
										<Label htmlFor="email">
											{t("sections.personal.fields.email")}
										</Label>
										<input
											id="email"
											type="email"
											placeholder={t(
												"sections.personal.fields.emailPlaceholder",
											)}
											className={inputClass}
											required
											value={form.email}
											onChange={(e) => set("email", e.target.value)}
										/>
									</div>
									<div>
										<Label htmlFor="city">
											{t("sections.personal.fields.city")}
										</Label>
										<input
											id="city"
											type="text"
											placeholder={t(
												"sections.personal.fields.cityPlaceholder",
											)}
											className={inputClass}
											required
											value={form.cityBase}
											onChange={(e) => set("cityBase", e.target.value)}
										/>
									</div>
									<div>
										<Label htmlFor="country">
											{t("sections.personal.fields.country")}
										</Label>
										<input
											id="country"
											type="text"
											placeholder={t(
												"sections.personal.fields.countryPlaceholder",
											)}
											className={inputClass}
											required
											value={form.country}
											onChange={(e) => set("country", e.target.value)}
										/>
									</div>
									<div>
										<Label htmlFor="nationality">
											{t("sections.personal.fields.nationality")}
										</Label>
										<input
											id="nationality"
											type="text"
											placeholder={t(
												"sections.personal.fields.nationalityPlaceholder",
											)}
											className={inputClass}
											required
											value={form.nationality}
											onChange={(e) => set("nationality", e.target.value)}
										/>
									</div>
									<div>
										<Label htmlFor="national-id" optional>
											{t("sections.personal.fields.nationalId")}
										</Label>
										<input
											id="national-id"
											type="text"
											placeholder={t(
												"sections.personal.fields.nationalIdPlaceholder",
											)}
											className={inputClass}
											value={form.nationalId}
											onChange={(e) => set("nationalId", e.target.value)}
										/>
										<p className="text-xs text-on-surface-variant mt-1.5 italic">
											{t("sections.personal.fields.nationalIdHint")}
										</p>
									</div>
								</div>
							</div>
						)}

						{/* Step 1: Role & Specialisation */}
						{step === 1 && (
							<div className="space-y-10">
								<div className="flex items-center gap-2 mb-2">
									<Icon name="wrench" size={18} className="text-primary" />
									<h3 className="text-xl font-semibold font-(family-name:--font-manrope)">
										{t("sections.role.title")}
									</h3>
								</div>

								<div>
									<Label>
										{t("sections.role.fields.primaryRole")}{" "}
										<span className="font-normal italic">
											{t("sections.role.fields.primaryRoleHint")}
										</span>
									</Label>
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
										{ROLES.map((role) => {
											const checked = form.roles.includes(role);
											return (
												<button
													key={role}
													type="button"
													onClick={() => {
														set(
															"roles",
															checked
																? form.roles.filter((r) => r !== role)
																: [...form.roles, role],
														);
													}}
													className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold border transition-all text-left ${
														checked
															? "bg-primary/10 border-primary text-primary"
															: "bg-surface-container-highest border-outline-variant/20 text-on-surface-variant hover:border-primary/40"
													}`}
												>
													<span
														className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
															checked
																? "border-primary bg-primary"
																: "border-current"
														}`}
													>
														{checked && (
															<Icon name="check" size={18} className="text-white" />
														)}
													</span>
													{role}
												</button>
											);
										})}
									</div>
								</div>

								{form.roles.includes(ROLES[ROLES.length - 1]) && (
									<div>
										<Label htmlFor="other-role">
											{t("sections.role.fields.otherRole")}
										</Label>
										<input
											id="other-role"
											type="text"
											placeholder={t("sections.role.fields.otherRolePlaceholder")}
											className={inputClass}
											value={form.otherRole}
											onChange={(e) => set("otherRole", e.target.value)}
										/>
									</div>
								)}
							</div>
						)}

						{/* Step 2: Touring & Scale */}
						{step === 2 && (
							<div className="space-y-10">
								<div className="flex items-center gap-2 mb-2">
									<Icon name="discovery" size={18} className="text-primary" />
									<h3 className="text-xl font-semibold font-(family-name:--font-manrope)">
										{t("sections.touring.title")}
									</h3>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
									<div className="space-y-6">
										<div>
											<Label>{t("sections.touring.fields.yearsExp")}</Label>
											<RadioGroup
												options={t.raw("sections.touring.options.years")}
												value={form.yearsExperience}
												onChange={(v) => set("yearsExperience", v)}
											/>
										</div>
										<div>
											<Label>
												{t("sections.touring.fields.largestEvent")}
											</Label>
											<RadioGroup
												options={t.raw("sections.touring.options.scale")}
												value={form.largestEvent}
												onChange={(v) => set("largestEvent", v)}
											/>
										</div>
									</div>

									<div className="space-y-6">
										<div>
											<Label>
												{t("sections.touring.fields.tourAvailability")}
											</Label>
											<RadioGroup
												options={t.raw(
													"sections.touring.options.availability",
												)}
												value={form.tourAvailability}
												onChange={(v) => set("tourAvailability", v)}
											/>
										</div>
										<div>
											<Label>
												{t("sections.touring.fields.deploy48h")}
											</Label>
											<RadioGroup
												options={t.raw(
													"sections.touring.options.deploy48h",
												)}
												value={form.deployIn48h}
												onChange={(v) => set("deployIn48h", v)}
											/>
										</div>
										<div>
											<Label>{t("sections.touring.fields.passport")}</Label>
											<RadioGroup
												options={t.raw("sections.touring.options.passport")}
												value={form.validPassport}
												onChange={(v) => set("validPassport", v)}
											/>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Step 3: Credentials */}
						{step === 3 && (
							<div className="space-y-8">
								<div className="flex items-center gap-2 mb-2">
									<Icon name="check-circle" size={18} className="text-primary" />
									<h3 className="text-xl font-semibold font-(family-name:--font-manrope)">
										{t("sections.credentials.title")}
									</h3>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<Label htmlFor="markets">
											{t("sections.credentials.fields.markets")}
										</Label>
										<input
											id="markets"
											type="text"
											placeholder={t(
												"sections.credentials.fields.marketsPlaceholder",
											)}
											className={inputClass}
											value={form.marketsWorked}
											onChange={(e) => set("marketsWorked", e.target.value)}
										/>
									</div>
									<div>
										<Label htmlFor="day-rate">
											{t("sections.credentials.fields.dayRate")}
										</Label>
										<input
											id="day-rate"
											type="text"
											placeholder={t(
												"sections.credentials.fields.dayRatePlaceholder",
											)}
											className={inputClass}
											value={form.dayRate}
											onChange={(e) => set("dayRate", e.target.value)}
										/>
									</div>
									<div className="md:col-span-2">
										<Label htmlFor="portfolio" optional>
											{t("sections.credentials.fields.portfolio")}
										</Label>
										<input
											id="portfolio"
											type="text"
											placeholder={t(
												"sections.credentials.fields.portfolioPlaceholder",
											)}
											className={inputClass}
											value={form.portfolioLinks}
											onChange={(e) =>
												set("portfolioLinks", e.target.value)
											}
										/>
									</div>
									<div className="md:col-span-2">
										<Label htmlFor="gear" optional>
											{t("sections.credentials.fields.equipment")}
										</Label>
										<textarea
											id="gear"
											placeholder={t(
												"sections.credentials.fields.equipmentPlaceholder",
											)}
											className={`${inputClass} h-24 resize-none pt-3`}
											value={form.equipment}
											onChange={(e) => set("equipment", e.target.value)}
										/>
									</div>
								</div>

								<div className="pt-6 border-t border-outline-variant/10">
									<p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
										Industry Reference
									</p>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<Label htmlFor="ref-name">
												{t("sections.credentials.fields.refereeName")}
											</Label>
											<input
												id="ref-name"
												type="text"
												placeholder={t("sections.credentials.fields.refereeNamePlaceholder")}
												className={inputClass}
												value={form.refereeName}
												onChange={(e) => set("refereeName", e.target.value)}
											/>
										</div>
										<div>
											<Label htmlFor="ref-company">
												{t("sections.credentials.fields.refereeCompany")}
											</Label>
											<input
												id="ref-company"
												type="text"
												placeholder={t("sections.credentials.fields.refereeCompanyPlaceholder")}
												className={inputClass}
												value={form.refereeCompany}
												onChange={(e) =>
													set("refereeCompany", e.target.value)
												}
											/>
										</div>
										<div>
											<Label htmlFor="ref-contact">
												{t("sections.credentials.fields.refereeContact")}
											</Label>
											<input
												id="ref-contact"
												type="text"
												placeholder={t("sections.credentials.fields.refereeContactPlaceholder")}
												className={inputClass}
												value={form.refereeContact}
												onChange={(e) =>
													set("refereeContact", e.target.value)
												}
											/>
										</div>
										<div>
											<Label htmlFor="ref-rel">
												{t(
													"sections.credentials.fields.refereeRelationship",
												)}
											</Label>
											<input
												id="ref-rel"
												type="text"
												placeholder={t("sections.credentials.fields.refereeRelationshipPlaceholder")}
												className={inputClass}
												value={form.refereeRelationship}
												onChange={(e) =>
													set("refereeRelationship", e.target.value)
												}
											/>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Step 4: WCS Score & Declaration */}
						{step === 4 && (
							<div className="space-y-10">
								<div className="flex items-center gap-2 mb-2">
									<Icon name="chart" size={18} className="text-primary" />
									<h3 className="text-xl font-semibold font-(family-name:--font-manrope)">
										{t("sections.wcs.title")}
									</h3>
								</div>

								<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
									<div>
										<ScoreGauge
											score={wcs.total}
											tierConfig={TIER_CONFIG}
											labels={{ tier: "Tier" }}
										/>
									</div>

									<div className="space-y-6">
										<div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
											<h4 className="font-semibold text-sm text-on-surface mb-4">
												Score Breakdown
											</h4>
											<div className="space-y-3">
												<div className="flex justify-between text-sm">
													<span className="text-on-surface-variant">
														Base Score
													</span>
													<span className="font-semibold">
														{wcs.base} / 100
													</span>
												</div>
												<div className="flex justify-between text-sm">
													<span className="text-on-surface-variant">
														Bonus Score
													</span>
													<span className="font-semibold text-emerald-600">
														+{wcs.bonus}
													</span>
												</div>
												<div className="h-px bg-outline-variant/10 my-2" />
												<div className="flex justify-between text-base">
													<span className="font-semibold">Total WCS Score</span>
													<span className="font-black text-primary">
														{wcs.total}
													</span>
												</div>
											</div>
										</div>

										<div className="space-y-3">
											<p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
												{t("sections.wcs.bonuses.title")}
											</p>
											<div className="grid grid-cols-1 gap-2">
												{wcs.bonusItems.map((item) => (
													<div
														key={item.label}
														className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold ${
															item.earned
																? "bg-emerald-50 border-emerald-200 text-emerald-800"
																: "bg-surface-container-low border-outline-variant/10 text-on-surface-variant opacity-60"
														}`}
													>
														<span>{item.label}</span>
														{item.earned ? (
															<Icon name="check-circle" size={14} />
														) : (
															<span>+0</span>
														)}
													</div>
												))}
											</div>
										</div>
									</div>
								</div>

								<div className="pt-8 border-t border-outline-variant/10 space-y-6">
									<div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
										<h4 className="font-semibold text-on-surface mb-2">
											{t("sections.wcs.declaration.title")}
										</h4>
										<p className="text-sm text-on-surface-variant leading-relaxed">
											{t("sections.wcs.declaration.text")}
										</p>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<Label htmlFor="sig-name">
												{t("sections.wcs.declaration.name")}
											</Label>
											<input
												id="sig-name"
												type="text"
												placeholder={form.fullName || t("sections.wcs.declaration.namePlaceholder")}
												className={inputClass}
												required
												value={form.declarationName}
												onChange={(e) =>
													set("declarationName", e.target.value)
												}
											/>
										</div>
										<div>
											<Label htmlFor="sig-date">
												{t("sections.wcs.declaration.date")}
											</Label>
											<input
												id="sig-date"
												type="date"
												className={inputClass}
												required
												value={form.declarationDate}
												onChange={(e) =>
													set("declarationDate", e.target.value)
												}
											/>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Navigation */}
						<div className="flex items-center justify-between mt-12 pt-8 border-t border-outline-variant/10">
							<button
								type="button"
								onClick={() => setStep((s) => s - 1)}
								className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
									step === 0
										? "opacity-0 pointer-events-none"
										: "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
								}`}
							>
								<Icon name="arrow-left" size={14} />
								{t("actions.back")}
							</button>

							<button
								type="submit"
								disabled={submitting}
								className="flex items-center gap-2 px-10 py-4 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
							>
								{submitting ? (
									<>
										<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
										{t("actions.submitting")}
									</>
								) : (
									<>
										{step === STEPS.length - 1
											? t("actions.submit")
											: t("actions.continue")}
										<Icon name={step === STEPS.length - 1 ? "send" : "arrow-right"} size={14} />
									</>
								)}
							</button>
						</div>
						{submitError && (
							<p className="mt-4 text-center text-sm font-semibold text-red-500">
								{submitError}
							</p>
						)}
					</form>
				</div>
			</div>
		</main>
	);
}

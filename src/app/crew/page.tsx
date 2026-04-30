"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import { registerCrewMember } from "@/app/actions";

/* ─────────────────────────── constants ─────────────────────────── */

const STEPS = [
	{ label: "Personal" },
	{ label: "Role" },
	{ label: "Touring" },
	{ label: "Credentials" },
	{ label: "WCS Score" },
];

const ROLES = [
	"Stage Manager",
	"Production Manager",
	"Tour Manager",
	"FOH Engineer",
	"Monitor Engineer",
	"Lighting Designer / Operator",
	"Rigger",
	"Backline Tech",
	"Pyrotechnics",
	"Logistics Coordinator",
	"Security Lead",
	"Merchandise Manager",
	"Hospitality / Rider Manager",
	"Video / LED Tech",
	"Photographer / Videographer",
	"Other",
];

const TIER_CONFIG = [
	{
		tier: 1,
		label: "Registered Worker",
		range: "0 – 50",
		color: "slate",
		bg: "bg-slate-100",
		text: "text-slate-700",
		border: "border-slate-300",
		ring: "ring-slate-300",
		perks: [
			"Database entry and profile created",
			"No tour deployment at this stage",
			"Training resources and upskilling pathways offered",
			"Eligible for re-assessment after 90 days",
		],
		aya: null,
	},
	{
		tier: 2,
		label: "Certified Local Crew",
		range: "51 – 70",
		color: "emerald",
		bg: "bg-emerald-100",
		text: "text-emerald-800",
		border: "border-emerald-300",
		ring: "ring-emerald-400",
		perks: [
			"Single-city tour deployment eligibility",
			"Access Bank payment onboarding & day rate locked",
			"Group insurance coverage via SanlamAllianz",
		],
		aya: "Eligible as local crew (per city)",
	},
	{
		tier: 3,
		label: "Certified Touring Professional",
		range: "71 – 85",
		color: "blue",
		bg: "bg-blue-100",
		text: "text-blue-800",
		border: "border-blue-300",
		ring: "ring-blue-400",
		perks: [
			"Multi-city cluster deployment eligibility",
			"Preferred crew status — first call for regional tours",
			"7-day payment terms post-tour completion",
			"Cross-border per diem advance provided",
		],
		aya: "Eligible for touring party (moves with tour)",
	},
	{
		tier: 4,
		label: "CTaaS Master Technician",
		range: "86 – 100+",
		color: "amber",
		bg: "bg-amber-100",
		text: "text-amber-800",
		border: "border-amber-400",
		ring: "ring-amber-500",
		perks: [
			"Pan-African tour deployment eligibility",
			"Lead role / department head assignment",
			"3-day payment terms post-engagement",
			"Equipment and tools insurance coverage included",
			"Training mentorship role — earns income from crew development",
		],
		aya: "Eligible as department lead",
	},
];

/* ─────────────────────────── scoring ─────────────────────────── */

function calcWCS(form: FormData) {
	// Base — Experience (max 35)
	const expMap: Record<string, number> = {
		"Less than 1 year": 5,
		"1–3 years": 14,
		"4–7 years": 21,
		"8–12 years": 28,
		"13+ years": 35,
	};
	const expPts = expMap[form.yearsExperience] ?? 0;

	// Base — Scale (max 40)
	const scaleMap: Record<string, number> = {
		"Under 500": 5,
		"500–2,000": 15,
		"2,001–10,000": 25,
		"10,001–50,000": 33,
		"50,000+": 40,
	};
	const scalePts = scaleMap[form.largestEvent] ?? 0;

	// Base — Touring availability (max 25)
	const tourMap: Record<string, number> = {
		"Yes, I can move with the tour": 25,
		"Flexible — depends on dates": 14,
		"Local crew only (single city)": 5,
	};
	const tourPts = tourMap[form.tourAvailability] ?? 0;

	const base = expPts + scalePts + tourPts;

	// Bonus
	const bonusItems: { label: string; pts: number; earned: boolean }[] = [
		{
			label: "48-hour deployment availability",
			pts: 10,
			earned: form.deployIn48h === "Yes",
		},
		{
			label: "Valid cross-border travel document",
			pts: 10,
			earned: form.validPassport === "Yes — currently valid",
		},
		{
			label: "Verified reference from a Certified Promoter",
			pts: 15,
			earned: form.refereeName.trim().length > 0,
		},
		{
			label: "Portfolio, showreel, or industry certificate",
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
		tier: TIER_CONFIG[tierIndex],
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
	"w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-[#FF5A30] transition-all text-on-surface outline-none text-sm";

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
								? "bg-[#FF5A30]/10 border-[#FF5A30] text-[#FF5A30]"
								: "bg-surface-container-highest border-outline-variant/20 text-on-surface-variant hover:border-[#FF5A30]/40"
						}`}
					>
						<span
							className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
								checked ? "border-[#FF5A30]" : "border-current"
							}`}
						>
							{checked && (
								<span className="w-2.5 h-2.5 rounded-full bg-[#FF5A30] block" />
							)}
						</span>
						{opt}
					</button>
				);
			})}
		</div>
	);
}

function Stepper({ current }: { current: number }) {
	const progress = (current / (STEPS.length - 1)) * 100;
	return (
		<div className="mb-12">
			<div className="flex justify-between items-center relative">
				<div className="absolute top-1/2 left-0 w-full h-0.5 bg-surface-variant -translate-y-1/2 z-0" />
				<div
					className="absolute top-1/2 left-0 h-0.5 bg-[#FF5A30] -translate-y-1/2 z-0 transition-all duration-500"
					style={{ width: `${progress}%` }}
				/>
				{STEPS.map((step, i) => {
					const done = i < current;
					const active = i === current;
					return (
						<div
							key={step.label}
							className="relative z-10 flex flex-col items-center"
						>
							<div
								className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ring-4 ring-surface-container-low ${
									done || active
										? "bg-[#FF5A30] text-white"
										: "bg-surface-variant text-on-surface-variant"
								}`}
							>
								{done ? (
									<span
										className="material-symbols-outlined text-sm"
										style={{ fontVariationSettings: "'FILL' 1" }}
									>
										check
									</span>
								) : (
									i + 1
								)}
							</div>
							<span
								className={`mt-2 text-[10px] font-bold uppercase tracking-wider text-center max-w-16 leading-tight ${
									active
										? "text-[#FF5A30]"
										: done
											? "text-[#FF5A30]/70"
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

function ScoreGauge({ score, max = 145 }: { score: number; max?: number }) {
	const pct = Math.min((score / max) * 100, 100);
	const tier =
		TIER_CONFIG[score >= 86 ? 3 : score >= 71 ? 2 : score >= 51 ? 1 : 0];

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
						background: `conic-gradient(${pct >= 86 ? "#f59e0b" : pct >= 71 ? "#3b82f6" : pct >= 51 ? "#10b981" : "#94a3b8"} ${pct * 3.6}deg, #e2e8f0 0deg)`,
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
					className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold ${tier.bg} ${tier.text}`}
				>
					<span
						className="material-symbols-outlined text-sm"
						style={{ fontVariationSettings: "'FILL' 1" }}
					>
						{score >= 86
							? "military_tech"
							: score >= 71
								? "verified"
								: score >= 51
									? "badge"
									: "person"}
					</span>
					Tier {tier.tier} — {tier.label}
				</div>
			</div>

			<div className="mt-4 h-2 bg-surface-container-highest rounded-full overflow-hidden max-w-xs mx-auto">
				<div
					className={`h-full rounded-full transition-all duration-700 ${barColor}`}
					style={{ width: `${pct}%` }}
				/>
			</div>
			<div className="flex justify-between text-[10px] text-on-surface-variant font-semibold mt-1 max-w-xs mx-auto">
				<span>0</span>
				<span>50</span>
				<span>70</span>
				<span>85</span>
				<span>145</span>
			</div>
		</div>
	);
}

/* ─────────────────────────── main page ─────────────────────────── */

export default function CrewPage() {
	const [step, setStep] = useState(0);
	const [form, setForm] = useState<FormData>(defaultForm);

	const submitMutation = useMutation({
		mutationFn: registerCrewMember,
	});

	const submitted = submitMutation.isSuccess;
	const submitting = submitMutation.isPending;
	const submitError = submitMutation.error
		? submitMutation.error instanceof Error
			? submitMutation.error.message
			: "Submission failed. Please try again."
		: submitMutation.data && !submitMutation.data.success
			? (submitMutation.data.error ?? "Submission failed. Please try again.")
			: null;

	function set<K extends keyof FormData>(field: K, value: FormData[K]) {
		setForm((prev) => ({ ...prev, [field]: value }));
	}

	const wcs = calcWCS(form);
	const { tier } = wcs;

	if (submitted) {
		return (
			<div className="bg-surface text-on-surface">
				<TopNav />
				<div className="flex pt-16 h-screen">
					<SideNav />
					<main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-12 flex items-center justify-center">
						<div className="text-center max-w-lg">
							<ScoreGauge score={wcs.total} />
							<div className="mt-8 mb-4">
								<h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2 font-(family-name:--font-manrope)">
									Registration Submitted!
								</h1>
								<p className="text-on-surface-variant">
									Your WCS score has been calculated. The Ckrowd team will
									verify your credentials and confirm your tier within 48 hours
									via WhatsApp or email.
								</p>
							</div>

							<div
								className={`rounded-2xl p-5 border mb-6 text-left ${tier.bg} ${tier.border}`}
							>
								<div className="flex items-center gap-2 mb-3">
									<span
										className="material-symbols-outlined text-sm"
										style={{ fontVariationSettings: "'FILL' 1" }}
									>
										{wcs.total >= 86
											? "military_tech"
											: wcs.total >= 71
												? "verified"
												: wcs.total >= 51
													? "badge"
													: "person"}
									</span>
									<h4 className={`text-sm font-bold ${tier.text}`}>
										Tier {tier.tier} — {tier.label}
									</h4>
								</div>
								<ul className="space-y-1.5">
									{tier.perks.map((p) => (
										<li
											key={p}
											className={`flex items-start gap-2 text-xs ${tier.text}`}
										>
											<span
												className="material-symbols-outlined text-xs mt-0.5"
												style={{ fontVariationSettings: "'FILL' 1" }}
											>
												check_circle
											</span>
											{p}
										</li>
									))}
								</ul>
								{tier.aya && (
									<div className="mt-3 pt-3 border-t border-current/20 flex items-center gap-2">
										<span
											className="material-symbols-outlined text-xs"
											style={{ fontVariationSettings: "'FILL' 1" }}
										>
											star
										</span>
										<span className={`text-xs font-bold ${tier.text}`}>
											Aya Nakamura Pilot: {tier.aya}
										</span>
									</div>
								)}
							</div>

							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Link
									href="/dashboard"
									className="px-8 py-3 bg-[#FF5A30] text-white rounded-xl font-bold shadow-lg shadow-[#FF5A30]/20 hover:scale-[1.02] transition-transform"
								>
									View Dashboard
								</Link>
								<Link
									href="/discovery"
									className="px-8 py-3 bg-surface-container-lowest text-on-surface rounded-xl font-bold border border-outline-variant/20 hover:bg-surface-container-low transition-colors"
								>
									Browse Tours
								</Link>
							</div>
							<p className="mt-6 text-xs text-on-surface-variant">
								Enquiries:{" "}
								<span className="font-semibold">workforce@ckrowd.africa</span>
							</p>
						</div>
					  </main>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-surface text-on-surface">
			<TopNav />

			<div className="flex pt-16 h-screen">
				<SideNav />

				<main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-12">
					<div className="w-full">
						{/* Header */}
						<header className="mb-10">
							<div className="flex items-start justify-between gap-4">
								<div>
									<span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-3">
										CTaaS — Workforce Registry
									</span>
									<h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
										Crew Registration
									</h1>
									<p className="text-on-surface-variant">
										Register as a verified CTaaS crew member. Your answers are
										scored instantly to determine your Workforce Capability
										Score and tier placement.
									</p>
								</div>
								{/* Live score pill (visible from step 1 onwards) */}
								{step > 0 && (
									<div
										className={`shrink-0 flex flex-col items-center px-5 py-3 rounded-2xl border-2 ${tier.bg} ${tier.border} min-w-24`}
									>
										<span className={`text-3xl font-black ${tier.text}`}>
											{wcs.total}
										</span>
										<span
											className={`text-[10px] font-bold uppercase tracking-wider ${tier.text} opacity-70`}
										>
											WCS
										</span>
										<span
											className={`text-[10px] font-bold ${tier.text} mt-0.5`}
										>
											Tier {tier.tier}
										</span>
									</div>
								)}
							</div>

							{/* Timer banner */}
							<div className="mt-4 flex items-center gap-2 text-xs text-on-surface-variant">
								<span className="material-symbols-outlined text-sm">timer</span>
								Estimated completion: 3 minutes &nbsp;·&nbsp; Submitted → Scored
								→ Tiered
							</div>
						</header>

						<Stepper current={step} />

						{/* Form Card */}
						<div className="bg-surface-container-lowest rounded-2xl p-8 md:p-10 shadow-sm border border-outline-variant/10">
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
											deployIn48h: form.deployIn48h === "yes",
											crossBorderDocs: form.validPassport === "yes",
										});
									}
								}}
							>
								{/* ── Step 0: Personal Information ── */}
								{step === 0 && (
									<div className="space-y-8">
										<div className="flex items-center gap-2 mb-2">
											<span className="material-symbols-outlined text-[#FF5A30]">
												person
											</span>
											<h3 className="text-xl font-bold font-(family-name:--font-manrope)">
												Personal Information
											</h3>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<div>
												<Label htmlFor="full-name">Full Name</Label>
												<input
													id="full-name"
													type="text"
													placeholder="e.g. Kofi Mensah"
													className={inputClass}
													required
													value={form.fullName}
													onChange={(e) => set("fullName", e.target.value)}
												/>
											</div>
											<div>
												<Label htmlFor="pref-name" optional>
													Preferred Name / Stage Name
												</Label>
												<input
													id="pref-name"
													type="text"
													placeholder="e.g. DJ Phantom"
													className={inputClass}
													value={form.preferredName}
													onChange={(e) => set("preferredName", e.target.value)}
												/>
											</div>
											<div>
												<Label htmlFor="phone">Phone Number</Label>
												<input
													id="phone"
													type="tel"
													placeholder="+234 800 000 0000"
													className={inputClass}
													required
													value={form.phone}
													onChange={(e) => set("phone", e.target.value)}
												/>
											</div>
											<div>
												<Label htmlFor="whatsapp" optional>
													WhatsApp Number (if different)
												</Label>
												<input
													id="whatsapp"
													type="tel"
													placeholder="+233 20 000 0000"
													className={inputClass}
													value={form.whatsapp}
													onChange={(e) => set("whatsapp", e.target.value)}
												/>
											</div>
											<div className="md:col-span-2">
												<Label htmlFor="email">Email Address</Label>
												<input
													id="email"
													type="email"
													placeholder="yourname@email.com"
													className={inputClass}
													required
													value={form.email}
													onChange={(e) => set("email", e.target.value)}
												/>
											</div>
											<div>
												<Label htmlFor="city">City / Base Location</Label>
												<input
													id="city"
													type="text"
													placeholder="e.g. Lagos"
													className={inputClass}
													required
													value={form.cityBase}
													onChange={(e) => set("cityBase", e.target.value)}
												/>
											</div>
											<div>
												<Label htmlFor="country">Country</Label>
												<input
													id="country"
													type="text"
													placeholder="e.g. Nigeria"
													className={inputClass}
													required
													value={form.country}
													onChange={(e) => set("country", e.target.value)}
												/>
											</div>
											<div>
												<Label htmlFor="nationality">Nationality</Label>
												<input
													id="nationality"
													type="text"
													placeholder="e.g. Ghanaian"
													className={inputClass}
													required
													value={form.nationality}
													onChange={(e) => set("nationality", e.target.value)}
												/>
											</div>
											<div>
												<Label htmlFor="national-id" optional>
													National ID / Passport Number
												</Label>
												<input
													id="national-id"
													type="text"
													placeholder="Document number only"
													className={inputClass}
													value={form.nationalId}
													onChange={(e) => set("nationalId", e.target.value)}
												/>
												<p className="text-xs text-on-surface-variant mt-1.5 italic">
													Required for cross-border eligibility — document
													number only.
												</p>
											</div>
										</div>
									</div>
								)}

								{/* ── Step 1: Role & Specialisation ── */}
								{step === 1 && (
									<div className="space-y-10">
										<div className="flex items-center gap-2 mb-2">
											<span className="material-symbols-outlined text-[#FF5A30]">
												engineering
											</span>
											<h3 className="text-xl font-bold font-(family-name:--font-manrope)">
												Role &amp; Specialisation
											</h3>
										</div>

										<div>
											<Label>
												Primary Role / Job Title{" "}
												<span className="font-normal italic text-xs">
													(select all that apply)
												</span>
											</Label>
											<div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3">
												{ROLES.map((role) => {
													const checked = form.roles.includes(role);
													return (
														<button
															key={role}
															type="button"
															onClick={() => {
																const arr = form.roles;
																set(
																	"roles",
																	checked
																		? arr.filter((x) => x !== role)
																		: [...arr, role],
																);
															}}
															className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all text-left ${
																checked
																	? "bg-[#FF5A30]/10 border-[#FF5A30] text-[#FF5A30]"
																	: "bg-surface-container-highest border-outline-variant/20 text-on-surface-variant hover:border-[#FF5A30]/40"
															}`}
														>
															<span
																className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border-2 ${
																	checked
																		? "bg-[#FF5A30] border-[#FF5A30]"
																		: "border-current"
																}`}
															>
																{checked && (
																	<span
																		className="material-symbols-outlined text-white"
																		style={{ fontSize: 10 }}
																	>
																		check
																	</span>
																)}
															</span>
															{role}
														</button>
													);
												})}
											</div>
										</div>

										{form.roles.includes("Other") && (
											<div>
												<Label htmlFor="other-role">Specify your role</Label>
												<input
													id="other-role"
													type="text"
													placeholder="Your role title"
													className={inputClass}
													value={form.otherRole}
													onChange={(e) => set("otherRole", e.target.value)}
												/>
											</div>
										)}

										<div>
											<Label>
												Years of Experience in Live Events / Concert Production
											</Label>
											<div className="mt-2">
												<RadioGroup
													options={[
														"Less than 1 year",
														"1–3 years",
														"4–7 years",
														"8–12 years",
														"13+ years",
													]}
													value={form.yearsExperience}
													onChange={(v) => set("yearsExperience", v)}
												/>
											</div>
											{form.yearsExperience && (
												<div className="mt-3 flex items-center gap-2 text-xs text-[#FF5A30] font-semibold">
													<span
														className="material-symbols-outlined text-sm"
														style={{ fontVariationSettings: "'FILL' 1" }}
													>
														add_circle
													</span>
													+{calcWCS({ ...form }).expPts} base points
												</div>
											)}
										</div>

										<div>
											<Label>
												Largest Event You Have Worked (Approximate Attendance)
											</Label>
											<div className="mt-2">
												<RadioGroup
													options={[
														"Under 500",
														"500–2,000",
														"2,001–10,000",
														"10,001–50,000",
														"50,000+",
													]}
													value={form.largestEvent}
													onChange={(v) => set("largestEvent", v)}
												/>
											</div>
											{form.largestEvent && (
												<div className="mt-3 flex items-center gap-2 text-xs text-[#FF5A30] font-semibold">
													<span
														className="material-symbols-outlined text-sm"
														style={{ fontVariationSettings: "'FILL' 1" }}
													>
														add_circle
													</span>
													+{calcWCS({ ...form }).scalePts} base points
												</div>
											)}
										</div>
									</div>
								)}

								{/* ── Step 2: Touring Capacity ── */}
								{step === 2 && (
									<div className="space-y-10">
										<div className="flex items-center gap-2 mb-2">
											<span className="material-symbols-outlined text-[#FF5A30]">
												travel_explore
											</span>
											<h3 className="text-xl font-bold font-(family-name:--font-manrope)">
												Touring Capacity
											</h3>
										</div>

										<div>
											<Label>Are you available for multi-city touring?</Label>
											<div className="mt-2">
												<RadioGroup
													options={[
														"Yes, I can move with the tour",
														"Local crew only (single city)",
														"Flexible — depends on dates",
													]}
													value={form.tourAvailability}
													onChange={(v) => set("tourAvailability", v)}
												/>
											</div>
											{form.tourAvailability && (
												<div className="mt-3 flex items-center gap-2 text-xs text-[#FF5A30] font-semibold">
													<span
														className="material-symbols-outlined text-sm"
														style={{ fontVariationSettings: "'FILL' 1" }}
													>
														add_circle
													</span>
													+{calcWCS({ ...form }).tourPts} base points
												</div>
											)}
										</div>

										<div>
											<div className="flex items-start justify-between gap-4 mb-2">
												<Label>
													Can you deploy within 48 hours if required?
												</Label>
												<span className="text-xs font-bold text-[#FF5A30] bg-[#FF5A30]/10 px-2 py-1 rounded-full shrink-0">
													+10 bonus pts
												</span>
											</div>
											<RadioGroup
												options={[
													"Yes",
													"No",
													"Sometimes — depends on advance notice",
												]}
												value={form.deployIn48h}
												onChange={(v) => set("deployIn48h", v)}
											/>
										</div>

										<div>
											<div className="flex items-start justify-between gap-4 mb-2">
												<Label optional>
													Do you hold a valid travel document (passport) for
													cross-border work?
												</Label>
												<span className="text-xs font-bold text-[#FF5A30] bg-[#FF5A30]/10 px-2 py-1 rounded-full shrink-0">
													+10 bonus pts
												</span>
											</div>
											<RadioGroup
												options={[
													"Yes — currently valid",
													"Yes — renewal pending",
													"No",
												]}
												value={form.validPassport}
												onChange={(v) => set("validPassport", v)}
											/>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<div>
												<Label htmlFor="markets" optional>
													Markets / Countries You Have Worked In
												</Label>
												<textarea
													id="markets"
													rows={3}
													placeholder="e.g. Nigeria, Ghana, Côte d'Ivoire, Senegal, Kenya..."
													className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-[#FF5A30] transition-all text-on-surface outline-none text-sm resize-none"
													value={form.marketsWorked}
													onChange={(e) => set("marketsWorked", e.target.value)}
												/>
											</div>
											<div>
												<Label htmlFor="day-rate">Expected Day Rate</Label>
												<input
													id="day-rate"
													type="text"
													placeholder="e.g. $150/day or ₦80,000/day"
													className={inputClass}
													required
													value={form.dayRate}
													onChange={(e) => set("dayRate", e.target.value)}
												/>
												<p className="text-xs text-on-surface-variant mt-1.5 italic">
													USD or local currency. Locked in your crew profile
													upon certification.
												</p>
											</div>
										</div>
									</div>
								)}

								{/* ── Step 3: Credentials & Verification ── */}
								{step === 3 && (
									<div className="space-y-10">
										<div className="flex items-center gap-2 mb-2">
											<span className="material-symbols-outlined text-[#FF5A30]">
												verified_user
											</span>
											<h3 className="text-xl font-bold font-(family-name:--font-manrope)">
												Credentials &amp; Verification
											</h3>
										</div>

										{/* Reference */}
										<section className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
											<div className="flex items-start justify-between gap-4 mb-4">
												<div>
													<h4 className="font-bold text-on-surface mb-1 font-(family-name:--font-manrope)">
														Reference from a Certified Promoter or Production
														Company
													</h4>
													<p className="text-sm text-on-surface-variant">
														A verified reference from a CTaaS-certified promoter
														awards bonus points toward your WCS score.
													</p>
												</div>
												<span className="shrink-0 text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full">
													+15 bonus pts
												</span>
											</div>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div>
													<Label htmlFor="ref-name" optional>
														Referee Full Name
													</Label>
													<input
														id="ref-name"
														type="text"
														placeholder="e.g. Seun Adekunle"
														className={inputClass}
														value={form.refereeName}
														onChange={(e) => set("refereeName", e.target.value)}
													/>
												</div>
												<div>
													<Label htmlFor="ref-company" optional>
														Referee Company / Organisation
													</Label>
													<input
														id="ref-company"
														type="text"
														placeholder="e.g. Lagos Live Events Ltd"
														className={inputClass}
														value={form.refereeCompany}
														onChange={(e) =>
															set("refereeCompany", e.target.value)
														}
													/>
												</div>
												<div>
													<Label htmlFor="ref-contact" optional>
														Referee Phone / Email
													</Label>
													<input
														id="ref-contact"
														type="text"
														placeholder="+234 800 000 0000"
														className={inputClass}
														value={form.refereeContact}
														onChange={(e) =>
															set("refereeContact", e.target.value)
														}
													/>
												</div>
												<div>
													<Label htmlFor="ref-rel" optional>
														Relationship to You
													</Label>
													<input
														id="ref-rel"
														type="text"
														placeholder="e.g. Previous employer, collaborator"
														className={inputClass}
														value={form.refereeRelationship}
														onChange={(e) =>
															set("refereeRelationship", e.target.value)
														}
													/>
												</div>
											</div>
											{form.refereeName.trim() && (
												<div className="mt-4 flex items-center gap-2 text-xs text-amber-700 font-bold">
													<span
														className="material-symbols-outlined text-sm"
														style={{ fontVariationSettings: "'FILL' 1" }}
													>
														check_circle
													</span>
													+15 bonus points unlocked
												</div>
											)}
										</section>

										{/* Portfolio */}
										<section className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
											<div className="flex items-start justify-between gap-4 mb-4">
												<div>
													<h4 className="font-bold text-on-surface mb-1 font-(family-name:--font-manrope)">
														Portfolio, Showreel, or Certificate Link(s)
													</h4>
													<p className="text-sm text-on-surface-variant">
														Sharing a portfolio or relevant certificate awards
														bonus points toward your WCS score.
													</p>
												</div>
												<span className="shrink-0 text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full">
													+10 bonus pts
												</span>
											</div>
											<div>
												<Label htmlFor="portfolio" optional>
													Paste links separated by commas
												</Label>
												<textarea
													id="portfolio"
													rows={3}
													placeholder="Google Drive, YouTube, LinkedIn, personal website..."
													className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-[#FF5A30] transition-all text-on-surface outline-none text-sm resize-none"
													value={form.portfolioLinks}
													onChange={(e) =>
														set("portfolioLinks", e.target.value)
													}
												/>
											</div>
											{form.portfolioLinks.trim() && (
												<div className="mt-4 flex items-center gap-2 text-xs text-amber-700 font-bold">
													<span
														className="material-symbols-outlined text-sm"
														style={{ fontVariationSettings: "'FILL' 1" }}
													>
														check_circle
													</span>
													+10 bonus points unlocked
												</div>
											)}
										</section>

										{/* Equipment */}
										<div>
											<Label htmlFor="equipment" optional>
												Equipment &amp; Tools You Own / Operate
											</Label>
											<textarea
												id="equipment"
												rows={3}
												placeholder="List any owned or certified equipment relevant to your role..."
												className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-[#FF5A30] transition-all text-on-surface outline-none text-sm resize-none"
												value={form.equipment}
												onChange={(e) => set("equipment", e.target.value)}
											/>
										</div>
									</div>
								)}

								{/* ── Step 4: WCS Score + Declaration ── */}
								{step === 4 && (
									<div className="space-y-10">
										<div className="flex items-center gap-2 mb-2">
											<span className="material-symbols-outlined text-[#FF5A30]">
												analytics
											</span>
											<h3 className="text-xl font-bold font-(family-name:--font-manrope)">
												Workforce Capability Score
											</h3>
										</div>

										{/* Score gauge */}
										<div className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10">
											<ScoreGauge score={wcs.total} />
										</div>

										{/* Score breakdown */}
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											{/* Base */}
											<div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/10">
												<h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-4">
													Base Score — {wcs.base} pts
												</h4>
												<div className="space-y-3">
													{[
														{
															label: "Experience Level",
															pts: wcs.expPts,
															max: 35,
														},
														{
															label: "Event Scale",
															pts: wcs.scalePts,
															max: 40,
														},
														{
															label: "Touring Availability",
															pts: wcs.tourPts,
															max: 25,
														},
													].map((item) => (
														<div key={item.label}>
															<div className="flex justify-between text-xs mb-1">
																<span className="text-on-surface-variant font-medium">
																	{item.label}
																</span>
																<span className="font-bold text-on-surface">
																	{item.pts} / {item.max}
																</span>
															</div>
															<div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
																<div
																	className="h-full bg-[#FF5A30] rounded-full transition-all"
																	style={{
																		width: `${(item.pts / item.max) * 100}%`,
																	}}
																/>
															</div>
														</div>
													))}
												</div>
											</div>

											{/* Bonus */}
											<div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/10">
												<h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-4">
													Bonus Points — {wcs.bonus} pts
												</h4>
												<div className="space-y-3">
													{wcs.bonusItems.map((b) => (
														<div
															key={b.label}
															className="flex items-start gap-3"
														>
															<span
																className={`material-symbols-outlined text-base mt-0.5 shrink-0 ${b.earned ? "text-amber-500" : "text-slate-300"}`}
																style={{ fontVariationSettings: "'FILL' 1" }}
															>
																{b.earned
																	? "check_circle"
																	: "radio_button_unchecked"}
															</span>
															<div className="flex-1 min-w-0">
																<p
																	className={`text-xs font-semibold ${b.earned ? "text-on-surface" : "text-on-surface-variant/50"}`}
																>
																	{b.label}
																</p>
															</div>
															<span
																className={`text-xs font-bold shrink-0 ${b.earned ? "text-amber-600" : "text-slate-300"}`}
															>
																+{b.pts}
															</span>
														</div>
													))}
												</div>
											</div>
										</div>

										{/* Tier card */}
										<div
											className={`rounded-2xl p-6 border-2 ${tier.bg} ${tier.border}`}
										>
											<div className="flex items-center gap-3 mb-4">
												<span
													className={`material-symbols-outlined text-2xl ${tier.text}`}
													style={{ fontVariationSettings: "'FILL' 1" }}
												>
													{wcs.total >= 86
														? "military_tech"
														: wcs.total >= 71
															? "verified"
															: wcs.total >= 51
																? "badge"
																: "person"}
												</span>
												<div>
													<p
														className={`text-xs font-bold uppercase tracking-wider ${tier.text} opacity-70`}
													>
														Tier {tier.tier} · Score {tier.range}
													</p>
													<h4
														className={`text-lg font-extrabold ${tier.text} font-(family-name:--font-manrope)`}
													>
														{tier.label}
													</h4>
												</div>
											</div>
											<ul className="space-y-2 mb-4">
												{tier.perks.map((p) => (
													<li
														key={p}
														className={`flex items-start gap-2 text-sm ${tier.text}`}
													>
														<span
															className="material-symbols-outlined text-sm mt-0.5 shrink-0"
															style={{ fontVariationSettings: "'FILL' 1" }}
														>
															check_circle
														</span>
														{p}
													</li>
												))}
											</ul>
											{tier.aya && (
												<div
													className={`flex items-center gap-2 pt-4 border-t border-current/20 text-sm font-bold ${tier.text}`}
												>
													<span
														className="material-symbols-outlined text-sm"
														style={{ fontVariationSettings: "'FILL' 1" }}
													>
														star
													</span>
													Aya Nakamura Pilot Gate: {tier.aya}
												</div>
											)}
										</div>

										{/* All 4 tiers reference */}
										<details className="bg-surface-container-low rounded-2xl border border-outline-variant/10 overflow-hidden">
											<summary className="px-6 py-4 cursor-pointer text-sm font-bold text-on-surface flex items-center justify-between">
												<span>View Full Tier Assignment Matrix</span>
												<span className="material-symbols-outlined text-on-surface-variant">
													expand_more
												</span>
											</summary>
											<div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
												{TIER_CONFIG.map((t) => (
													<div
														key={t.tier}
														className={`rounded-xl p-4 border ${t.bg} ${t.border} ${t.tier === tier.tier ? "ring-2 " + t.ring : ""}`}
													>
														<div className="flex items-center justify-between mb-2">
															<span
																className={`text-xs font-bold uppercase ${t.text}`}
															>
																Tier {t.tier}
															</span>
															<span
																className={`text-xs font-semibold ${t.text} opacity-70`}
															>
																{t.range}
															</span>
														</div>
														<p className={`text-sm font-bold ${t.text} mb-1`}>
															{t.label}
														</p>
														{t.aya && (
															<p className={`text-xs ${t.text} opacity-70`}>
																Aya: {t.aya}
															</p>
														)}
													</div>
												))}
											</div>
										</details>

										{/* Declaration */}
										<section className="bg-surface-container-low rounded-2xl p-6 border border-[#FF5A30]/10 space-y-5">
											<div className="flex items-center gap-2">
												<span className="material-symbols-outlined text-[#FF5A30]">
													gavel
												</span>
												<h4 className="font-bold text-on-surface font-(family-name:--font-manrope)">
													Declaration &amp; Consent
												</h4>
											</div>
											<ul className="space-y-2">
												{[
													"All information provided is accurate and complete to the best of my knowledge.",
													"I consent to Ckrowd Africa Technologies holding and processing my data for workforce deployment purposes.",
													"I understand that misrepresentation may result in removal from the CTaaS workforce registry.",
													"I agree to uphold the professional standards of the CTaaS crew certification programme.",
												].map((item) => (
													<li
														key={item}
														className="flex items-start gap-2 text-sm text-on-surface-variant"
													>
														<span
															className="material-symbols-outlined text-[#FF5A30] text-base mt-0.5 shrink-0"
															style={{ fontVariationSettings: "'FILL' 1" }}
														>
															check_box
														</span>
														{item}
													</li>
												))}
											</ul>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
												<div>
													<Label htmlFor="decl-name">Full Name (Print)</Label>
													<input
														id="decl-name"
														type="text"
														placeholder={form.fullName || "Your full name"}
														className={inputClass}
														required
														value={form.declarationName}
														onChange={(e) =>
															set("declarationName", e.target.value)
														}
													/>
												</div>
												<div>
													<Label htmlFor="decl-date">Date</Label>
													<input
														id="decl-date"
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
										</section>

										<p className="text-xs text-center text-on-surface-variant">
											Ckrowd Africa Technologies · CTaaS Workforce Registry ·
											WCS v0.1
											<br />
											Enquiries:{" "}
											<span className="font-semibold">
												workforce@ckrowd.africa
											</span>
										</p>
									</div>
								)}

								{/* Navigation */}
								<footer className="flex items-center justify-between pt-8 mt-10 border-t border-outline-variant/10">
									{step === 0 ? (
										<Link
											href="/dashboard"
											className="px-8 py-3 text-on-surface-variant font-bold hover:text-on-surface transition-colors flex items-center gap-2"
										>
											<span className="material-symbols-outlined">
												arrow_back
											</span>
											Back
										</Link>
									) : (
										<button
											type="button"
											onClick={() => setStep((s) => s - 1)}
											className="px-8 py-3 text-on-surface-variant font-bold hover:text-on-surface transition-colors flex items-center gap-2"
										>
											<span className="material-symbols-outlined">
												arrow_back
											</span>
											Back
										</button>
									)}
									<div className="flex gap-4">
										<button
											type="button"
											className="px-8 py-3 bg-secondary-container text-on-secondary-container rounded-xl font-bold hover:opacity-90 transition-opacity"
										>
											Save Draft
										</button>
										<button
											type="submit"
											disabled={submitting}
											className="px-10 py-3 bg-linear-to-r from-[#FF5A30] to-[#cc4826] text-white rounded-xl font-bold shadow-xl shadow-[#FF5A30]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
										>
											{submitting
												? "Submitting..."
												: step < STEPS.length - 1
													? "Continue"
													: "Submit Registration"}
											{!submitting && (
												<span className="material-symbols-outlined">
													{step < STEPS.length - 1 ? "arrow_forward" : "send"}
												</span>
											)}
										</button>
									</div>
								</footer>
								{submitError && (
									<p className="mt-4 text-sm text-red-600 font-medium text-center">
										{submitError}
									</p>
								)}
							</form>
						</div>

						{/* Info strip */}
						{step < STEPS.length - 1 && (
							<div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
								{[
									{
										icon: "bolt",
										title: "Instant Scoring",
										body: "Your WCS score is calculated in real-time as you complete the form.",
									},
									{
										icon: "payments",
										title: "Locked Day Rate",
										body: "Your declared rate is locked in your crew profile upon certification.",
									},
									{
										icon: "shield",
										title: "Insurance Included",
										body: "Tier 2+ crew receive group insurance coverage via SanlamAllianz.",
									},
								].map((item) => (
									<div key={item.title} className="flex gap-4">
										<div className="w-10 h-10 rounded-full bg-[#FF5A30]/10 flex items-center justify-center shrink-0">
											<span className="material-symbols-outlined text-[#FF5A30] text-base">
												{item.icon}
											</span>
										</div>
										<div>
											<h5 className="font-bold text-on-surface text-sm mb-0.5">
												{item.title}
											</h5>
											<p className="text-xs text-on-surface-variant leading-relaxed">
												{item.body}
											</p>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				  </main>
			</div>
		</div>
	);
}

"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { registerStakeholder } from "@/app/actions";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";

const STEPS = [
	{ label: "Basic Info" },
	{ label: "Experience" },
	{ label: "Gate Check" },
	{ label: "Credibility" },
	{ label: "Intent" },
];

const inputClass =
	"w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-[#FF5A30] transition-all text-on-surface outline-none text-sm";

const selectClass =
	"w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-[#FF5A30] transition-all text-on-surface outline-none text-sm appearance-none";

function Label({
	htmlFor,
	children,
}: {
	htmlFor: string;
	children: React.ReactNode;
}) {
	return (
		<label
			htmlFor={htmlFor}
			className="block text-sm font-semibold text-on-surface-variant mb-1.5"
		>
			{children}
		</label>
	);
}

function CheckGroup({
	options,
	value,
	onChange,
	multi,
}: {
	name: string;
	options: string[];
	value: string | string[];
	onChange: (v: string | string[]) => void;
	multi?: boolean;
}) {
	function toggle(opt: string) {
		if (multi) {
			const arr = value as string[];
			onChange(
				arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt],
			);
		} else {
			onChange(opt);
		}
	}

	function isChecked(opt: string) {
		return multi ? (value as string[]).includes(opt) : value === opt;
	}

	return (
		<div className="flex flex-wrap gap-3">
			{options.map((opt) => {
				const checked = isChecked(opt);
				return (
					<button
						key={opt}
						type="button"
						onClick={() => toggle(opt)}
						className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
							checked
								? "bg-[#FF5A30]/10 border-[#FF5A30] text-[#FF5A30]"
								: "bg-surface-container-highest border-outline-variant/20 text-on-surface-variant hover:border-[#FF5A30]/40"
						}`}
						aria-pressed={checked}
					>
						<span
							className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
								checked ? "border-[#FF5A30] bg-[#FF5A30]" : "border-current"
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
								className={`mt-2 text-[10px] font-bold uppercase tracking-wider text-center  leading-tight ${
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

type FormData = {
	fullName: string;
	company: string;
	phone: string;
	email: string;
	cityCountry: string;
	yearsExperience: string;
	eventsLastYear: string;
	largestCrowd: string;
	artistLevel: string[];
	hostedLargeVenue: string;
	proofFileName: string;
	instagram: string;
	twitter: string;
	youtube: string;
	ticketLinks: string;
	hasRegisteredBusiness: boolean;
	hasActiveBankAccount: boolean;
	hasBrandSponsors: boolean;
	intent: string[];
	estimatedBudget: string;
};

const defaultForm: FormData = {
	fullName: "",
	company: "",
	phone: "",
	email: "",
	cityCountry: "",
	yearsExperience: "",
	eventsLastYear: "",
	largestCrowd: "",
	artistLevel: [],
	hostedLargeVenue: "",
	proofFileName: "",
	instagram: "",
	twitter: "",
	youtube: "",
	ticketLinks: "",
	hasRegisteredBusiness: false,
	hasActiveBankAccount: false,
	hasBrandSponsors: false,
	intent: [],
	estimatedBudget: "",
};

function reviewRow(
	label: string,
	value: string | boolean | string[] | undefined,
) {
	if (
		value === undefined ||
		value === "" ||
		value === false ||
		(Array.isArray(value) && value.length === 0)
	)
		return null;
	let display: string;
	if (typeof value === "boolean") display = "Yes";
	else if (Array.isArray(value)) display = value.join(", ");
	else display = value;
	return (
		<div className="flex items-start gap-4 py-3 border-b border-outline-variant/10 last:border-none">
			<span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant w-44 shrink-0 mt-0.5">
				{label}
			</span>
			<span className="text-sm font-semibold text-on-surface">{display}</span>
		</div>
	);
}

export default function ApplyPage() {
	const [step, setStep] = useState(0);
	const [form, setForm] = useState<FormData>(defaultForm);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const submitMutation = useMutation({
		mutationFn: registerStakeholder,
	});

	const submitted = submitMutation.isSuccess;
	const submitting = submitMutation.isPending;
	const submitError = submitMutation.error
		? submitMutation.error instanceof Error
			? submitMutation.error.message
			: "Failed to submit application."
		: submitMutation.data && !submitMutation.data.success
			? (submitMutation.data.error ?? "Failed to submit application.")
			: null;

	function set<K extends keyof FormData>(field: K, value: FormData[K]) {
		setForm((prev) => ({ ...prev, [field]: value }));
	}

	const isAyaEligible = form.hostedLargeVenue === "Yes";

	if (submitted) {
		return (
			<div className="bg-surface text-on-surface">
				<TopNav />
				<div className="flex pt-16 h-screen">
					<SideNav />
					<main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-12 flex items-center justify-center">
						<div className="text-center">
							<div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-[#FF5A30]/10">
								<span
									className="material-symbols-outlined text-[#FF5A30] text-5xl"
									style={{ fontVariationSettings: "'FILL' 1" }}
								>
									verified
								</span>
							</div>
							<h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-3 font-(family-name:--font-manrope)">
								Application Received!
							</h1>
							{isAyaEligible && (
								<div className="mb-4 inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-bold">
									<span
										className="material-symbols-outlined text-sm"
										style={{ fontVariationSettings: "'FILL' 1" }}
									>
										star
									</span>
									Aya Pilot Eligible
								</div>
							)}
							<p className="text-on-surface-variant mb-8">
								Your promoter intake form has been submitted. The Ckrowd team
								will review your application and respond within 48 hours via
								email or WhatsApp.
							</p>
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
							<span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-3">
								Ckrowd — Promoter Onboarding
							</span>
							<h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
								Promoter Intake Form
							</h1>
							<p className="text-on-surface-variant">
								Apply to become a verified Ckrowd promoter and unlock access to
								Pan-African tour stops, artist partnerships, and financing
								support.
							</p>
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
										const country =
											form.cityCountry.split(",").pop()?.trim() ??
											form.cityCountry;
										submitMutation.mutate({
											category: "service",
											name: form.fullName,
											email: form.email,
											phone: form.phone,
											company: form.company || undefined,
											country,
											extraData: {
												cityCountry: form.cityCountry,
												yearsExperience: form.yearsExperience,
												eventsLastYear: form.eventsLastYear,
												largestCrowd: form.largestCrowd,
												artistLevel: form.artistLevel,
												hostedLargeVenue: form.hostedLargeVenue,
												instagram: form.instagram,
												twitter: form.twitter,
												youtube: form.youtube,
												ticketLinks: form.ticketLinks,
												hasRegisteredBusiness: form.hasRegisteredBusiness,
												hasActiveBankAccount: form.hasActiveBankAccount,
												hasBrandSponsors: form.hasBrandSponsors,
												intent: form.intent,
												estimatedBudget: form.estimatedBudget,
											},
										});
									}
								}}
							>
								{/* ── Step 0: Basic Info ── */}
								{step === 0 && (
									<div className="space-y-8">
										<div className="flex items-center gap-2 mb-6">
											<span className="material-symbols-outlined text-[#FF5A30]">
												person
											</span>
											<h3 className="text-xl font-bold font-(family-name:--font-manrope)">
												Basic Information
											</h3>
										</div>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<div>
												<Label htmlFor="full-name">Full Name</Label>
												<input
													id="full-name"
													type="text"
													placeholder="e.g. Amara Osei"
													className={inputClass}
													value={form.fullName}
													onChange={(e) => set("fullName", e.target.value)}
													required
												/>
											</div>
											<div>
												<Label htmlFor="company">Company / Brand Name</Label>
												<input
													id="company"
													type="text"
													placeholder="e.g. Osei Live Events"
													className={inputClass}
													value={form.company}
													onChange={(e) => set("company", e.target.value)}
												/>
											</div>
											<div>
												<Label htmlFor="phone">
													Phone Number (WhatsApp preferred)
												</Label>
												<input
													id="phone"
													type="tel"
													placeholder="+234 800 000 0000"
													className={inputClass}
													value={form.phone}
													onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
													required
												/>
											</div>
											<div>
												<Label htmlFor="email">Email Address</Label>
												<input
													id="email"
													type="email"
													placeholder="you@example.com"
													className={inputClass}
													value={form.email}
													onChange={(e) => set("email", e.target.value)}
													required
												/>
											</div>
											<div className="md:col-span-2">
												<Label htmlFor="city-country">City &amp; Country</Label>
												<input
													id="city-country"
													type="text"
													placeholder="e.g. Accra, Ghana"
													className={inputClass}
													value={form.cityCountry}
													onChange={(e) => set("cityCountry", e.target.value)}
													required
												/>
											</div>
										</div>
									</div>
								)}

								{/* ── Step 1: Experience Snapshot ── */}
								{step === 1 && (
									<div className="space-y-10">
										<div className="flex items-center gap-2 mb-2">
											<span className="material-symbols-outlined text-[#FF5A30]">
												workspace_premium
											</span>
											<h3 className="text-xl font-bold font-(family-name:--font-manrope)">
												Experience Snapshot
											</h3>
										</div>

										<div className="space-y-8">
											<div>
												<Label htmlFor="years-exp">
													Years of Promoting Experience
												</Label>
												<div className="relative mt-1.5">
													<select
														id="years-exp"
														className={selectClass}
														value={form.yearsExperience}
														onChange={(e) =>
															set("yearsExperience", e.target.value)
														}
													>
														<option value="">-- Select range --</option>
														<option>0–1 years</option>
														<option>2–3 years</option>
														<option>4–6 years</option>
														<option>7–10 years</option>
														<option>10+ years</option>
													</select>
													<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
														expand_more
													</span>
												</div>
											</div>

											<div>
												<Label htmlFor="events-year">
													Events Organized in the Last 12 Months
												</Label>
												<div className="relative mt-1.5">
													<select
														id="events-year"
														className={selectClass}
														value={form.eventsLastYear}
														onChange={(e) =>
															set("eventsLastYear", e.target.value)
														}
													>
														<option value="">-- Select range --</option>
														<option>0–2</option>
														<option>3–5</option>
														<option>6–10</option>
														<option>11–20</option>
														<option>20+</option>
													</select>
													<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
														expand_more
													</span>
												</div>
											</div>

											<div>
												<Label htmlFor="crowd-size">
													Largest Crowd Successfully Hosted
												</Label>
												<div className="relative mt-1.5">
													<select
														id="crowd-size"
														className={selectClass}
														value={form.largestCrowd}
														onChange={(e) =>
															set("largestCrowd", e.target.value)
														}
													>
														<option value="">-- Select range --</option>
														<option>Under 1,000</option>
														<option>1,000–3,000</option>
														<option>3,000–7,000</option>
														<option>7,000–15,000</option>
														<option>15,000+</option>
													</select>
													<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
														expand_more
													</span>
												</div>
											</div>

											<div>
												<p className="block text-sm font-semibold text-on-surface-variant mb-3">
													Artist Level Worked With{" "}
													<span className="font-normal italic">
														(select all that apply)
													</span>
												</p>
												<CheckGroup
													name="artist-level"
													options={[
														"Emerging/Local",
														"Mid-tier National",
														"Top-tier National",
														"International",
													]}
													value={form.artistLevel}
													onChange={(v) => set("artistLevel", v as string[])}
													multi
												/>
											</div>
										</div>
									</div>
								)}

								{/* ── Step 2: Gate Check ── */}
								{step === 2 && (
									<div className="space-y-10">
										<div className="flex items-center gap-2 mb-2">
											<span className="material-symbols-outlined text-[#FF5A30]">
												lock_open
											</span>
											<h3 className="text-xl font-bold font-(family-name:--font-manrope)">
												Gate Check — Aya Pilot Eligibility
											</h3>
										</div>
										<p className="text-sm text-on-surface-variant -mt-6">
											The Aya Pilot is reserved for promoters with demonstrated
											large-venue experience. This gate check determines your
											eligibility tier.
										</p>

										<div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
											<p className="text-sm font-semibold text-on-surface mb-4">
												Have you ever executed an event in a 10,000+ capacity
												venue?
											</p>
											<CheckGroup
												name="large-venue"
												options={["Yes", "No"]}
												value={form.hostedLargeVenue}
												onChange={(v) => set("hostedLargeVenue", v as string)}
											/>
										</div>

										{form.hostedLargeVenue === "Yes" && (
											<div className="space-y-6">
												<div
													className="border-2 border-dashed border-[#FF5A30]/30 rounded-2xl p-8 text-center cursor-pointer hover:border-[#FF5A30]/60 transition-colors bg-[#FF5A30]/5"
													onClick={() => fileInputRef.current?.click()}
													onDragOver={(e) => e.preventDefault()}
													onDrop={(e) => {
														e.preventDefault();
														const file = e.dataTransfer.files[0];
														if (file) set("proofFileName", file.name);
													}}
												>
													<input
														ref={fileInputRef}
														type="file"
														className="hidden"
														accept="image/*,video/*,.pdf"
														onChange={(e) => {
															const file = e.target.files?.[0];
															if (file) set("proofFileName", file.name);
														}}
													/>
													{form.proofFileName ? (
														<div className="flex items-center justify-center gap-3">
															<span
																className="material-symbols-outlined text-[#FF5A30] text-3xl"
																style={{ fontVariationSettings: "'FILL' 1" }}
															>
																attach_file
															</span>
															<div className="text-left">
																<p className="font-bold text-on-surface">
																	{form.proofFileName}
																</p>
																<p className="text-xs text-on-surface-variant">
																	Click to replace
																</p>
															</div>
														</div>
													) : (
														<>
															<span className="material-symbols-outlined text-[#FF5A30] text-4xl mb-3 block">
																cloud_upload
															</span>
															<p className="font-bold text-on-surface mb-1">
																Upload Proof of Large Venue Event
															</p>
															<p className="text-sm text-on-surface-variant">
																Flyer, ticket link screenshot, video, or media
																coverage
															</p>
															<p className="text-xs text-on-surface-variant mt-2">
																PNG, JPG, MP4, or PDF — max 20MB
															</p>
														</>
													)}
												</div>

												<div className="flex items-start gap-3 bg-amber-50 rounded-xl p-4 border border-amber-200">
													<span
														className="material-symbols-outlined text-amber-600 mt-0.5"
														style={{ fontVariationSettings: "'FILL' 1" }}
													>
														star
													</span>
													<div>
														<p className="text-sm font-bold text-amber-800">
															Aya Pilot Tier Unlocked
														</p>
														<p className="text-xs text-amber-700 mt-0.5">
															Your profile will be flagged for priority review
															and access to Aya Pilot features, including
															premium tour allocations and dedicated support.
														</p>
													</div>
												</div>
											</div>
										)}

										{form.hostedLargeVenue === "No" && (
											<div className="flex items-start gap-3 bg-surface-container-low rounded-xl p-4 border border-outline-variant/20">
												<span className="material-symbols-outlined text-on-surface-variant mt-0.5">
													info
												</span>
												<div>
													<p className="text-sm font-bold text-on-surface">
														Standard Tier
													</p>
													<p className="text-xs text-on-surface-variant mt-0.5">
														You&apos;ll be reviewed for our standard promoter
														program. As you build your track record with Ckrowd,
														you can unlock higher tiers.
													</p>
												</div>
											</div>
										)}
									</div>
								)}

								{/* ── Step 3: Credibility Signals ── */}
								{step === 3 && (
									<div className="space-y-10">
										<div className="flex items-center gap-2 mb-2">
											<span className="material-symbols-outlined text-[#FF5A30]">
												verified_user
											</span>
											<h3 className="text-xl font-bold font-(family-name:--font-manrope)">
												Credibility Signals
											</h3>
										</div>

										<section>
											<p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
												Past Event Links (at least one)
											</p>
											<div className="space-y-4">
												{[
													{
														id: "instagram",
														label: "Instagram",
														icon: "photo_camera",
														field: "instagram" as const,
														placeholder: "https://instagram.com/your_handle",
													},
													{
														id: "twitter",
														label: "Twitter / X",
														icon: "tag",
														field: "twitter" as const,
														placeholder: "https://x.com/your_handle",
													},
													{
														id: "youtube",
														label: "YouTube / TikTok",
														icon: "play_circle",
														field: "youtube" as const,
														placeholder: "https://youtube.com/your_channel",
													},
													{
														id: "ticket-links",
														label: "Ticketing Links",
														icon: "confirmation_number",
														field: "ticketLinks" as const,
														placeholder:
															"https://tickets.example.com/your_event",
													},
												].map((item) => (
													<div key={item.id} className="relative">
														<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-base pointer-events-none">
															{item.icon}
														</span>
														<input
															id={item.id}
															type="url"
															placeholder={`${item.label} — ${item.placeholder}`}
															className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-[#FF5A30] transition-all text-on-surface outline-none text-sm"
															value={form[item.field]}
															onChange={(e) => set(item.field, e.target.value)}
														/>
													</div>
												))}
											</div>
										</section>

										<section>
											<p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
												Business Credentials
											</p>
											<div className="space-y-3">
												{[
													{
														id: "biz-reg",
														label: "Registered Business",
														field: "hasRegisteredBusiness" as const,
													},
													{
														id: "bank-acct",
														label: "Active Bank Account",
														field: "hasActiveBankAccount" as const,
													},
													{
														id: "sponsors",
														label: "Existing Brand Sponsors",
														field: "hasBrandSponsors" as const,
													},
												].map((item) => (
													<label
														key={item.id}
														htmlFor={item.id}
														className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
															form[item.field]
																? "bg-[#FF5A30]/5 border-[#FF5A30]/30"
																: "bg-surface-container-highest border-outline-variant/20 hover:border-[#FF5A30]/20"
														}`}
													>
														<input
															id={item.id}
															type="checkbox"
															className="rounded border-[#FF5A30] text-[#FF5A30] focus:ring-[#FF5A30] w-4 h-4"
															checked={form[item.field]}
															onChange={(e) =>
																set(item.field, e.target.checked)
															}
														/>
														<span className="text-sm font-semibold text-on-surface">
															{item.label}
														</span>
													</label>
												))}
											</div>
										</section>
									</div>
								)}

								{/* ── Step 4: Intent ── */}
								{step === 4 && (
									<div className="space-y-10">
										<div className="flex items-center gap-2 mb-2">
											<span className="material-symbols-outlined text-[#FF5A30]">
												flag
											</span>
											<h3 className="text-xl font-bold font-(family-name:--font-manrope)">
												Intent &amp; Review
											</h3>
										</div>

										<section>
											<p className="text-sm font-semibold text-on-surface-variant mb-3">
												What are you looking for?{" "}
												<span className="font-normal italic">
													(select all that apply)
												</span>
											</p>
											<CheckGroup
												name="intent"
												options={[
													"Funding",
													"Tour support",
													"Artist partnerships",
													"Training",
													"All of the above",
												]}
												value={form.intent}
												onChange={(v) => set("intent", v as string[])}
												multi
											/>
										</section>

										<section>
											<Label htmlFor="budget-range">
												Estimated Budget for Your Next Event / Tour
											</Label>
											<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1.5">
												{["<$10K", "$10K–50K", "$50K–150K", "$150K+"].map(
													(opt) => (
														<button
															key={opt}
															type="button"
															onClick={() => set("estimatedBudget", opt)}
															className={`py-4 px-3 rounded-xl text-sm font-bold border transition-all text-center ${
																form.estimatedBudget === opt
																	? "bg-[#FF5A30] border-[#FF5A30] text-white shadow-lg shadow-[#FF5A30]/20"
																	: "bg-surface-container-highest border-outline-variant/20 text-on-surface-variant hover:border-[#FF5A30]/40"
															}`}
														>
															{opt}
														</button>
													),
												)}
											</div>
										</section>

										{/* Summary card */}
										<div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10 space-y-1">
											<div className="flex items-center justify-between mb-4">
												<h4 className="font-bold text-on-surface font-(family-name:--font-manrope)">
													Application Summary
												</h4>
												{isAyaEligible && (
													<span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">
														<span
															className="material-symbols-outlined text-xs"
															style={{ fontVariationSettings: "'FILL' 1" }}
														>
															star
														</span>
														Aya Pilot Eligible
													</span>
												)}
											</div>
											{reviewRow("Name", form.fullName || "Not provided")}
											{reviewRow("Company", form.company || "—")}
											{reviewRow(
												"Location",
												form.cityCountry || "Not provided",
											)}
											{reviewRow(
												"Experience",
												form.yearsExperience || "Not selected",
											)}
											{reviewRow(
												"Events (12 mo.)",
												form.eventsLastYear || "Not selected",
											)}
											{reviewRow(
												"Largest Crowd",
												form.largestCrowd || "Not selected",
											)}
											{reviewRow("Artist Tiers", form.artistLevel)}
											{reviewRow(
												"Large Venue (10K+)",
												form.hostedLargeVenue || "Not answered",
											)}
											{reviewRow("Looking For", form.intent)}
											{reviewRow(
												"Budget Range",
												form.estimatedBudget || "Not selected",
											)}
											{(form.hasRegisteredBusiness ||
												form.hasActiveBankAccount ||
												form.hasBrandSponsors) && (
												<div className="flex items-start gap-4 py-3 border-b border-outline-variant/10 last:border-none">
													<span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant w-44 shrink-0 mt-0.5">
														Credentials
													</span>
													<span className="text-sm font-semibold text-on-surface">
														{[
															form.hasRegisteredBusiness &&
																"Registered Business",
															form.hasActiveBankAccount &&
																"Active Bank Account",
															form.hasBrandSponsors && "Brand Sponsors",
														]
															.filter(Boolean)
															.join(", ")}
													</span>
												</div>
											)}
										</div>

										<div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/10">
											<p className="text-sm text-on-surface-variant leading-relaxed">
												By submitting this application, you confirm all
												information is accurate and you have authority to
												represent your organisation. Your data is handled
												securely and shared only with the Ckrowd team for review
												purposes.
											</p>
										</div>
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
										{submitError && (
											<p
												className="text-sm font-medium text-rose-700 self-center"
												role="alert"
											>
												{submitError}
											</p>
										)}
										<button
											type="submit"
											disabled={submitting}
											className="px-10 py-3 bg-linear-to-r from-[#FF5A30] to-[#cc4826] text-white rounded-xl font-bold shadow-xl shadow-[#FF5A30]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
										>
											{submitting
												? "Submitting..."
												: step < STEPS.length - 1
													? "Continue"
													: "Submit Application"}
											{!submitting && (
												<span className="material-symbols-outlined">
													{step < STEPS.length - 1 ? "arrow_forward" : "send"}
												</span>
											)}
										</button>
									</div>
								</footer>
							</form>
						</div>

						{/* Help Tips */}
						{step < STEPS.length - 1 && (
							<div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
								<div className="flex gap-4">
									<div className="w-12 h-12 rounded-full bg-[#FF5A30]/10 flex items-center justify-center shrink-0">
										<span className="material-symbols-outlined text-[#FF5A30]">
											lightbulb
										</span>
									</div>
									<div>
										<h5 className="font-bold text-on-surface mb-1">
											Strong Applications
										</h5>
										<p className="text-sm text-on-surface-variant leading-relaxed">
											Promoters with verifiable past events, registered
											businesses, and clear intent score highest in our review
											process.
										</p>
									</div>
								</div>
								<div className="flex gap-4">
									<div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
										<span className="material-symbols-outlined text-on-secondary-container">
											shield
										</span>
									</div>
									<div>
										<h5 className="font-bold text-on-surface mb-1">
											Secure &amp; Confidential
										</h5>
										<p className="text-sm text-on-surface-variant leading-relaxed">
											Your data is encrypted and only shared with the Ckrowd
											team as part of the review and onboarding process.
										</p>
									</div>
								</div>
							</div>
						)}
					</div>
				  </main>
			</div>
		</div>
	);
}

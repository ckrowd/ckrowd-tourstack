"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useId, useRef, useState } from "react";
import { registerStakeholder, uploadFile } from "@/app/actions";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import { Link } from "@/i18n/routing";

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
					className="absolute top-1/2 left-0 h-0.5 bg-[#FF5A30] -translate-y-1/2 z-0 transition-all duration-500"
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
	proofFileId: string;
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
	proofFileId: "",
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

function ReviewRow({
	label,
	value,
}: {
	label: string;
	value: string | boolean | string[] | undefined;
}) {
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
	const t = useTranslations("ApplyPage");
	const [step, setStep] = useState(0);
	const [form, setForm] = useState<FormData>(defaultForm);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const uploadSessionId = useId();

	const STEPS = [
		{ label: t("steps.basic") },
		{ label: t("steps.experience") },
		{ label: t("steps.gate") },
		{ label: t("steps.credibility") },
		{ label: t("steps.intent") },
	];

	const submitMutation = useMutation({
		mutationFn: registerStakeholder,
	});

	const uploadMutation = useMutation({
		mutationFn: uploadFile,
		onSuccess: (result) => {
			if (result.success && typeof result.data === "string") {
				set("proofFileId", result.data);
			}
		},
	});

	function handleProofFile(file: File) {
		set("proofFileName", file.name);
		set("proofFileId", "");
		uploadMutation.mutate({
			file,
			path: `apply-proofs/${uploadSessionId.replace(/[:]/g, "_")}-${file.name}`,
			contentType: file.type || "application/octet-stream",
		});
	}

	const uploadError = uploadMutation.error
		? uploadMutation.error instanceof Error
			? uploadMutation.error.message
			: t("errors.uploadFailed")
		: uploadMutation.data && !uploadMutation.data.success
			? (uploadMutation.data.error ?? t("errors.uploadFailed"))
			: null;

	const submitted = !!submitMutation.data?.success;
	const submitting = submitMutation.isPending;
	const submitError = submitMutation.error
		? submitMutation.error instanceof Error
			? submitMutation.error.message
			: t("errors.failed")
		: submitMutation.data && !submitMutation.data.success
			? (submitMutation.data.error ?? t("errors.failed"))
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
								{t("success.title")}
							</h1>
							{isAyaEligible && (
								<div className="mb-4 inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-bold">
									<span
										className="material-symbols-outlined text-sm"
										style={{ fontVariationSettings: "'FILL' 1" }}
									>
										star
									</span>
									{t("success.aya")}
								</div>
							)}
							<p className="text-on-surface-variant mb-8">
								{t("success.description")}
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Link
									href="/dashboard"
									className="px-8 py-3 bg-[#FF5A30] text-white rounded-xl font-bold shadow-lg shadow-[#FF5A30]/20 hover:scale-[1.02] transition-transform"
								>
									{t("actions.dashboard")}
								</Link>
								<Link
									href="/discovery"
									className="px-8 py-3 bg-surface-container-lowest text-on-surface rounded-xl font-bold border border-outline-variant/20 hover:bg-surface-container-low transition-colors"
								>
									{t("actions.discovery")}
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
								{t("promoterOnboarding")}
							</span>
							<h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
								{t("title")}
							</h1>
							<p className="text-on-surface-variant">{t("description")}</p>
						</header>

						<Stepper current={step} steps={STEPS} />

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
												proofFileId: form.proofFileId || undefined,
												proofFileName: form.proofFileName || undefined,
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
								{/* Step 0: Basic Info */}
								{step === 0 && (
									<div className="space-y-8">
										<div className="flex items-center gap-2 mb-6">
											<span className="material-symbols-outlined text-[#FF5A30]">
												person
											</span>
											<h3 className="text-xl font-bold font-(family-name:--font-manrope)">
												{t("sections.basic.title")}
											</h3>
										</div>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<div>
												<Label htmlFor="full-name">
													{t("sections.basic.fields.fullName")}
												</Label>
												<input
													id="full-name"
													type="text"
													placeholder={t(
														"sections.basic.fields.fullNamePlaceholder",
													)}
													className={inputClass}
													value={form.fullName}
													onChange={(e) => set("fullName", e.target.value)}
													required
												/>
											</div>
											<div>
												<Label htmlFor="company">
													{t("sections.basic.fields.company")}
												</Label>
												<input
													id="company"
													type="text"
													placeholder={t(
														"sections.basic.fields.companyPlaceholder",
													)}
													className={inputClass}
													value={form.company}
													onChange={(e) => set("company", e.target.value)}
												/>
											</div>
											<div>
												<Label htmlFor="phone">
													{t("sections.basic.fields.phone")}
												</Label>
												<input
													id="phone"
													type="tel"
													placeholder={t(
														"sections.basic.fields.phonePlaceholder",
													)}
													className={inputClass}
													value={form.phone}
													onChange={(e) =>
														set("phone", e.target.value.replace(/\D/g, ""))
													}
													required
												/>
											</div>
											<div>
												<Label htmlFor="email">
													{t("sections.basic.fields.email")}
												</Label>
												<input
													id="email"
													type="email"
													placeholder={t(
														"sections.basic.fields.emailPlaceholder",
													)}
													className={inputClass}
													value={form.email}
													onChange={(e) => set("email", e.target.value)}
													required
												/>
											</div>
											<div className="md:col-span-2">
												<Label htmlFor="city-country">
													{t("sections.basic.fields.cityCountry")}
												</Label>
												<input
													id="city-country"
													type="text"
													placeholder={t(
														"sections.basic.fields.cityCountryPlaceholder",
													)}
													className={inputClass}
													value={form.cityCountry}
													onChange={(e) => set("cityCountry", e.target.value)}
													required
												/>
											</div>
										</div>
									</div>
								)}

								{/* Step 1: Experience Snapshot */}
								{step === 1 && (
									<div className="space-y-10">
										<div className="flex items-center gap-2 mb-2">
											<span className="material-symbols-outlined text-[#FF5A30]">
												workspace_premium
											</span>
											<h3 className="text-xl font-bold font-(family-name:--font-manrope)">
												{t("sections.experience.title")}
											</h3>
										</div>

										<div className="space-y-8">
											<div>
												<Label htmlFor="years-exp">
													{t("sections.experience.fields.years")}
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
														{t
															.raw("sections.experience.options.years")
															.map((opt: string) => (
																<option key={opt}>{opt}</option>
															))}
													</select>
													<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
														expand_more
													</span>
												</div>
											</div>

											<div>
												<Label htmlFor="events-year">
													{t("sections.experience.fields.events")}
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
														{t
															.raw("sections.experience.options.events")
															.map((opt: string) => (
																<option key={opt}>{opt}</option>
															))}
													</select>
													<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
														expand_more
													</span>
												</div>
											</div>

											<div>
												<Label htmlFor="crowd-size">
													{t("sections.experience.fields.crowd")}
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
														{t
															.raw("sections.experience.options.crowd")
															.map((opt: string) => (
																<option key={opt}>{opt}</option>
															))}
													</select>
													<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
														expand_more
													</span>
												</div>
											</div>

											<div>
												<p className="block text-sm font-semibold text-on-surface-variant mb-3">
													{t("sections.experience.fields.artistLevel")}{" "}
													<span className="font-normal italic">
														{t("sections.experience.fields.artistLevelHint")}
													</span>
												</p>
												<CheckGroup
													name="artist-level"
													options={t.raw("sections.experience.options.levels")}
													value={form.artistLevel}
													onChange={(v) => set("artistLevel", v as string[])}
													multi
												/>
											</div>
										</div>
									</div>
								)}

								{/* Step 2: Gate Check */}
								{step === 2 && (
									<div className="space-y-10">
										<div className="flex items-center gap-2 mb-2">
											<span className="material-symbols-outlined text-[#FF5A30]">
												lock_open
											</span>
											<h3 className="text-xl font-bold font-(family-name:--font-manrope)">
												{t("sections.gate.title")}
											</h3>
										</div>
										<p className="text-sm text-on-surface-variant -mt-6">
											{t("sections.gate.description")}
										</p>

										<div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
											<p className="text-sm font-semibold text-on-surface mb-4">
												{t("sections.gate.question")}
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
														if (file) handleProofFile(file);
													}}
												>
													<input
														ref={fileInputRef}
														type="file"
														className="hidden"
														accept="image/*,video/*,.pdf"
														onChange={(e) => {
															const file = e.target.files?.[0];
															if (file) handleProofFile(file);
														}}
													/>
													{form.proofFileName ? (
														<div className="flex items-center justify-center gap-3">
															<span
																className="material-symbols-outlined text-[#FF5A30] text-3xl"
																style={{ fontVariationSettings: "'FILL' 1" }}
															>
																{uploadMutation.isPending
																	? "progress_activity"
																	: form.proofFileId
																		? "check_circle"
																		: "attach_file"}
															</span>
															<div className="text-left">
																<p className="font-bold text-on-surface">
																	{form.proofFileName}
																</p>
																<p className="text-xs text-on-surface-variant">
																	{uploadMutation.isPending
																		? t("sections.gate.uploading")
																		: form.proofFileId
																			? t("sections.gate.uploaded")
																			: t("sections.gate.clickToReplace")}
																</p>
															</div>
														</div>
													) : (
														<>
															<span className="material-symbols-outlined text-[#FF5A30] text-4xl mb-3 block">
																cloud_upload
															</span>
															<p className="font-bold text-on-surface mb-1">
																{t("sections.gate.uploadTitle")}
															</p>
															<p className="text-sm text-on-surface-variant">
																{t("sections.gate.uploadDesc")}
															</p>
															<p className="text-xs text-on-surface-variant mt-2">
																{t("sections.gate.uploadLimit")}
															</p>
														</>
													)}
												</div>
												{uploadError && (
													<p className="mt-2 text-sm text-rose-700 font-medium">
														{uploadError}
													</p>
												)}

												<div className="flex items-start gap-3 bg-amber-50 rounded-xl p-4 border border-amber-200">
													<span
														className="material-symbols-outlined text-amber-600 mt-0.5"
														style={{ fontVariationSettings: "'FILL' 1" }}
													>
														star
													</span>
													<div>
														<p className="text-sm font-bold text-amber-800">
															{t("sections.gate.ayaEligible")}
														</p>
														<p className="text-xs text-amber-700 mt-0.5">
															{t("sections.gate.ayaEligibleDesc")}
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
														{t("sections.gate.standardTier")}
													</p>
													<p className="text-xs text-on-surface-variant mt-0.5">
														{t("sections.gate.standardTierDesc")}
													</p>
												</div>
											</div>
										)}
									</div>
								)}

								{/* Step 3: Credibility Signals */}
								{step === 3 && (
									<div className="space-y-10">
										<div className="flex items-center gap-2 mb-2">
											<span className="material-symbols-outlined text-[#FF5A30]">
												verified_user
											</span>
											<h3 className="text-xl font-bold font-(family-name:--font-manrope)">
												{t("sections.credibility.title")}
											</h3>
										</div>

										<section>
											<p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
												{t("sections.credibility.pastLinks")}
											</p>
											<div className="space-y-4">
												{[
													{
														id: "instagram",
														icon: "photo_camera",
														field: "instagram" as const,
														placeholder: t(
															"sections.credibility.placeholders.instagram",
														),
													},
													{
														id: "twitter",
														icon: "tag",
														field: "twitter" as const,
														placeholder: t(
															"sections.credibility.placeholders.twitter",
														),
													},
													{
														id: "youtube",
														icon: "play_circle",
														field: "youtube" as const,
														placeholder: t(
															"sections.credibility.placeholders.youtube",
														),
													},
													{
														id: "ticket-links",
														icon: "confirmation_number",
														field: "ticketLinks" as const,
														placeholder: t(
															"sections.credibility.placeholders.ticketing",
														),
													},
												].map((item) => (
													<div key={item.id} className="relative">
														<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-base pointer-events-none">
															{item.icon}
														</span>
														<input
															id={item.id}
															type="url"
															placeholder={item.placeholder}
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
												{t("sections.credibility.business")}
											</p>
											<div className="space-y-3">
												{[
													{
														id: "biz-reg",
														label: t("sections.credibility.fields.registered"),
														field: "hasRegisteredBusiness" as const,
													},
													{
														id: "bank-acct",
														label: t("sections.credibility.fields.bank"),
														field: "hasActiveBankAccount" as const,
													},
													{
														id: "sponsors",
														label: t("sections.credibility.fields.sponsors"),
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

								{/* Step 4: Intent & Submit */}
								{step === 4 && (
									<div className="space-y-10">
										<div className="flex items-center gap-2 mb-2">
											<span className="material-symbols-outlined text-[#FF5A30]">
												rocket_launch
											</span>
											<h3 className="text-xl font-bold font-(family-name:--font-manrope)">
												{t("sections.intent.title")}
											</h3>
										</div>

										<div className="space-y-8">
											<div>
												<Label htmlFor="intent-q">
													{t("sections.intent.question")}
												</Label>
												<CheckGroup
													name="intent"
													options={t.raw("sections.intent.options")}
													value={form.intent}
													onChange={(v) => set("intent", v as string[])}
													multi
												/>
											</div>

											<div>
												<Label htmlFor="budget">
													{t("sections.intent.budget")}
												</Label>
												<input
													id="budget"
													type="text"
													placeholder={t("sections.intent.budgetPlaceholder")}
													className={inputClass}
													value={form.estimatedBudget}
													onChange={(e) =>
														set("estimatedBudget", e.target.value)
													}
												/>
											</div>
										</div>

										<div className="pt-8 border-t border-outline-variant/10">
											<div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10 mb-6">
												<h4 className="font-bold text-on-surface mb-2">
													{t("sections.review.title")}
												</h4>
												<p className="text-sm text-on-surface-variant">
													{t("sections.review.description")}
												</p>
											</div>

											<div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
												<ReviewRow
													label={t("sections.basic.fields.fullName")}
													value={form.fullName}
												/>
												<ReviewRow
													label={t("sections.basic.fields.company")}
													value={form.company}
												/>
												<ReviewRow
													label={t("sections.basic.fields.email")}
													value={form.email}
												/>
												<ReviewRow
													label={t("sections.basic.fields.cityCountry")}
													value={form.cityCountry}
												/>
												<ReviewRow
													label={t("sections.experience.fields.years")}
													value={form.yearsExperience}
												/>
												<ReviewRow
													label={t("sections.gate.question")}
													value={form.hostedLargeVenue}
												/>
											</div>
										</div>
									</div>
								)}

								{/* Navigation */}
								<div className="flex items-center justify-between mt-12 pt-8 border-t border-outline-variant/10">
									<button
										type="button"
										onClick={() => setStep((s) => s - 1)}
										className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
											step === 0
												? "opacity-0 pointer-events-none"
												: "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
										}`}
									>
										<span className="material-symbols-outlined text-sm">
											arrow_back
										</span>
										{t("actions.back")}
									</button>

									<button
										type="submit"
										disabled={submitting}
										className="flex items-center gap-2 px-10 py-4 bg-[#FF5A30] text-white rounded-xl font-bold shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all disabled:opacity-50"
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
												<span className="material-symbols-outlined text-sm">
													{step === STEPS.length - 1 ? "send" : "arrow_forward"}
												</span>
											</>
										)}
									</button>
								</div>
								{submitError && (
									<p className="mt-4 text-center text-sm font-bold text-red-500">
										{submitError}
									</p>
								)}
							</form>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}

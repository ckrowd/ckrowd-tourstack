"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Suspense, useState } from "react";
import { createEOI, getArtists } from "@/app/actions";
import PageTour from "@/components/PageTour";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import { useSession } from "@/context/AuthContext";
import { Link } from "@/i18n/routing";

type ArtistItem = NonNullable<
	Awaited<ReturnType<typeof getArtists>>["data"]
>[number];

type ApplicationForm = {
	name: string;
	email: string;
	company: string;
	city: string;
	audience: string;
	notes: string;
};

const inputClass =
	"w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF5A30] focus:ring-2 focus:ring-[#FF5A30]/20";

const textareaClass =
	"w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF5A30] focus:ring-2 focus:ring-[#FF5A30]/20 min-h-32";

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
			className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-slate-500"
		>
			{children}
		</label>
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
		<div className="mb-10">
			<div className="relative flex items-center justify-between">
				<div className="absolute left-0 top-1/2 z-0 h-0.5 w-full -translate-y-1/2 bg-slate-200" />
				<div
					className="absolute left-0 top-1/2 z-0 h-0.5 -translate-y-1/2 bg-[#FF5A30] transition-all duration-500"
					style={{ width: `${progress}%` }}
				/>
				{steps.map((step, index) => {
					const done = index < current;
					const active = index === current;
					return (
						<div
							key={step.label}
							className="relative z-10 flex flex-col items-center"
						>
							<div
								className={`flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full ring-4 ring-[#f6f4ef] font-bold text-sm ${
									done || active
										? "bg-[#FF5A30] text-white"
										: "bg-slate-200 text-slate-500"
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
									index + 1
								)}
							</div>
							<span
								className={`mt-1.5 text-[9px] md:text-[10px] font-bold uppercase tracking-wider hidden sm:block ${
									active
										? "text-[#FF5A30]"
										: done
											? "text-[#FF5A30]/70"
											: "text-slate-500"
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

function ReviewRow({
	label,
	value,
}: {
	label: string;
	value: string | string[] | boolean | undefined;
}) {
	if (
		value === undefined ||
		value === "" ||
		value === false ||
		(Array.isArray(value) && value.length === 0)
	) {
		return null;
	}
	const display = Array.isArray(value)
		? value.join(", ")
		: value === true
			? "Yes"
			: value;
	return (
		<div className="flex items-start gap-4 border-b border-slate-100 py-3 last:border-none">
			<span className="mt-0.5 w-28 sm:w-40 shrink-0 text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
				{label}
			</span>
			<span className="text-sm font-semibold text-slate-900">{display}</span>
		</div>
	);
}

function OpportunitySelector({
	opportunities,
	loading,
	selectedId,
	onSelect,
}: {
	opportunities: ArtistItem[];
	loading: boolean;
	selectedId: string | null;
	onSelect: (id: string) => void;
}) {
	const t = useTranslations("EOIPage");
	const [search, setSearch] = useState("");

	const filtered = search.trim()
		? opportunities.filter(
				(a) =>
					String(a.name ?? "")
						.toLowerCase()
						.includes(search.toLowerCase()) ||
					String(a.tour_name ?? "")
						.toLowerCase()
						.includes(search.toLowerCase()),
			)
		: opportunities;

	return (
		<div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
			<p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 mb-3">
				{t("selector.heading")}
			</p>
			<div className="relative mb-3">
				<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-base">
					search
				</span>
				<input
					type="text"
					placeholder={t("selector.searchPlaceholder")}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-[#FF5A30] focus:ring-2 focus:ring-[#FF5A30]/20 transition"
				/>
			</div>

			{loading ? (
				<p className="text-sm text-slate-500 text-center py-4">
					{t("selector.loading")}
				</p>
			) : filtered.length === 0 ? (
				<p className="text-sm text-slate-500 text-center py-4">
					{t("selector.noResults")}
				</p>
			) : (
				<div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5">
					{filtered.map((a) => {
						const id = String(a.id ?? a.name ?? "");
						const isSelected = id === selectedId;
						return (
							<button
								key={id}
								type="button"
								onClick={() => onSelect(id)}
								className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
									isSelected
										? "bg-orange-50 border border-[#FF5A30]/25"
										: "hover:bg-slate-50 border border-transparent"
								}`}
							>
								<div
									className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
										isSelected ? "border-[#FF5A30]" : "border-slate-300"
									}`}
								>
									{isSelected && (
										<div className="w-2 h-2 rounded-full bg-[#FF5A30]" />
									)}
								</div>
								<div className="flex-1 min-w-0">
									<p
										className={`text-sm font-bold truncate ${isSelected ? "text-[#FF5A30]" : "text-slate-900"}`}
									>
										{String(a.name ?? "")}
									</p>
									{a.tour_name && (
										<p className="text-xs text-slate-500 truncate">
											{String(a.tour_name)}
										</p>
									)}
								</div>
								{a.genre && (
									<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
										{String(a.genre)}
									</span>
								)}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}

function OpportunityPanel({
	artist,
	locale,
}: {
	artist: ArtistItem;
	locale: string;
}) {
	const t = useTranslations("EOIPage");

	const dateRange =
		artist.tour_start && artist.tour_end
			? `${new Date(String(artist.tour_start)).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })} – ${new Date(String(artist.tour_end)).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })}`
			: String(artist.tour_window ?? "");

	const feeRange =
		artist.fee_min != null && artist.fee_max != null
			? `$${Math.round(Number(artist.fee_min) / 1000)}k – $${Math.round(Number(artist.fee_max) / 1000)}k USD`
			: null;

	const markets = Array.isArray(artist.markets)
		? (artist.markets as string[]).join(", ")
		: String(artist.markets ?? "");

	return (
		<div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
			<div>
				<p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#FF5A30] mb-1">
					{t("tourPanel.heading")}
				</p>
				<h2 className="text-lg font-(family-name:--font-manrope) font-extrabold text-slate-950 leading-tight">
					{String(artist.tour_name ?? artist.name ?? "")}
				</h2>
				<p className="mt-0.5 text-sm font-semibold text-slate-500">
					{String(artist.name ?? "")}
				</p>
			</div>

			<div className="space-y-2.5">
				{artist.genre && (
					<div>
						<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
							{t("tourPanel.genre")}
						</p>
						<p className="text-sm font-semibold text-slate-800 mt-0.5">
							{String(artist.genre)}
						</p>
					</div>
				)}
				{dateRange && (
					<div>
						<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
							{t("tourPanel.dates")}
						</p>
						<p className="text-sm font-semibold text-slate-800 mt-0.5">
							{dateRange}
						</p>
					</div>
				)}
				{markets && (
					<div>
						<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
							{t("tourPanel.markets")}
						</p>
						<p className="text-sm font-semibold text-slate-800 mt-0.5">
							{markets}
						</p>
					</div>
				)}
				{feeRange && (
					<div>
						<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
							{t("tourPanel.fee")}
						</p>
						<p className="text-sm font-semibold text-slate-800 mt-0.5">
							{feeRange}
						</p>
					</div>
				)}
				{artist.region && (
					<div>
						<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
							{t("tourPanel.region")}
						</p>
						<p className="text-sm font-semibold text-slate-800 mt-0.5">
							{String(artist.region)}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

const defaultForm: ApplicationForm = {
	name: "",
	email: "",
	company: "",
	city: "",
	audience: "",
	notes: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function EOIPageContent() {
	const t = useTranslations("EOIPage");
	const locale = useLocale();

	const STEPS = [
		{ label: t("stepper.contact") },
		{ label: t("stepper.fit") },
		{ label: t("stepper.review") },
	];

	const searchParams = useSearchParams();
	const initialId =
		searchParams.get("opportunity") ?? searchParams.get("id") ?? null;

	const { data: session } = useSession();
	const [selectedId, setSelectedId] = useState<string | null>(initialId);
	const [step, setStep] = useState(0);
	const [form, setForm] = useState<ApplicationForm>(defaultForm);
	const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ApplicationForm, string>>>({});

	const { data: artistsQuery, isLoading: loadingOpportunities } = useQuery({
		queryKey: ["artists"],
		queryFn: () => getArtists(),
	});

	const opportunities = artistsQuery?.data ?? [];
	const artist = selectedId
		? (opportunities.find((a) => String(a.id ?? a.name ?? "") === selectedId) ??
			null)
		: null;

	function handleSelectOpportunity(id: string) {
		setSelectedId(id);
		setStep(0);
		setForm(defaultForm);
		setFieldErrors({});
	}

	const submitMutation = useMutation({
		mutationFn: createEOI,
	});

	const submitted = submitMutation.isSuccess && submitMutation.data?.success;
	const submitting = submitMutation.isPending;
	const submitError = submitMutation.error
		? submitMutation.error instanceof Error
			? submitMutation.error.message
			: t("submitError")
		: submitMutation.data && !submitMutation.data.success
			? (submitMutation.data.error ?? t("submitError"))
			: null;

	function validateStep(currentStep: number): boolean {
		const errors: Partial<Record<keyof ApplicationForm, string>> = {};
		if (currentStep === 0) {
			const name = (form.name || session?.user?.name || "").trim();
			const email = (form.email || session?.user?.email || "").trim();
			if (!name) errors.name = t("validation.nameRequired");
			if (!email) errors.email = t("validation.emailRequired");
			else if (!EMAIL_RE.test(email)) errors.email = t("validation.emailInvalid");
		}
		if (currentStep === 1) {
			if (!form.city.trim()) errors.city = t("validation.cityRequired");
		}
		setFieldErrors(errors);
		return Object.keys(errors).length === 0;
	}

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (step < STEPS.length - 1) {
			if (!validateStep(step)) return;
			setStep((current) => current + 1);
			return;
		}
		if (!artist) return;
		const estimatedAudience = form.audience
			? Number(form.audience.replace(/,/g, ""))
			: 0;
		submitMutation.mutate({
			artistId: artist.id,
			city: form.city,
			capacity: estimatedAudience > 0 ? estimatedAudience : undefined,
			notes: form.notes || undefined,
		});
	}

	function updateField<K extends keyof ApplicationForm>(
		field: K,
		value: ApplicationForm[K],
	) {
		setForm((prev) => ({ ...prev, [field]: value }));
		if (fieldErrors[field]) {
			setFieldErrors((prev) => {
				const next = { ...prev };
				delete next[field];
				return next;
			});
		}
	}

	const estimatedAudience = form.audience
		? Number(form.audience.replace(/,/g, ""))
		: 0;

	const markets = artist
		? Array.isArray(artist.markets)
			? (artist.markets as string[]).join(", ")
			: String(artist.markets ?? "")
		: "";

	if (submitted && artist) {
		return (
			<div className="bg-surface text-on-surface">
				<TopNav />
				<div className="flex pt-16 h-screen">
					<SideNav />
					<main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-12">
						<div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
							<div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-12">
								<div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto">
									<span
										className="material-symbols-outlined text-4xl"
										style={{ fontVariationSettings: "'FILL' 1" }}
									>
										check_circle
									</span>
								</div>
								<h1 className="text-3xl font-black tracking-tight text-slate-950 font-(family-name:--font-manrope)">
									{t("success.title")}
								</h1>
								<p className="mt-4 text-sm leading-6 text-slate-600">
									{t("success.description", {
										artist: String(artist.name ?? ""),
									})}
								</p>
								<div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
									<Link
										href="/dashboard"
										className="inline-flex items-center justify-center rounded-full bg-[#FF5A30] px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
									>
										{t("success.viewDashboard")}
									</Link>
									<Link
										href="/discovery"
										className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
									>
										{t("success.backToDiscovery")}
									</Link>
								</div>
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
			<PageTour pageId="eoi" />
			<div className="flex pt-16 h-screen">
				<SideNav />
				<main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-10">
					<div className="w-full">
						<header className="mb-8">
							<span className="mb-2 block text-xs font-bold uppercase tracking-[0.3em] text-[#FF5A30]">
								{t("hero.platform")}
							</span>
							<h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl font-(family-name:--font-manrope)">
								{t("hero.title")}
							</h1>
							<p className="mt-3 text-base leading-relaxed text-slate-600">
								{t("hero.description")}
							</p>
						</header>

						<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
							{/* Left: selector + info panel */}
							<div data-tour="eoi-selector" className="lg:col-span-4 space-y-4">
								<OpportunitySelector
									opportunities={opportunities}
									loading={loadingOpportunities}
									selectedId={selectedId}
									onSelect={handleSelectOpportunity}
								/>
								{artist && <OpportunityPanel artist={artist} locale={locale} />}
							</div>

							{/* Right: form */}
							<div data-tour="eoi-form" className="lg:col-span-8">
								{!artist ? (
									<div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 p-12 text-center">
										<span className="material-symbols-outlined text-5xl text-slate-300 block mb-4">
											confirmation_number
										</span>
										<p className="text-base font-bold text-slate-400">
											{t("selector.selectPrompt")}
										</p>
									</div>
								) : (
									<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
										<Stepper current={step} steps={STEPS} />

										<form onSubmit={handleSubmit} className="space-y-8">
											{step === 0 && (
												<div className="grid gap-5 sm:grid-cols-2">
													<div>
														<Label htmlFor="name">
															{t("form.fullName.label")}{" "}
															<span className="text-rose-500">*</span>
														</Label>
														<input
															id="name"
															type="text"
															autoComplete="name"
															placeholder={t("form.fullName.placeholder")}
															value={form.name || session?.user?.name || ""}
															onChange={(event) =>
																updateField("name", event.target.value)
															}
															required
															aria-invalid={!!fieldErrors.name}
															className={`${inputClass} ${fieldErrors.name ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/20" : ""}`}
														/>
														{fieldErrors.name && (
															<p className="mt-1.5 text-xs text-rose-600 font-medium">
																{fieldErrors.name}
															</p>
														)}
													</div>
													<div>
														<Label htmlFor="email">
															{t("form.email.label")}{" "}
															<span className="text-rose-500">*</span>
														</Label>
														<input
															id="email"
															type="email"
															autoComplete="email"
															placeholder={t("form.email.placeholder")}
															value={
																form.email || session?.user?.email || ""
															}
															onChange={(event) =>
																updateField("email", event.target.value)
															}
															required
															aria-invalid={!!fieldErrors.email}
															className={`${inputClass} ${fieldErrors.email ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/20" : ""}`}
														/>
														{fieldErrors.email && (
															<p className="mt-1.5 text-xs text-rose-600 font-medium">
																{fieldErrors.email}
															</p>
														)}
													</div>
													<div className="sm:col-span-2">
														<Label htmlFor="company">
															{t("form.company.label")}
														</Label>
														<input
															id="company"
															type="text"
															placeholder={t("form.company.placeholder")}
															value={form.company}
															onChange={(event) =>
																updateField("company", event.target.value)
															}
															className={inputClass}
														/>
													</div>
												</div>
											)}

											{step === 1 && (
												<div className="grid gap-5 sm:grid-cols-2">
													<div>
														<Label htmlFor="city">
															{t("form.city.label")}{" "}
															<span className="text-rose-500">*</span>
														</Label>
														<input
															id="city"
															type="text"
															placeholder={t("form.city.placeholder")}
															value={form.city}
															onChange={(event) =>
																updateField("city", event.target.value)
															}
															required
															aria-invalid={!!fieldErrors.city}
															className={`${inputClass} ${fieldErrors.city ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/20" : ""}`}
														/>
														{fieldErrors.city && (
															<p className="mt-1.5 text-xs text-rose-600 font-medium">
																{fieldErrors.city}
															</p>
														)}
													</div>
													<div>
														<Label htmlFor="audience">
															{t("form.audience.label")}
														</Label>
														<input
															id="audience"
															type="text"
															inputMode="numeric"
															placeholder={t("form.audience.placeholder")}
															value={form.audience}
															onChange={(event) =>
																updateField("audience", event.target.value)
															}
															className={inputClass}
														/>
													</div>
													<div className="sm:col-span-2">
														<Label htmlFor="notes">
															{t("form.notes.label")}
														</Label>
														<textarea
															id="notes"
															placeholder={t("form.notes.placeholder")}
															value={form.notes}
															onChange={(event) =>
																updateField("notes", event.target.value)
															}
															className={textareaClass}
														/>
													</div>
												</div>
											)}

											{step === 2 && (
												<div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
													<h3 className="text-lg font-black tracking-tight text-slate-950 font-(family-name:--font-manrope)">
														{t("review.title")}
													</h3>
													<div className="mt-4 divide-y divide-slate-100 rounded-2xl bg-white p-4 shadow-sm">
														<ReviewRow
															label={t("review.artist")}
															value={String(artist.name ?? "")}
														/>
														<ReviewRow
															label={t("review.tour")}
															value={String(artist.tour_name ?? "")}
														/>
														<ReviewRow
															label={t("review.markets")}
															value={markets}
														/>
														<ReviewRow
															label={t("review.applicant")}
															value={form.name}
														/>
														<ReviewRow
															label={t("review.email")}
															value={form.email}
														/>
														<ReviewRow
															label={t("review.company")}
															value={form.company}
														/>
														<ReviewRow
															label={t("review.city")}
															value={form.city}
														/>
														<ReviewRow
															label={t("review.audience")}
															value={form.audience}
														/>
														<ReviewRow
															label={t("review.notes")}
															value={form.notes}
														/>
														{estimatedAudience > 0 && (
															<ReviewRow
																label={t("review.estimatedAudience")}
																value={estimatedAudience.toLocaleString(
																	locale,
																)}
															/>
														)}
													</div>
													<p className="mt-4 text-sm leading-6 text-slate-600">
														{t("review.disclaimer")}
													</p>
												</div>
											)}

											{submitError && (
												<p
													className="text-sm font-medium text-rose-700"
													role="alert"
												>
													{submitError}
												</p>
											)}

											<div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
												<button
													type="button"
													onClick={() =>
														setStep((current) => Math.max(0, current - 1))
													}
													disabled={step === 0}
													className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
												>
													{t("actions.back")}
												</button>
												<div className="flex flex-wrap items-center gap-3">
													<Link
														href="/discovery"
														className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
													>
														{t("actions.cancel")}
													</Link>
													<button
														type="submit"
														disabled={submitting}
														className="rounded-full bg-[#FF5A30] px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
													>
														{submitting
															? t("actions.submitting")
															: step === STEPS.length - 1
																? t("actions.submit")
																: t("actions.continue")}
													</button>
												</div>
											</div>
										</form>
									</section>
								)}
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}

export default function EOIPage() {
	const t = useTranslations("EOIPage");
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center bg-surface-container-low text-sm font-medium text-on-surface-variant">
					{t("loadingOpportunity")}
				</div>
			}
		>
			<EOIPageContent />
		</Suspense>
	);
}

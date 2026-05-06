"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Suspense, useState } from "react";
import { createEOI, getArtist } from "@/app/actions";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import { useSession } from "@/context/AuthContext";
import { Link } from "@/i18n/routing";

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
		<div className="mb-12">
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
								className={`flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-[#f6f4ef] font-bold ${
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
								className={`mt-2 text-[10px] font-bold uppercase tracking-[0.28em] ${
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
			<span className="mt-0.5 w-40 shrink-0 text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
				{label}
			</span>
			<span className="text-sm font-semibold text-slate-900">{display}</span>
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

function EOIPageContent() {
	const t = useTranslations("EOIPage");
	const locale = useLocale();

	const STEPS = [
		{ label: t("stepper.contact") },
		{ label: t("stepper.fit") },
		{ label: t("stepper.review") },
	];

	const searchParams = useSearchParams();
	const opportunityId =
		searchParams.get("opportunity") ?? searchParams.get("id");
	const { data: session } = useSession();
	const [step, setStep] = useState(0);
	const [form, setForm] = useState<ApplicationForm>(defaultForm);

	const { data: artistQuery, isLoading: loadingOpportunity } = useQuery({
		queryKey: ["artist", opportunityId],
		queryFn: () => getArtist(opportunityId ?? ""),
		enabled: !!opportunityId,
	});

	type ArtistData = NonNullable<Awaited<ReturnType<typeof getArtist>>["data"]>;

	const artist = artistQuery?.success
		? artistQuery.data
		: !opportunityId
			? ({
					id: "general",
					name: t("generalEoi.name"),
					genre: t("generalEoi.genre"),
					tour_name: t("generalEoi.tourName"),
					tour_start: new Date(),
					tour_end: new Date(
						new Date().setFullYear(new Date().getFullYear() + 1),
					),
					markets: t("generalEoi.markets"),
					fee_min: t("generalEoi.fee_min"),
				} as unknown as ArtistData)
			: null;

	const loadError =
		opportunityId && !artistQuery?.success && !loadingOpportunity
			? (artistQuery?.error ?? t("loadError"))
			: null;

	const submitMutation = useMutation({
		mutationFn: createEOI,
	});

	const submitted = submitMutation.isSuccess;
	const submitting = submitMutation.isPending;
	const submitError = submitMutation.error
		? submitMutation.error instanceof Error
			? submitMutation.error.message
			: t("submitError")
		: submitMutation.data && !submitMutation.data.success
			? (submitMutation.data.error ?? t("submitError"))
			: null;

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (step < STEPS.length - 1) {
			setStep((current) => current + 1);
			return;
		}

		if (!artist) {
			return;
		}

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
	}

	const selectedOpportunityTitle = artist?.name ?? t("selectedOpportunity");
	const estimatedAudience = form.audience
		? Number(form.audience.replace(/,/g, ""))
		: 0;

	if (submitted && artist) {
		return (
			<div className="bg-surface text-on-surface">
				<TopNav />
				<div className="flex pt-16 h-screen">
					<SideNav />
					<main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-12">
						<div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
							<div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-12">
								<div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
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
									{t("success.description", { artist: artist.name })}
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
			<div className="flex pt-16 h-screen">
				<SideNav />
				<main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-12">
					<div className="w-full">
						<header className="mb-10">
							<span className="mb-3 block text-xs font-bold uppercase tracking-[0.3em] text-[#FF5A30]">
								{t("hero.platform")}
							</span>
							<h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl font-(family-name:--font-manrope)">
								{t("hero.title")}
							</h1>
							<p className="mt-5 text-lg leading-relaxed text-slate-600">
								{t("hero.description")}
							</p>
						</header>

						<Stepper current={step} steps={STEPS} />

						{loadingOpportunity ? (
							<div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
								<p className="text-sm font-medium text-slate-600">
									{t("loadingOpportunity")}
								</p>
							</div>
						) : loadError ? (
							<div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm font-medium text-rose-700 shadow-sm">
								<p>{loadError}</p>
								<Link
									href="/discovery"
									className="mt-4 inline-flex items-center justify-center rounded-full bg-[#FF5A30] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
								>
									{t("success.backToDiscovery")}
								</Link>
							</div>
						) : artist ? (
							<div className="w-full">
								<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
									<div className="mb-8">
										<h2 className="text-2xl font-black tracking-tight text-slate-950 font-(family-name:--font-manrope)">
											{artist.name}
										</h2>
										<p className="mt-2 text-sm font-medium text-slate-500">
											{artist.genre}
										</p>
									</div>

									<form onSubmit={handleSubmit} className="space-y-8">
										{step === 0 && (
											<div className="grid gap-5 sm:grid-cols-2">
												<div>
													<Label htmlFor="name">
														{t("form.fullName.label")}
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
														className={inputClass}
													/>
												</div>
												<div>
													<Label htmlFor="email">{t("form.email.label")}</Label>
													<input
														id="email"
														type="email"
														autoComplete="email"
														placeholder={t("form.email.placeholder")}
														value={form.email || session?.user?.email || ""}
														onChange={(event) =>
															updateField("email", event.target.value)
														}
														required
														className={inputClass}
													/>
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
													<Label htmlFor="city">{t("form.city.label")}</Label>
													<input
														id="city"
														type="text"
														placeholder={t("form.city.placeholder")}
														value={form.city}
														onChange={(event) =>
															updateField("city", event.target.value)
														}
														className={inputClass}
													/>
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
													<Label htmlFor="notes">{t("form.notes.label")}</Label>
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
														value={selectedOpportunityTitle}
													/>
													<ReviewRow
														label={t("review.markets")}
														value={artist.markets ?? undefined}
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
													<ReviewRow
														label={t("review.estimatedAudience")}
														value={
															estimatedAudience > 0
																? estimatedAudience.toLocaleString(locale)
																: undefined
														}
													/>
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
							</div>
						) : null}
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

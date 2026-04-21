"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createEOI, getArtist } from "@/app/actions";
import { useSession } from "@/context/AuthContext";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";

type ApplicationForm = {
	name: string;
	email: string;
	company: string;
	city: string;
	audience: string;
	notes: string;
};

const STEPS = [{ label: "Contact" }, { label: "Fit" }, { label: "Review" }];

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

function Stepper({ current }: { current: number }) {
	const progress = (current / (STEPS.length - 1)) * 100;

	return (
		<div className="mb-12">
			<div className="relative flex items-center justify-between">
				<div className="absolute left-0 top-1/2 z-0 h-0.5 w-full -translate-y-1/2 bg-slate-200" />
				<div
					className="absolute left-0 top-1/2 z-0 h-0.5 -translate-y-1/2 bg-[#FF5A30] transition-all duration-500"
					style={{ width: `${progress}%` }}
				/>
				{STEPS.map((step, index) => {
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

function reviewRow(
	label: string,
	value: string | string[] | boolean | undefined,
) {
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

	const artist = artistQuery?.success ? artistQuery.data : null;
	const loadError = !opportunityId
		? "Choose an opportunity from discovery to start an application."
		: !artistQuery?.success && !loadingOpportunity
			? (artistQuery?.error ?? "Unable to load this opportunity.")
			: null;

	const submitMutation = useMutation({
		mutationFn: createEOI,
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

	const selectedOpportunityTitle = artist?.name ?? "Selected opportunity";
	const estimatedAudience = form.audience
		? Number(form.audience.replace(/,/g, ""))
		: 0;

	if (submitted && artist) {
		return (
			<div className="bg-[#f6f4ef] text-slate-950 min-h-screen flex">
				<SideNav />
				<main className="flex-1 min-h-screen overflow-y-auto px-6 py-6 md:px-12 md:py-10">
					<div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
						<div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-12">
							<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
								<span
									className="material-symbols-outlined text-4xl"
									style={{ fontVariationSettings: "'FILL' 1" }}
								>
									check_circle
								</span>
							</div>
							<h1 className="text-3xl font-black tracking-tight text-slate-950 font-(family-name:--font-manrope)">
								EOI submitted.
							</h1>
							<p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600">
								Your application for {artist.name} has been received. The Ckrowd
								team will review it and respond within 48 hours.
							</p>
							<div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
								<Link
									href="/dashboard"
									className="inline-flex items-center justify-center rounded-full bg-[#FF5A30] px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
								>
									View dashboard
								</Link>
								<Link
									href="/discovery"
									className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
								>
									Back to discovery
								</Link>
							</div>
						</div>
					</div>
				</main>
			</div>
		);
	}

	return (
		<div className="bg-[#f6f4ef] text-slate-950 min-h-screen flex">
			<SideNav />
			<main className="flex-1 min-h-screen overflow-y-auto px-6 py-6 md:px-12 md:py-10">
				<TopNav />

				<div className="mx-auto max-w-5xl pt-20">
					<header className="mb-10">
						<span className="mb-3 block text-xs font-bold uppercase tracking-[0.3em] text-[#FF5A30]">
							TourStack - Expression of Interest
						</span>
						<h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl font-(family-name:--font-manrope)">
							Apply for a live opportunity.
						</h1>
						<p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-600">
							Complete the short application below and submit it directly
							through the package apply endpoint.
						</p>
					</header>

					<Stepper current={step} />

					{loadingOpportunity ? (
						<div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
							<p className="text-sm font-medium text-slate-600">
								Loading opportunity...
							</p>
						</div>
					) : loadError ? (
						<div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm font-medium text-rose-700 shadow-sm">
							<p>{loadError}</p>
							<Link
								href="/discovery"
								className="mt-4 inline-flex items-center justify-center rounded-full bg-[#FF5A30] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
							>
								Go to discovery
							</Link>
						</div>
					) : artist ? (
						<div className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
							<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
								<div className="mb-6 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
									<span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
										{artist.genre ?? "General"}
									</span>
									<span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
										{artist.tour_start ? artist.tour_start.toDateString() : "Upcoming tour"}
									</span>
									<span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
										{artist.markets}
									</span>
								</div>

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
												<Label htmlFor="name">Full name</Label>
												<input
													id="name"
													type="text"
													autoComplete="name"
													placeholder="Amina Bello"
													value={form.name || session?.user?.name || ""}
													onChange={(event) =>
														updateField("name", event.target.value)
													}
													required
													className={inputClass}
												/>
											</div>
											<div>
												<Label htmlFor="email">Email address</Label>
												<input
													id="email"
													type="email"
													autoComplete="email"
													placeholder="you@company.com"
													value={form.email || session?.user?.email || ""}
													onChange={(event) =>
														updateField("email", event.target.value)
													}
													required
													className={inputClass}
												/>
											</div>
											<div className="sm:col-span-2">
												<Label htmlFor="company">Company or venue</Label>
												<input
													id="company"
													type="text"
													placeholder="Venue name or promoter brand"
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
												<Label htmlFor="city">City / market</Label>
												<input
													id="city"
													type="text"
													placeholder="Lagos, Nairobi, Accra..."
													value={form.city}
													onChange={(event) =>
														updateField("city", event.target.value)
													}
													className={inputClass}
												/>
											</div>
											<div>
												<Label htmlFor="audience">Expected attendance</Label>
												<input
													id="audience"
													type="text"
													inputMode="numeric"
													placeholder="5,000"
													value={form.audience}
													onChange={(event) =>
														updateField("audience", event.target.value)
													}
													className={inputClass}
												/>
											</div>
											<div className="sm:col-span-2">
												<Label htmlFor="notes">
													Why this opportunity fits your venue
												</Label>
												<textarea
													id="notes"
													placeholder="Tell the team about your venue, audience, and promotion plan."
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
												Review application
											</h3>
											<div className="mt-4 divide-y divide-slate-100 rounded-2xl bg-white p-4 shadow-sm">
												{reviewRow("Artist", selectedOpportunityTitle)}
												{reviewRow("Markets", artist.markets ?? undefined)}
												{reviewRow("Applicant", form.name)}
												{reviewRow("Email", form.email)}
												{reviewRow("Company / venue", form.company)}
												{reviewRow("City / market", form.city)}
												{reviewRow("Expected attendance", form.audience)}
												{reviewRow("Notes", form.notes)}
												{reviewRow(
													"Estimated audience",
													estimatedAudience > 0
														? estimatedAudience.toLocaleString()
														: undefined,
												)}
											</div>
											<p className="mt-4 text-sm leading-6 text-slate-600">
												Submitting will send the application to the package
												endpoint using your current opportunity selection.
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
											Back
										</button>
										<div className="flex flex-wrap items-center gap-3">
											<Link
												href="/discovery"
												className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
											>
												Cancel
											</Link>
											<button
												type="submit"
												disabled={submitting}
												className="rounded-full bg-[#FF5A30] px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
											>
												{submitting
													? "Submitting..."
													: step === STEPS.length - 1
														? "Submit application"
														: "Continue"}
											</button>
										</div>
									</div>
								</form>
							</section>

							<aside className="space-y-6">
								<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
									<p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
										Artist brief
									</p>
									<h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950 font-(family-name:--font-manrope)">
										{artist.name}
									</h3>
									<p className="mt-2 text-sm font-medium text-slate-500">
										{artist.genre}
									</p>
									<p className="mt-4 text-sm leading-6 text-slate-600">
										{artist.tour_name}
									</p>
								</div>

								<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
									<p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
										Key facts
									</p>
									<div className="mt-4 space-y-4 text-sm text-slate-600">
										<div>
											<span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
												Fee
											</span>
											<span className="mt-1 block font-semibold text-slate-900">
												{artist.fee_min ?? "Budget on request"}
											</span>
										</div>
										<div>
											<span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
												Markets
											</span>
											<span className="mt-1 block font-semibold text-slate-900">
												{artist.markets ?? "Not specified"}
											</span>
										</div>
										<div>
											<span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
												Tour window
											</span>
											<span className="mt-1 block font-semibold text-slate-900">
												{artist.tour_start ? artist.tour_start.toDateString() : "TBD"} - {artist.tour_end ? artist.tour_end.toDateString() : "TBD"}
											</span>
										</div>
									</div>
								</div>
							</aside>
						</div>
					) : null}
				</div>
			</main>
		</div>
	);
}

export default function EOIPage () {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center bg-[#f6f4ef] text-sm font-medium text-slate-600">
					Loading opportunity...
				</div>
			}
		>
			<EOIPageContent />
		</Suspense>
	);
}

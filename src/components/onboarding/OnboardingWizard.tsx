"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { authInput, authLabel } from "@/components/auth/authFields";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useTsTheme } from "@/components/theme/useTsTheme";
import { Link, useRouter } from "@/i18n/routing";

type RoleOption = { id: string; title: string; desc: string };
type SetupOption = { id: string; label: string };

const STEPS = ["role", "about", "setup", "review"] as const;
type StepKey = (typeof STEPS)[number];

// Material Symbols glyph per real user type (icon font already loaded app-wide).
const ROLE_ICON: Record<string, string> = {
	promoter: "campaign",
	service: "business_center",
	workforce: "engineering",
	artmgmt: "queue_music",
};

// Where each self-serve user type actually goes (mirrors the real /join and
// /onboard routes). Promoters create a platform account then land on the
// dashboard; stakeholders continue into their registry.
const ROLE_DEST: Record<string, string> = {
	promoter: "/register",
	service: "/onboard/service",
	workforce: "/onboard/workforce",
	artmgmt: "/onboard/artmgmt",
};

export default function OnboardingWizard() {
	const t = useTranslations("OnboardingWizard");
	const tCommon = useTranslations("Common");
	const router = useRouter();
	const { theme, toggle } = useTsTheme();

	const [step, setStep] = useState(0);
	const [role, setRole] = useState<string | null>(null);
	const [name, setName] = useState("");
	const [org, setOrg] = useState("");
	const [market, setMarket] = useState("");
	const [priorities, setPriorities] = useState<string[]>([]);

	const roleOptions = t.raw("role.options") as RoleOption[];
	const total = STEPS.length;
	const current: StepKey = STEPS[step];
	const progress = Math.round(((step + 1) / total) * 100);
	const selectedRole = roleOptions.find((r) => r.id === role);
	const setupOptions = role ? (t.raw(`setup.options.${role}`) as SetupOption[]) : [];
	const dashboardFeatures = role ? (t.raw(`workspace.features.${role}`) as string[]) : [];

	const canContinue =
		current === "role" ? role !== null : current === "about" ? name.trim().length > 0 : true;

	function goNext() {
		if (!canContinue) return;
		if (step < total - 1) {
			setStep((s) => s + 1);
			return;
		}
		// Finish: stash the tailored onboarding so the destination/dashboard can
		// seed itself, then route the user to where their type onboards.
		try {
			sessionStorage.setItem(
				"ts-onboarding",
				JSON.stringify({ role, name, org, market, priorities }),
			);
		} catch {}
		if (role) router.push(ROLE_DEST[role] ?? "/register");
	}
	function back() {
		if (step > 0) setStep((s) => s - 1);
	}
	function togglePriority(id: string) {
		setPriorities((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
	}

	return (
		<div
			className={`ts-theme ${theme === "light" ? "light" : ""} min-h-[100dvh] font-(family-name:--font-geist) lg:grid lg:grid-cols-[340px_1fr]`}
		>
			{/* Left rail (desktop) */}
			<aside className="relative hidden lg:flex flex-col justify-between border-r border-[var(--hair)] px-9 py-10 overflow-hidden">
				<div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-orange/10 blur-[120px]" />
				<div className="relative z-10">
					<Link
						href="/"
						className="flex items-center gap-2.5 mb-12"
						aria-label={tCommon("brandLockupLabel")}
					>
						<Image src="/ckrowd-logo.png" alt={tCommon("logoAlt")} width={32} height={32} />
						<span className="flex flex-col leading-tight">
							<span className="text-base font-bold tracking-tight text-orange">
								{tCommon("brandName")}
							</span>
							<span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
								{tCommon("brandBy")}
							</span>
						</span>
					</Link>

					<ol className="relative space-y-1">
						{STEPS.map((key, i) => {
							const done = i < step;
							const active = i === step;
							return (
								<li key={key}>
									<button
										type="button"
										onClick={() => i <= step && setStep(i)}
										disabled={i > step}
										className={`group flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-left transition-colors ${
											active ? "bg-[var(--surface-2)]" : "hover:bg-[var(--surface)]"
										} ${i > step ? "cursor-default" : "cursor-pointer"}`}
									>
										<span
											className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold transition-all duration-300 ${
												done
													? "bg-gradient-to-br from-orange to-ember text-white shadow-md shadow-orange/30"
													: active
														? "border-2 border-orange text-orange ring-4 ring-orange/15"
														: "border border-[var(--hair)] text-[var(--muted)]"
											}`}
										>
											{done ? (
												<span className="material-symbols-outlined text-[18px]">check</span>
											) : (
												i + 1
											)}
										</span>
										<span
											className={`text-sm font-medium transition-colors ${
												active || done ? "text-[var(--text)]" : "text-[var(--muted)]"
											}`}
										>
											{t(`stepShort.${key}`)}
										</span>
									</button>
								</li>
							);
						})}
					</ol>
				</div>

				<div className="relative z-10">
					<div className="mb-4 flex justify-end">
						<ThemeToggle theme={theme} onToggle={toggle} />
					</div>
					<div className="h-1 w-full rounded-full bg-[var(--hair)] overflow-hidden">
						<div
							className="h-full rounded-full bg-orange transition-[width] duration-500 ease-out"
							style={{ width: `${progress}%` }}
						/>
					</div>
					<p className="mt-3 font-(family-name:--font-geist-mono) text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
						{t("progress", { current: step + 1, total })}
					</p>
				</div>
			</aside>

			{/* Content */}
			<div className="relative flex flex-col min-h-[100dvh] lg:min-h-0 overflow-hidden">
				<div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[30rem] w-[46rem] rounded-full bg-orange/[0.07] blur-[140px]" />
				<div className="pointer-events-none absolute bottom-0 right-0 h-[24rem] w-[24rem] rounded-full bg-orange/[0.04] blur-[130px]" />
				{/* Mobile top bar */}
				<div className="lg:hidden px-5 pt-6 pb-4">
					<div className="flex items-center justify-between mb-4">
						<Link href="/" className="flex items-center gap-2" aria-label={tCommon("brandLockupLabel")}>
							<Image src="/ckrowd-logo.png" alt={tCommon("logoAlt")} width={28} height={28} />
							<span className="text-sm font-bold tracking-tight text-orange">
								{tCommon("brandName")}
							</span>
						</Link>
						<div className="flex items-center gap-3">
							<span className="font-(family-name:--font-geist-mono) text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
								{t("progress", { current: step + 1, total })}
							</span>
							<ThemeToggle theme={theme} onToggle={toggle} />
						</div>
					</div>
					<div className="h-1 w-full rounded-full bg-[var(--hair)] overflow-hidden">
						<div
							className="h-full rounded-full bg-orange transition-[width] duration-500 ease-out"
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>

				<main className="flex-1 flex flex-col px-5 sm:px-8 md:px-14 py-8 md:py-14">
					<div key={current} className="funnel-step-in flex-1 w-full max-w-2xl mx-auto text-center">
						{/* Step header */}
						<h1 className="font-(family-name:--font-display) text-[2rem] md:text-[2.75rem] leading-[1.05] tracking-tight">
							{t(`${current}.title`)}
						</h1>
						<p className="mt-4 text-[var(--muted)] text-sm md:text-base max-w-xl mx-auto leading-relaxed">
							{t(`${current}.subtitle`)}
						</p>

						{/* Step 1 — role */}
						{current === "role" && (
							<div className="mt-9 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
								{roleOptions.map((r) => {
									const selected = role === r.id;
									return (
										<button
											key={r.id}
											type="button"
											onClick={() => setRole(r.id)}
											aria-pressed={selected}
											className={`group relative flex flex-col items-start gap-3.5 rounded-2xl border p-5 text-left transition-all duration-300 hover:-translate-y-0.5 ${
												selected
													? "border-orange bg-orange/[0.07] ring-1 ring-orange/40 shadow-[0_16px_50px_-12px_rgba(255,90,48,0.35)]"
													: "border-[var(--hair)] bg-[var(--surface)] hover:border-[var(--muted)] hover:shadow-[0_16px_50px_-12px_rgba(0,0,0,0.35)]"
											}`}
										>
											<span
												className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${
													selected
														? "bg-gradient-to-br from-orange to-ember text-white shadow-lg shadow-orange/30"
														: "bg-[var(--surface-2)] text-[var(--muted)] group-hover:text-[var(--text)]"
												}`}
											>
												<span className="material-symbols-outlined">
													{ROLE_ICON[r.id] ?? "person"}
												</span>
											</span>
											<span>
												<span className="block font-semibold text-[15px] text-[var(--text)]">
													{r.title}
												</span>
												<span className="mt-1 block text-[13px] leading-snug text-[var(--muted)]">
													{r.desc}
												</span>
											</span>
											<span
												className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full transition-all ${
													selected ? "bg-orange opacity-100" : "opacity-0"
												}`}
											>
												<span className="material-symbols-outlined text-[15px] text-white">check</span>
											</span>
										</button>
									);
								})}
							</div>
						)}

						{/* Step 2 — about you */}
						{current === "about" && (
							<form
								onSubmit={(e) => {
									e.preventDefault();
									goNext();
								}}
								className="mt-9 mx-auto max-w-md space-y-5 text-left"
							>
								<div>
									<label htmlFor="ob-name" className={authLabel}>
										{t("about.name")}
									</label>
									<input
										id="ob-name"
										type="text"
										autoComplete="name"
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder={t("about.namePlaceholder")}
										required
										className={authInput}
									/>
								</div>
								<div>
									<label htmlFor="ob-org" className={authLabel}>
										{t("about.org")}
									</label>
									<input
										id="ob-org"
										type="text"
										autoComplete="organization"
										value={org}
										onChange={(e) => setOrg(e.target.value)}
										placeholder={t("about.orgPlaceholder")}
										className={authInput}
									/>
								</div>
								<div>
									<label htmlFor="ob-market" className={authLabel}>
										{t("about.market")}
									</label>
									<input
										id="ob-market"
										type="text"
										value={market}
										onChange={(e) => setMarket(e.target.value)}
										placeholder={t("about.marketPlaceholder")}
										className={authInput}
									/>
								</div>
							</form>
						)}

						{/* Step 3 — tailored setup */}
						{current === "setup" && (
							<div className="mt-4">
								<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)] mb-6">
									{t("setup.hint")}
								</p>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
									{setupOptions.map((o) => {
										const selected = priorities.includes(o.id);
										return (
											<button
												key={o.id}
												type="button"
												onClick={() => togglePriority(o.id)}
												aria-pressed={selected}
												className={`group flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-300 hover:-translate-y-0.5 ${
													selected
														? "border-orange bg-orange/[0.07] ring-1 ring-orange/40 shadow-[0_12px_36px_-12px_rgba(255,90,48,0.3)]"
														: "border-[var(--hair)] bg-[var(--surface)] hover:border-[var(--muted)]"
												}`}
											>
												<span
													className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-all duration-300 ${
														selected
															? "border-transparent bg-gradient-to-br from-orange to-ember shadow-sm shadow-orange/40"
															: "border-[var(--muted)] group-hover:border-[var(--text)]"
													}`}
												>
													{selected && (
														<span className="material-symbols-outlined text-[16px] text-white">
															check
														</span>
													)}
												</span>
												<span className="text-sm font-medium text-[var(--text)]">{o.label}</span>
											</button>
										);
									})}
								</div>
							</div>
						)}

						{/* Step 4 — review */}
						{current === "review" && selectedRole && (
							<div className="mt-9 text-left">
								<div className="space-y-3">
									<ReviewRow
										label={t("review.roleLabel")}
										value={selectedRole.title}
										editLabel={t("review.edit")}
										onEdit={() => setStep(0)}
									/>
									<ReviewRow
										label={t("review.nameLabel")}
										value={name.trim() || t("review.empty")}
										editLabel={t("review.edit")}
										onEdit={() => setStep(1)}
									/>
									<ReviewRow
										label={t("review.orgLabel")}
										value={org.trim() || t("review.empty")}
										editLabel={t("review.edit")}
										onEdit={() => setStep(1)}
									/>
									<ReviewRow
										label={t("review.marketLabel")}
										value={market.trim() || t("review.empty")}
										editLabel={t("review.edit")}
										onEdit={() => setStep(1)}
									/>
									<ReviewRow
										label={t("review.prioritiesLabel")}
										value={
											priorities.length
												? setupOptions
														.filter((o) => priorities.includes(o.id))
														.map((o) => o.label)
														.join(", ")
												: t("review.empty")
										}
										editLabel={t("review.edit")}
										onEdit={() => setStep(2)}
									/>
								</div>

								<div className="mt-6 rounded-2xl border border-[var(--hair)] bg-[var(--surface)] p-6">
									<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)] mb-4">
										{t("review.includesLabel")}
									</p>
									<ul className="space-y-3">
										{dashboardFeatures.map((feat) => (
											<li key={feat} className="flex items-start gap-3">
												<span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange/15 text-orange">
													<span className="material-symbols-outlined text-[15px]">check</span>
												</span>
												<span className="text-sm text-[var(--text)]">{feat}</span>
											</li>
										))}
									</ul>
								</div>

								<p className="mt-5 text-xs text-[var(--muted)] leading-relaxed">
									{t("review.finePrint")}
								</p>
							</div>
						)}
					</div>

					{/* Footer nav */}
					<div className="mt-10 w-full max-w-2xl mx-auto flex items-center justify-between gap-4 border-t border-[var(--hair)] pt-6">
						{step === 0 ? (
							<Link
								href="/"
								className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors"
							>
								<span className="material-symbols-outlined text-base">arrow_back</span>
								{t("backToSite")}
							</Link>
						) : (
							<button
								type="button"
								onClick={back}
								className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors"
							>
								<span className="material-symbols-outlined text-base">arrow_back</span>
								{t("back")}
							</button>
						)}

						<button
							type="button"
							onClick={goNext}
							disabled={!canContinue}
							className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange to-ember px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-orange/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange/40 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none disabled:translate-y-0 disabled:shadow-none"
						>
							{step === total - 1 ? t("review.cta") : t("continue")}
							<span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-0.5">
								arrow_forward
							</span>
						</button>
					</div>
				</main>
			</div>
		</div>
	);
}

function ReviewRow({
	label,
	value,
	editLabel,
	onEdit,
}: {
	label: string;
	value: string;
	editLabel: string;
	onEdit: () => void;
}) {
	return (
		<div className="flex items-start justify-between gap-4 rounded-xl border border-[var(--hair)] bg-[var(--surface)] px-5 py-4">
			<div className="min-w-0">
				<p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
				<p className="mt-1 text-sm text-[var(--text)] break-words">{value}</p>
			</div>
			<button
				type="button"
				onClick={onEdit}
				className="shrink-0 text-xs font-semibold text-orange hover:text-ember transition-colors"
			>
				{editLabel}
			</button>
		</div>
	);
}

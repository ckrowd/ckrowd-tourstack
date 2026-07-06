"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useId, useState } from "react";
import { authInput, authLabel } from "@/components/auth/authFields";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useTsTheme } from "@/components/theme/useTsTheme";
import { Link, useRouter } from "@/i18n/routing";

type RoleOption = { id: string; title: string; desc: string };
type FocusOption = { id: string; label: string };

const STEPS = ["role", "profile", "focus", "review"] as const;
type StepKey = (typeof STEPS)[number];

// Material Symbols glyph per role id (icon font already loaded app-wide).
const ROLE_ICON: Record<string, string> = {
	promoter: "campaign",
	artist: "mic",
	financier: "account_balance",
	insurer: "verified_user",
	venue: "stadium",
	service: "construction",
};

export default function OnboardingWizard() {
	const t = useTranslations("OnboardingWizard");
	const tCommon = useTranslations("Common");
	const router = useRouter();
	const formId = useId();
	const { theme, toggle } = useTsTheme();

	const [step, setStep] = useState(0);
	const [role, setRole] = useState<string | null>(null);
	const [name, setName] = useState("");
	const [org, setOrg] = useState("");
	const [market, setMarket] = useState("");
	const [focus, setFocus] = useState<string[]>([]);

	const roleOptions = t.raw("role.options") as RoleOption[];
	const focusOptions = t.raw("focus.options") as FocusOption[];
	const total = STEPS.length;
	const current: StepKey = STEPS[step];
	const progress = Math.round(((step + 1) / total) * 100);

	const canContinue =
		current === "role" ? role !== null : current === "profile" ? name.trim().length > 0 : true;

	function next() {
		if (!canContinue) return;
		if (step < total - 1) setStep((s) => s + 1);
		else router.push("/register");
	}
	function back() {
		if (step > 0) setStep((s) => s - 1);
	}
	function toggleFocus(id: string) {
		setFocus((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
	}

	const selectedRole = roleOptions.find((r) => r.id === role);

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
											className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold transition-colors ${
												done
													? "bg-orange text-white"
													: active
														? "border-2 border-orange text-orange"
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
												active ? "text-[var(--text)]" : done ? "text-[var(--text)]" : "text-[var(--muted)]"
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
			<div className="flex flex-col min-h-[100dvh] lg:min-h-0">
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
					<div key={current} className="funnel-step-in flex-1 w-full max-w-2xl mx-auto lg:mx-0">
						<h1 className="font-(family-name:--font-display) text-3xl md:text-4xl leading-[1.08] tracking-tight">
							{t(`${current}.title`)}
						</h1>
						<p className="mt-3 text-[var(--muted)] text-sm md:text-base max-w-xl">
							{t(`${current}.subtitle`)}
						</p>

						<div className="mt-9">
							{current === "role" && (
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
									{roleOptions.map((r) => {
										const selected = role === r.id;
										return (
											<button
												key={r.id}
												type="button"
												onClick={() => setRole(r.id)}
												aria-pressed={selected}
												className={`group relative flex flex-col items-start gap-3 rounded-2xl border p-5 text-left transition-all duration-200 ${
													selected
														? "border-orange bg-orange/[0.08]"
														: "border-[var(--hair)] bg-[var(--surface)] hover:border-[var(--muted)] hover:bg-[var(--surface-2)]"
												}`}
											>
												<span
													className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
														selected ? "bg-orange text-white" : "bg-[var(--surface-2)] text-[var(--text)]"
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
													<span className="material-symbols-outlined text-[15px] text-[var(--text)]">check</span>
												</span>
											</button>
										);
									})}
								</div>
							)}

							{current === "profile" && (
								<form
									id={formId}
									onSubmit={(e) => {
										e.preventDefault();
										next();
									}}
									className="space-y-5 max-w-lg"
								>
									<div>
										<label htmlFor="ob-name" className={authLabel}>
											{t("profile.name")}
										</label>
										<input
											id="ob-name"
											type="text"
											autoComplete="name"
											value={name}
											onChange={(e) => setName(e.target.value)}
											placeholder={t("profile.namePlaceholder")}
											required
											className={authInput}
										/>
									</div>
									<div>
										<label htmlFor="ob-org" className={authLabel}>
											{t("profile.org")}
										</label>
										<input
											id="ob-org"
											type="text"
											autoComplete="organization"
											value={org}
											onChange={(e) => setOrg(e.target.value)}
											placeholder={t("profile.orgPlaceholder")}
											className={authInput}
										/>
									</div>
									<div>
										<label htmlFor="ob-market" className={authLabel}>
											{t("profile.market")}
										</label>
										<input
											id="ob-market"
											type="text"
											value={market}
											onChange={(e) => setMarket(e.target.value)}
											placeholder={t("profile.marketPlaceholder")}
											className={authInput}
										/>
									</div>
								</form>
							)}

							{current === "focus" && (
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									{focusOptions.map((f) => {
										const selected = focus.includes(f.id);
										return (
											<button
												key={f.id}
												type="button"
												onClick={() => toggleFocus(f.id)}
												aria-pressed={selected}
												className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-200 ${
													selected
														? "border-orange bg-orange/[0.08]"
														: "border-[var(--hair)] bg-[var(--surface)] hover:border-[var(--muted)]"
												}`}
											>
												<span
													className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors ${
														selected ? "border-orange bg-orange" : "border-[var(--muted)]"
													}`}
												>
													{selected && (
														<span className="material-symbols-outlined text-[16px] text-white">
															check
														</span>
													)}
												</span>
												<span className="text-sm font-medium text-[var(--text)]">{f.label}</span>
											</button>
										);
									})}
								</div>
							)}

							{current === "review" && (
								<div className="space-y-3">
									<ReviewRow
										label={t("review.roleLabel")}
										value={selectedRole?.title ?? t("review.empty")}
										onEdit={() => setStep(0)}
										editLabel={t("review.edit")}
									/>
									<ReviewRow
										label={t("review.orgLabel")}
										value={org.trim() || t("review.empty")}
										onEdit={() => setStep(1)}
										editLabel={t("review.edit")}
									/>
									<ReviewRow
										label={t("review.marketLabel")}
										value={market.trim() || t("review.empty")}
										onEdit={() => setStep(1)}
										editLabel={t("review.edit")}
									/>
									<ReviewRow
										label={t("review.focusLabel")}
										value={
											focus.length
												? focusOptions
														.filter((f) => focus.includes(f.id))
														.map((f) => f.label)
														.join(", ")
												: t("review.empty")
										}
										onEdit={() => setStep(2)}
										editLabel={t("review.edit")}
									/>
									<p className="pt-3 text-xs text-[var(--muted)] leading-relaxed">
										{t("review.finePrint")}
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Footer nav */}
					<div className="mt-10 w-full max-w-2xl mx-auto lg:mx-0 flex items-center justify-between gap-4 border-t border-[var(--hair)] pt-6">
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
							type="submit"
							form={current === "profile" ? formId : undefined}
							onClick={current === "profile" ? undefined : next}
							disabled={!canContinue}
							className="inline-flex items-center gap-2 rounded-xl bg-orange px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange/25 transition-all hover:bg-ember active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
						>
							{step === total - 1 ? t("finish") : t("continue")}
							<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
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
	onEdit,
	editLabel,
}: {
	label: string;
	value: string;
	onEdit: () => void;
	editLabel: string;
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

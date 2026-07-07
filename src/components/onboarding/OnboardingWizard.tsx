"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useTsTheme } from "@/components/theme/useTsTheme";
import { Link, useRouter } from "@/i18n/routing";

type RoleOption = { id: string; title: string; desc: string };

const STEPS = ["role", "workspace"] as const;
type StepKey = (typeof STEPS)[number];

// Material Symbols glyph per real user type (icon font already loaded app-wide).
const ROLE_ICON: Record<string, string> = {
	promoter: "campaign",
	service: "business_center",
	workforce: "engineering",
	artmgmt: "queue_music",
};

// Where each self-serve user type actually goes. Promoters create a platform
// account (then land on the dashboard); stakeholders self-onboard into their
// registry. These mirror the real /join and /onboard routes.
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

	const roleOptions = t.raw("role.options") as RoleOption[];
	const total = STEPS.length;
	const current: StepKey = STEPS[step];
	const progress = Math.round(((step + 1) / total) * 100);
	const selectedRole = roleOptions.find((r) => r.id === role);

	const canContinue = current === "role" ? role !== null : true;

	function next() {
		if (!canContinue) return;
		if (step < total - 1) setStep((s) => s + 1);
		else if (role) router.push(ROLE_DEST[role] ?? "/register");
	}
	function back() {
		if (step > 0) setStep((s) => s - 1);
	}

	const features = selectedRole
		? (t.raw(`workspace.features.${selectedRole.id}`) as string[])
		: [];

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
						{current === "role" && (
							<>
								<h1 className="font-(family-name:--font-display) text-3xl md:text-4xl leading-[1.08] tracking-tight">
									{t("role.title")}
								</h1>
								<p className="mt-3 text-[var(--muted)] text-sm md:text-base max-w-xl">
									{t("role.subtitle")}
								</p>

								<div className="mt-9 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
													<span className="material-symbols-outlined text-[15px] text-white">check</span>
												</span>
											</button>
										);
									})}
								</div>
							</>
						)}

						{current === "workspace" && selectedRole && (
							<>
								<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange">
									{t("workspace.eyebrow")}
								</p>
								<div className="mt-4 flex items-center gap-4">
									<span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange/12 text-orange shrink-0">
										<span className="material-symbols-outlined text-[28px]">
											{ROLE_ICON[selectedRole.id] ?? "person"}
										</span>
									</span>
									<h1 className="font-(family-name:--font-display) text-2xl md:text-3xl leading-[1.1] tracking-tight">
										{t("workspace.title", { role: selectedRole.title })}
									</h1>
								</div>
								<p className="mt-4 text-[var(--muted)] text-sm md:text-base max-w-xl">
									{t("workspace.subtitle")}
								</p>

								<div className="mt-8 rounded-2xl border border-[var(--hair)] bg-[var(--surface)] p-6 md:p-7">
									<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)] mb-4">
										{t("workspace.includesLabel")}
									</p>
									<ul className="space-y-3.5">
										{features.map((feat) => (
											<li key={feat} className="flex items-start gap-3">
												<span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange/15 text-orange">
													<span className="material-symbols-outlined text-[15px]">check</span>
												</span>
												<span className="text-sm text-[var(--text)]">{feat}</span>
											</li>
										))}
									</ul>
								</div>
							</>
						)}
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
							type="button"
							onClick={next}
							disabled={!canContinue}
							className="inline-flex items-center gap-2 rounded-xl bg-orange px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange/25 transition-all hover:bg-ember active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
						>
							{step === total - 1 ? t("workspace.cta") : t("continue")}
							<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
						</button>
					</div>
				</main>
			</div>
		</div>
	);
}

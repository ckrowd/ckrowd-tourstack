"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { registerStakeholderAnonymous } from "@/app/actions";
import OnboardingValueProps from "@/components/onboarding/OnboardingValueProps";
import {
	StakeholderForm,
	type StakeholderCategory,
	type SubmitPayload,
} from "@/components/onboarding/StakeholderForms";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useTsTheme } from "@/components/theme/useTsTheme";
import { Link, useRouter } from "@/i18n/routing";

type RoleOption = { id: string; title: string; desc: string };

// Material Symbols glyph per real user type (icon font already loaded app-wide).
const ROLE_ICON: Record<string, string> = {
	promoter: "campaign",
	service: "business_center",
	workforce: "engineering",
	artmgmt: "queue_music",
};

const STAKEHOLDER_ROLES: StakeholderCategory[] = ["service", "workforce", "artmgmt"];

function isStakeholder(role: string | null): role is StakeholderCategory {
	return !!role && (STAKEHOLDER_ROLES as string[]).includes(role);
}

/**
 * The single post-registration onboarding. The user picks how they work with
 * live entertainment, then completes the full detailed registration for that
 * role in one place — the detailed `StakeholderForm` is reused verbatim so no
 * field is dropped or re-collected. Promoters continue to their dashboard,
 * where their company profile is completed.
 */
export default function OnboardingWizard() {
	const t = useTranslations("OnboardingWizard");
	const tReg = useTranslations("StakeholderRegistrationPage");
	const tCommon = useTranslations("Common");
	const router = useRouter();
	const { theme, toggle } = useTsTheme();

	const [role, setRole] = useState<string | null>(null);
	const roleOptions = t.raw("role.options") as RoleOption[];

	const submitMutation = useMutation({
		mutationFn: (body: SubmitPayload) =>
			registerStakeholderAnonymous({
				...body,
				category: role as StakeholderCategory,
			}),
	});

	const submitError = submitMutation.error
		? submitMutation.error instanceof Error
			? submitMutation.error.message
			: tReg("errorDefault")
		: submitMutation.data && !submitMutation.data.success
			? (submitMutation.data.error ?? tReg("errorDefault"))
			: null;

	function pickRole(id: string) {
		// A promoter arriving from the funnel has no company profile yet, so send
		// them straight to the profile-setup surface (`?setup=1` shows the setup
		// banner) instead of bouncing through the dashboard's `ProfileSetupGate`.
		// The gate stays as the backstop for returning promoters who never
		// finished setup. Stakeholders continue into the detailed form below.
		if (id === "promoter") {
			router.push("/profile?setup=1");
			return;
		}
		setRole(id);
	}

	const submitted = submitMutation.data?.success ?? false;
	const detailRole = isStakeholder(role) ? role : null;

	return (
		<div
			className={`ts-theme ${theme === "light" ? "light" : ""} min-h-[100dvh] font-(family-name:--font-geist) flex flex-col`}
		>
			{/* Top bar */}
			<div className="flex items-center justify-between px-5 sm:px-8 md:px-12 pt-6">
				<Link href="/" className="flex items-center gap-2.5" aria-label={tCommon("brandLockupLabel")}>
					<Image src="/ckrowd-logo.png" alt={tCommon("logoAlt")} width={30} height={30} />
					<span className="flex flex-col leading-tight">
						<span className="text-base font-bold tracking-tight text-orange">
							{tCommon("brandName")}
						</span>
						<span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
							{tCommon("brandBy")}
						</span>
					</span>
				</Link>
				<ThemeToggle theme={theme} onToggle={toggle} />
			</div>

			<main className="relative flex-1 flex flex-col px-5 sm:px-8 md:px-12 py-8 md:py-12">
				<div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[30rem] w-[46rem] rounded-full bg-orange/[0.07] blur-[140px]" />

				{/* ── Success ─────────────────────────────────────────────── */}
				{submitted ? (
					<div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center max-w-md mx-auto">
						<div className="w-16 h-16 rounded-full bg-lime/10 border border-lime/25 flex items-center justify-center mb-6">
							<span className="material-symbols-outlined text-3xl text-lime">check</span>
						</div>
						<h1 className="font-(family-name:--font-display) text-3xl tracking-tight text-[var(--text)]">
							{tReg("success.title")}
						</h1>
						<p className="mt-3 text-sm text-[var(--muted)]">{tReg("success.description")}</p>
						<Link
							href="/dashboard"
							className="mt-7 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-orange text-white text-sm font-semibold hover:bg-ember transition-colors"
						>
							{t("continueDashboard")}
							<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
						</Link>
					</div>
				) : detailRole ? (
					/* ── Detailed registration for the chosen role ──────────── */
					<div className="relative z-10 w-full max-w-2xl mx-auto">
						<button
							type="button"
							onClick={() => setRole(null)}
							className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors mb-6"
						>
							<span className="material-symbols-outlined text-base">arrow_back</span>
							{t("changeRole")}
						</button>

						<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange">
							{detailRole === "service"
								? tReg("serviceProvider.tagline" as never)
								: detailRole === "workforce"
									? tReg("workforce.tagline" as never)
									: tReg("artmgmt.tagline" as never)}
						</p>
						<h1 className="mt-2 font-(family-name:--font-display) text-3xl md:text-4xl leading-tight tracking-tight text-[var(--text)]">
							{detailRole === "service"
								? tReg("serviceProvider.title" as never)
								: detailRole === "workforce"
									? tReg("workforce.title" as never)
									: tReg("artmgmt.title" as never)}
						</h1>

						<OnboardingValueProps />

						<StakeholderForm
							category={detailRole}
							onSubmit={(data) => submitMutation.mutate(data)}
							submitError={submitError}
							isPending={submitMutation.isPending}
						/>
					</div>
				) : (
					/* ── Role picker ────────────────────────────────────────── */
					<div className="relative z-10 w-full max-w-2xl mx-auto text-center">
						<h1 className="font-(family-name:--font-display) text-[2rem] md:text-[2.75rem] leading-[1.05] tracking-tight text-[var(--text)]">
							{t("role.title")}
						</h1>
						<p className="mt-4 text-[var(--muted)] text-sm md:text-base max-w-xl mx-auto leading-relaxed">
							{t("role.subtitle")}
						</p>

						<div className="mt-9 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
							{roleOptions.map((r) => (
								<button
									key={r.id}
									type="button"
									onClick={() => pickRole(r.id)}
									className="group relative flex flex-col items-start gap-3.5 rounded-2xl border border-[var(--hair)] bg-[var(--surface)] p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-orange hover:shadow-[0_16px_50px_-12px_rgba(255,90,48,0.28)]"
								>
									<span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--muted)] transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-orange group-hover:to-ember group-hover:text-white group-hover:shadow-lg group-hover:shadow-orange/30">
										<span className="material-symbols-outlined">{ROLE_ICON[r.id] ?? "person"}</span>
									</span>
									<span>
										<span className="block font-semibold text-[15px] text-[var(--text)]">{r.title}</span>
										<span className="mt-1 block text-[13px] leading-snug text-[var(--muted)]">{r.desc}</span>
									</span>
									<span className="absolute right-4 top-4 text-[var(--muted)] opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
										<span className="material-symbols-outlined text-[20px]">arrow_forward</span>
									</span>
								</button>
							))}
						</div>

						<p className="mt-8 text-sm text-[var(--muted)]">
							{t("haveAccount")}{" "}
							<Link href="/login" className="text-orange font-semibold hover:text-ember transition-colors">
								{t("signIn")}
							</Link>
						</p>
					</div>
				)}
			</main>
		</div>
	);
}

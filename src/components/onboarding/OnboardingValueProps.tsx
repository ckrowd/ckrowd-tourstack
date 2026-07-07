"use client";

import { useTranslations } from "next-intl";

const ITEMS = [
	{ key: "directory", icon: "hub" },
	{ key: "financing", icon: "payments" },
	{ key: "insurance", icon: "security" },
	{ key: "certification", icon: "verified" },
] as const;

/**
 * Value panel shown above every onboarding form so a stakeholder sees exactly
 * what completing their profile unlocks (directory listing, financing,
 * insurance, certification) — as described in the onboarding strategy.
 */
export default function OnboardingValueProps() {
	const t = useTranslations("StakeholderRegistrationPage");
	return (
		<section className="mt-6 rounded-2xl border border-orange/20 bg-orange/5 p-5">
			<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)] mb-4">
				{t("valueProps.heading")}
			</p>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{ITEMS.map((item) => (
					<div key={item.key} className="flex items-start gap-3">
						<div className="w-8 h-8 rounded-lg bg-orange/10 flex items-center justify-center shrink-0">
							<span
								className="material-symbols-outlined text-orange text-base"
								style={{ fontVariationSettings: "'FILL' 1" }}
							>
								{item.icon}
							</span>
						</div>
						<div>
							<p className="text-xs font-semibold text-[var(--text)]">
								{t(`valueProps.items.${item.key}.title` as never)}
							</p>
							<p className="text-xs text-[var(--muted)] leading-relaxed">
								{t(`valueProps.items.${item.key}.body` as never)}
							</p>
						</div>
					</div>
				))}
			</div>
			<p className="text-xs text-[var(--muted)] leading-relaxed mt-4 pt-4 border-t border-orange/15">
				{t("valueProps.note")}
			</p>
		</section>
	);
}

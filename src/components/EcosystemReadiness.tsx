"use client";

import { useTranslations } from "next-intl";
import type { EcosystemReadiness as Readiness, ReadinessKey } from "@/lib/eligibility";
import { Link } from "@/i18n/routing";

const ICONS: Record<ReadinessKey, string> = {
	service: "business_center",
	workforce: "engineering",
	artmgmt: "queue_music",
	insurance: "security",
};

/**
 * Ecosystem-onboarding readiness + financing-eligibility panel. Pure
 * presentation — the readiness is computed server-side and passed in.
 */
export default function EcosystemReadiness({
	readiness,
	compact = false,
}: {
	readiness: Readiness;
	compact?: boolean;
}) {
	const t = useTranslations("EcosystemReadiness");
	const { checklist, completedCount, completionPct, eligible } = readiness;

	return (
		<section
			className={`rounded-2xl border shadow-sm overflow-hidden ${
				eligible
					? "border-emerald-200 bg-emerald-50/40"
					: "border-[#FF5A30]/20 bg-[#FF5A30]/5"
			}`}
		>
			<div className="p-5 md:p-6">
				<div className="flex items-start justify-between gap-4 mb-4">
					<div>
						<div className="flex items-center gap-2 mb-1">
							<span
								className={`material-symbols-outlined text-lg ${
									eligible ? "text-emerald-600" : "text-[#FF5A30]"
								}`}
								style={{ fontVariationSettings: "'FILL' 1" }}
							>
								{eligible ? "verified" : "hub"}
							</span>
							<h2 className="font-(family-name:--font-manrope) font-extrabold text-on-surface">
								{eligible ? t("eligibleTitle") : t("title")}
							</h2>
						</div>
						<p className="text-sm text-on-surface-variant">
							{eligible ? t("eligibleBody") : t("subtitle")}
						</p>
					</div>
					<div className="text-right shrink-0">
						<p
							className={`text-2xl font-black font-(family-name:--font-manrope) ${
								eligible ? "text-emerald-600" : "text-[#FF5A30]"
							}`}
						>
							{completionPct}%
						</p>
						<p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
							{t("progress", { done: completedCount, total: checklist.length })}
						</p>
					</div>
				</div>

				{/* Progress bar */}
				<div className="h-2 w-full rounded-full bg-surface-container-high overflow-hidden mb-5">
					<div
						className={`h-full rounded-full transition-all ${
							eligible ? "bg-emerald-500" : "bg-[#FF5A30]"
						}`}
						style={{ width: `${completionPct}%` }}
					/>
				</div>

				{/* Checklist */}
				<ul
					className={`grid gap-2 ${compact ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}
				>
					{checklist.map((item) => (
						<li
							key={item.key}
							className="flex items-center gap-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/10 px-3 py-2.5"
						>
							<span
								className={`material-symbols-outlined text-base shrink-0 ${
									item.done ? "text-emerald-600" : "text-on-surface-variant/40"
								}`}
								style={item.done ? { fontVariationSettings: "'FILL' 1" } : undefined}
							>
								{item.done ? "check_circle" : ICONS[item.key]}
							</span>
							<span className="text-sm font-medium text-on-surface truncate">
								{t(`items.${item.key}`)}
							</span>
							{item.key !== "insurance" && item.count > 0 && (
								<span className="ml-auto text-xs font-bold text-on-surface-variant">
									{item.count}
								</span>
							)}
						</li>
					))}
				</ul>

				{!eligible && (
					<div className="mt-5 flex flex-col sm:flex-row gap-2.5">
						<Link
							href="/stakeholders"
							className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF5A30] text-white text-sm font-bold hover:opacity-90 transition-opacity"
						>
							<span className="material-symbols-outlined text-sm">share</span>
							{t("ctaInvite")}
						</Link>
						{!readiness.hasInsurance && (
							<Link
								href="/insurance"
								className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant/30 text-sm font-bold text-on-surface hover:bg-surface-container-high transition-colors"
							>
								<span className="material-symbols-outlined text-sm">security</span>
								{t("ctaInsurance")}
							</Link>
						)}
					</div>
				)}
			</div>
		</section>
	);
}

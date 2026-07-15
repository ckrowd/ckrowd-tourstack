"use client";

import { useTranslations } from "next-intl";
import Icon from "@/components/icons";
import type { EcosystemReadiness as Readiness, ReadinessKey } from "@/lib/eligibility";
import { Link } from "@/i18n/routing";

const ICONS: Record<ReadinessKey, string> = {
	service: "briefcase",
	workforce: "wrench",
	artmgmt: "music",
	insurance: "insurance",
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
			className={`rounded-2xl border overflow-hidden ${
				eligible
					? "border-emerald-500/25 bg-emerald-500/5"
					: "border-primary/20 bg-primary/5"
			}`}
		>
			<div className="p-5 md:p-6">
				<div className="flex items-start justify-between gap-4 mb-4">
					<div>
						<div className="flex items-center gap-2 mb-1">
							<Icon
								name={eligible ? "check-circle" : "share"}
								size={18}
								className={eligible ? "text-emerald-500 shrink-0" : "text-primary shrink-0"}
							/>
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
								eligible ? "text-emerald-500" : "text-primary"
							}`}
						>
							{completionPct}%
						</p>
						<p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
							{t("progress", { done: completedCount, total: checklist.length })}
						</p>
					</div>
				</div>

				{/* Progress bar */}
				<div className="h-2 w-full rounded-full bg-surface-container-high overflow-hidden mb-5">
					<div
						className={`h-full rounded-full transition-all ${
							eligible ? "bg-emerald-500" : "bg-primary"
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
							<Icon
								name={item.done ? "check-circle" : ICONS[item.key]}
								size={16}
								className={`shrink-0 ${item.done ? "text-emerald-500" : "text-on-surface-variant/40"}`}
							/>
							<span className="text-sm font-medium text-on-surface truncate">
								{t(`items.${item.key}`)}
							</span>
							{item.key !== "insurance" && item.count > 0 && (
								<span className="ml-auto text-xs font-semibold text-on-surface-variant">
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
							className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
						>
							<Icon name="share" size={15} />
							{t("ctaInvite")}
						</Link>
						{!readiness.hasInsurance && (
							<Link
								href="/insurance"
								className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant/30 text-sm font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
							>
								<Icon name="insurance" size={15} />
								{t("ctaInsurance")}
							</Link>
						)}
					</div>
				)}
			</div>
		</section>
	);
}

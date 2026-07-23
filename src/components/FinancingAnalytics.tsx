"use client";

import { useTranslations } from "next-intl";
import AreaChart from "@/components/dashboard/AreaChart";
import DonutChart from "@/components/dashboard/DonutChart";
import Sparkline from "@/components/dashboard/Sparkline";
import CountUp from "@/components/ui/CountUp";
import Icon from "@/components/icons";

type Application = {
	id: string;
	product?: string | null;
	amount_requested?: number | null;
	currency?: string | null;
	status?: string | null;
	created_at?: Date | string | null;
	tour?: { artist?: { name?: string | null } | null } | null;
};

const APPROVED_STATUSES = ["approved", "disbursed"];
const DECIDED_STATUSES = ["approved", "disbursed", "declined"];

/* Compact currency for KPI numerals — $1.2M, $840K, $12K. */
function compactMoney(v: number, locale: string) {
	return new Intl.NumberFormat(locale, {
		notation: "compact",
		maximumFractionDigits: 1,
	}).format(v);
}

export default function FinancingAnalytics({
	applications,
	locale,
}: {
	applications: Application[];
	locale: string;
}) {
	const t = useTranslations("FinancingApplyPage.analytics");

	const now = new Date();
	const amt = (a: Application) => Number(a.amount_requested ?? 0) || 0;
	const isApproved = (a: Application) =>
		APPROVED_STATUSES.includes(String(a.status ?? ""));

	// ── Six-month buckets (mirrors the dashboard's derivation) ───────────────
	const monthKeys = Array.from({ length: 6 }, (_, i) => {
		const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
		return `${d.getFullYear()}-${d.getMonth()}`;
	});
	const monthKeyOf = (raw: unknown) => {
		if (!raw) return null;
		const d = new Date(String(raw));
		return Number.isNaN(d.getTime()) ? null : `${d.getFullYear()}-${d.getMonth()}`;
	};
	const monthLabels = monthKeys.map((k) => {
		const [yy, mm] = k.split("-").map(Number);
		return new Date(yy, mm, 1).toLocaleDateString(locale, { month: "short" });
	});
	const inMonth = (a: Application, k: string) => monthKeyOf(a.created_at) === k;

	const requestedSeries = monthKeys.map((k) =>
		applications.filter((a) => inMonth(a, k)).reduce((s, a) => s + amt(a), 0),
	);
	const approvedSeries = monthKeys.map((k) =>
		applications
			.filter((a) => inMonth(a, k) && isApproved(a))
			.reduce((s, a) => s + amt(a), 0),
	);
	const countSeries = monthKeys.map(
		(k) => applications.filter((a) => inMonth(a, k)).length,
	);

	// ── KPIs ─────────────────────────────────────────────────────────────────
	const totalRequested = applications.reduce((s, a) => s + amt(a), 0);
	const approvedCapital = applications
		.filter(isApproved)
		.reduce((s, a) => s + amt(a), 0);
	const decidedCount = applications.filter((a) =>
		DECIDED_STATUSES.includes(String(a.status ?? "")),
	).length;
	const approvedCount = applications.filter(isApproved).length;
	const approvalRate =
		decidedCount > 0 ? Math.round((approvedCount / decidedCount) * 100) : 0;

	// Trend delta — last 3 months vs the prior 3.
	const recent = requestedSeries.slice(3).reduce((s, v) => s + v, 0);
	const prior = requestedSeries.slice(0, 3).reduce((s, v) => s + v, 0);
	const trendPct =
		prior > 0 ? Math.round(((recent - prior) / prior) * 100) : recent > 0 ? 100 : 0;

	// ── Status composition ─────────────────────────────────────────────────────
	const tStatus = useTranslations("FinancingApplyPage.statuses");
	const countStatus = (wanted: string[]) =>
		applications.filter((a) => wanted.includes(String(a.status ?? ""))).length;
	const statusSegments = [
		{ label: tStatus("approved"), value: countStatus(APPROVED_STATUSES), color: "var(--chart-approved)" },
		{ label: tStatus("pending_review"), value: countStatus(["pending_review", "pending", "under_review"]), color: "var(--chart-pending)" },
		{ label: tStatus("declined"), value: countStatus(["declined", "rejected"]), color: "var(--chart-rejected)" },
	].filter((s) => s.value > 0);

	// ── Product breakdown ──────────────────────────────────────────────────────
	const productMap = new Map<string, number>();
	for (const a of applications) {
		const key = String(a.product ?? "—");
		productMap.set(key, (productMap.get(key) ?? 0) + amt(a));
	}
	const products = [...productMap.entries()]
		.map(([label, value]) => ({ label, value }))
		.sort((a, b) => b.value - a.value)
		.slice(0, 5);
	const productMax = Math.max(...products.map((p) => p.value), 1);

	if (applications.length === 0) {
		return (
			<section className="tsd-card p-10 mb-8 text-center">
				<span className="tsd-empty-icon inline-flex w-12 h-12 rounded-xl bg-primary/10 text-primary items-center justify-center mb-4">
					<Icon name="chart" size={22} />
				</span>
				<p className="text-sm font-medium text-on-surface-variant max-w-sm mx-auto">
					{t("empty")}
				</p>
			</section>
		);
	}

	const kpis = [
		{
			label: t("totalRequested"),
			value: compactMoney(totalRequested, locale),
			prefix: "$",
			icon: "wallet",
			tint: "bg-primary/10 text-primary",
			series: requestedSeries,
			sparkClass: "text-primary",
			badge:
				trendPct !== 0 ? (
					<span
						className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${trendPct > 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}
					>
						<Icon name={trendPct > 0 ? "trending-up" : "trending-down"} size={11} strokeWidth={2.5} />
						{trendPct > 0 ? "+" : ""}
						{trendPct}%
					</span>
				) : null,
			sub: t("vsPrev"),
		},
		{
			label: t("approvedCapital"),
			value: compactMoney(approvedCapital, locale),
			prefix: "$",
			icon: "check",
			tint: "bg-emerald-500/10 text-emerald-500",
			series: approvedSeries,
			sparkClass: "[color:var(--chart-approved)]",
			badge: (
				<span className="text-emerald-500 font-semibold text-xs">
					{approvedCount}/{applications.length}
				</span>
			),
			sub: null,
		},
		{
			label: t("approvalRate"),
			value: String(approvalRate),
			suffix: "%",
			icon: "shield-check",
			tint: "bg-blue-500/10 text-blue-500",
			series: null,
			ring: approvalRate,
			sub: t("ofDecided"),
		},
		{
			label: t("applications"),
			value: String(applications.length),
			icon: "file-text",
			tint: "bg-tertiary-fixed text-tertiary",
			series: countSeries,
			sparkClass: "[color:var(--chart-contacted)]",
			badge: (
				<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface-container text-on-surface-variant">
					{t("acrossProducts", { count: productMap.size })}
				</span>
			),
			sub: null,
		},
	];

	return (
		<section className="mb-10">
			{/* KPI strip */}
			<div className="tsd-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-5">
				{kpis.map((k) => (
					<div
						key={k.label}
						className="tsd-card tsd-card-hover p-5 md:p-6 flex flex-col justify-between gap-5"
					>
						<div className="flex items-center justify-between">
							<p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-[0.12em]">
								{k.label}
							</p>
							<span className={`tsd-chip w-8 h-8 rounded-lg flex items-center justify-center ${k.tint}`}>
								<Icon name={k.icon} size={16} strokeWidth={2} />
							</span>
						</div>
						<div className="flex items-end justify-between gap-2">
							<span className="text-3xl md:text-4xl font-(family-name:--font-display) text-on-surface leading-none tabular-nums">
								{k.prefix ?? ""}
								{k.value}
								{k.suffix ?? ""}
							</span>
							{k.badge}
						</div>
						{k.series ? (
							<Sparkline data={k.series} height={30} className={k.sparkClass} />
						) : k.ring != null ? (
							<div className="h-[30px] flex items-end">
								<div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
									<div
										className="h-full rounded-full bg-blue-500 transition-[width] duration-700 [transition-timing-function:var(--ease-out)]"
										style={{ width: `${Math.min(k.ring, 100)}%` }}
									/>
								</div>
							</div>
						) : null}
					</div>
				))}
			</div>

			{/* Trend + status composition */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
				<div className="lg:col-span-2 tsd-card p-5 md:p-6 flex flex-col">
					<div className="flex items-start justify-between gap-3">
						<div>
							<p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
								{t("eyebrow")}
							</p>
							<h2 className="text-lg font-(family-name:--font-manrope) font-semibold text-on-surface">
								{t("trendTitle")}
							</h2>
						</div>
						<span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-on-surface-variant shrink-0">
							<Icon name="calendar" size={12} />
							{t("period")}
						</span>
					</div>
					<AreaChart
						series={[
							{ values: requestedSeries, label: t("requestedSeries"), color: "var(--color-primary)" },
							{ values: approvedSeries, label: t("approvedSeries"), color: "var(--chart-approved)", fill: false },
						]}
						labels={monthLabels}
						locale={locale}
						valuePrefix="$"
						height={250}
						className="mt-6"
					/>
				</div>

				<div className="lg:col-span-1 tsd-card p-6 flex flex-col">
					<div className="flex items-center justify-between mb-5">
						<h3 className="font-(family-name:--font-manrope) font-semibold text-lg">
							{t("statusTitle")}
						</h3>
						<span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
							<Icon name="chart" size={16} />
						</span>
					</div>
					<div className="flex items-center gap-5">
						<DonutChart
							segments={statusSegments}
							centerValue={String(applications.length)}
							centerLabel={t("applications")}
							size={124}
						/>
						<ul className="flex-1 min-w-0 space-y-2.5">
							{statusSegments.map((seg) => (
								<li key={seg.label} className="flex items-center gap-2.5">
									<span className="w-2 h-2 rounded-full shrink-0" style={{ background: seg.color }} />
									<span className="text-xs font-medium text-on-surface-variant flex-1 truncate">
										{seg.label}
									</span>
									<span className="text-xs font-semibold text-on-surface tabular-nums">
										{seg.value}
									</span>
								</li>
							))}
						</ul>
					</div>

					{/* Capital by product — mini bar list */}
					<div className="mt-6 pt-5 border-t border-outline-variant/60">
						<p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant mb-3">
							{t("productTitle")}
						</p>
						<ul className="space-y-3">
							{products.map((p) => (
								<li key={p.label}>
									<div className="flex items-center justify-between gap-2 mb-1">
										<span className="text-xs font-medium text-on-surface truncate">{p.label}</span>
										<span className="text-xs font-semibold text-on-surface-variant tabular-nums shrink-0">
											${compactMoney(p.value, locale)}
										</span>
									</div>
									<div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
										<div
											className="h-full rounded-full bg-primary/80 transition-[width] duration-700 [transition-timing-function:var(--ease-out)]"
											style={{ width: `${Math.max((p.value / productMax) * 100, 3)}%` }}
										/>
									</div>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</section>
	);
}

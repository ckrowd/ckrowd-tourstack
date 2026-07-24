"use client";

import { getTourReport, submitTourReport } from "@/app/actions";
import Icon from "@/components/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import FormattedNumberInput from "@/components/ui/FormattedNumberInput";

type ReportData = {
	actual_attendance?: number | null;
	actual_ticket_revenue?: number | null;
	actual_sponsorship_revenue?: number | null;
	actual_merch_revenue?: number | null;
	actual_total_costs?: number | null;
	actual_net_profit?: number | null;
	sell_out_pct?: number | null;
	promoter_notes?: string | null;
	submitted_at: string;
};

const ic =
	"w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all";

export default function TourReportForm({ tourId }: { tourId: string }) {
	const t = useTranslations("TourReport");

	const { data: existingData } = useQuery({
		queryKey: ["tour-report", tourId],
		queryFn: () => getTourReport(tourId),
	});

	const existing = existingData?.data as ReportData | null | undefined;

	const [form, setForm] = useState({
		actualAttendance: "",
		actualTicketRevenue: "",
		actualSponsorshipRevenue: "",
		actualMerchRevenue: "",
		actualTotalCosts: "",
		actualNetProfit: "",
		sellOutPct: "",
		promoterNotes: "",
	});

	const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));
	const toInt = (s: string) => {
		const n = Number.parseInt(s, 10);
		return Number.isFinite(n) ? n : undefined;
	};

	const mutation = useMutation({
		mutationFn: () =>
			submitTourReport(tourId, {
				actualAttendance: toInt(form.actualAttendance),
				actualTicketRevenue: toInt(form.actualTicketRevenue),
				actualSponsorshipRevenue: toInt(form.actualSponsorshipRevenue),
				actualMerchRevenue: toInt(form.actualMerchRevenue),
				actualTotalCosts: toInt(form.actualTotalCosts),
				actualNetProfit: toInt(form.actualNetProfit),
				sellOutPct: toInt(form.sellOutPct),
				promoterNotes: form.promoterNotes || undefined,
			}),
	});

	if (existing) {
		return (
			<div className="space-y-4">
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
					{[
						{ label: t("fields.actualAttendance"), value: existing.actual_attendance },
						{ label: t("fields.actualTicketRevenue"), value: existing.actual_ticket_revenue != null ? `₦${Number(existing.actual_ticket_revenue).toLocaleString()}` : null },
						{ label: t("fields.actualSponsorshipRevenue"), value: existing.actual_sponsorship_revenue != null ? `₦${Number(existing.actual_sponsorship_revenue).toLocaleString()}` : null },
						{ label: t("fields.actualMerchRevenue"), value: existing.actual_merch_revenue != null ? `₦${Number(existing.actual_merch_revenue).toLocaleString()}` : null },
						{ label: t("fields.actualTotalCosts"), value: existing.actual_total_costs != null ? `₦${Number(existing.actual_total_costs).toLocaleString()}` : null },
						{ label: t("fields.actualNetProfit"), value: existing.actual_net_profit != null ? `₦${Number(existing.actual_net_profit).toLocaleString()}` : null },
						{ label: t("fields.sellOutPct"), value: existing.sell_out_pct != null ? `${existing.sell_out_pct}%` : null },
					].map(({ label, value }) => (
						<div key={label} className="bg-surface-container-low rounded-xl p-3">
							<p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
								{label}
							</p>
							<p className="text-sm font-semibold mt-1">{value ?? "—"}</p>
						</div>
					))}
				</div>
				{existing.promoter_notes && (
					<div className="bg-surface-container-low rounded-xl p-4">
						<p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
							{t("fields.promoterNotes")}
						</p>
						<p className="text-sm text-on-surface">{existing.promoter_notes}</p>
					</div>
				)}
				<p className="text-xs text-on-surface-variant">
					{t("submittedOn")}{" "}
					{new Date(existing.submitted_at).toLocaleDateString("en", {
						month: "short",
						day: "numeric",
						year: "numeric",
					})}
				</p>
			</div>
		);
	}

	if (mutation.data?.success) {
		return (
			<div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-5">
				<Icon name="check-circle" size={24} className="text-emerald-600 shrink-0" />
				<p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{t("success")}</p>
			</div>
		);
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				mutation.mutate();
			}}
			className="space-y-4"
		>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{(
					[
						["actualAttendance", t("fields.actualAttendance")],
						["actualTicketRevenue", t("fields.actualTicketRevenue")],
						["actualSponsorshipRevenue", t("fields.actualSponsorshipRevenue")],
						["actualMerchRevenue", t("fields.actualMerchRevenue")],
						["actualTotalCosts", t("fields.actualTotalCosts")],
						["actualNetProfit", t("fields.actualNetProfit")],
						["sellOutPct", t("fields.sellOutPct")],
					] as [keyof typeof form, string][]
				).map(([key, label]) => (
					<div key={key}>
						<label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
							{label}
						</label>
						{key === "sellOutPct" ? (
							<input
								type="text"
								inputMode="numeric"
								value={form[key]}
								onChange={(e) => set(key, e.target.value.replace(/\D/g, ""))}
								className={ic}
							/>
						) : (
							<FormattedNumberInput
								value={form[key]}
								onChange={(v) => set(key, v)}
								className={ic}
							/>
						)}
					</div>
				))}
			</div>

			<div>
				<label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
					{t("fields.promoterNotes")}
				</label>
				<textarea
					rows={3}
					value={form.promoterNotes}
					onChange={(e) => set("promoterNotes", e.target.value)}
					className={ic}
				/>
			</div>

			{mutation.data && !mutation.data.success && (
				<p className="text-xs text-rose-600">{t("error")}</p>
			)}

			<button
				type="submit"
				disabled={mutation.isPending}
				className="w-full bg-primary text-white font-bold text-sm py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
			>
				{mutation.isPending ? t("submitting") : t("submit")}
			</button>
		</form>
	);
}

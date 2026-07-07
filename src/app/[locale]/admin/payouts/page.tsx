"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getTicketPayoutSummary, getAdminTicketPayouts, initiateTicketPayout } from "@/app/actions";

type Tab = "summary" | "history";

const payoutStatusColor: Record<string, string> = {
	initiated: "bg-blue-100 text-blue-800",
	pending: "bg-amber-100 text-amber-800",
	success: "bg-emerald-100 text-emerald-800",
	failed: "bg-red-100 text-red-700",
	reversed: "bg-surface-container-high text-on-surface-variant",
};

function fmt(amount: number, currency: string) {
	return `${currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AdminPayoutsPage() {
	const t = useTranslations("AdminPayoutsPage");
	const queryClient = useQueryClient();
	const [tab, setTab] = useState<Tab>("summary");

	const { data: summaryResult, isLoading: summaryLoading } = useQuery({
		queryKey: ["ticketPayoutSummary"],
		queryFn: getTicketPayoutSummary,
		enabled: tab === "summary",
	});

	const { data: payoutsResult, isLoading: payoutsLoading } = useQuery({
		queryKey: ["adminTicketPayouts"],
		queryFn: getAdminTicketPayouts,
		enabled: tab === "history",
	});

	const payoutMutation = useMutation({
		mutationFn: ({ eventId, notes }: { eventId: string; notes?: string }) =>
			initiateTicketPayout(eventId, notes),
		onSuccess: (res) => {
			if (res.success) {
				queryClient.invalidateQueries({ queryKey: ["ticketPayoutSummary"] });
				queryClient.invalidateQueries({ queryKey: ["adminTicketPayouts"] });
			}
		},
	});

	const summaryRows = (summaryResult?.data as Record<string, unknown>[] | null) ?? [];
	const payoutRows = (payoutsResult?.data as Record<string, unknown>[] | null) ?? [];

	function handlePay(row: Record<string, unknown>) {
		const event = row.event as Record<string, unknown>;
		const promoter = row.promoter as Record<string, unknown>;
		const unpaid = row.unpaid as Record<string, unknown>;
		const currency = String(event.currency ?? "NGN");
		const net = Number(unpaid.net_amount ?? 0);
		const name = String(promoter?.company_name ?? promoter?.contact_person ?? "promoter");
		if (!window.confirm(t("payConfirm", { amount: fmt(net, currency), currency, promoter: name }))) return;
		payoutMutation.mutate({ eventId: String(event.id) });
	}

	const isPayingId = payoutMutation.isPending
		? (payoutMutation.variables as { eventId: string }).eventId
		: null;

	return (
		<div className="p-6 max-w-7xl mx-auto">
			<div className="mb-8">
				<p className="text-xs font-black uppercase tracking-widest text-[#FF5A2E] mb-1">{t("badge")}</p>
				<h1 className="text-2xl font-black text-on-surface">{t("title")}</h1>
				<p className="text-sm text-on-surface-variant mt-1">{t("description")}</p>
			</div>

			{/* Tabs */}
			<div className="flex gap-1 mb-6 bg-surface-container rounded-xl p-1 w-fit">
				{(["summary", "history"] as Tab[]).map((t2) => (
					<button
						key={t2}
						type="button"
						onClick={() => setTab(t2)}
						className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
							tab === t2 ? "bg-surface shadow text-on-surface" : "text-on-surface-variant hover:text-on-surface"
						}`}
					>
						{t(`tabs.${t2}`)}
					</button>
				))}
			</div>

			{/* ── SUMMARY TAB ── */}
			{tab === "summary" && (
				<>
					{summaryLoading && (
						<div className="flex justify-center py-16">
							<div className="w-6 h-6 border-2 border-[#FF5A2E] border-t-transparent rounded-full animate-spin" />
						</div>
					)}
					{!summaryLoading && summaryRows.length === 0 && (
						<div className="text-center py-16 text-on-surface-variant text-sm">{t("noEvents")}</div>
					)}
					{!summaryLoading && summaryRows.length > 0 && (
						<div className="space-y-4">
							{summaryRows.map((row) => {
								const event = row.event as Record<string, unknown>;
								const promoter = row.promoter as Record<string, unknown> | null;
								const totals = row.totals as Record<string, number>;
								const unpaid = row.unpaid as Record<string, number>;
								const currency = String(event?.currency ?? "NGN");
								const hasBankDetails = !!promoter?.bank_account_number;
								const isPayoutReady =
									!!promoter?.bank_code &&
									!!promoter?.bank_account_number &&
									!!promoter?.bank_account_holder;
								const hasUnpaid = unpaid.count > 0;
								const isPayingThis = isPayingId === String(event.id);

								return (
									<div
										key={String(event.id)}
										className="bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden"
									>
										{/* Event header */}
										<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-5 border-b border-outline-variant">
											<div>
												<h2 className="font-bold text-on-surface">{String(event.title)}</h2>
												<p className="text-xs text-on-surface-variant mt-0.5">
													{String(event.city ?? "")}
													{event.event_date
														? ` · ${new Date(String(event.event_date)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
														: ""}
												</p>
											</div>
											<div className="sm:text-right shrink-0">
												{hasUnpaid && isPayoutReady ? (
													<button
														type="button"
														onClick={() => handlePay(row)}
														disabled={isPayingThis || payoutMutation.isPending}
														className="px-4 py-2 bg-[#FF5A2E] text-white text-xs font-bold rounded-xl hover:bg-[#e04e28] disabled:opacity-50 transition"
													>
														{isPayingThis ? t("paying") : `${t("payNow")} · ${fmt(unpaid.net_amount, currency)}`}
													</button>
												) : hasUnpaid && hasBankDetails ? (
													<span className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full font-semibold">
														{t("bankCodeMissing")}
													</span>
												) : hasUnpaid ? (
													<span className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full font-semibold">
														{t("noBankDetails")}
													</span>
												) : (
													<span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full font-semibold">
														{t("allPaid")}
													</span>
												)}
											</div>
										</div>

										{/* Stats grid */}
										<div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-outline-variant">
											{[
												{ label: t("table.tickets"), value: String(totals.tickets_sold) },
												{ label: t("table.gross"), value: fmt(totals.gross_amount, currency) },
												{ label: t("table.fee"), value: fmt(totals.platform_fee, currency) },
												{ label: t("table.net"), value: fmt(totals.net_amount, currency) },
												{ label: t("table.unpaidNet"), value: fmt(unpaid.net_amount, currency), highlight: hasUnpaid },
											].map(({ label, value, highlight }) => (
												<div key={label} className="bg-surface-container-low p-4">
													<p className="text-xs text-on-surface-variant mb-1">{label}</p>
													<p className={`font-bold text-sm ${highlight ? "text-[#FF5A2E]" : "text-on-surface"}`}>
														{value}
													</p>
												</div>
											))}
										</div>

										{/* Promoter bank info */}
										{promoter && (
											<div className="px-5 py-3 bg-surface-container/40 text-xs text-on-surface-variant flex flex-wrap gap-4">
												<span>
													<span className="font-semibold text-on-surface">
														{String(promoter.company_name ?? promoter.contact_person ?? "—")}
													</span>
													{!!promoter.user && ` · ${String((promoter.user as Record<string, unknown>).email ?? "")}`}
												</span>
												{hasBankDetails ? (
													<span>
														{String(promoter.bank_name ?? "")} &middot;{" "}
														<span className="font-mono">{String(promoter.bank_account_number ?? "")}</span>
														{promoter.bank_code ? (
															<span className="ml-1 text-on-surface-variant">(code: {String(promoter.bank_code)})</span>
														) : (
															<span className="ml-2 text-amber-600">{t("bankCodeMissing")}</span>
														)}
														{!!promoter.paystack_recipient_code && (
															<span className="ml-2 text-emerald-600">{t("recipientReady")}</span>
														)}
													</span>
												) : (
													<span className="text-amber-700">{t("noBankDetails")}</span>
												)}
											</div>
										)}
									</div>
								);
							})}
						</div>
					)}
				</>
			)}

			{/* ── HISTORY TAB ── */}
			{tab === "history" && (
				<>
					{payoutsLoading && (
						<div className="flex justify-center py-16">
							<div className="w-6 h-6 border-2 border-[#FF5A2E] border-t-transparent rounded-full animate-spin" />
						</div>
					)}
					{!payoutsLoading && payoutRows.length === 0 && (
						<div className="text-center py-16 text-on-surface-variant text-sm">{t("noPayouts")}</div>
					)}
					{!payoutsLoading && payoutRows.length > 0 && (
						<div className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant">
							<div className="overflow-x-auto">
								<table className="w-full text-sm">
									<thead>
										<tr className="border-b border-outline-variant bg-surface-container">
											{(["event", "promoter", "amount", "status", "date"] as const).map((col) => (
												<th
													key={col}
													className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant"
												>
													{t(`table.${col}`)}
												</th>
											))}
											<th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
												Ref
											</th>
										</tr>
									</thead>
									<tbody>
										{payoutRows.map((p) => {
											const payout = p as Record<string, unknown>;
											const event = payout.event as Record<string, unknown> | undefined;
											const promoter = payout.promoter as Record<string, unknown> | undefined;
											const status = String(payout.status ?? "initiated");
											const initiatedAt = payout.initiated_at
												? new Date(String(payout.initiated_at))
												: null;

											return (
												<tr
													key={String(payout.id)}
													className="border-b border-outline-variant last:border-0 hover:bg-surface-container/60"
												>
													<td className="px-4 py-3">
														<p className="font-semibold">{event?.title ? String(event.title) : "—"}</p>
														{!!event?.city && (
															<p className="text-xs text-on-surface-variant">{String(event.city)}</p>
														)}
													</td>
													<td className="px-4 py-3 text-on-surface-variant">
														{String(promoter?.company_name ?? promoter?.contact_person ?? "—")}
													</td>
													<td className="px-4 py-3 font-semibold whitespace-nowrap">
														{fmt(Number(payout.net_amount ?? 0), String(payout.currency ?? "NGN"))}
													</td>
													<td className="px-4 py-3">
														<span
															className={`px-2 py-0.5 rounded-full text-xs font-semibold ${payoutStatusColor[status] ?? ""}`}
														>
															{t(`payoutStatus.${status}` as Parameters<typeof t>[0])}
														</span>
													</td>
													<td className="px-4 py-3 text-on-surface-variant text-xs whitespace-nowrap">
														{initiatedAt?.toLocaleDateString("en-US", {
															month: "short",
															day: "numeric",
															year: "numeric",
														}) ?? "—"}
													</td>
													<td className="px-4 py-3 text-xs text-on-surface-variant font-mono truncate max-w-[120px]">
														{String(payout.paystack_transfer_reference ?? "—")}
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}

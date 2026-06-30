"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getAdminTicketPurchases, refundTicketPurchase } from "@/app/actions";

const FILTERS = ["all", "pending", "success", "failed", "refunded"] as const;
type Filter = (typeof FILTERS)[number];

const statusColor: Record<string, string> = {
	pending: "bg-amber-100 text-amber-800",
	success: "bg-emerald-100 text-emerald-800",
	failed: "bg-red-100 text-red-700",
	refunded: "bg-surface-container-high text-on-surface-variant",
};

export default function AdminPaymentsPage() {
	const t = useTranslations("AdminPaymentsPage");
	const queryClient = useQueryClient();

	const [filter, setFilter] = useState<Filter>("all");
	const [page, setPage] = useState(1);

	const { data: result, isLoading, isFetching } = useQuery({
		queryKey: ["adminTicketPurchases", filter, page],
		queryFn: () => getAdminTicketPurchases(undefined, filter === "all" ? undefined : filter, page, 50),
	});

	const refundMutation = useMutation({
		mutationFn: (id: string) => refundTicketPurchase(id),
		onSuccess: (res) => {
			if (res.success) {
				queryClient.invalidateQueries({ queryKey: ["adminTicketPurchases"] });
			}
		},
	});

	const purchases = (result?.data as Record<string, unknown>[] | null) ?? [];
	const pagination = result?.pagination as { page: number; totalPages: number; total: number } | null | undefined;

	function handleRefund(id: string) {
		if (!window.confirm(t("refundConfirm"))) return;
		refundMutation.mutate(id);
	}

	return (
		<div className="p-6 max-w-7xl mx-auto">
			<div className="flex flex-wrap items-start justify-between gap-2 mb-8">
				<div>
					<p className="text-xs font-black uppercase tracking-widest text-[#FF5A30] mb-1">{t("badge")}</p>
					<h1 className="text-2xl font-black text-on-surface">{t("title")}</h1>
					<p className="text-sm text-on-surface-variant mt-1">{t("description")}</p>
				</div>
				{pagination && (
					<p className="text-xs text-on-surface-variant font-semibold self-end">
						{pagination.total} total
					</p>
				)}
			</div>

			{/* Status filter */}
			<div className="flex gap-2 mb-6 flex-wrap">
				{FILTERS.map((f) => (
					<button
						key={f}
						type="button"
						onClick={() => { setFilter(f); setPage(1); }}
						className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
							filter === f
								? "bg-[#FF5A30] text-white"
								: "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
						}`}
					>
						{t(`filters.${f}`)}
					</button>
				))}
			</div>

			{(isLoading || isFetching) && (
				<div className="flex justify-center py-16">
					<div className="w-6 h-6 border-2 border-[#FF5A30] border-t-transparent rounded-full animate-spin" />
				</div>
			)}

			{!isLoading && purchases.length === 0 && (
				<div className="text-center py-16 text-on-surface-variant text-sm">{t("noPayments")}</div>
			)}

			{!isLoading && purchases.length > 0 && (
				<div className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant">
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-outline-variant bg-surface-container">
									{(["buyer", "event", "tier", "qty", "amount", "status", "date", "actions"] as const).map((col) => (
										<th key={col} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant whitespace-nowrap">
											{t(`table.${col}`)}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{purchases.map((row) => {
									const r = row as Record<string, unknown>;
									const event = r.event as Record<string, unknown> | undefined;
									const tier = r.tier as Record<string, unknown> | undefined;
									const status = String(r.payment_status ?? "pending");
									const createdAt = r.created_at ? new Date(String(r.created_at)) : null;
									const currency = String(event?.currency ?? "USD");
									const amount = Number(r.total_amount ?? 0);
									const id = String(r.id);
									const isRefunding = refundMutation.isPending && refundMutation.variables === id;

									return (
										<tr key={id} className="border-b border-outline-variant last:border-0 hover:bg-surface-container/60">
											<td className="px-4 py-3">
												<p className="font-semibold truncate max-w-[140px]">{String(r.buyer_name ?? "—")}</p>
												<p className="text-xs text-on-surface-variant truncate max-w-[140px]">{String(r.buyer_email ?? "")}</p>
											</td>
											<td className="px-4 py-3 text-on-surface-variant">
												<p className="truncate max-w-[160px]">{event?.title ? String(event.title) : "—"}</p>
												{event?.city && (
													<p className="text-xs">{String(event.city)}</p>
												)}
											</td>
											<td className="px-4 py-3 text-on-surface-variant whitespace-nowrap">
												{tier?.name ? String(tier.name) : "—"}
											</td>
											<td className="px-4 py-3 text-center font-semibold">
												{String(r.quantity ?? 1)}
											</td>
											<td className="px-4 py-3 font-semibold whitespace-nowrap">
												{currency} {amount.toFixed(2)}
											</td>
											<td className="px-4 py-3">
												<span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor[status] ?? ""}`}>
													{t(`filters.${status}` as Parameters<typeof t>[0])}
												</span>
											</td>
											<td className="px-4 py-3 text-on-surface-variant whitespace-nowrap text-xs">
												{createdAt
													? createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
													: "—"}
											</td>
											<td className="px-4 py-3">
												{status === "success" && (
													<button
														type="button"
														onClick={() => handleRefund(id)}
														disabled={isRefunding || refundMutation.isPending}
														className="text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-40 transition"
													>
														{isRefunding ? t("refunding") : t("refund")}
													</button>
												)}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>

					{pagination && pagination.totalPages > 1 && (
						<div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant bg-surface-container">
							<button
								type="button"
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page <= 1}
								className="text-xs font-semibold text-on-surface-variant hover:text-on-surface disabled:opacity-40 transition"
							>
								{t("prev")}
							</button>
							<span className="text-xs text-on-surface-variant">
								{t("page", { page, total: pagination.totalPages })}
							</span>
							<button
								type="button"
								onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
								disabled={page >= pagination.totalPages}
								className="text-xs font-semibold text-on-surface-variant hover:text-on-surface disabled:opacity-40 transition"
							>
								{t("next")}
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

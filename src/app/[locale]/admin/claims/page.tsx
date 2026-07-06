"use client";

import { useQuery } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { getAdminClaims } from "@/app/actions";
import Loader from "@/components/Loader";

const FILTERS = ["all", "open", "under_review", "settled", "rejected"] as const;
type Filter = (typeof FILTERS)[number];

function statusClass(status: string) {
	if (status === "settled") return "bg-emerald-50 text-emerald-700";
	if (status === "rejected") return "bg-red-50 text-red-700";
	if (status === "under_review") return "bg-blue-50 text-blue-700";
	return "bg-yellow-50 text-yellow-700";
}

export default function AdminClaimsPage() {
	const t = useTranslations("AdminClaimsPage");
	const format = useFormatter();
	const [filter, setFilter] = useState<Filter>("all");

	const claimsQuery = useQuery({
		queryKey: ["adminClaims", filter],
		queryFn: () => getAdminClaims(filter === "all" ? undefined : filter),
	});

	const claims = (claimsQuery.data?.data as Record<string, unknown>[] | null) ?? [];

	return (
		<>
			<div className="mb-8">
				<span className="text-xs font-semibold uppercase tracking-widest text-[#FF5A2E] block mb-2">
					{t("badge")}
				</span>
				<h1 className="text-2xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
					{t("title")}
				</h1>
				<p className="text-on-surface-variant text-sm font-medium max-w-3xl">
					{t("description")}
				</p>
			</div>

			<div className="flex flex-wrap items-center gap-2 mb-6">
				{FILTERS.map((f) => (
					<button
						key={f}
						type="button"
						onClick={() => setFilter(f)}
						className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
							filter === f
								? "bg-[#FF5A2E] text-white"
								: "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
						}`}
					>
						{t(`filters.${f}`)}
					</button>
				))}
				<button
					type="button"
					onClick={() => claimsQuery.refetch()}
					disabled={claimsQuery.isFetching}
					className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-high text-on-surface rounded-xl text-xs font-semibold hover:bg-surface-container-highest transition-colors disabled:opacity-60"
				>
					<span className="material-symbols-outlined text-sm">sync</span>
					{claimsQuery.isFetching ? t("refreshing") : t("refresh")}
				</button>
			</div>

			{claimsQuery.isLoading ? (
				<Loader />
			) : !claimsQuery.data?.success ? (
				<p className="text-sm font-medium text-red-600 py-10 text-center">
					{claimsQuery.data?.error || t("loadError")}
				</p>
			) : claims.length === 0 ? (
				<div className="bg-surface-container-lowest rounded-2xl p-12 text-center shadow-sm">
					<span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-3">
						health_and_safety
					</span>
					<p className="text-on-surface-variant font-medium text-sm">{t("empty")}</p>
				</div>
			) : (
				<div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-outline-variant/10">
								{(["id", "promoter", "description", "amount", "status", "filed"] as const).map((col) => (
									<th
										key={col}
										className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-on-surface-variant"
									>
										{t(`table.${col}`)}
									</th>
								))}
							</tr>
						</thead>
						<tbody className="divide-y divide-outline-variant/10">
							{claims.map((claim) => {
								const id = String(claim.id);
								const promoter = claim.promoter as Record<string, unknown> | null;
								const filedAt = claim.created_at != null
									? format.dateTime(new Date(String(claim.created_at)), { dateStyle: "medium" })
									: "—";
								const status = String(claim.status ?? "open");
								return (
									<tr key={id} className="hover:bg-surface-container-low/50 transition-colors">
										<td className="px-4 py-3 font-mono text-xs text-on-surface-variant">
											{id.slice(-8).toUpperCase()}
										</td>
										<td className="px-4 py-3 text-on-surface">
											{String(promoter?.company_name ?? promoter?.contact_person ?? "—")}
										</td>
										<td className="px-4 py-3 text-on-surface-variant max-w-xs truncate">
											{String(claim.description ?? "—")}
										</td>
										<td className="px-4 py-3 text-on-surface font-medium">
											{claim.amount_claimed != null
												? `$${Number(claim.amount_claimed).toLocaleString()}`
												: "—"}
										</td>
										<td className="px-4 py-3">
											<span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass(status)}`}>
												{status.replace(/_/g, " ")}
											</span>
										</td>
										<td className="px-4 py-3 text-on-surface-variant">{filedAt}</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</>
	);
}

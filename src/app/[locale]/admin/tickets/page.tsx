"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getAdminTicketEvents } from "@/app/actions";

const FILTERS = ["all", "draft", "published", "closed", "cancelled"] as const;
type Filter = (typeof FILTERS)[number];

export default function AdminTicketsPage() {
	const t = useTranslations("AdminTicketsPage");
	const [filter, setFilter] = useState<Filter>("all");

	const { data: result, isLoading, refetch, isFetching } = useQuery({
		queryKey: ["adminTicketEvents", filter],
		queryFn: () => getAdminTicketEvents(filter === "all" ? undefined : filter),
	});

	const events = (result?.data as Record<string, unknown>[] | null) ?? [];

	const statusColor: Record<string, string> = {
		draft: "bg-surface-container text-on-surface-variant",
		published: "bg-emerald-100 text-emerald-800",
		closed: "bg-surface-container-high text-on-surface-variant",
		cancelled: "bg-red-100 text-red-700",
	};

	return (
		<div className="p-6 max-w-6xl mx-auto">
			<div className="flex items-start justify-between mb-8">
				<div>
					<p className="text-xs font-black uppercase tracking-widest text-[#FF5A30] mb-1">{t("badge")}</p>
					<h1 className="text-2xl font-black text-on-surface">{t("title")}</h1>
					<p className="text-sm text-on-surface-variant mt-1">{t("description")}</p>
				</div>
				<button
					type="button"
					onClick={() => refetch()}
					disabled={isFetching}
					className="text-sm font-semibold text-on-surface-variant hover:text-on-surface disabled:opacity-50 transition"
				>
					{isFetching ? "↻" : "↻"} Refresh
				</button>
			</div>

			{/* Filters */}
			<div className="flex gap-2 mb-6 flex-wrap">
				{FILTERS.map((f) => (
					<button
						key={f}
						type="button"
						onClick={() => setFilter(f)}
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

			{isLoading && (
				<div className="flex justify-center py-16">
					<div className="w-6 h-6 border-2 border-[#FF5A30] border-t-transparent rounded-full animate-spin" />
				</div>
			)}

			{!isLoading && events.length === 0 && (
				<div className="text-center py-16 text-on-surface-variant text-sm">No events found.</div>
			)}

			{!isLoading && events.length > 0 && (
				<div className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-outline-variant bg-surface-container">
								{["event", "promoter", "date", "sold", "status"].map((col) => (
									<th key={col} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
										{t(`table.${col}`)}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{events.map((ev) => {
								const raw = ev as Record<string, unknown>;
								const promoter = raw.promoter as Record<string, unknown> | null | undefined;
								const count = raw._count as Record<string, number> | undefined;
								const soldCount = count?.purchases ?? 0;
								const status = String(raw.status ?? "draft");
								const eventDate = raw.event_date ? new Date(String(raw.event_date)) : null;
								return (
									<tr key={String(raw.id)} className="border-b border-outline-variant last:border-0 hover:bg-surface-container/60">
										<td className="px-4 py-3">
											<p className="font-semibold">{String(raw.title)}</p>
											{!!(raw.venue || raw.city) && (
												<p className="text-xs text-on-surface-variant mt-0.5">
													{[raw.venue, raw.city].filter(Boolean).join(", ")}
												</p>
											)}
										</td>
										<td className="px-4 py-3 text-on-surface-variant">
											{promoter?.company_name ? String(promoter.company_name) : "—"}
										</td>
										<td className="px-4 py-3 text-on-surface-variant">
											{eventDate
												? eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
												: t("dateTBC")}
										</td>
										<td className="px-4 py-3 font-semibold">{soldCount}</td>
										<td className="px-4 py-3">
											<span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor[status] ?? ""}`}>
												{t(`filters.${status}` as Parameters<typeof t>[0])}
											</span>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}

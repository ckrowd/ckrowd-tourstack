"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { listTicketEvents, publishTicketEvent, closeTicketEvent } from "@/app/actions";
import PageTour from "@/components/PageTour";

export default function TicketsDashboardPage() {
	const t = useTranslations("TicketsDashboardPage");
	const { locale } = useParams<{ locale: string }>();
	const router = useRouter();
	const qc = useQueryClient();

	const { data: result, isLoading } = useQuery({
		queryKey: ["ticketEvents"],
		queryFn: listTicketEvents,
	});

	const publishMutation = useMutation({
		mutationFn: (id: string) => publishTicketEvent(id),
		onSuccess: (res) => {
			if (res.success) qc.invalidateQueries({ queryKey: ["ticketEvents"] });
		},
	});

	const closeMutation = useMutation({
		mutationFn: (id: string) => closeTicketEvent(id),
		onSuccess: (res) => {
			if (res.success) qc.invalidateQueries({ queryKey: ["ticketEvents"] });
		},
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
			<PageTour pageId="tickets" />
			<div className="flex items-start justify-between mb-8">
				<div>
					<p className="text-xs font-black uppercase tracking-widest text-[#FF5A2E] mb-1">
						{t("badge")}
					</p>
					<h1 className="text-2xl font-black text-on-surface">{t("title")}</h1>
					<p className="text-sm text-on-surface-variant mt-1">{t("description")}</p>
				</div>
				<button
					type="button"
					data-tour="tickets-create"
					onClick={() => router.push(`/${locale}/dashboard/tickets/create`)}
					className="bg-[#FF5A2E] text-white font-bold text-sm px-4 py-2.5 rounded-xl hover:opacity-90 transition"
				>
					{t("create")}
				</button>
			</div>

			{isLoading && (
				<div className="flex justify-center py-16">
					<div className="w-6 h-6 border-2 border-[#FF5A2E] border-t-transparent rounded-full animate-spin" />
				</div>
			)}

			{!isLoading && events.length === 0 && (
				<div className="text-center py-16 text-on-surface-variant text-sm">{t("empty")}</div>
			)}

			{!isLoading && events.length > 0 && (
				<div data-tour="tickets-list" className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-outline-variant bg-surface-container">
								{["event", "date", "location", "tiers", "sold", "status", "actions"].map((col) => (
									<th key={col} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
										{t(`table.${col}`)}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{events.map((ev) => {
								const raw = ev as Record<string, unknown>;
								const tiers = (raw.tiers as Record<string, unknown>[]) ?? [];
								const count = raw._count as Record<string, number> | undefined;
								const soldCount = count?.purchases ?? 0;
								const status = String(raw.status ?? "draft");
								const eventDate = raw.event_date ? new Date(String(raw.event_date)) : null;
								return (
									<tr key={String(raw.id)} className="border-b border-outline-variant last:border-0 hover:bg-surface-container/60 transition">
										<td className="px-4 py-3 font-semibold">{String(raw.title)}</td>
										<td className="px-4 py-3 text-on-surface-variant">
											{eventDate
												? eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
												: t("dateTBC")}
										</td>
										<td className="px-4 py-3 text-on-surface-variant">
											{[raw.venue, raw.city].filter(Boolean).join(", ") || t("locationTBC")}
										</td>
										<td className="px-4 py-3 text-on-surface-variant">{tiers.length}</td>
										<td className="px-4 py-3 font-semibold">{soldCount}</td>
										<td className="px-4 py-3">
											<span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor[status] ?? ""}`}>
												{t(`status.${status}` as Parameters<typeof t>[0])}
											</span>
										</td>
										<td className="px-4 py-3">
											<div className="flex gap-2">
												<button
													type="button"
													onClick={() => router.push(`/${locale}/dashboard/tickets/${String(raw.id)}`)}
													className="text-xs font-semibold text-[#FF5A2E] hover:underline"
												>
													{t("actions.manage")}
												</button>
												{status === "draft" && (
													<button
														type="button"
														disabled={publishMutation.isPending}
														onClick={() => publishMutation.mutate(String(raw.id))}
														className="text-xs font-semibold text-emerald-600 hover:underline disabled:opacity-50"
													>
														{t("actions.publish")}
													</button>
												)}
												{status === "published" && (
													<button
														type="button"
														disabled={closeMutation.isPending}
														onClick={() => closeMutation.mutate(String(raw.id))}
														className="text-xs font-semibold text-on-surface-variant hover:underline disabled:opacity-50"
													>
														{t("actions.close")}
													</button>
												)}
											</div>
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

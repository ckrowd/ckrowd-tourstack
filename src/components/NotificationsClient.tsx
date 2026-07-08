"use client";

import { useQuery } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { getEOIs } from "@/app/actions";
import Loader from "@/components/Loader";
import { useSession } from "@/context/AuthContext";
import { Link } from "@/i18n/routing";

const STATUS_META: Record<string, { icon: string; color: string; labelKey: string }> = {
	approved: { icon: "task_alt", color: "text-emerald-500", labelKey: "notif.statusApproved" },
	rejected: { icon: "cancel", color: "text-red-500", labelKey: "notif.statusRejected" },
	needs_revision: { icon: "edit_note", color: "text-[#FF5A2E]", labelKey: "notif.statusNeedsRevision" },
	pending_review: { icon: "schedule", color: "text-blue-500", labelKey: "notif.statusPendingReview" },
};

export default function NotificationsClient() {
	const t = useTranslations("NotificationsPage");
	const tNav = useTranslations("TopNav");
	const format = useFormatter();
	const { data: session } = useSession();

	const eoisQuery = useQuery({
		queryKey: ["eois"],
		queryFn: () => getEOIs(),
		enabled: Boolean(session?.user),
	});

	const notifications = (eoisQuery.data?.data ?? []).map((eoi) => {
		const status = String(eoi.status ?? "pending_review");
		const meta = STATUS_META[status] ?? { icon: "notifications", color: "text-slate-400", labelKey: "notif.eoiFallback" };
		return {
			id: String(eoi.id),
			icon: meta.icon,
			color: meta.color,
			title: String(eoi.artist?.name ?? tNav("notif.eoiFallback")),
			body: tNav(meta.labelKey as Parameters<typeof tNav>[0]),
			date: eoi.created_at ? new Date(String(eoi.created_at)) : null,
			href: (status === "needs_revision" ? "/eoi" : "/tours") as "/eoi" | "/tours",
		};
	});

	return (
		<main className="flex-1 lg:ml-64 bg-surface p-6 md:p-10">
			<div className="mb-8">
				<Link
					href="/dashboard"
					className="inline-flex items-center gap-1 text-xs font-semibold text-on-surface-variant hover:text-[#FF5A2E] transition-colors mb-3"
				>
					<span className="material-symbols-outlined text-sm">arrow_back</span>
					{t("backToDashboard")}
				</Link>
				<h1 className="font-(family-name:--font-manrope) text-3xl font-black text-on-surface">
					{t("title")}
				</h1>
				<p className="text-on-surface-variant text-sm mt-1">{t("subtitle")}</p>
			</div>

			{eoisQuery.isLoading ? (
				<Loader />
			) : notifications.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-24 text-on-surface-variant text-center">
					<span className="material-symbols-outlined text-5xl mb-4 text-on-surface-variant/40">
						notifications_off
					</span>
					<p className="font-semibold text-lg">{t("empty")}</p>
					<p className="text-sm mt-1">{t("emptyHint")}</p>
				</div>
			) : (
				<div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden max-w-2xl">
					<ul className="divide-y divide-outline-variant/10">
						{notifications.map((n) => (
							<li key={n.id}>
								<Link
									href={n.href}
									className="flex items-start gap-4 px-6 py-5 hover:bg-surface-container-low transition-colors"
								>
									<span className={`material-symbols-outlined text-xl mt-0.5 shrink-0 ${n.color}`}>
										{n.icon}
									</span>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-semibold text-on-surface">{n.title}</p>
										<p className="text-xs text-on-surface-variant mt-0.5">{n.body}</p>
									</div>
									{n.date && (
										<span className="text-[11px] text-on-surface-variant font-medium shrink-0 mt-0.5 whitespace-nowrap">
											{format.relativeTime(n.date)}
										</span>
									)}
								</Link>
							</li>
						))}
					</ul>
				</div>
			)}
		</main>
	);
}

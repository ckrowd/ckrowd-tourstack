"use client";

import { useQuery } from "@tanstack/react-query";
import Icon from "@/components/icons";
import { useFormatter, useTranslations } from "next-intl";
import { getEOIs } from "@/app/actions";
import Loader from "@/components/Loader";
import PageHero from "@/components/PageHero";
import EmptyState from "@/components/ui/EmptyState";
import { useSession } from "@/context/AuthContext";
import { Link } from "@/i18n/routing";

const STATUS_META: Record<string, { icon: string; color: string; labelKey: string }> = {
	approved: { icon: "check-circle", color: "text-emerald-500", labelKey: "notif.statusApproved" },
	rejected: { icon: "x", color: "text-red-500", labelKey: "notif.statusRejected" },
	needs_revision: { icon: "edit", color: "text-primary", labelKey: "notif.statusNeedsRevision" },
	pending_review: { icon: "clock", color: "text-blue-500", labelKey: "notif.statusPendingReview" },
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
		const meta = STATUS_META[status] ?? { icon: "bell", color: "text-slate-400", labelKey: "notif.eoiFallback" };
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
		<main className="flex-1 lg:ml-64 bg-surface p-6 md:px-10 md:pt-5 md:pb-10">
			<Link
				href="/dashboard"
				className="inline-flex items-center gap-1 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors mb-3"
			>
				<Icon name="arrow-left" size={14} />
				{t("backToDashboard")}
			</Link>
			<PageHero title={t("title")} description={t("subtitle")} />

			{eoisQuery.isLoading ? (
				<Loader />
			) : notifications.length === 0 ? (
				<div className="rounded-2xl border border-outline-variant/60">
					<EmptyState icon="bell-off" title={t("empty")} description={t("emptyHint")} />
				</div>
			) : (
				<div className="tsd-card overflow-hidden max-w-2xl">
					<ul className="divide-y divide-outline-variant/10">
						{notifications.map((n) => (
							<li key={n.id}>
								<Link
									href={n.href}
									className="flex items-start gap-4 px-6 py-5 hover:bg-surface-container-low transition-colors"
								>
									<Icon name={n.icon} size={20} className={`mt-0.5 shrink-0 ${n.color}`} />
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

import { getTranslations, setRequestLocale } from "next-intl/server";
import { getTour, getTourMilestones } from "@/app/actions";
import AITourScorePanel from "@/components/AITourScorePanel";
import TourReportForm from "@/components/TourReportForm";
import Icon from "@/components/icons";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import StatusBadge, { type StatusTone } from "@/components/ui/StatusBadge";
import { Link } from "@/i18n/routing";

function tourStatusToTone(status: string): StatusTone {
	switch (status) {
		case "confirmed":
			return "approved";
		case "rejected":
			return "rejected";
		case "needs_revision":
		case "needs revision":
			return "contacted";
		default:
			return "pending";
	}
}

export default async function TourDetailPage({
	params,
}: {
	params: Promise<{ id: string; locale: string }>;
}) {
	const { id, locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("TourDetailPage");

	const [tourResult, milestonesResult] = await Promise.all([
		getTour(id),
		getTourMilestones(id),
	]);

	const tour = tourResult.data;
	const milestones = milestonesResult.data ?? [];
	const status = String(tour?.status ?? "pending").toLowerCase();

	return (
		<div className="bg-surface text-on-surface">
			<TopNav />
			<div className="flex pt-16">
				<SideNav />
				<main className="flex-1 lg:ml-64 bg-surface p-6 md:p-10">
					<div className="w-full space-y-8">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<div>
								<p className="text-xs font-semibold uppercase tracking-widest text-primary">
									{t("tagline")}
								</p>
								<h1 className="text-3xl font-(family-name:--font-manrope) font-extrabold text-on-surface mt-1">
									{tour?.artist?.name
										? String(tour.artist.name)
										: t("defaultTitle")}
								</h1>
							</div>
							<Link
								href="/tours"
								className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-variant/30 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low"
							>
								<Icon name="arrow-left" size={15} />
								{t("actions.back")}
							</Link>
						</div>

						{!tourResult.success || !tour ? (
							<div className="bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-300 rounded-2xl p-6 text-sm font-medium">
								{tourResult.error ?? t("errors.load")}
							</div>
						) : (
							<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
								<section className="lg:col-span-8 bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant space-y-5">
									<div className="flex items-start justify-between gap-3">
										<div>
											<h2 className="text-xl font-(family-name:--font-manrope) font-semibold">
												{String(
													tour.tour_name ??
														tour.artist?.tour_name ??
														t("defaultTourName"),
												)}
											</h2>
											<p className="text-sm text-on-surface-variant mt-1">
												{String(tour.artist?.genre ?? "")}
											</p>
										</div>
										<StatusBadge tone={tourStatusToTone(status)}>
											{String(tour.status ?? "pending").replace(/_/g, " ")}
										</StatusBadge>
									</div>

									<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
										<div className="bg-surface-container-low rounded-xl p-3">
											<p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
												{t("fields.city")}
											</p>
											<p className="text-sm font-semibold mt-1">
												{String(tour.city ?? "-")}
											</p>
										</div>
										<div className="bg-surface-container-low rounded-xl p-3">
											<p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
												{t("fields.venue")}
											</p>
											<p className="text-sm font-semibold mt-1">
												{String(tour.venue ?? "-")}
											</p>
										</div>
										<div className="bg-surface-container-low rounded-xl p-3">
											<p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
												{t("fields.date")}
											</p>
											<p className="text-sm font-semibold mt-1">
												{tour.date
													? new Date(tour.date).toLocaleDateString(locale, {
															month: "short",
															day: "numeric",
															year: "numeric",
														})
													: "-"}
											</p>
										</div>
										<div className="bg-surface-container-low rounded-xl p-3">
											<p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
												{t("fields.fee")}
											</p>
											<p className="text-sm font-semibold mt-1">
												{tour.fee_usd != null
													? `$${Number(tour.fee_usd).toLocaleString()}`
													: "-"}
											</p>
										</div>
										<div className="bg-surface-container-low rounded-xl p-3">
											<p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
												{t("fields.capacity")}
											</p>
											<p className="text-sm font-semibold mt-1">
												{tour.capacity != null
													? Number(tour.capacity).toLocaleString()
													: "-"}
											</p>
										</div>
										<div className="bg-surface-container-low rounded-xl p-3">
											<p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
												{t("fields.ticketsSold")}
											</p>
											<p className="text-sm font-semibold mt-1">
												{tour.tickets_sold != null
													? Number(tour.tickets_sold).toLocaleString()
													: "-"}
											</p>
										</div>
									</div>
								</section>

								{/* AI Tour Success Score */}
								{tour.eoi_id && (
									<section className="lg:col-span-12 bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant">
										<div className="flex items-center gap-2 mb-4">
											<Icon name="ai" size={20} className="text-primary" />
											<h3 className="text-base font-(family-name:--font-manrope) font-semibold">
												{t("aiScore.title")}
											</h3>
										</div>
										<AITourScorePanel eoiId={String(tour.eoi_id)} />
									</section>
								)}

								{/* Post-event report for completed tours */}
								{status === "completed" && (
									<section className="lg:col-span-12 bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant">
										<h3 className="text-base font-(family-name:--font-manrope) font-semibold mb-1">
											{t("report.title")}
										</h3>
										<p className="text-sm text-on-surface-variant mb-4">{t("report.description")}</p>
										<TourReportForm tourId={id} />
									</section>
								)}

								<section className="lg:col-span-4 lg:sticky lg:top-24 self-start bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant">
									<h3 className="text-base font-(family-name:--font-manrope) font-semibold mb-4">
										{t("milestones.title")}
									</h3>
									{!milestonesResult.success ? (
										<p className="text-sm text-rose-600 dark:text-rose-300">
											{milestonesResult.error ?? t("errors.milestones")}
										</p>
									) : milestones.length === 0 ? (
										<p className="text-sm text-on-surface-variant">
											{t("milestones.empty")}
										</p>
									) : (
										<div className="space-y-3">
											{milestones.map((m) => (
												<div
													key={String(m.id)}
													className="rounded-xl bg-surface-container-low p-3"
												>
													<p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
														{String(m.type ?? "milestone")}
													</p>
													<p className="text-sm font-semibold mt-1">
														{String(m.label ?? "")}
													</p>
													<p className="text-xs text-on-surface-variant mt-1">
														{m.date
															? new Date(String(m.date)).toLocaleDateString(
																	locale,
																	{
																		month: "short",
																		day: "numeric",
																		year: "numeric",
																	},
																)
															: "-"}
													</p>
												</div>
											))}
										</div>
									)}
								</section>
							</div>
						)}
					</div>
				</main>
			</div>
		</div>
	);
}

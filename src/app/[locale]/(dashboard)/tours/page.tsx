import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getEOIs, getTours, getTourstackDashboard } from "@/app/actions";
import PageTour from "@/components/PageTour";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import Button from "@/components/ui/Button";
import StatusBadge, { type StatusTone } from "@/components/ui/StatusBadge";
import { Link } from "@/i18n/routing";

const PAGE_SIZE = 8;

function tourStatusToTone(statusLower: string): StatusTone {
	switch (statusLower) {
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

function getDaysAway(date: Date | null | undefined): number | null {
	return date ? Math.round((date.getTime() - Date.now()) / 86400000) : null;
}

type Props = {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ page?: string; status?: string }>;
};

export default async function ToursPage({ params, searchParams }: Props) {
	const { locale } = await params;
	const { page: pageParam, status } = await searchParams;
	setRequestLocale(locale);
	const t = await getTranslations("ToursPage");

	const currentPage = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

	const [toursResult, dashboardResult, eoisResult, allToursResult] = await Promise.all([
		getTours(status, currentPage, PAGE_SIZE),
		getTourstackDashboard(),
		getEOIs(),
		getTours(undefined, 1, 999),
	]);
	const tours = toursResult.data ?? [];
	const allTours = allToursResult.data ?? [];
	// EOIs still in the pipeline — not yet turned into a tour stop.
	const pendingEois = (eoisResult.data ?? []).filter((eoi) => {
		const eoiStatus = String(eoi.status ?? "").toLowerCase();
		return eoiStatus === "pending_review" || eoiStatus === "needs_revision";
	});
	const pagination = toursResult.pagination;
	const totalPages = pagination?.totalPages ?? 1;

	const dashData = dashboardResult.data;
	const stats = dashData?.stats;
	const upcomingMilestones = (dashData?.upcomingMilestones ?? []).map((m) => {
		const mType = String(m.type ?? "");
		return {
			date: new Date(String(m.date)).toLocaleDateString(locale, {
				month: "short",
				day: "numeric",
			}),
			label: String(m.label ?? ""),
			type: mType,
			icon:
				mType === "show"
					? "celebration"
					: mType === "call"
						? "call"
						: mType === "payment"
							? "payments"
							: "gavel",
			color:
				mType === "show"
					? "bg-[#FF5A2E]/10 text-[#FF5A2E]"
					: mType === "call"
						? "bg-blue-100 text-blue-600"
						: mType === "payment"
							? "bg-emerald-100 text-emerald-700"
							: "bg-yellow-100 text-yellow-700",
		};
	});
	const venueMap = new Map<
		string,
		{ label: string; cap: string; shows: number }
	>();
	for (const tour of allTours) {
		const key = String(tour.venue ?? tour.city ?? t("unknownVenue"));
		const cap =
			tour.capacity != null
				? Number(tour.capacity).toLocaleString(locale)
				: "—";
		const existing = venueMap.get(key);
		if (existing) {
			existing.shows++;
		} else {
			venueMap.set(key, { label: key, cap, shows: 1 });
		}
	}
	const venueSummary = Array.from(venueMap.values()).slice(0, 5);

	// Tour-record counts — used as a fallback when live dashboard stats are
	// unavailable.
	const confirmedTours = allTours.filter(
		(tour) => String(tour.status ?? "").toLowerCase() === "confirmed",
	);
	const inProgressTours = allTours.filter((tour) =>
		[
			"under_review",
			"needs_revision",
			"under review",
			"needs revision",
		].includes(String(tour.status ?? "").toLowerCase()),
	);
	const rejectedTours = allTours.filter(
		(tour) => String(tour.status ?? "").toLowerCase() === "rejected",
	);

	// Live pipeline metrics — prefer the backend-computed dashboard stats so the
	// summary reflects EOIs in the pipeline, not just approved tour records.
	const totalStops =
		stats?.totalEOIs ?? allToursResult.pagination?.total ?? allTours.length;
	const confirmedCount = stats?.approvedEOIs ?? confirmedTours.length;
	const inProgressCount =
		stats != null
			? (stats.pendingEOIs ?? 0) + (stats.needsRevisionEOIs ?? 0)
			: inProgressTours.length;
	const rejectedCount = stats?.rejectedEOIs ?? rejectedTours.length;

	function pageHref(p: number) {
		const sp = new URLSearchParams();
		sp.set("page", String(p));
		if (status) sp.set("status", status);
		return `/tours?${sp.toString()}`;
	}

	const pageWindow = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
		(p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2,
	);

	return (
		<div className="bg-surface text-on-surface">
			<TopNav />
			<PageTour pageId="tours" />

			<div className="flex pt-16">
				<SideNav />

				<main className="flex-1 lg:ml-64 bg-surface p-6 md:p-10">
					{/* Header */}
					<div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
						<div>
							<span className="text-xs font-semibold uppercase tracking-widest text-[#FF5A2E] block mb-2">
								{t("promoterPortal")}
							</span>
							<h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
								{t("title")}
							</h1>
							<p className="text-on-surface-variant font-medium">
								{t("description")}
							</p>
						</div>
						<Button href="/eoi" className="self-start md:self-auto shadow-lg shadow-primary/20">
							<span className="material-symbols-outlined text-sm">add</span>
							{t("newTourStop")}
						</Button>
					</div>

					{/* Summary strip */}
					<div data-tour="tours-stats" className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10">
						{[
							{
								label: t("stats.totalStops"),
								value: totalStops.toString(),
								color: "border-[#FF5A2E]",
							},
							{
								label: t("stats.confirmed"),
								value: confirmedCount.toString(),
								color: "border-emerald-400",
							},
							{
								label: t("stats.inProgress"),
								value: inProgressCount.toString(),
								color: "border-yellow-400",
							},
							{
								label: t("stats.rejected"),
								value: rejectedCount.toString(),
								color: "border-red-400",
							},
						].map((s) => (
							<div
								key={s.label}
								className={`bg-surface-container-lowest rounded-xl p-4 md:p-5 shadow-sm border-l-4 ${s.color}`}
							>
								<p className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
									{s.label}
								</p>
								<p className="text-2xl md:text-3xl font-black font-(family-name:--font-manrope) text-on-surface">
									{s.value}
								</p>
							</div>
						))}
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
						{/* Pipeline + Tour Cards */}
						<div className="lg:col-span-8 space-y-5">
							{pendingEois.length > 0 && (
								<section data-tour="tours-pipeline" className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
									<div className="mb-4">
										<h2 className="font-(family-name:--font-manrope) font-semibold text-lg text-on-surface">
											{t("pendingEois.title")}
										</h2>
										<p className="text-sm text-on-surface-variant mt-0.5">
											{t("pendingEois.description")}
										</p>
									</div>
									<div className="space-y-3">
										{pendingEois.map((eoi) => {
											const eoiArtist = eoi.artist;
											const eoiStatus = String(eoi.status ?? "");
											const isRevision =
												eoiStatus.toLowerCase() === "needs_revision";
											return (
												<div
													key={String(eoi.id)}
													className={`bg-surface-container-low rounded-xl p-5 border-l-4 ${
														isRevision
															? "border-blue-400"
															: "border-yellow-400"
													}`}
												>
													<div className="flex items-start justify-between gap-4">
														<div className="min-w-0">
															<div className="flex items-center gap-2 flex-wrap">
																<h3 className="font-(family-name:--font-manrope) font-semibold text-on-surface">
																	{String(eoiArtist?.name ?? "Artist")}
																</h3>
																{eoiArtist?.genre != null &&
																	eoiArtist.genre !== "" && (
																		<span className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
																			{String(eoiArtist.genre)}
																		</span>
																	)}
															</div>
															{eoiArtist?.tour_name != null &&
																eoiArtist.tour_name !== "" && (
																	<p className="text-sm text-on-surface-variant mt-0.5">
																		{String(eoiArtist.tour_name)}
																	</p>
																)}
														</div>
														<span
															className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shrink-0 ${
																isRevision
																	? "bg-blue-100 text-blue-800"
																	: "bg-yellow-100 text-yellow-800"
															}`}
														>
															{eoiStatus.replace(/_/g, " ")}
														</span>
													</div>
													<div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-on-surface-variant mt-3">
														{eoi.city != null && eoi.city !== "" && (
															<span className="flex items-center gap-1.5">
																<span className="material-symbols-outlined text-sm">
																	location_on
																</span>
																{String(eoi.city)}
															</span>
														)}
														{eoi.created_at != null && (
															<span className="flex items-center gap-1.5">
																<span className="material-symbols-outlined text-sm">
																	schedule
																</span>
																{t("pendingEois.submitted")}{" "}
																{new Date(
																	String(eoi.created_at),
																).toLocaleDateString(locale, {
																	month: "short",
																	day: "numeric",
																	year: "numeric",
																})}
															</span>
														)}
														{isRevision && (
															<Link
																href="/eoi"
																className="flex items-center gap-1.5 text-[#FF5A2E] font-semibold"
															>
																<span className="material-symbols-outlined text-sm">
																	edit
																</span>
																{t("reviseEoi")}
															</Link>
														)}
													</div>
												</div>
											);
										})}
									</div>
								</section>
							)}
							{tours.length === 0 ? (
								<div data-tour="tours-list" className="bg-surface-container-lowest rounded-2xl p-12 text-center shadow-sm">
									<span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-4">
										confirmation_number
									</span>
									<h3 className="font-(family-name:--font-manrope) font-semibold text-on-surface text-lg mb-2">
										{t("noStops")}
									</h3>
									<p className="text-on-surface-variant text-sm max-w-xs mx-auto mb-6">
										{t("noStopsDesc")}
									</p>
									<Button href="/eoi">
										<span className="material-symbols-outlined text-sm">
											add
										</span>
										{t("submitEoi")}
									</Button>
								</div>
							) : (
								<>
									{tours.map((tour) => {
										const tourArtist = tour.artist;
										const ticketsSold =
											typeof tour.tickets_sold === "number"
												? tour.tickets_sold
												: 0;
										const capacity =
											typeof tour.capacity === "number" ? tour.capacity : 0;
										const soldPct =
											ticketsSold > 0 && capacity > 0
												? Math.round((ticketsSold / capacity) * 100)
												: 0;
										const tourStatus = String(tour.status ?? "");
										const statusLower = tourStatus.toLowerCase();
										const daysAway = getDaysAway(tour.date);

										return (
											<div
												key={String(tour.id)}
												className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-transparent hover:border-outline-variant/20 hover:shadow-lg transition-all duration-300"
											>
												<div className="flex flex-col sm:flex-row">
													{/* Image */}
													<div className="sm:w-36 h-36 relative shrink-0 bg-surface-container-high flex items-center justify-center">
														{tourArtist?.image_url ? (
															<>
																<Image
																	src={String(tourArtist.image_url)}
																	alt={String(tourArtist.name ?? "")}
																	fill
																	className="object-cover"
																/>
																<div className="absolute inset-0 bg-linear-to-r from-black/20 to-transparent sm:bg-linear-to-b sm:from-transparent sm:to-black/30" />
															</>
														) : (
															<span className="material-symbols-outlined text-3xl text-on-surface-variant">
																music_note
															</span>
														)}
													</div>

													{/* Content */}
													<div className="flex-1 p-6 flex flex-col gap-3">
														<div className="flex items-start justify-between gap-4">
															<div>
																<div className="flex items-center gap-2 flex-wrap">
																	<h3 className="font-(family-name:--font-manrope) font-extrabold text-lg text-on-surface">
																		{String(tourArtist?.name ?? "Artist")}
																	</h3>
																	{tourArtist?.genre != null &&
																		tourArtist.genre !== "" && (
																			<span className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
																				{String(tourArtist.genre)}
																			</span>
																		)}
																</div>
																<p className="text-sm text-on-surface-variant mt-0.5">
																	{String(
																		tour.tour_name ?? tourArtist?.tour_name ?? "",
																	)}
																</p>
															</div>
															<StatusBadge tone={tourStatusToTone(statusLower)} className="shrink-0">
																{tourStatus.replace(/_/g, " ")}
															</StatusBadge>
														</div>

														<div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-on-surface-variant">
															{tour.city != null && tour.city !== "" && (
																<span className="flex items-center gap-1.5">
																	<span className="material-symbols-outlined text-sm">
																		location_on
																	</span>
																	{String(tour.city)}
																</span>
															)}
															{tour.date != null && (
																<span className="flex items-center gap-1.5">
																	<span className="material-symbols-outlined text-sm">
																		event
																	</span>
																	{tour.date.toLocaleDateString(locale, {
																		month: "short",
																		day: "numeric",
																		year: "numeric",
																	})}
																</span>
															)}
															{tour.fee_usd != null && (
																<span className="flex items-center gap-1.5">
																	<span className="material-symbols-outlined text-sm">
																		monetization_on
																	</span>
																	${Number(tour.fee_usd).toLocaleString(locale)}
																</span>
															)}
															{tour.financing != null && (
																<span className="flex items-center gap-1.5 text-[#FF5A2E] font-semibold">
																	<span className="material-symbols-outlined text-sm">
																		account_balance
																	</span>
																	{t("financed")}
																	{tour.financing_amount
																		? ` · $${Number(tour.financing_amount).toLocaleString(locale)}`
																		: ""}
																</span>
															)}
														</div>

														{statusLower === "confirmed" && capacity > 0 && (
															<div className="mt-1">
																<div className="flex justify-between text-xs text-on-surface-variant mb-1">
																	<span>{t("ticketsSold")}</span>
																	<span className="font-semibold text-on-surface">
																		{ticketsSold.toLocaleString(locale)} /{" "}
																		{capacity.toLocaleString(locale)}
																	</span>
																</div>
																<div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
																	<div
																		className="bg-[#FF5A2E] h-full rounded-full transition-all"
																		style={{ width: `${soldPct}%` }}
																	/>
																</div>
															</div>
														)}

														<div className="flex items-center justify-between mt-auto pt-1">
															{daysAway != null ? (
																daysAway > 0 ? (
																	<span className="text-xs text-on-surface-variant">
																		<span className="font-semibold text-on-surface">
																			{daysAway}
																			{t("daysLetter")}
																		</span>{" "}
																		{t("untilShow")}
																	</span>
																) : daysAway < 0 ? (
																	<span className="text-xs text-on-surface-variant">
																		{t("showPassed", {
																			days: Math.abs(daysAway),
																		})}
																	</span>
																) : (
																	<span className="text-xs font-semibold text-[#FF5A2E]">
																		{t("showDay")}
																	</span>
																)
															) : (
																<span />
															)}

															<div className="flex items-center gap-2">
																{(statusLower === "needs_revision" ||
																	statusLower === "needs revision") && (
																	<Link
																		href="/eoi"
																		className="text-xs font-semibold text-[#FF5A2E] border border-[#FF5A2E]/30 px-3 py-1.5 rounded-lg hover:bg-[#FF5A2E]/5 transition-colors"
																	>
																		{t("reviseEoi")}
																	</Link>
																)}
																<Link
																	href={`/tours/${String(tour.id)}`}
																	className="text-xs font-semibold text-on-surface-variant border border-outline-variant/30 px-3 py-1.5 rounded-lg hover:bg-surface-container-low transition-colors"
																>
																	{t("viewDetails")}
																</Link>
															</div>
														</div>
													</div>
												</div>
											</div>
										);
									})}

									{totalPages > 1 && (
										<div className="flex items-center justify-between pt-4">
											<Link
												href={pageHref(currentPage - 1)}
												aria-disabled={currentPage <= 1}
												className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
													currentPage <= 1
														? "pointer-events-none text-on-surface-variant/40"
														: "text-on-surface-variant hover:bg-surface-container-lowest"
												}`}
											>
												<span className="material-symbols-outlined text-sm">chevron_left</span>
												{t("pagination.previous")}
											</Link>

											<div className="flex items-center gap-1">
												{pageWindow.map((p, i) => {
													const prev = pageWindow[i - 1];
													const showEllipsis = prev != null && p - prev > 1;
													return (
														<span key={p} className="flex items-center gap-1">
															{showEllipsis && (
																<span className="px-2 text-on-surface-variant text-sm select-none">
																	…
																</span>
															)}
															<Link
																href={pageHref(p)}
																className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
																	p === currentPage
																		? "bg-[#FF5A2E] text-white shadow-sm"
																		: "text-on-surface-variant hover:bg-surface-container-lowest"
																}`}
															>
																{p}
															</Link>
														</span>
													);
												})}
											</div>

											<Link
												href={pageHref(currentPage + 1)}
												aria-disabled={currentPage >= totalPages}
												className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
													currentPage >= totalPages
														? "pointer-events-none text-on-surface-variant/40"
														: "text-on-surface-variant hover:bg-surface-container-lowest"
												}`}
											>
												{t("pagination.next")}
												<span className="material-symbols-outlined text-sm">chevron_right</span>
											</Link>
										</div>
									)}
								</>
							)}
						</div>

						{/* Sidebar: Milestones */}
						<aside className="lg:col-span-4 space-y-6">
							{upcomingMilestones.length > 0 && (
								<div className="bg-surface-container-lowest rounded-2xl p-7 shadow-sm">
									<h3 className="font-(family-name:--font-manrope) font-semibold text-base mb-6">
										{t("upcomingMilestones")}
									</h3>
									<div className="space-y-4">
										{upcomingMilestones.map((m) => (
											<div
												key={`${m.date}-${m.label}`}
												className="flex items-start gap-4"
											>
												<div
													className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${m.color}`}
												>
													<span
														className="material-symbols-outlined text-sm"
														style={{ fontVariationSettings: "'FILL' 1" }}
													>
														{m.icon}
													</span>
												</div>
												<div>
													<p className="text-sm font-semibold text-on-surface leading-snug">
														{m.label}
													</p>
													<p className="text-xs text-on-surface-variant mt-0.5">
														{m.date}
													</p>
												</div>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Venue snapshot */}
							{venueSummary.length > 0 && (
								<div className="bg-surface-container-lowest rounded-2xl p-7 shadow-sm">
									<h3 className="font-(family-name:--font-manrope) font-semibold text-base mb-5">
										{t("venueSummary")}
									</h3>
									<div className="space-y-3">
										{venueSummary.map((v) => (
											<div
												key={v.label}
												className="flex items-center gap-3 py-2 border-b border-outline-variant/10 last:border-0"
											>
												<span
													className="material-symbols-outlined text-[#FF5A2E]"
													style={{ fontVariationSettings: "'FILL' 1" }}
												>
													stadium
												</span>
												<div className="flex-1 min-w-0">
													<p className="text-sm font-semibold text-on-surface truncate">
														{v.label}
													</p>
													<p className="text-xs text-on-surface-variant">
														{t("cap")}: {v.cap} · {v.shows} {t("showSingle")}
													</p>
												</div>
											</div>
										))}
									</div>
								</div>
							)}

							{/* CTA */}
							<Link
								href="/financing"
								className="flex items-center gap-4 bg-linear-to-br from-[#FF5A2E] to-[#cc4826] text-white p-6 rounded-2xl shadow-lg shadow-[#FF5A2E]/20 hover:scale-[1.02] transition-transform"
							>
								<span
									className="material-symbols-outlined text-2xl"
									style={{ fontVariationSettings: "'FILL' 1" }}
								>
									account_balance_wallet
								</span>
								<div>
									<p className="font-(family-name:--font-manrope) font-semibold text-sm">
										{t("ctaFinancingTitle")}
									</p>
									<p className="text-xs text-orange-100 mt-0.5">
										{t("ctaFinancingDesc")}
									</p>
								</div>
								<span className="material-symbols-outlined ml-auto">
									arrow_forward
								</span>
							</Link>
						</aside>
					</div>
				</main>
			</div>
		</div>
	);
}

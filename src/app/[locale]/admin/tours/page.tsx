import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAdminTours } from "@/app/actions";
import TourActionsMenu from "@/components/TourActionsMenu";
import { Link } from "@/i18n/routing";
import PageTour from "@/components/PageTour";

const PAGE_SIZE = 10;

export default async function AdminToursPage({
	params,
	searchParams,
}: {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ page?: string; status?: string }>;
}) {
	const { locale } = await params;
	const { page: pageParam, status } = await searchParams;
	setRequestLocale(locale);
	const t = await getTranslations("AdminToursPage");

	const currentPage = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
	const toursResult = await getAdminTours(status, currentPage, PAGE_SIZE);
	const tourProjects = toursResult.data ?? [];
	const pagination = toursResult.pagination;
	const totalPages = pagination?.totalPages ?? 1;

	function pageHref(p: number) {
		const sp = new URLSearchParams();
		sp.set("page", String(p));
		if (status) sp.set("status", status);
		return `/admin/tours?${sp.toString()}`;
	}

	const pageWindow = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
		(p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2,
	);

	return (
		<>
			<PageTour pageId="admin-tours" />
			<div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
				<div>
					<span className="text-xs font-semibold uppercase tracking-widest text-[#FF5A2E] block mb-2">
						{t("badge")}
					</span>
					<h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
						{t("title")}
					</h1>
					<p className="text-on-surface-variant font-medium">
						{t("description")}
					</p>
				</div>
				<Link
					href="/admin/tours/create"
					className="flex items-center gap-2 px-6 py-3 bg-[#FF5A2E] text-white rounded-xl font-(family-name:--font-manrope) font-semibold shadow-lg shadow-[#FF5A2E]/20 hover:scale-[1.02] transition-transform active:scale-95 shrink-0"
				>
					<span className="material-symbols-outlined">add</span>
					{t("createTour")}
				</Link>
			</div>

			<div data-tour="admin-tours-list" className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
				<div className="flex items-center justify-between mb-5">
					<h3 className="font-(family-name:--font-manrope) font-semibold text-lg">
						{t("allTours")}
					</h3>
					{pagination && (
						<p className="text-sm text-on-surface-variant">
							{t("pagination.total", { count: pagination.total })}
						</p>
					)}
				</div>

				<div className="space-y-4">
					{tourProjects.length === 0 && (
						<div className="bg-surface-container-low rounded-2xl p-12 text-center">
							<span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-4">
								confirmation_number
							</span>
							<p className="font-(family-name:--font-manrope) font-semibold text-on-surface text-lg mb-2">
								{t("noTours")}
							</p>
							<p className="text-on-surface-variant text-sm">
								{t("noToursDesc")}
							</p>
						</div>
					)}
					{tourProjects.map((tour) => {
						const tArtist = tour.artist;
						const tStatus = String(tour.status ?? "draft").toLowerCase();
						const statusStyle: Record<string, string> = {
							confirmed:      "bg-emerald-100 text-emerald-700",
							under_review:   "bg-blue-100 text-blue-700",
							needs_revision: "bg-amber-100 text-amber-700",
							rejected:       "bg-red-100 text-red-700",
							draft:          "bg-slate-100 text-slate-500",
						};
						const statusLabel: Record<string, string> = {
							confirmed:      "Active",
							under_review:   "Under Review",
							needs_revision: "Needs Revision",
							rejected:       "Rejected",
							draft:          "Draft",
						};
						return (
							<div
								key={String(tour.id)}
								className="flex items-center justify-between gap-3 py-3 md:py-4 border-b border-outline-variant/10 last:border-none"
							>
								<div className="flex-1 min-w-0">
									<p className="text-sm md:text-base font-semibold text-on-surface truncate">
										{String(tArtist?.name ?? tArtist?.tour_name ?? "Tour")}
									</p>
									<p className="text-xs text-on-surface-variant mt-0.5 truncate">
										{String(tArtist?.genre ?? "")}
										{tour.city ? ` · ${String(tour.city)}` : ""}
									</p>
								</div>
								<span
									className={`shrink-0 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter ${statusStyle[tStatus] ?? "bg-slate-100 text-slate-500"}`}
								>
									{statusLabel[tStatus] ?? tStatus.replace(/_/g, " ")}
								</span>
								<TourActionsMenu
									tourId={String(tour.id)}
									initialStatus={tStatus}
									initialVenue={String(tour.venue ?? "")}
									initialCity={String(tour.city ?? "")}
									initialDate={tour.date ? String(tour.date) : ""}
									initialCapacity={tour.capacity ?? null}
									initialFeeUsd={typeof tour.fee_usd === "number" ? tour.fee_usd : undefined}
								/>
							</div>
						);
					})}
				</div>

				{totalPages > 1 && (
					<div className="flex items-center justify-between mt-8 pt-6 border-t border-outline-variant/10">
						<Link
							href={pageHref(currentPage - 1)}
							aria-disabled={currentPage <= 1}
							className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
								currentPage <= 1
									? "pointer-events-none text-on-surface-variant/40"
									: "text-on-surface-variant hover:bg-surface-container-low"
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
													: "text-on-surface-variant hover:bg-surface-container-low"
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
									: "text-on-surface-variant hover:bg-surface-container-low"
							}`}
						>
							{t("pagination.next")}
							<span className="material-symbols-outlined text-sm">chevron_right</span>
						</Link>
					</div>
				)}
			</div>
		</>
	);
}

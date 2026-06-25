import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAdminEOIs, getAdminTours } from "@/app/actions";
import PageTour from "@/components/PageTour";
import { Link } from "@/i18n/routing";

type Props = {
	params: Promise<{ locale: string }>;
};

export default async function AdminPage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("AdminPage");

	const [eoisResult, toursResult] = await Promise.all([
		getAdminEOIs(),
		getAdminTours(),
	]);

	const eois = eoisResult.data ?? [];
	const tourProjects = toursResult.data ?? [];
	const activeTourCount = tourProjects.filter((t) =>
		["confirmed", "under_review", "active"].includes(
			String(t.status ?? "").toLowerCase(),
		),
	).length;
	const pendingEOICount = eois.filter((e) =>
		["pending", "pending_review"].includes(
			String(e.status ?? "").toLowerCase(),
		),
	).length;
	const approvedStopCount = eois.filter(
		(e) => String(e.status ?? "").toLowerCase() === "approved",
	).length;

	return (
		<>
			<PageTour pageId="admin-dashboard" />
			{/* Header */}
			<div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
				<div>
					<span className="text-xs font-semibold uppercase tracking-widest text-[#FF5A30] block mb-2">
						{t("platform")}
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
					className="flex items-center gap-2 px-6 py-3 bg-[#FF5A30] text-white rounded-xl font-(family-name:--font-manrope) font-semibold shadow-lg shadow-[#FF5A30]/20 hover:scale-[1.02] transition-transform active:scale-95 shrink-0"
				>
					<span className="material-symbols-outlined">add</span>
					{t("createTour")}
				</Link>
			</div>

			{/* Stats */}
			<div data-tour="admin-stats" className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-10">
				{[
					{
						label: t("stats.activeTours"),
						value: String(activeTourCount),
						icon: "confirmation_number",
						accent: "border-[#FF5A30]",
						href: "/admin/tours",
					},
					{
						label: t("stats.eoisReceived"),
						value: String(eois.length),
						icon: "send",
						accent: "border-secondary",
						href: "/admin/eoi",
					},
					{
						label: t("stats.pendingReview"),
						value: String(pendingEOICount),
						icon: "pending",
						accent: "border-yellow-400",
						href: "/admin/eoi",
					},
					{
						label: t("stats.approvedStops"),
						value: String(approvedStopCount),
						icon: "task_alt",
						accent: "border-emerald-500",
						href: "/admin/eoi",
					},
				].map((s) => (
					<Link
						href={s.href}
						key={s.label}
						className={`bg-surface-container-lowest p-4 md:p-5 rounded-xl shadow-sm flex flex-col gap-2 md:gap-3 border-l-4 ${s.accent} hover:shadow-md transition-shadow`}
					>
						<div className="flex items-center justify-between">
							<p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
								{s.label}
							</p>
							<span className="material-symbols-outlined text-on-surface-variant text-sm md:text-base">
								{s.icon}
							</span>
						</div>
						<span className="text-3xl md:text-4xl font-(family-name:--font-manrope) font-extrabold text-on-surface">
							{s.value}
						</span>
					</Link>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Recent Tours Summary */}
				<div data-tour="admin-recent-tours" className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
					<div className="flex items-center justify-between mb-5">
						<h3 className="font-(family-name:--font-manrope) font-semibold text-lg">
							{t("recentTours")}
						</h3>
						<Link
							href="/admin/tours"
							className="text-sm font-semibold text-[#FF5A30] hover:underline"
						>
							{t("viewAll")}
						</Link>
					</div>
					<div className="space-y-4">
						{tourProjects.length === 0 && (
							<div className="bg-surface-container-low rounded-2xl p-8 text-center">
								<span className="material-symbols-outlined text-4xl text-on-surface-variant block mb-3">
									confirmation_number
								</span>
								<p className="font-(family-name:--font-manrope) font-semibold text-on-surface mb-1">
									{t("noTours")}
								</p>
								<p className="text-on-surface-variant text-sm">
									{t("noToursDesc")}
								</p>
							</div>
						)}
						{tourProjects.slice(0, 5).map((t) => {
							const tArtist = t.artist;
							return (
								<div
									key={String(t.id)}
									className="flex items-center justify-between gap-4 py-3 border-b border-outline-variant/10 last:border-none"
								>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-semibold text-on-surface truncate">
											{String(tArtist?.name ?? tArtist?.tour_name ?? "Tour")}
										</p>
										<p className="text-xs text-on-surface-variant mt-0.5">
											{String(tArtist?.genre ?? "")}
										</p>
									</div>
									<span
										className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
											String(t.status ?? "draft") === "active" ||
											String(t.status ?? "") === "Active"
												? "bg-emerald-100 text-emerald-700"
												: "bg-slate-100 text-slate-500"
										}`}
									>
										{String(t.status ?? "Draft")}
									</span>
								</div>
							);
						})}
					</div>
				</div>

				{/* Recent EOIs Summary */}
				<div data-tour="admin-recent-eois" className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
					<div className="flex items-center justify-between mb-5">
						<h3 className="font-(family-name:--font-manrope) font-semibold text-lg">
							{t("recentEois")}
						</h3>
						<Link
							href="/admin/eoi"
							className="text-sm font-semibold text-[#FF5A30] hover:underline"
						>
							{t("viewAll")}
						</Link>
					</div>
					<div className="space-y-4">
						{eois.length === 0 && (
							<div className="bg-surface-container-low rounded-2xl p-8 text-center">
								<span className="material-symbols-outlined text-4xl text-on-surface-variant block mb-3">
									send
								</span>
								<p className="font-(family-name:--font-manrope) font-semibold text-on-surface mb-1">
									{t("noEois")}
								</p>
							</div>
						)}
						{eois.slice(0, 5).map((eoi) => {
							const eoiArtist = eoi.artist;
							const status = String(eoi.status ?? "pending");
							const statusColor =
								status === "approved"
									? "bg-emerald-100 text-emerald-800"
									: status === "rejected"
										? "bg-red-100 text-red-800"
										: status === "needs_revision"
											? "bg-blue-100 text-blue-800"
											: "bg-yellow-100 text-yellow-800";
							return (
								<div
									key={String(eoi.id)}
									className="flex items-center justify-between gap-4 py-3 border-b border-outline-variant/10 last:border-none"
								>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-semibold text-on-surface truncate">
											{String(eoiArtist?.name ?? "Artist")}
										</p>
										<p className="text-xs text-on-surface-variant mt-0.5">
											{String(eoi.city ?? "Location")}
										</p>
									</div>
									<span
										className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusColor}`}
									>
										{status.replace(/_/g, " ")}
									</span>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</>
	);
}

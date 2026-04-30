import Footer from "@/components/Footer";
import Link from "next/link";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import { getTour, getTourMilestones } from "@/app/actions";

export default async function TourDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const [tourResult, milestonesResult] = await Promise.all([
		getTour(id),
		getTourMilestones(id),
	]);

	const tour = tourResult.data;
	const milestones = milestonesResult.data ?? [];
	const status = String(tour?.status ?? "pending").toLowerCase();
	const statusColor =
		status === "confirmed"
			? "bg-emerald-100 text-emerald-800"
			: status === "rejected"
				? "bg-red-100 text-red-800"
				: status === "needs_revision" || status === "needs revision"
					? "bg-blue-100 text-blue-800"
					: "bg-yellow-100 text-yellow-800";

	return (
		<div className="bg-surface text-on-surface">
			<TopNav />
			<div className="flex pt-16 h-screen">
				<SideNav />
				<main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-10 no-scrollbar">
					<div className="mx-auto max-w-5xl space-y-8">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<div>
								<p className="text-xs font-bold uppercase tracking-widest text-[#FF5A30]">
									Tour Details
								</p>
								<h1 className="text-3xl font-(family-name:--font-manrope) font-extrabold text-on-surface mt-1">
									{tour?.artist?.name ? String(tour.artist.name) : "Tour stop"}
								</h1>
							</div>
							<Link
								href="/tours"
								className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-variant/30 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low"
							>
								<span className="material-symbols-outlined text-sm">arrow_back</span>
								Back to tours
							</Link>
						</div>

						{!tourResult.success || !tour ? (
							<div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-6 text-sm font-medium">
								{tourResult.error ?? "Unable to load this tour."}
							</div>
						) : (
							<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
								<section className="lg:col-span-8 bg-surface-container-lowest rounded-2xl p-6 shadow-sm space-y-5">
									<div className="flex items-start justify-between gap-3">
										<div>
											<h2 className="text-xl font-(family-name:--font-manrope) font-bold">
												{String(tour.tour_name ?? tour.artist?.tour_name ?? "Tour")}
											</h2>
											<p className="text-sm text-on-surface-variant mt-1">
												{String(tour.artist?.genre ?? "")}
											</p>
										</div>
										<span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusColor}`}>
											{String(tour.status ?? "pending").replace(/_/g, " ")}
										</span>
									</div>

									<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
										<div className="bg-surface-container-low rounded-xl p-3">
											<p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
												City
											</p>
											<p className="text-sm font-bold mt-1">{String(tour.city ?? "-")}</p>
										</div>
										<div className="bg-surface-container-low rounded-xl p-3">
											<p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
												Venue
											</p>
											<p className="text-sm font-bold mt-1">{String(tour.venue ?? "-")}</p>
										</div>
										<div className="bg-surface-container-low rounded-xl p-3">
											<p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
												Date
											</p>
											<p className="text-sm font-bold mt-1">
												{tour.date
													? tour.date.toLocaleDateString("en-US", {
															month: "short",
															day: "numeric",
															year: "numeric",
														})
													: "-"}
											</p>
										</div>
										<div className="bg-surface-container-low rounded-xl p-3">
											<p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
												Fee
											</p>
											<p className="text-sm font-bold mt-1">
												{tour.fee_usd != null
													? `$${Number(tour.fee_usd).toLocaleString()}`
													: "-"}
											</p>
										</div>
										<div className="bg-surface-container-low rounded-xl p-3">
											<p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
												Capacity
											</p>
											<p className="text-sm font-bold mt-1">
												{tour.capacity != null
													? Number(tour.capacity).toLocaleString()
													: "-"}
											</p>
										</div>
										<div className="bg-surface-container-low rounded-xl p-3">
											<p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
												Tickets Sold
											</p>
											<p className="text-sm font-bold mt-1">
												{tour.tickets_sold != null
													? Number(tour.tickets_sold).toLocaleString()
													: "-"}
											</p>
										</div>
									</div>
								</section>

								<section className="lg:col-span-4 bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
									<h3 className="text-base font-(family-name:--font-manrope) font-bold mb-4">
										Milestones
									</h3>
									{!milestonesResult.success ? (
										<p className="text-sm text-rose-700">
											{milestonesResult.error ?? "Unable to load milestones."}
										</p>
									) : milestones.length === 0 ? (
										<p className="text-sm text-on-surface-variant">No milestones yet.</p>
									) : (
										<div className="space-y-3">
											{milestones.map((m) => (
												<div key={String(m.id)} className="rounded-xl bg-surface-container-low p-3">
													<p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
														{String(m.type ?? "milestone")}
													</p>
													<p className="text-sm font-bold mt-1">{String(m.label ?? "")}</p>
													<p className="text-xs text-on-surface-variant mt-1">
														{m.date
															? new Date(String(m.date)).toLocaleDateString("en-US", {
																	month: "short",
																	day: "numeric",
																	year: "numeric",
																})
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
				  <Footer />
</main>
			</div>
		</div>
	);
}

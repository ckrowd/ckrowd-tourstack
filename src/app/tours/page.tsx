import Image from "next/image";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import SideNav from "@/components/SideNav";
import { getTours } from "@/app/actions";

const EMPTY_TOURS: Record<string, unknown>[] = [];

const upcomingMilestones = [
	{
		date: "Sept 28",
		label: "Frequency Shift — Production call",
		type: "call",
		icon: "call",
		color: "bg-blue-100 text-blue-600",
	},
	{
		date: "Oct 01",
		label: "Vanguard Echo — Venue contract deadline",
		type: "deadline",
		icon: "gavel",
		color: "bg-yellow-100 text-yellow-700",
	},
	{
		date: "Oct 12",
		label: "Vanguard Echo — Show Day",
		type: "show",
		icon: "celebration",
		color: "bg-[#FF5A30]/10 text-[#FF5A30]",
	},
	{
		date: "Nov 05",
		label: "Aria Velvet — Show Day",
		type: "show",
		icon: "celebration",
		color: "bg-[#FF5A30]/10 text-[#FF5A30]",
	},
	{
		date: "Nov 12",
		label: "Aria Velvet — Settlement due",
		type: "payment",
		icon: "payments",
		color: "bg-emerald-100 text-emerald-700",
	},
];

export default async function ToursPage() {
	const toursResult = await getTours();
	const tours = (toursResult.data ?? EMPTY_TOURS) as Record<string, unknown>[];

	const confirmed = tours.filter(
		(t) => String(t.status ?? "").toLowerCase() === "confirmed",
	);
	const inProgress = tours.filter((t) =>
		[
			"under_review",
			"needs_revision",
			"under review",
			"needs revision",
		].includes(String(t.status ?? "").toLowerCase()),
	);
	const rejected = tours.filter(
		(t) => String(t.status ?? "").toLowerCase() === "rejected",
	);

	return (
		<div className="bg-surface text-on-surface">
			<TopNav />

			<div className="flex pt-16 h-screen">
				<SideNav />

				<main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-10 no-scrollbar">
					{/* Header */}
					<div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
						<div>
							<span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-2">
								Promoter Portal
							</span>
							<h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
								My Tours
							</h1>
							<p className="text-on-surface-variant font-medium">
								Track every tour stop — from EOI submission to show-day
								settlement.
							</p>
						</div>
						<Link
							href="/eoi"
							className="flex items-center gap-2 bg-[#FF5A30] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all self-start md:self-auto"
						>
							<span className="material-symbols-outlined text-sm">add</span>
							New Tour Stop
						</Link>
					</div>

					{/* Summary strip */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
						{[
							{
								label: "Total Stops",
								value: tours.length.toString(),
								color: "border-[#FF5A30]",
							},
							{
								label: "Confirmed",
								value: confirmed.length.toString(),
								color: "border-emerald-400",
							},
							{
								label: "In Progress",
								value: inProgress.length.toString(),
								color: "border-yellow-400",
							},
							{
								label: "Rejected",
								value: rejected.length.toString(),
								color: "border-red-400",
							},
						].map((s) => (
							<div
								key={s.label}
								className={`bg-surface-container-lowest rounded-xl p-5 shadow-sm border-l-4 ${s.color}`}
							>
								<p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
									{s.label}
								</p>
								<p className="text-3xl font-black font-(family-name:--font-manrope) text-on-surface">
									{s.value}
								</p>
							</div>
						))}
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
						{/* Tour Cards */}
						<div className="lg:col-span-8 space-y-5">
							{tours.map((tour) => {
								const ticketsSold =
									typeof tour.ticketsSold === "number" ? tour.ticketsSold : 0;
								const capacity =
									typeof tour.capacity === "number" ? tour.capacity : 0;
								const soldPct =
									ticketsSold > 0 && capacity > 0
										? Math.round((ticketsSold / capacity) * 100)
										: 0;
								const status = String(tour.status ?? "");
								const statusLower = status.toLowerCase();
								const statusColor =
									statusLower === "confirmed"
										? "bg-emerald-100 text-emerald-800"
										: statusLower === "rejected"
											? "bg-red-100 text-red-800"
											: statusLower === "needs_revision" ||
													statusLower === "needs revision"
												? "bg-blue-100 text-blue-800"
												: "bg-yellow-100 text-yellow-800";
								const daysAway =
									tour.daysAway != null
										? Number(tour.daysAway)
										: tour.date
											? Math.round(
													(new Date(String(tour.date)).getTime() - Date.now()) /
														86400000,
												)
											: null;

								return (
									<div
										key={String(tour.id)}
										className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-transparent hover:border-outline-variant/20 hover:shadow-lg transition-all duration-300"
									>
										<div className="flex flex-col sm:flex-row">
											{/* Image */}
											<div className="sm:w-36 h-36 relative shrink-0 bg-surface-container-high flex items-center justify-center">
												{tour.img ? (
													<>
														<Image
															src={String(tour.img)}
															alt={String(tour.imgAlt ?? "")}
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
																{String(
																	tour.artistName ?? tour.artiste ?? "Artist",
																)}
															</h3>
															{tour.genre != null && tour.genre !== "" && (
																<span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
																	{String(tour.genre)}
																</span>
															)}
														</div>
														<p className="text-sm text-on-surface-variant mt-0.5">
															{String(tour.tour ?? tour.tourName ?? "")}
														</p>
													</div>
													<span
														className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shrink-0 ${statusColor}`}
													>
														{status.replace(/_/g, " ")}
													</span>
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
													{tour.date != null && tour.date !== "" && (
														<span className="flex items-center gap-1.5">
															<span className="material-symbols-outlined text-sm">
																event
															</span>
															{String(tour.date)}
														</span>
													)}
													{tour.fee != null && tour.fee !== "" && (
														<span className="flex items-center gap-1.5">
															<span className="material-symbols-outlined text-sm">
																monetization_on
															</span>
															{String(tour.fee)}
														</span>
													)}
													{tour.financing === true && (
														<span className="flex items-center gap-1.5 text-[#FF5A30] font-semibold">
															<span className="material-symbols-outlined text-sm">
																account_balance
															</span>
															Financed
															{tour.financingAmount
																? ` · ${String(tour.financingAmount)}`
																: ""}
														</span>
													)}
												</div>

												{statusLower === "confirmed" && capacity > 0 && (
													<div className="mt-1">
														<div className="flex justify-between text-xs text-on-surface-variant mb-1">
															<span>Tickets Sold</span>
															<span className="font-bold text-on-surface">
																{ticketsSold.toLocaleString()} /{" "}
																{capacity.toLocaleString()}
															</span>
														</div>
														<div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
															<div
																className="bg-[#FF5A30] h-full rounded-full transition-all"
																style={{ width: `${soldPct}%` }}
															/>
														</div>
													</div>
												)}

												<div className="flex items-center justify-between mt-auto pt-1">
													{daysAway != null ? (
														daysAway > 0 ? (
															<span className="text-xs text-on-surface-variant">
																<span className="font-bold text-on-surface">
																	{daysAway}d
																</span>{" "}
																until show
															</span>
														) : daysAway < 0 ? (
															<span className="text-xs text-on-surface-variant">
																Show passed {Math.abs(daysAway)}d ago
															</span>
														) : (
															<span className="text-xs font-bold text-[#FF5A30]">
																Show day!
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
																className="text-xs font-bold text-[#FF5A30] border border-[#FF5A30]/30 px-3 py-1.5 rounded-lg hover:bg-[#FF5A30]/5 transition-colors"
															>
																Revise EOI
															</Link>
														)}
														<button
															type="button"
															className="text-xs font-bold text-on-surface-variant border border-outline-variant/30 px-3 py-1.5 rounded-lg hover:bg-surface-container-low transition-colors"
														>
															View Details
														</button>
													</div>
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>

						{/* Sidebar: Milestones */}
						<aside className="lg:col-span-4 space-y-6">
							<div className="bg-surface-container-lowest rounded-2xl p-7 shadow-sm">
								<h3 className="font-(family-name:--font-manrope) font-bold text-base mb-6">
									Upcoming Milestones
								</h3>
								<div className="space-y-4">
									{upcomingMilestones.map((m, i) => (
										<div key={i} className="flex items-start gap-4">
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
												<p className="text-sm font-bold text-on-surface leading-snug">
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

							{/* Venue snapshot */}
							<div className="bg-surface-container-lowest rounded-2xl p-7 shadow-sm">
								<h3 className="font-(family-name:--font-manrope) font-bold text-base mb-5">
									Venue Summary
								</h3>
								<div className="space-y-3">
									{[
										{
											label: "Alliance Française, Accra",
											cap: "1,200",
											shows: 1,
										},
										{ label: "Eko Convention Centre", cap: "3,000", shows: 1 },
										{ label: "Freedom Park, Lagos", cap: "5,000", shows: 1 },
									].map((v) => (
										<div
											key={v.label}
											className="flex items-center gap-3 py-2 border-b border-outline-variant/10 last:border-0"
										>
											<span
												className="material-symbols-outlined text-[#FF5A30]"
												style={{ fontVariationSettings: "'FILL' 1" }}
											>
												stadium
											</span>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-semibold text-on-surface truncate">
													{v.label}
												</p>
												<p className="text-xs text-on-surface-variant">
													Cap: {v.cap} · {v.shows} show
												</p>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* CTA */}
							<Link
								href="/financing"
								className="flex items-center gap-4 bg-linear-to-br from-[#FF5A30] to-[#cc4826] text-white p-6 rounded-2xl shadow-lg shadow-[#FF5A30]/20 hover:scale-[1.02] transition-transform"
							>
								<span
									className="material-symbols-outlined text-2xl"
									style={{ fontVariationSettings: "'FILL' 1" }}
								>
									account_balance_wallet
								</span>
								<div>
									<p className="font-(family-name:--font-manrope) font-bold text-sm">
										Need Financing?
									</p>
									<p className="text-xs text-orange-100 mt-0.5">
										Cover up to 40% of artiste fees upfront
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

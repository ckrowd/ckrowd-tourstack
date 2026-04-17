import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import {
	getEOIs,
	getTourstackDashboard,
	getTourstackProfile,
	getFinancingApplications,
} from "@/app/actions";

function formatTimeAgo(date: Date): string {
	const diff = Date.now() - date.getTime();
	const hours = Math.floor(diff / 3600000);
	const days = Math.floor(diff / 86400000);
	if (hours < 1) return "Just now";
	if (hours < 24) return `${hours}h ago`;
	if (days === 1) return "Yesterday";
	return `${days}d ago`;
}

export default async function DashboardPage() {
	const [eoisResult, dashboardResult, profileResult, financingResult] =
		await Promise.all([
			getEOIs(),
			getTourstackDashboard(),
			getTourstackProfile(),
			getFinancingApplications(),
		]);

	const eois = eoisResult.data ?? [];
	const dashData = dashboardResult.data;
	const profile = profileResult.data;
	const companyName = profile?.company_name
		? String(profile.company_name)
		: "your organization";
	const financingApps = financingResult.data ?? [];
	const latestFinancing = financingApps[0];
	const recentEOIs = dashData?.recentEOIs ?? [];
	const nextMilestone = dashData?.upcomingMilestones?.[0];
	const nextMilestoneTour = nextMilestone?.tour;
	const statusStepDone: Record<string, number> = {
		pending_review: 2,
		needs_revision: 3,
		approved: 4,
		confirmed: 5,
		rejected: 4,
	};
	const progressEOI = recentEOIs[0];
	const progressStepsDone = progressEOI
		? (statusStepDone[String(progressEOI.status ?? "pending_review")] ?? 2)
		: 0;
	const progressWidthClass =
		["w-0", "w-1/5", "w-2/5", "w-3/5", "w-4/5", "w-full"][progressStepsDone] ??
		"w-0";
	const progressArtist = progressEOI?.artist;
	const progressTitle = progressEOI
		? `EOI Progress — ${progressArtist?.name ?? "Artist"}${
				progressArtist?.tour_name ? ` (${progressArtist.tour_name})` : ""
			}`
		: "No EOIs yet";
	const progressStatusLabel = progressEOI
		? String(progressEOI.status ?? "pending").replace(/_/g, " ")
		: "No EOIs";
	const progressStatusColor = progressEOI
		? String(progressEOI.status) === "approved"
			? "bg-emerald-100 text-emerald-800"
			: String(progressEOI.status) === "rejected"
				? "bg-red-100 text-red-800"
				: "bg-yellow-100 text-yellow-800"
		: "bg-surface-container-high text-on-surface-variant";
	const tourSteps = [
		{ n: "01", label: "EOI Submitted", done: progressStepsDone >= 1 },
		{ n: "02", label: "Under Review", done: progressStepsDone >= 2 },
		{ n: "03", label: "Match Score", done: progressStepsDone >= 3 },
		{ n: "04", label: "Decision", done: progressStepsDone >= 4 },
		{ n: "05", label: "Confirmed", done: progressStepsDone >= 5 },
	];
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
								Your Tour Dashboard
							</h1>
							<p className="text-on-surface-variant font-medium">
								Welcome back, {companyName}. Track your EOIs and tour process
								below.
							</p>
						</div>
						<div className="flex items-center gap-3 bg-surface-container-lowest p-2 rounded-xl shadow-sm">
							<span className="material-symbols-outlined text-tertiary-container ml-2">
								calendar_month
							</span>
							<span className="font-(family-name:--font-manrope) font-bold text-sm pr-4">
								Touring Season: 2024 / 2025
							</span>
						</div>
					</div>

					{/* Tour Progress Tracker */}
					<div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm mb-10">
						<div className="flex items-center justify-between mb-4">
							<h2 className="font-(family-name:--font-manrope) font-bold text-base">
								{progressTitle}
							</h2>
							<span
								className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tight ${progressStatusColor}`}
							>
								{progressStatusLabel}
							</span>
						</div>
						<div className="flex items-center justify-between relative mt-6">
							<div className="absolute top-5 left-0 w-full h-0.5 bg-surface-variant z-0" />
							<div
								className={`absolute top-5 left-0 h-0.5 bg-[#FF5A30] z-0 transition-all duration-500 ${progressWidthClass}`}
							/>
							{tourSteps.map((s) => (
								<div
									key={s.n}
									className="relative z-10 flex flex-col items-center gap-2"
								>
									<div
										className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ring-4 ring-surface-container-lowest transition-all ${
											s.done
												? "bg-[#FF5A30] text-white"
												: "bg-surface-variant text-on-surface-variant"
										}`}
									>
										{s.done ? (
											<span
												className="material-symbols-outlined text-sm"
												style={{ fontVariationSettings: "'FILL' 1" }}
											>
												check
											</span>
										) : (
											s.n
										)}
									</div>
									<span className="text-[10px] font-bold uppercase tracking-wider text-center max-w-16 leading-tight text-on-surface-variant">
										{s.label}
									</span>
								</div>
							))}
						</div>
					</div>

					{/* Stats Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
						<div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between border-l-4 border-[#FF5A30]">
							<p className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
								EOIs Submitted
							</p>
							<div className="flex items-end justify-between">
								<span className="text-4xl font-(family-name:--font-manrope) font-extrabold text-on-surface">
									{typeof dashData?.stats?.totalEOIs === "number"
										? dashData.stats.totalEOIs
										: eois.length}
								</span>
								<span className="text-[#FF5A30] font-bold flex items-center text-sm">
									+2 this month
								</span>
							</div>
						</div>

						<div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between border-l-4 border-secondary">
							<p className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
								Approved
							</p>
							<div className="flex items-end justify-between">
								<span className="text-4xl font-(family-name:--font-manrope) font-extrabold text-on-surface">
									{typeof dashData?.stats?.approvedEOIs === "number"
										? dashData.stats.approvedEOIs
										: 0}
								</span>
								<span className="text-emerald-600 font-bold text-sm">
									Confirmed
								</span>
							</div>
						</div>

						<div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between border-l-4 border-tertiary-container">
							<p className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
								Financing Status
							</p>
							<div className="flex items-end justify-between">
								<span className="text-4xl font-(family-name:--font-manrope) font-extrabold text-on-surface">
									{latestFinancing
										? `$${Math.round(Number(latestFinancing.amount_requested) / 1000)}K`
										: "—"}
								</span>
								<span className="text-tertiary-container font-bold text-sm capitalize">
									{latestFinancing
										? String(latestFinancing.status ?? "Pending")
										: "No apps"}
								</span>
							</div>
						</div>
					</div>

					<div className="relative overflow-hidden bg-[#FF5A30] p-6 rounded-xl shadow-sm flex flex-col justify-between">
						<div className="absolute top-0 right-0 p-2 opacity-20">
							<span
								className="material-symbols-outlined text-8xl"
								style={{ fontVariationSettings: "'FILL' 1" }}
							>
								electric_bolt
							</span>
						</div>
						<p className="text-sm font-semibold text-white uppercase tracking-wider mb-4 z-10">
							Next Show
						</p>
						<div className="z-10">
							{nextMilestone ? (
								<>
									<span className="block text-xl font-(family-name:--font-manrope) font-extrabold text-white leading-tight">
										{String(nextMilestoneTour?.venue ?? "TBD")} @{" "}
										{String(nextMilestoneTour?.city ?? "TBD")}
									</span>
									<span className="text-orange-50 font-medium text-sm">
										{new Date(String(nextMilestone.date)).toLocaleDateString(
											"en-US",
											{
												month: "short",
												day: "numeric",
												year: "numeric",
											},
										)}
									</span>
								</>
							) : (
								<>
									<span className="block text-xl font-(family-name:--font-manrope) font-extrabold text-white leading-tight">
										No upcoming shows
									</span>
									<span className="text-orange-50 font-medium text-sm">
										Submit an EOI to get started
									</span>
								</>
							)}
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						<div className="lg:col-span-2 space-y-6">
							<div className="flex items-center justify-between">
								<h2 className="text-2xl font-(family-name:--font-manrope) font-bold text-on-surface">
									My EOI Submissions
								</h2>
								<Link
									href="/eoi"
									className="text-sm font-bold text-[#FF5A30] flex items-center gap-1 hover:underline"
								>
									New EOI{" "}
									<span className="material-symbols-outlined text-sm">add</span>
								</Link>
							</div>

							<div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
								<table className="w-full text-left border-collapse">
									<thead>
										<tr className="bg-surface-container-high">
											<th className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
												Artiste / Tour
											</th>
											<th className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant hidden md:table-cell">
												Venue
											</th>
											<th className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
												Status
											</th>
											<th className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">
												Match
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-outline-variant/10">
										{eois.length === 0 ? (
											<tr>
												<td colSpan={4} className="px-5 py-12 text-center">
													<span className="material-symbols-outlined text-4xl text-on-surface-variant block mb-3">
														confirmation_number
													</span>
													<p className="font-(family-name:--font-manrope) font-bold text-on-surface-variant text-sm">
														No EOIs submitted yet
													</p>
													<p className="text-xs text-on-surface-variant mt-1">
														Browse artistes and submit your first Expression of
														Interest.
													</p>
													<Link
														href="/discovery"
														className="inline-flex items-center gap-1 mt-4 text-sm font-bold text-[#FF5A30] hover:underline"
													>
														<span className="material-symbols-outlined text-sm">
															search
														</span>
														Discover Artistes
													</Link>
												</td>
											</tr>
										) : (
											eois.map((req) => {
												const reqArtist = req.artist;
												const status = String(req.status ?? "pending");
												const statusColor =
													status === "approved"
														? "bg-emerald-100 text-emerald-800"
														: status === "rejected"
															? "bg-red-100 text-red-800"
															: status === "needs_revision"
																? "bg-blue-100 text-blue-800"
																: "bg-yellow-100 text-yellow-800";
												return (
													<tr
														key={String(req.id ?? req.city)}
														className="hover:bg-surface-container-low transition-colors"
													>
														<td className="px-5 py-4">
															<div className="flex items-center gap-3">
																<div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 relative bg-surface-container-high flex items-center justify-center">
																	{reqArtist?.image_url ? (
																		<Image
																			src={String(reqArtist.image_url)}
																			alt={String(reqArtist.name ?? "")}
																			fill
																			className="object-cover"
																		/>
																	) : (
																		<span className="material-symbols-outlined text-on-surface-variant">
																			music_note
																		</span>
																	)}
																</div>
																<div>
																	<span className="block font-(family-name:--font-manrope) font-bold text-on-surface text-sm">
																		{String(reqArtist?.name ?? "Artist")}
																	</span>
																	<span className="block text-xs text-on-surface-variant">
																		{String(
																			reqArtist?.tour_name ?? req.city ?? "",
																		)}
																	</span>
																</div>
															</div>
														</td>
														<td className="px-5 py-4 text-xs text-on-surface-variant font-medium hidden md:table-cell">
															{String(req.venue ?? req.city ?? "—")}
														</td>
														<td className="px-5 py-4">
															<span
																className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tight ${statusColor}`}
															>
																{status.replace(/_/g, " ")}
															</span>
														</td>
														<td className="px-5 py-4 text-right">
															<span className="font-(family-name:--font-manrope) font-extrabold text-[#FF5A30]">
																{req.match_score != null
																	? `${String(req.match_score)}%`
																	: "—"}
															</span>
														</td>
													</tr>
												);
											})
										)}
									</tbody>
								</table>
							</div>
						</div>

						{/* Widgets */}
						<div className="space-y-8">
							{/* Financing Widget */}
							<div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
								<div className="flex items-center justify-between mb-6">
									<h3 className="font-(family-name:--font-manrope) font-bold text-lg">
										Financing Status
									</h3>
									<span className="material-symbols-outlined text-[#FF5A30]">
										account_balance
									</span>
								</div>
								{latestFinancing ? (
									<div className="space-y-5">
										<div>
											<div className="flex justify-between text-sm mb-2">
												<span className="text-on-surface-variant font-medium">
													{String(latestFinancing.product ?? "Application")}
												</span>
												<span className="font-bold text-[#FF5A30] capitalize">
													{String(latestFinancing.status ?? "Pending")}
												</span>
											</div>
											<div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
												<div
													className="bg-[#FF5A30] h-full rounded-full"
													style={{
														width:
															String(latestFinancing.status) === "approved"
																? "100%"
																: String(latestFinancing.status) === "declined"
																	? "60%"
																	: "35%",
													}}
												/>
											</div>
											<p className="text-xs text-on-surface-variant mt-1">
												{String(latestFinancing.status) === "approved"
													? "Financing approved"
													: String(latestFinancing.status) === "declined"
														? "Application declined"
														: "Application under assessment"}
											</p>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div className="p-4 bg-surface-container-low rounded-lg">
												<p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">
													Requested
												</p>
												<p className="text-xl font-(family-name:--font-manrope) font-extrabold text-on-surface">
													{String(latestFinancing.currency ?? "USD")}{" "}
													{Number(
														latestFinancing.amount_requested,
													).toLocaleString()}
												</p>
											</div>
											<div className="p-4 bg-surface-container-low rounded-lg">
												<p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">
													Status
												</p>
												<p className="text-xl font-(family-name:--font-manrope) font-extrabold text-tertiary-container capitalize">
													{String(latestFinancing.status ?? "Pending")}
												</p>
											</div>
										</div>
										<Link
											href="/financing"
											className="block w-full py-3 bg-orange-50 text-[#FF5A30] font-(family-name:--font-manrope) font-bold text-sm rounded-lg hover:brightness-95 transition-all text-center"
										>
											View Financing Details
										</Link>
									</div>
								) : (
									<div className="text-center py-4">
										<span className="material-symbols-outlined text-3xl text-on-surface-variant block mb-2">
											account_balance
										</span>
										<p className="text-sm font-bold text-on-surface-variant">
											No applications yet
										</p>
										<p className="text-xs text-on-surface-variant mt-1">
											Apply for financing to cover your event costs.
										</p>
										<Link
											href="/financing"
											className="inline-flex items-center gap-1 mt-4 text-sm font-bold text-[#FF5A30] hover:underline"
										>
											Explore Financing
											<span className="material-symbols-outlined text-sm">
												arrow_forward
											</span>
										</Link>
									</div>
								)}
							</div>

							{/* Activity Feed */}
							<div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
								<h3 className="font-(family-name:--font-manrope) font-bold text-lg mb-6">
									Tour Activity
								</h3>
								{recentEOIs.length === 0 ? (
									<div className="text-center py-4">
										<span className="material-symbols-outlined text-3xl text-on-surface-variant block mb-2">
											inbox
										</span>
										<p className="text-sm text-on-surface-variant font-medium">
											No activity yet
										</p>
									</div>
								) : (
									<div className="space-y-6 relative before:absolute before:left-2.75 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-high">
										{recentEOIs.slice(0, 5).map((eoi) => {
											const eoiStatus = String(eoi.status ?? "pending");
											const eoiArtist = eoi.artist;
											const artistName = String(eoiArtist?.name ?? "Artist");
											const dotBg =
												eoiStatus === "approved"
													? "bg-emerald-100"
													: eoiStatus === "needs_revision"
														? "bg-orange-100"
														: "bg-tertiary-fixed";
											const dotFill =
												eoiStatus === "approved"
													? "bg-emerald-500"
													: eoiStatus === "needs_revision"
														? "bg-[#FF5A30]"
														: "bg-tertiary-container";
											const activityLabel =
												eoiStatus === "approved"
													? `EOI Approved — ${artistName}`
													: eoiStatus === "needs_revision"
														? `Revision Requested — ${artistName}`
														: eoiStatus === "rejected"
															? `EOI Rejected — ${artistName}`
															: `EOI Submitted — ${artistName}`;
											const timeAgo = eoi.created_at
												? formatTimeAgo(new Date(String(eoi.created_at)))
												: "";
											return (
												<div
													key={String(eoi.id)}
													className="relative flex gap-4 pl-8"
												>
													<div
														className={`absolute left-0 top-1 w-6 h-6 rounded-full ${dotBg} flex items-center justify-center border-4 border-surface-container-lowest`}
													>
														<div
															className={`w-2 h-2 rounded-full ${dotFill}`}
														/>
													</div>
													<div>
														<p className="text-sm font-bold text-on-surface">
															{activityLabel}
														</p>
														<p className="text-xs text-on-surface-variant">
															{timeAgo}
															{eoi.city ? ` • ${String(eoi.city)}` : ""}
														</p>
													</div>
												</div>
											);
										})}
									</div>
								)}
							</div>
						</div>
					</div>

					<div className="mt-16">
						<Footer />
					</div>
				</main>
			</div>
		</div>
	);
}

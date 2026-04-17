import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import { getEOIs, getTourstackDashboard } from "@/app/actions";

const tourSteps = [
	{ n: "01", label: "EOI Submitted", done: true },
	{ n: "02", label: "Under Review", done: true },
	{ n: "03", label: "Match Score", done: false },
	{ n: "04", label: "Decision", done: false },
	{ n: "05", label: "Confirmed", done: false },
];

export default async function DashboardPage() {
	const [eoisResult, dashboardResult] = await Promise.all([
		getEOIs(),
		getTourstackDashboard(),
	]);

	const eois = (eoisResult.data as Record<string, unknown>[] | undefined) ?? [];
	const dashData = dashboardResult.data as Record<string, unknown> | undefined;
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
								Welcome back, Stage One Productions. Track your EOIs and tour
								process below.
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
								EOI Progress — Vanguard Echo (Pan-African Tour 2024)
							</h2>
							<span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-[10px] font-black tracking-tight">
								Under Review
							</span>
						</div>
						<div className="flex items-center justify-between relative mt-6">
							<div className="absolute top-5 left-0 w-full h-0.5 bg-surface-variant z-0" />
							<div className="absolute top-5 left-0 w-2/5 h-0.5 bg-[#FF5A30] z-0 transition-all duration-500" />
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
									{typeof dashData?.totalEOIs === "number"
										? dashData.totalEOIs
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
									{typeof dashData?.approvedEOIs === "number"
										? dashData.approvedEOIs
										: eois.filter(
												(e) =>
													(e as Record<string, unknown>).status === "approved",
											).length}
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
									$75K
								</span>
								<span className="text-tertiary-container font-bold text-sm">
									Pending
								</span>
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
								<span className="block text-xl font-(family-name:--font-manrope) font-extrabold text-white leading-tight">
									Aria Velvet @ Accra
								</span>
								<span className="text-orange-50 font-medium text-sm">
									Nov 5, 2024
								</span>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* EOI Requests Table */}
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
										{(eois as Record<string, unknown>[]).map((req) => {
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
																{req.img ? (
																	<Image
																		src={String(req.img)}
																		alt={String(req.imgAlt ?? "")}
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
																	{String(
																		req.artistName ?? req.name ?? "Artist",
																	)}
																</span>
																<span className="block text-xs text-on-surface-variant">
																	{String(req.tour ?? req.artistId ?? "")}
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
															{req.matchScore != null
																? `${String(req.matchScore)}%`
																: "—"}
														</span>
													</td>
												</tr>
											);
										})}
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
								<div className="space-y-5">
									<div>
										<div className="flex justify-between text-sm mb-2">
											<span className="text-on-surface-variant font-medium">
												EOI Financing Gap
											</span>
											<span className="font-bold text-[#FF5A30]">Pending</span>
										</div>
										<div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
											<div
												className="bg-[#FF5A30] h-full rounded-full"
												style={{ width: "35%" }}
											/>
										</div>
										<p className="text-xs text-on-surface-variant mt-1">
											35% of requested financing assessed
										</p>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div className="p-4 bg-surface-container-low rounded-lg">
											<p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">
												Requested
											</p>
											<p className="text-xl font-(family-name:--font-manrope) font-extrabold text-on-surface">
												$75K
											</p>
										</div>
										<div className="p-4 bg-surface-container-low rounded-lg">
											<p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">
												Status
											</p>
											<p className="text-xl font-(family-name:--font-manrope) font-extrabold text-tertiary-container">
												Pending
											</p>
										</div>
									</div>
									<button
										type="button"
										className="w-full py-3 bg-orange-50 text-[#FF5A30] font-(family-name:--font-manrope) font-bold text-sm rounded-lg hover:brightness-95 transition-all"
									>
										View Financing Details
									</button>
								</div>
							</div>

							{/* Activity Feed */}
							<div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
								<h3 className="font-(family-name:--font-manrope) font-bold text-lg mb-6">
									Tour Activity
								</h3>
								<div className="space-y-6 relative before:absolute before:left-2.75 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-high">
									<div className="relative flex gap-4 pl-8">
										<div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-surface-container-lowest">
											<div className="w-2 h-2 rounded-full bg-emerald-500" />
										</div>
										<div>
											<p className="text-sm font-bold text-on-surface">
												EOI Approved — Aria Velvet
											</p>
											<p className="text-xs text-on-surface-variant">
												2 hours ago • Accra, Ghana
											</p>
										</div>
									</div>
									<div className="relative flex gap-4 pl-8">
										<div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center border-4 border-surface-container-lowest">
											<div className="w-2 h-2 rounded-full bg-[#FF5A30]" />
										</div>
										<div>
											<p className="text-sm font-bold text-on-surface">
												Revision Requested
											</p>
											<p className="text-xs text-on-surface-variant">
												Yesterday • Frequency Shift — budget too low
											</p>
										</div>
									</div>
									<div className="relative flex gap-4 pl-8">
										<div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-tertiary-fixed flex items-center justify-center border-4 border-surface-container-lowest">
											<div className="w-2 h-2 rounded-full bg-tertiary-container" />
										</div>
										<div>
											<p className="text-sm font-bold text-on-surface">
												EOI Submitted — Vanguard Echo
											</p>
											<p className="text-xs text-on-surface-variant">
												3 days ago • Pending review
											</p>
										</div>
									</div>
								</div>
							</div>

							{/* Quick CTA */}
							<Link
								href="/eoi"
								className="flex items-center gap-4 bg-[#FF5A30] text-white p-5 rounded-xl shadow-lg shadow-[#FF5A30]/20 hover:scale-[1.02] transition-transform"
							>
								<span className="material-symbols-outlined text-2xl">send</span>
								<div>
									<p className="font-(family-name:--font-manrope) font-bold">
										Submit New EOI
									</p>
									<p className="text-xs text-orange-100 mt-0.5">
										Browse artistes &amp; apply for a Tour Stop
									</p>
								</div>
								<span className="material-symbols-outlined ml-auto">
									arrow_forward
								</span>
							</Link>
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

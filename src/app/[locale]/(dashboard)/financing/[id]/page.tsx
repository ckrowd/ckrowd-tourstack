import { getTranslations, setRequestLocale } from "next-intl/server";
import { getFinancingApplication } from "@/app/actions";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import { Link } from "@/i18n/routing";

function Stat({ label, value }: { label: string; value: string }) {
	return (
		<div className="bg-surface-container-low rounded-xl p-3">
			<p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
				{label}
			</p>
			<p className="text-sm font-bold mt-1 text-on-surface break-words">
				{value || "—"}
			</p>
		</div>
	);
}

export default async function FinancingDetailPage({
	params,
}: {
	params: Promise<{ id: string; locale: string }>;
}) {
	const { id, locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("FinancingDetailPage");

	const result = await getFinancingApplication(id);
	const app = result.data;

	return (
		<div className="bg-surface text-on-surface">
			<TopNav />
			<div className="flex pt-16 h-screen">
				<SideNav />
				<main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-10 no-scrollbar">
					<div className="w-full space-y-6">
						<div className="flex items-center justify-between gap-3">
							<div>
								<p className="text-xs font-bold uppercase tracking-widest text-[#FF5A30]">
									{t("tagline")}
								</p>
								<h1 className="text-3xl font-(family-name:--font-manrope) font-extrabold mt-1">
									{t("title")}
								</h1>
							</div>
							<Link
								href="/financing"
								className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-variant/30 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low"
							>
								<span className="material-symbols-outlined text-sm">
									arrow_back
								</span>
								{t("actions.back")}
							</Link>
						</div>

						{!result.success || !app ? (
							<div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-6 text-sm font-medium">
								{result.error ?? t("errors.load")}
							</div>
						) : (
							(() => {
								const fmtDate = (d: Date | string) =>
									new Date(d).toLocaleDateString(locale, {
										month: "short",
										day: "numeric",
										year: "numeric",
									});
								const money = (n: number) =>
									`${app.currency} ${Number(n).toLocaleString(locale)}`;
								const tour = app.tour;
								const hasBanking =
									!!app.bank_name || !!app.account_number || !!app.account_name;
								return (
									<div className="space-y-6">
										{/* Summary */}
										<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm space-y-5">
											<div className="flex flex-wrap items-start justify-between gap-3">
												<div>
													<p className="text-sm text-on-surface-variant">
														{t("fields.product")}
													</p>
													<p className="text-xl font-(family-name:--font-manrope) font-bold text-on-surface">
														{app.product || t("defaultProduct")}
													</p>
												</div>
												<span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-surface-container-high text-on-surface-variant">
													{String(app.status).replace(/_/g, " ")}
												</span>
											</div>

											<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
												<Stat
													label={t("fields.requested")}
													value={money(app.amount_requested)}
												/>
												<Stat
													label={t("fields.submitted")}
													value={fmtDate(app.created_at)}
												/>
												{app.approved_at ? (
													<Stat
														label={t("fields.approved")}
														value={fmtDate(app.approved_at)}
													/>
												) : (
													<Stat
														label={t("fields.partner")}
														value={app.partner_name || t("fields.unassigned")}
													/>
												)}
											</div>

											{app.purpose ? (
												<div>
													<p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
														{t("fields.purpose")}
													</p>
													<p className="text-sm text-on-surface whitespace-pre-line">
														{app.purpose}
													</p>
												</div>
											) : null}
										</div>

										{/* Tour details */}
										{tour ? (
											<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
												<p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
													{t("tour.title")}
												</p>
												<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
													<Stat
														label={t("tour.artist")}
														value={tour.artist?.name ?? "—"}
													/>
													<Stat
														label={t("tour.genre")}
														value={tour.artist?.genre ?? "—"}
													/>
													<Stat
														label={t("tour.name")}
														value={
															tour.artist?.tour_name ?? tour.tour_name ?? "—"
														}
													/>
													<Stat label={t("tour.venue")} value={tour.venue} />
													<Stat
														label={t("tour.dates")}
														value={tour.artist?.tour_window ?? "—"}
													/>
													<Stat
														label={t("tour.capacity")}
														value={
															tour.capacity != null
																? tour.capacity.toLocaleString(locale)
																: "—"
														}
													/>
													<Stat
														label={t("tour.ticketsSold")}
														value={tour.tickets_sold.toLocaleString(locale)}
													/>
													<Stat label={t("tour.fee")} value={money(tour.fee_usd)} />
													{tour.financing_amount != null ? (
														<Stat
															label={t("tour.financingAmount")}
															value={money(tour.financing_amount)}
														/>
													) : null}
												</div>
											</div>
										) : null}

										{/* Disbursement account */}
										{hasBanking ? (
											<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
												<div className="flex items-center justify-between gap-3 mb-4">
													<p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
														{t("banking.title")}
													</p>
													{app.account_name ? (
														<span
															className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${app.account_verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
														>
															{app.account_verified
																? t("banking.verified")
																: t("banking.unverified")}
														</span>
													) : null}
												</div>
												<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
													{app.bank_name ? (
														<Stat
															label={t("banking.bank")}
															value={app.bank_name}
														/>
													) : null}
													{app.account_number ? (
														<Stat
															label={t("banking.account")}
															value={`****${String(app.account_number).slice(-4)}`}
														/>
													) : null}
													{app.account_name ? (
														<Stat
															label={t("banking.holder")}
															value={app.account_name}
														/>
													) : null}
												</div>
											</div>
										) : null}

										{/* Documents + term sheet */}
										<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
											<p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">
												{t("fields.documents")}
											</p>
											{app.documents.length === 0 && !app.term_sheet_url ? (
												<p className="text-sm text-on-surface-variant">
													{t("docs.none")}
												</p>
											) : (
												<div className="flex flex-wrap gap-2">
													{app.documents.map((doc, index) => (
														<a
															key={`${index}-${doc}`}
															href={doc}
															target="_blank"
															rel="noopener noreferrer"
															className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-high text-xs font-bold text-on-surface hover:bg-surface-container-highest transition-colors"
														>
															<span className="material-symbols-outlined text-xs">
																attach_file
															</span>
															{t("docs.open", { index: index + 1 })}
														</a>
													))}
													{app.term_sheet_url ? (
														<a
															href={app.term_sheet_url}
															target="_blank"
															rel="noopener noreferrer"
															className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FF5A30]/10 text-xs font-bold text-[#FF5A30] hover:bg-[#FF5A30]/20 transition-colors"
														>
															<span className="material-symbols-outlined text-xs">
																open_in_new
															</span>
															{t("docs.termSheet")}
														</a>
													) : null}
												</div>
											)}
										</div>

										{/* Reviewer note */}
										{app.note ? (
											<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
												<p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
													{t("fields.note")}
												</p>
												<p className="text-sm text-on-surface whitespace-pre-line">
													{app.note}
												</p>
											</div>
										) : null}
									</div>
								);
							})()
						)}
					</div>
				</main>
			</div>
		</div>
	);
}

import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAdminEOIs } from "@/app/actions";
import AITourScorePanel from "@/components/AITourScorePanel";
import EoiActionPanel from "@/components/EoiActionPanel";
import EoiDocumentsPanel from "@/components/EoiDocumentsPanel";
import PageTour from "@/components/PageTour";

function EoiNotesDisplay({ notes }: { notes: string }) {
	const sections = notes
		.split(/\n{2,}/)
		.map((s) => s.trim())
		.filter(Boolean);

	return (
		<div className="mt-1 space-y-1.5">
			{sections.map((section, i) => {
				const lines = section.split("\n");
				const header = lines[0]?.trim();
				const body = lines.slice(1).map((l) => l.trim()).filter(Boolean);
				return (
					<div key={i} className="px-3 py-2 bg-surface-container-low rounded-lg">
						<p className="text-[9px] font-black uppercase tracking-widest text-[#FF5A30] mb-1">
							{header}
						</p>
						{body.map((line, j) => (
							<p key={j} className="text-xs text-on-surface leading-relaxed">
								{line.split(" | ").join(" · ")}
							</p>
						))}
					</div>
				);
			})}
		</div>
	);
}

function MatchBar({ score }: { score: number }) {
	const color =
		score >= 80
			? "bg-emerald-500"
			: score >= 60
				? "bg-yellow-400"
				: "bg-red-400";
	return (
		<div className="flex items-center gap-2">
			<div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
				<div
					className={`${color} h-full rounded-full`}
					style={{ width: `${score}%` }}
				/>
			</div>
			<span className="text-xs font-black text-on-surface w-8 text-right">
				{score}%
			</span>
		</div>
	);
}

export default async function AdminEOIPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("AdminEOIPage");

	const eoisResult = await getAdminEOIs();
	const eois = eoisResult.data ?? [];
	const pendingEOICount = eois.filter((e) =>
		["pending", "pending_review"].includes(
			String(e.status ?? "").toLowerCase(),
		),
	).length;

	return (
		<>
			<PageTour pageId="admin-eoi" />
			<div className="mb-10">
				<span className="text-xs font-semibold uppercase tracking-widest text-[#FF5A30] block mb-2">
					{t("badge")}
				</span>
				<h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
					{t("title")}
				</h1>
				<p className="text-on-surface-variant font-medium">
					{t("description")}
				</p>
			</div>

			<div data-tour="admin-eoi-list" className="bg-surface-container-lowest rounded-2xl p-4 md:p-6 shadow-sm">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-(family-name:--font-manrope) font-semibold">
						{t("pendingSubmissions")}
					</h2>
					<span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-black">
						{pendingEOICount} {t("pendingCount")}
					</span>
				</div>

				<div className="space-y-4">
					{eois.length === 0 && (
						<div className="bg-surface-container-low rounded-2xl p-12 text-center">
							<span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-4">
								inbox
							</span>
							<p className="font-(family-name:--font-manrope) font-semibold text-on-surface text-lg mb-2">
								{t("noEois")}
							</p>
							<p className="text-on-surface-variant text-sm">
								{t("noEoisDesc")}
							</p>
						</div>
					)}
					{eois.map((eoi) => {
						const eoiArtist = eoi.artist;
						const eoiPromoter = eoi.promoter;
						const status = String(eoi.status ?? "pending");
						const statusColor =
							status === "approved"
								? "bg-emerald-100 text-emerald-800"
								: status === "rejected"
									? "bg-red-100 text-red-800"
									: status === "needs_revision"
										? "bg-blue-100 text-blue-800"
										: "bg-yellow-100 text-yellow-800";
						const matchScore =
							typeof eoi.match_score === "number"
								? eoi.match_score
								: typeof eoi.match_score === "string"
									? Number(eoi.match_score)
									: 0;
						return (
							<div
								key={String(eoi.id)}
								className="bg-surface-container-low rounded-2xl p-4 md:p-6 border border-outline-variant/10"
							>
								<div className="flex items-start gap-4">
									<div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-surface-container-high flex items-center justify-center">
										<span className="material-symbols-outlined text-on-surface-variant">
											music_note
										</span>
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 flex-wrap mb-1">
											<span className="text-xs font-black text-[#FF5A30] uppercase tracking-widest">
												{eoi.id
													? `EOI-${String(eoi.id).slice(-4).toUpperCase()}`
													: "EOI"}
											</span>
											<span
												className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusColor}`}
											>
												{status.replace(/_/g, " ")}
											</span>
										</div>
										<h3 className="font-(family-name:--font-manrope) font-semibold text-on-surface text-lg">
											{String(eoiArtist?.name ?? "Artist")}
											<span className="text-on-surface-variant font-normal text-sm ml-1">
												— {String(eoiArtist?.tour_name ?? "")}
											</span>
										</h3>
										<p className="text-sm text-on-surface-variant mt-0.5">
											<span className="font-semibold text-on-surface">
												{String(eoiPromoter?.company_name ?? "")}
											</span>
											{" · "}
											{String(eoi.city ?? "")}
										</p>
									</div>
								</div>

								<div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
									{[
										{
											icon: "event",
											label: t("fields.date"),
											value: eoi.created_at
												? new Date(String(eoi.created_at)).toLocaleDateString()
												: "—",
										},
										{
											icon: "location_on",
											label: t("fields.venue"),
											value: String(eoi.venue ?? eoi.city ?? "—"),
										},
										{
											icon: "groups",
											label: t("fields.capacity"),
											value: eoi.capacity != null ? String(eoi.capacity) : "—",
										},
										{
											icon: "payments",
											label: t("fields.budget"),
											value: eoi.budget != null ? String(eoi.budget) : "—",
										},
									].map((d) => (
										<div
											key={d.label}
											className="bg-surface-container-lowest rounded-lg p-3"
										>
											<div className="flex items-center gap-1 text-on-surface-variant mb-1">
												<span className="material-symbols-outlined text-xs">
													{d.icon}
												</span>
												<span className="text-[10px] font-semibold uppercase tracking-wider">
													{d.label}
												</span>
											</div>
											<p className="text-sm font-semibold text-on-surface">
												{d.value}
											</p>
										</div>
									))}
								</div>

								<div className="mt-4 space-y-2">
									<div className="flex items-center gap-3">
										<span className="text-xs font-semibold text-on-surface-variant w-20 shrink-0">
											{t("matchScore")}
										</span>
										<div className="flex-1">
											<MatchBar score={matchScore} />
										</div>
									</div>

									{/* Finance / insurance badges */}
									<div className="flex flex-wrap gap-2 pt-1">
										{String(eoi.funding_type ?? "") === "required" && (
											<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider">
												<span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
												{t("financeRequested")}
											</span>
										)}
										{String(eoi.notes ?? "").includes("Insurance support requested") && (
											<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
												<span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
												{t("insuranceRequested")}
											</span>
										)}
									</div>

									{/* Finance / insurance sign-off status */}
								{((eoi as Record<string, unknown>).finance_status != null ||
									(eoi as Record<string, unknown>).insurance_status != null) && (
									<div className="flex flex-wrap gap-2">
										{(eoi as Record<string, unknown>).finance_status != null && (
											<span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${String((eoi as Record<string, unknown>).finance_status) === "disbursed" ? "bg-emerald-100 text-emerald-800" : "bg-blue-50 text-blue-700"}`}>
												<span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
												{t("finance")}: {String((eoi as Record<string, unknown>).finance_status)}
											</span>
										)}
										{(eoi as Record<string, unknown>).insurance_status != null && (
											<span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${String((eoi as Record<string, unknown>).insurance_status) === "disbursed" ? "bg-emerald-100 text-emerald-800" : "bg-purple-50 text-purple-700"}`}>
												<span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
												{t("insurance")}: {String((eoi as Record<string, unknown>).insurance_status)}
											</span>
										)}
									</div>
								)}

								{/* Promoter contact */}
									{(eoiPromoter?.contact_person != null || (eoiPromoter as Record<string, unknown>)?.phone != null) && (
										<div className="flex items-center gap-2 text-xs text-on-surface-variant">
											<span className="material-symbols-outlined text-xs">person</span>
											<span className="font-semibold text-on-surface-variant">{t("promoterContact")}:</span>
											<span className="font-semibold text-on-surface">
												{String(eoiPromoter?.contact_person ?? "")}
												{(eoiPromoter as Record<string, unknown>)?.phone != null && (
													<> · {String((eoiPromoter as Record<string, unknown>).phone)}</>
												)}
											</span>
										</div>
									)}

									{/* Notes */}
									{eoi.notes != null && String(eoi.notes).trim() !== "" && (
										<div className="mt-1">
											<p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">{t("notes")}</p>
											<EoiNotesDisplay notes={String(eoi.notes)} />
										</div>
									)}

									{eoi.flag_note != null && String(eoi.flag_note) !== "signed_off" && (
										<div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg text-xs text-red-700 font-semibold">
											<span className="material-symbols-outlined text-xs text-red-500">
												flag
											</span>
											{String(eoi.flag_note)}
										</div>
									)}
								</div>

								<div className="mt-5">
									<EoiActionPanel
										eoiId={String(eoi.id)}
										currentStatus={status}
										eoiCity={String(eoi.city ?? "")}
										forwardedToFinance={Boolean((eoi as Record<string, unknown>).forwarded_to_finance)}
										forwardedToInsurance={Boolean((eoi as Record<string, unknown>).forwarded_to_insurance)}
										signedOff={String(eoi.flag_note ?? "") === "signed_off"}
									/>
								</div>
								{status === "approved" && (
									<div className="mt-4 border-t border-slate-100 pt-4">
										<p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">
											Uploaded Documents
										</p>
										<EoiDocumentsPanel eoiId={String(eoi.id)} />
									</div>
								)}
								<div className="mt-4 border-t border-slate-100 pt-4">
									<p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-3">
										AI Tour Success Score™
									</p>
									<AITourScorePanel eoiId={String(eoi.id)} />
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</>
	);
}

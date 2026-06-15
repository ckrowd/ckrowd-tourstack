import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAdminReport } from "@/app/actions";
import AdminReportExport from "@/components/AdminReportExport";

export default async function AdminReportsPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("AdminReportsPage");

	const reportResult = await getAdminReport();
	const report = reportResult.data;

	const usd = (amount: number) =>
		`$${Number(amount).toLocaleString(locale, { maximumFractionDigits: 0 })}`;

	const stats = report
		? [
				{ label: t("stats.totalEois"), value: String(report.eois.total) },
				{ label: t("stats.approvalRate"), value: `${report.approvalRate}%` },
				{ label: t("stats.totalTours"), value: String(report.tours.total) },
				{ label: t("stats.activeArtists"), value: String(report.activeArtists) },
				{
					label: t("stats.totalDisbursed"),
					value: usd(report.financing.totalDisbursed),
				},
				{
					label: t("stats.totalRequested"),
					value: usd(report.financing.totalRequested),
				},
				{ label: t("stats.crewMembers"), value: String(report.crewMembers) },
				{ label: t("stats.stakeholders"), value: String(report.stakeholders) },
			]
		: [];

	const breakdowns = report
		? [
				{ title: t("breakdowns.eois"), data: report.eois.byStatus },
				{ title: t("breakdowns.tours"), data: report.tours.byStatus },
				{ title: t("breakdowns.financing"), data: report.financing.byStatus },
			]
		: [];

	return (
		<>
			<div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
				<div>
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
				<AdminReportExport />
			</div>

			{!report ? (
				<div className="bg-surface-container-lowest rounded-2xl p-12 text-center shadow-sm border border-outline-variant/10">
					<span className="material-symbols-outlined text-6xl text-on-surface-variant block mb-6">
						error
					</span>
					<p className="text-on-surface-variant">{t("loadError")}</p>
				</div>
			) : (
				<div className="space-y-8">
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
						{stats.map((s) => (
							<div
								key={s.label}
								className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10"
							>
								<p className="text-3xl font-black font-(family-name:--font-manrope) text-on-surface">
									{s.value}
								</p>
								<p className="text-xs uppercase font-semibold text-on-surface-variant mt-2 tracking-wider">
									{s.label}
								</p>
							</div>
						))}
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{breakdowns.map((b) => {
							const rows = Object.entries(b.data);
							return (
								<div
									key={b.title}
									className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10"
								>
									<h2 className="font-(family-name:--font-manrope) font-semibold text-on-surface mb-4 pb-4 border-b border-outline-variant/20">
										{b.title}
									</h2>
									{rows.length === 0 ? (
										<p className="text-sm text-on-surface-variant">
											{t("noBreakdown")}
										</p>
									) : (
										<ul className="space-y-3">
											{rows.map(([status, count]) => (
												<li
													key={status}
													className="flex items-center justify-between gap-4"
												>
													<span className="text-sm text-on-surface-variant capitalize">
														{status.replace(/_/g, " ")}
													</span>
													<span className="text-sm font-semibold text-on-surface">
														{Number(count).toLocaleString(locale)}
													</span>
												</li>
											))}
										</ul>
									)}
								</div>
							);
						})}
					</div>
				</div>
			)}
		</>
	);
}

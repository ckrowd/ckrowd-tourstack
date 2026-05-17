import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAdminFinancing } from "@/app/actions";

function statusColor(status: string): string {
	switch (status) {
		case "approved":
		case "disbursed":
			return "text-emerald-700 bg-emerald-50";
		case "rejected":
			return "text-red-700 bg-red-50";
		case "under_review":
			return "text-blue-700 bg-blue-50";
		default:
			return "text-yellow-600 bg-yellow-50";
	}
}

export default async function AdminFinancingPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("AdminFinancingPage");

	const result = await getAdminFinancing();
	const applications = result.data ?? [];

	return (
		<>
			<div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
				<div>
					<span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-2">
						{t("badge")}
					</span>
					<h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
						{t("title")}
					</h1>
					<p className="text-on-surface-variant font-medium">
						{t("description")}
					</p>
				</div>
			</div>

			<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
				<div className="flex items-center justify-between mb-5">
					<h3 className="font-(family-name:--font-manrope) font-bold text-lg">
						{t("requestsTitle")}
					</h3>
					<span className="material-symbols-outlined text-[#FF5A30]">
						account_balance
					</span>
				</div>

				{!result.success ? (
					<p className="text-sm font-medium text-red-600 py-8 text-center">
						{result.error || t("loadError")}
					</p>
				) : applications.length === 0 ? (
					<div className="py-12 text-center">
						<span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-4">
							account_balance
						</span>
						<p className="text-on-surface-variant font-medium">{t("empty")}</p>
					</div>
				) : (
					<div className="space-y-4">
						{applications.map((f) => {
							const status = String(f.status ?? "pending");
							const promoter = f.promoter;
							const promoterName = String(
								promoter?.company_name ??
									promoter?.contact_person ??
									promoter?.user?.name ??
									promoter?.user?.email ??
									"—",
							);
							const artist = f.tour?.artist;
							const tourLabel = artist
								? `${String(artist.name ?? "")}${
										artist.tour_name ? ` — ${String(artist.tour_name)}` : ""
									}`
								: "—";
							const amount = `${String(f.currency ?? "USD")} ${Number(
								f.amount_requested ?? 0,
							).toLocaleString(locale)}`;
							return (
								<div
									key={String(f.id)}
									className="flex items-center justify-between gap-4 p-4 border border-outline-variant/10 rounded-xl hover:bg-surface-container-low transition-colors"
								>
									<div>
										<p className="text-base font-bold text-on-surface">
											{promoterName}
										</p>
										<p className="text-sm text-on-surface-variant mt-1">
											{tourLabel} —{" "}
											<span className="font-semibold">
												{amount} {t("requested")}
											</span>
										</p>
									</div>
									<span
										className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shrink-0 ${statusColor(
											status,
										)}`}
									>
										{t(`status.${status}`)}
									</span>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</>
	);
}

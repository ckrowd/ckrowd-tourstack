import { getTranslations, setRequestLocale } from "next-intl/server";
import { getFinancingEois } from "@/app/actions";
import Button from "@/components/ui/Button";
import StatusBadge, { type StatusTone } from "@/components/ui/StatusBadge";
import { Link } from "@/i18n/routing";

function financeStatusToTone(status: string): StatusTone {
	switch (status) {
		case "disbursed":
			return "approved";
		default:
			return "pending";
	}
}

export default async function FinancingAdminPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("FinancingAdminPage");

	const result = await getFinancingEois();
	const eois = ((result.data as Record<string, unknown>[] | null) ?? []).slice(0, 6);
	const workflow = t.raw("workflow.items") as {
		title: string;
		description: string;
		icon: string;
	}[];

	return (
		<>
			<div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-5">
				<div>
					<span className="text-xs font-semibold uppercase tracking-widest text-[#FF5A2E] block mb-2">
						{t("badge")}
					</span>
					<h1 className="text-2xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
						{t("title")}
					</h1>
					<p className="text-on-surface-variant text-sm font-medium max-w-3xl">
						{t("description")}
					</p>
				</div>
				<Button
					href="/financing-admin/applications"
					className="font-(family-name:--font-manrope) shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 shrink-0"
				>
					<span className="material-symbols-outlined text-base">rate_review</span>
					{t("reviewQueue")}
				</Button>
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-8">
				<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
					<div className="flex items-center justify-between mb-5">
						<h2 className="font-(family-name:--font-manrope) font-semibold text-base">
							{t("queue.title")}
						</h2>
						<Link
							href="/financing-admin/applications"
							className="text-sm font-semibold text-[#FF5A2E] hover:underline"
						>
							{t("queue.viewAll")}
						</Link>
					</div>

					{!result.success ? (
						<p className="text-sm font-medium text-red-600 py-10 text-center">
							{result.error || t("queue.loadError")}
						</p>
					) : eois.length === 0 ? (
						<div className="py-12 text-center">
							<span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-3">
								request_quote
							</span>
							<p className="text-on-surface-variant font-medium text-sm">
								{t("queue.empty")}
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{eois.map((eoi) => {
								const financeStatus = String(eoi.finance_status ?? "pending");
								const promoter = eoi.promoter as Record<string, unknown> | null;
								const user = promoter?.user as Record<string, unknown> | null;
								const promoterName = String(
									promoter?.company_name ??
										promoter?.contact_person ??
										user?.name ??
										user?.email ??
										"—",
								);
								const artist = eoi.artist as Record<string, unknown> | null;
								const artistName = artist ? String(artist.name ?? "—") : "—";
								const tourName = artist ? String(artist.tour_name ?? "") : "";
								return (
									<div
										key={String(eoi.id)}
										className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-outline-variant/10 last:border-none"
									>
										<div className="flex items-start gap-3 min-w-0">
											<div className="w-11 h-11 rounded-xl bg-surface-container-low flex items-center justify-center shrink-0">
												<span className="material-symbols-outlined text-on-surface-variant">
													request_quote
												</span>
											</div>
											<div className="min-w-0">
												<div className="flex items-center gap-2 flex-wrap mb-1">
													<span className="text-xs font-black text-[#FF5A2E] uppercase tracking-widest">
														{`#${String(eoi.id).slice(-6).toUpperCase()}`}
													</span>
													<StatusBadge tone={financeStatusToTone(financeStatus)}>
														{t(`status.${financeStatus}`)}
													</StatusBadge>
												</div>
												<p className="font-(family-name:--font-manrope) font-semibold text-on-surface truncate">
													{promoterName}
												</p>
												<p className="text-sm text-on-surface-variant mt-0.5">
													{artistName}
													{tourName ? ` · ${tourName}` : ""}
												</p>
												{eoi.city != null && (
													<p className="text-xs text-on-surface-variant mt-0.5">
														{String(eoi.city)}
													</p>
												)}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>

				<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
					<h2 className="font-(family-name:--font-manrope) font-semibold text-base mb-5">
						{t("workflow.title")}
					</h2>
					<div className="space-y-4">
						{workflow.map((item) => (
							<div
								key={item.title}
								className="bg-surface-container-low rounded-2xl p-4 flex items-start gap-3"
							>
								<span className="material-symbols-outlined text-[#FF5A2E] shrink-0">
									{item.icon}
								</span>
								<div>
									<p className="font-semibold text-sm text-on-surface">
										{item.title}
									</p>
									<p className="text-xs text-on-surface-variant mt-1 leading-5">
										{item.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</>
	);
}

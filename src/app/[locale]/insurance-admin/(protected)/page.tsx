import { getTranslations, setRequestLocale } from "next-intl/server";
import { getInsuranceEois, getInsuranceClaims } from "@/app/actions";
import { Link } from "@/i18n/routing";

type Props = {
	params: Promise<{ locale: string }>;
};

function statusClass(status: string) {
	switch (status) {
		case "disbursed":
			return "bg-emerald-100 text-emerald-700";
		default:
			return "bg-yellow-100 text-yellow-700";
	}
}

export default async function InsuranceAdminPage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("InsuranceAdminPage");

	const [eoisResult, claimsResult] = await Promise.all([
		getInsuranceEois(),
		getInsuranceClaims(),
	]);
	const eois = (eoisResult.data as Record<string, unknown>[] | null) ?? [];
	const claims = (claimsResult.data ?? []) as Record<string, unknown>[];

	const countBy = (predicate: (s: string | null) => boolean) =>
		eois.filter((e) => predicate(e.insurance_status != null ? String(e.insurance_status) : null)).length;

	const stats = [
		{
			label: t("stats.activeApplications"),
			value: eois.length,
			icon: "description",
			accent: "border-[#FF5A30]",
			href: "/insurance-admin/applications",
		},
		{
			label: t("stats.pendingReview"),
			value: countBy((s) => s === null || s === "pending"),
			icon: "pending",
			accent: "border-yellow-400",
			href: "/insurance-admin/applications",
		},
		{
			label: t("stats.approvedPolicies"),
			value: countBy((s) => s === "disbursed"),
			icon: "task_alt",
			accent: "border-emerald-500",
			href: "/insurance-admin/applications",
		},
		{
			label: t("stats.claimsProcessed"),
			value: claims.length,
			icon: "assignment_late",
			accent: "border-blue-400",
			href: "/insurance-admin/claims",
		},
	];

	const recentEois = eois.slice(0, 5);

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
			</div>

			<div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
				{stats.map((s) => (
					<Link
						href={s.href}
						key={s.label}
						className={`bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col gap-3 border-l-4 ${s.accent} hover:shadow-md transition-shadow`}
					>
						<div className="flex items-center justify-between">
							<p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
								{s.label}
							</p>
							<span className="material-symbols-outlined text-on-surface-variant text-base">
								{s.icon}
							</span>
						</div>
						<span className="text-4xl font-(family-name:--font-manrope) font-extrabold text-on-surface">
							{s.value}
						</span>
					</Link>
				))}
			</div>

			<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
				<div className="flex items-center justify-between mb-5">
					<h3 className="font-(family-name:--font-manrope) font-semibold text-lg">
						{t("recentApplications")}
					</h3>
					<Link
						href="/insurance-admin/applications"
						className="text-sm font-semibold text-[#FF5A30] hover:underline"
					>
						{t("viewAll")}
					</Link>
				</div>

				<div className="space-y-4">
					{!eoisResult.success ? (
						<p className="text-sm font-medium text-red-600 py-6 text-center">
							{eoisResult.error || t("loadError")}
						</p>
					) : recentEois.length === 0 ? (
						<div className="bg-surface-container-low rounded-2xl p-8 text-center">
							<span className="material-symbols-outlined text-4xl text-on-surface-variant block mb-3">
								shield
							</span>
							<p className="font-(family-name:--font-manrope) font-semibold text-on-surface mb-1">
								{t("noApplications")}
							</p>
							<p className="text-on-surface-variant text-sm">
								{t("noApplicationsDesc")}
							</p>
						</div>
					) : (
						recentEois.map((eoi) => {
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
							const insuranceStatus = String(eoi.insurance_status ?? "pending");
							return (
								<div
									key={String(eoi.id)}
									className="flex items-center justify-between gap-4 py-3 border-b border-outline-variant/10 last:border-none"
								>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-semibold text-on-surface truncate">
											{promoterName}
										</p>
										<p className="text-xs text-on-surface-variant mt-0.5">
											{artistName}
											{tourName ? ` — ${tourName}` : ""}
											{eoi.city != null ? ` · ${String(eoi.city)}` : ""}
										</p>
									</div>
									<span
										className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusClass(insuranceStatus)}`}
									>
										{t(`status.${insuranceStatus}`)}
									</span>
								</div>
							);
						})
					)}
				</div>
			</div>
		</>
	);
}

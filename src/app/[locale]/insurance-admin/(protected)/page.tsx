import { getTranslations, setRequestLocale } from "next-intl/server";
import { getInsuranceApplications, getInsuranceClaims } from "@/app/actions";
import { Link } from "@/i18n/routing";

type Props = {
	params: Promise<{ locale: string }>;
};

function statusClass(status: string) {
	switch (status) {
		case "approved":
		case "disbursed":
			return "bg-emerald-100 text-emerald-700";
		case "rejected":
			return "bg-red-100 text-red-700";
		case "under_review":
			return "bg-blue-100 text-blue-700";
		default:
			return "bg-yellow-100 text-yellow-700";
	}
}

export default async function InsuranceAdminPage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("InsuranceAdminPage");

	const [appsResult, claimsResult] = await Promise.all([
		getInsuranceApplications(),
		getInsuranceClaims(),
	]);
	const applications = (appsResult.data ?? []) as Record<string, unknown>[];
	const claims = (claimsResult.data ?? []) as Record<string, unknown>[];

	const countBy = (predicate: (s: string) => boolean) =>
		applications.filter((a) => predicate(String(a.status ?? "pending"))).length;

	const stats = [
		{
			label: t("stats.activeApplications"),
			value: applications.length,
			icon: "description",
			accent: "border-[#FF5A30]",
			href: "/insurance-admin/applications",
		},
		{
			label: t("stats.pendingReview"),
			value: countBy((s) => s === "pending" || s === "under_review"),
			icon: "pending",
			accent: "border-yellow-400",
			href: "/insurance-admin/applications",
		},
		{
			label: t("stats.approvedPolicies"),
			value: countBy((s) => s === "approved" || s === "disbursed"),
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

	const recentApplications = applications.slice(0, 5);

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
					{!appsResult.success ? (
						<p className="text-sm font-medium text-red-600 py-6 text-center">
							{appsResult.error || t("loadError")}
						</p>
					) : recentApplications.length === 0 ? (
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
						recentApplications.map((app) => {
							const promoter = app.promoter as Record<string, unknown> | null;
							const user = promoter?.user as Record<string, unknown> | null;
							const promoterName = String(
								promoter?.company_name ??
									promoter?.contact_person ??
									user?.name ??
									user?.email ??
									"—",
							);
							const tour = app.tour as Record<string, unknown> | null;
							const artist = tour?.artist as Record<string, unknown> | null;
							const tourLabel = artist
								? String(artist.tour_name ?? artist.name ?? "—")
								: "—";
							const status = String(app.status ?? "pending");
							const coverage = `${String(app.currency ?? "USD")} ${Number(
								app.amount_requested ?? 0,
							).toLocaleString(locale)}`;
							return (
								<div
									key={String(app.id)}
									className="flex items-center justify-between gap-4 py-3 border-b border-outline-variant/10 last:border-none"
								>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-semibold text-on-surface truncate">
											{promoterName}
										</p>
										<p className="text-xs text-on-surface-variant mt-0.5">
											{tourLabel} —{" "}
											<span className="font-semibold">{coverage}</span>
										</p>
									</div>
									<span
										className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusClass(status)}`}
									>
										{t(`status.${status}`)}
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

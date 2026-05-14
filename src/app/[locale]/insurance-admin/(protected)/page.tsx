import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";

type Props = {
	params: Promise<{ locale: string }>;
};

export default async function InsuranceAdminPage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("InsuranceAdminPage");

	const stats = [
		{
			label: t("stats.activeApplications"),
			value: "12",
			icon: "description",
			accent: "border-[#FF5A30]",
			href: "/insurance-admin/applications",
		},
		{
			label: t("stats.pendingReview"),
			value: "5",
			icon: "pending",
			accent: "border-yellow-400",
			href: "/insurance-admin/applications",
		},
		{
			label: t("stats.approvedPolicies"),
			value: "7",
			icon: "task_alt",
			accent: "border-emerald-500",
			href: "/insurance-admin/applications",
		},
		{
			label: t("stats.claimsProcessed"),
			value: "3",
			icon: "assignment_late",
			accent: "border-blue-400",
			href: "/insurance-admin/claims",
		},
	];

	const recentApplications = [
		{
			promoter: "Stage One Productions",
			tour: "Burna Boy — Twice As Tall",
			coverage: "$50,000",
			status: "pending" as const,
			statusColor: "bg-yellow-100 text-yellow-700",
		},
		{
			promoter: "Pulse Nairobi",
			tour: "Davido — Timeless Tour",
			coverage: "$35,000",
			status: "approved" as const,
			statusColor: "bg-emerald-100 text-emerald-700",
		},
		{
			promoter: "Teranga Concerts",
			tour: "Asake — Work of Art",
			coverage: "$20,000",
			status: "under_review" as const,
			statusColor: "bg-blue-100 text-blue-700",
		},
	];

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
					<p className="text-on-surface-variant font-medium">{t("description")}</p>
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
							<p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
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
					<h3 className="font-(family-name:--font-manrope) font-bold text-lg">
						{t("recentApplications")}
					</h3>
					<Link
						href="/insurance-admin/applications"
						className="text-sm font-bold text-[#FF5A30] hover:underline"
					>
						{t("viewAll")}
					</Link>
				</div>

				<div className="space-y-4">
					{recentApplications.length === 0 && (
						<div className="bg-surface-container-low rounded-2xl p-8 text-center">
							<span className="material-symbols-outlined text-4xl text-on-surface-variant block mb-3">
								shield
							</span>
							<p className="font-(family-name:--font-manrope) font-bold text-on-surface mb-1">
								{t("noApplications")}
							</p>
							<p className="text-on-surface-variant text-sm">
								{t("noApplicationsDesc")}
							</p>
						</div>
					)}
					{recentApplications.map((app) => (
						<div
							key={app.promoter}
							className="flex items-center justify-between gap-4 py-3 border-b border-outline-variant/10 last:border-none"
						>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-bold text-on-surface truncate">
									{app.promoter}
								</p>
								<p className="text-xs text-on-surface-variant mt-0.5">
									{app.tour} — <span className="font-semibold">{app.coverage}</span>
								</p>
							</div>
							<span
								className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${app.statusColor}`}
							>
								{app.status.replace(/_/g, " ")}
							</span>
						</div>
					))}
				</div>
			</div>
		</>
	);
}

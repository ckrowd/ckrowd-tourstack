import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function InsuranceAdminClaimsPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("InsuranceAdminClaimsPage");

	const claims = [
		{
			promoter: "Stage One Productions",
			tour: "Burna Boy — Twice As Tall",
			policyRef: "POL-2024-001",
			amount: "$12,000",
			status: t("status.open"),
			color: "text-yellow-600 bg-yellow-50",
		},
		{
			promoter: "Pulse Nairobi",
			tour: "Davido — Timeless Tour",
			policyRef: "POL-2024-002",
			amount: "$8,500",
			status: t("status.under_review"),
			color: "text-blue-700 bg-blue-50",
		},
		{
			promoter: "Teranga Concerts",
			tour: "Asake — Work of Art",
			policyRef: "POL-2024-003",
			amount: "$5,200",
			status: t("status.settled"),
			color: "text-emerald-700 bg-emerald-50",
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

			<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
				<div className="flex items-center justify-between mb-5">
					<h3 className="font-(family-name:--font-manrope) font-bold text-lg">
						{t("claimsTitle")}
					</h3>
					<span className="material-symbols-outlined text-[#FF5A30]">
						assignment_late
					</span>
				</div>
				<div className="space-y-4">
					{claims.map((claim) => (
						<div
							key={claim.policyRef}
							className="flex items-center justify-between gap-4 p-4 border border-outline-variant/10 rounded-xl hover:bg-surface-container-low transition-colors"
						>
							<div>
								<p className="text-base font-bold text-on-surface">{claim.promoter}</p>
								<p className="text-sm text-on-surface-variant mt-1">
									{claim.tour}
								</p>
								<p className="text-xs text-on-surface-variant mt-0.5">
									{t("policyRef")}:{" "}
									<span className="font-semibold">{claim.policyRef}</span>
									{" — "}
									<span className="font-semibold">{claim.amount}</span>
								</p>
							</div>
							<div className="flex flex-col items-end gap-2">
								<span
									className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${claim.color}`}
								>
									{claim.status}
								</span>
								<button
									type="button"
									className="text-xs font-bold text-[#FF5A30] hover:underline"
								>
									{t("reviewClaim")}
								</button>
							</div>
						</div>
					))}
				</div>
			</div>
		</>
	);
}

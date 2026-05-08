import { getTranslations, setRequestLocale } from "next-intl/server";

type ApplicationItem = {
	id: string;
	promoter: string;
	tour: string;
	market: string;
	product: string;
	amount: string;
	requested: string;
	status: string;
	statusKey: "pending" | "underReview" | "approved" | "disbursed";
	risk: string;
	riskKey: "low" | "medium" | "high";
	documents: string;
	partner: string;
};

function statusClass(status: ApplicationItem["statusKey"]) {
	if (status === "approved") return "bg-emerald-100 text-emerald-800";
	if (status === "disbursed") return "bg-purple-100 text-purple-800";
	if (status === "underReview") return "bg-blue-100 text-blue-800";
	return "bg-yellow-100 text-yellow-800";
}

function riskClass(risk: ApplicationItem["riskKey"]) {
	if (risk === "low") return "bg-emerald-50 text-emerald-700";
	if (risk === "high") return "bg-red-50 text-red-700";
	return "bg-yellow-50 text-yellow-700";
}

export default async function FinancingAdminApplicationsPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("FinancingAdminApplicationsPage");
	const applications = t.raw("items") as ApplicationItem[];
	const checklist = t.raw("reviewChecklist.items") as string[];

	return (
		<>
			<div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-5">
				<div>
					<span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-2">
						{t("badge")}
					</span>
					<h1 className="text-2xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
						{t("title")}
					</h1>
					<p className="text-on-surface-variant text-sm font-medium max-w-3xl">
						{t("description")}
					</p>
				</div>
				<button
					type="button"
					className="flex items-center gap-2 px-3 py-2 bg-surface-container-high text-on-surface rounded-xl font-(family-name:--font-manrope) text-xs font-bold hover:bg-surface-container-highest transition-colors"
				>
					<span className="material-symbols-outlined text-sm">sync</span>
					{t("actions.sync")}
				</button>
			</div>

			<div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm mb-8">
				<div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
					<div className="flex flex-wrap gap-2">
						{["all", "underReview", "approved", "disbursed"].map((key) => (
							<button
								key={key}
								type="button"
								className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors"
							>
								{t(`filters.${key}`)}
							</button>
						))}
					</div>
					<div className="flex flex-col sm:flex-row gap-3">
						<label className="relative">
							<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
								search
							</span>
							<input
								type="search"
								placeholder={t("searchPlaceholder")}
								className="w-full sm:w-64 rounded-xl border border-outline-variant/20 bg-surface-container-low px-9 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
							/>
						</label>
						<button
							type="button"
							className="px-4 py-2.5 rounded-xl bg-surface-container-high text-on-surface text-sm font-bold hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2"
						>
							<span className="material-symbols-outlined text-sm">
								filter_list
							</span>
							{t("actions.filter")}
						</button>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.65fr] gap-8">
				<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-base font-(family-name:--font-manrope) font-bold">
							{t("queueTitle")}
						</h2>
					</div>

					<div className="space-y-4">
						{applications.map((item) => (
							<div
								key={item.id}
								className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10"
							>
								<div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
									<div className="flex items-start gap-4 min-w-0">
										<div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-surface-container-high flex items-center justify-center">
											<span className="material-symbols-outlined text-on-surface-variant">
												account_balance_wallet
											</span>
										</div>
										<div className="min-w-0">
											<div className="flex items-center gap-2 flex-wrap mb-1">
												<span className="text-xs font-black text-[#FF5A30] uppercase tracking-widest">
													{item.id}
												</span>
												<span
													className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusClass(item.statusKey)}`}
												>
													{item.status}
												</span>
												<span
													className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${riskClass(item.riskKey)}`}
												>
													{item.risk}
												</span>
											</div>
											<h3 className="font-(family-name:--font-manrope) font-bold text-on-surface text-base">
												{item.promoter}
											</h3>
											<p className="text-sm text-on-surface-variant mt-0.5">
												{item.tour} · {item.market}
											</p>
										</div>
									</div>
									<div className="lg:text-right">
										<p className="text-lg font-(family-name:--font-manrope) font-black text-on-surface">
											{item.amount}
										</p>
										<p className="text-xs text-on-surface-variant">
											{t("requestedOn")} {item.requested}
										</p>
									</div>
								</div>

								<div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
									{[
										{
											icon: "category",
											label: t("fields.product"),
											value: item.product,
										},
										{
											icon: "description",
											label: t("fields.documents"),
											value: item.documents,
										},
										{
											icon: "account_balance",
											label: t("fields.partner"),
											value: item.partner,
										},
										{
											icon: "verified",
											label: t("fields.decision"),
											value: item.status,
										},
									].map((detail) => (
										<div
											key={detail.label}
											className="bg-surface-container-lowest rounded-lg p-3"
										>
											<div className="flex items-center gap-1 text-on-surface-variant mb-1">
												<span className="material-symbols-outlined text-xs">
													{detail.icon}
												</span>
												<span className="text-[10px] font-bold uppercase tracking-wider">
													{detail.label}
												</span>
											</div>
											<p className="text-sm font-bold text-on-surface truncate">
												{detail.value}
											</p>
										</div>
									))}
								</div>

								<div className="mt-5 flex flex-wrap md:flex-nowrap items-center gap-3 pt-4 border-t border-outline-variant/10">
									{["open", "approve", "termSheet", "reject"].map((key) => (
										<button
											key={key}
											type="button"
											className="flex-1 py-2 bg-surface-container-lowest text-on-surface rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors"
										>
											<span className="material-symbols-outlined text-sm">
												{key === "open"
													? "visibility"
													: key === "approve"
														? "check_circle"
														: key === "termSheet"
															? "contract"
															: "cancel"}
											</span>
											{t(`actions.${key}`)}
										</button>
									))}
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="space-y-6">
					<form className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
						<h3 className="font-(family-name:--font-manrope) font-bold text-base mb-4 pb-4 border-b border-outline-variant/20">
							{t("reviewForm.title")}
						</h3>
						<div className="space-y-4">
							<label className="block">
								<span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
									{t("reviewForm.fields.decision")}
								</span>
								<select className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20">
									<option>{t("reviewForm.options.underReview")}</option>
									<option>{t("reviewForm.options.approved")}</option>
									<option>{t("reviewForm.options.rejected")}</option>
									<option>{t("reviewForm.options.disbursed")}</option>
								</select>
							</label>
							<label className="block">
								<span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
									{t("reviewForm.fields.partner")}
								</span>
								<input
									type="text"
									placeholder={t("reviewForm.placeholders.partner")}
									className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
								/>
							</label>
							<label className="block">
								<span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
									{t("reviewForm.fields.termSheet")}
								</span>
								<input
									type="url"
									placeholder={t("reviewForm.placeholders.termSheet")}
									className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
								/>
							</label>
							<label className="block">
								<span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
									{t("reviewForm.fields.note")}
								</span>
								<textarea
									rows={4}
									placeholder={t("reviewForm.placeholders.note")}
									className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
								/>
							</label>
							<button
								type="button"
								className="w-full py-3 bg-[#FF5A30] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-opacity"
							>
								{t("reviewForm.submit")}
							</button>
						</div>
					</form>

					<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
						<h3 className="font-(family-name:--font-manrope) font-bold text-base mb-4 pb-4 border-b border-outline-variant/20">
							{t("reviewChecklist.title")}
						</h3>
						<div className="space-y-3">
							{checklist.map((item) => (
								<div
									key={item}
									className="flex items-start gap-3 p-3 bg-surface-container-low rounded-xl"
								>
									<span className="material-symbols-outlined text-[#FF5A30] text-base mt-0.5">
										rule
									</span>
									<p className="text-sm text-on-surface-variant">{item}</p>
								</div>
							))}
						</div>
					</div>

				</div>
			</div>
		</>
	);
}

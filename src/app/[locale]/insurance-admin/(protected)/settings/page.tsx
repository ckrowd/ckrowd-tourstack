import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function InsuranceAdminSettingsPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("InsuranceAdminSettingsPage");

	return (
		<>
			<div className="mb-10">
				<span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-2">
					{t("badge")}
				</span>
				<h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
					{t("title")}
				</h1>
				<p className="text-on-surface-variant font-medium">{t("description")}</p>
			</div>

			<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
				<div className="space-y-6">
					<div className="flex items-center justify-between gap-4 p-4 border border-outline-variant/10 rounded-xl">
						<div className="flex items-center gap-3">
							<span className="material-symbols-outlined text-[#FF5A30]">
								security
							</span>
							<div>
								<p className="text-sm font-bold text-on-surface">
									Coverage Limit Threshold
								</p>
								<p className="text-xs text-on-surface-variant mt-0.5">
									Maximum coverage amount per tour event ($)
								</p>
							</div>
						</div>
						<input
							type="number"
							defaultValue={100000}
							className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 text-right focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/30 focus:border-[#FF5A30]"
						/>
					</div>

					<div className="flex items-center justify-between gap-4 p-4 border border-outline-variant/10 rounded-xl">
						<div className="flex items-center gap-3">
							<span className="material-symbols-outlined text-[#FF5A30]">
								timer
							</span>
							<div>
								<p className="text-sm font-bold text-on-surface">
									Auto-Review Window (days)
								</p>
								<p className="text-xs text-on-surface-variant mt-0.5">
									Flag applications not reviewed within this period
								</p>
							</div>
						</div>
						<input
							type="number"
							defaultValue={7}
							className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 text-right focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/30 focus:border-[#FF5A30]"
						/>
					</div>

					<div className="flex items-center justify-between gap-4 p-4 border border-outline-variant/10 rounded-xl">
						<div className="flex items-center gap-3">
							<span className="material-symbols-outlined text-[#FF5A30]">
								percent
							</span>
							<div>
								<p className="text-sm font-bold text-on-surface">
									Base Premium Rate (%)
								</p>
								<p className="text-xs text-on-surface-variant mt-0.5">
									Default premium percentage applied to tour coverage value
								</p>
							</div>
						</div>
						<input
							type="number"
							step="0.1"
							defaultValue={1.2}
							className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 text-right focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/30 focus:border-[#FF5A30]"
						/>
					</div>
				</div>

				<div className="mt-8 flex justify-end">
					<button
						type="button"
						className="px-6 py-3 bg-[#FF5A30] text-white font-(family-name:--font-manrope) font-bold rounded-xl shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-opacity active:scale-[0.98]"
					>
						{t("saveChanges")}
					</button>
				</div>
			</div>
		</>
	);
}

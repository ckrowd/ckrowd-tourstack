import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function AdminSettingsPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("AdminSettingsPage");

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
				<button
					type="button"
					className="flex items-center gap-2 px-6 py-3 bg-[#FF5A30] text-white rounded-xl font-(family-name:--font-manrope) font-bold shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-opacity"
				>
					{t("saveChanges")}
				</button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2 space-y-6">
					<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
						<h3 className="font-(family-name:--font-manrope) font-bold text-lg mb-4 pb-4 border-b border-outline-variant/20">
							{t("algorithm.title")}
						</h3>
						<div className="space-y-4">
							<div className="flex items-center justify-between gap-4 p-4 bg-surface-container-low rounded-xl">
								<div>
									<p className="font-bold text-sm text-on-surface">
										{t("algorithm.strictBudget")}
									</p>
									<p className="text-xs text-on-surface-variant mt-1">
										{t("algorithm.strictBudgetDesc")}
									</p>
								</div>
								<div className="relative w-11 h-6 rounded-full bg-[#FF5A30] shrink-0 cursor-pointer">
									<div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow translate-x-5" />
								</div>
							</div>
							<div className="flex items-center justify-between gap-4 p-4 bg-surface-container-low rounded-xl">
								<div>
									<p className="font-bold text-sm text-on-surface">
										{t("algorithm.autoApprove")}
									</p>
									<p className="text-xs text-on-surface-variant mt-1">
										{t("algorithm.autoApproveDesc")}
									</p>
								</div>
								<div className="relative w-11 h-6 rounded-full bg-surface-container-high shrink-0 cursor-pointer">
									<div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow translate-x-0" />
								</div>
							</div>
						</div>
					</div>

					<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
						<h3 className="font-(family-name:--font-manrope) font-bold text-lg mb-4 pb-4 border-b border-outline-variant/20">
							{t("team.title")}
						</h3>
						<div className="space-y-3">
							{[
								{
									name: "Super Admin",
									email: "admin@ckrowd.com",
									role: "Owner",
								},
								{
									name: "Tour Manager",
									email: "tours@ckrowd.com",
									role: "Editor",
								},
							].map((user) => (
								<div
									key={user.email}
									className="flex items-center justify-between p-3 border border-outline-variant/10 rounded-xl"
								>
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center font-bold text-sm text-on-surface-variant">
											{user.name.charAt(0)}
										</div>
										<div>
											<p className="text-sm font-bold text-on-surface">
												{user.name}
											</p>
											<p className="text-xs text-on-surface-variant">
												{user.email}
											</p>
										</div>
									</div>
									<span className="text-xs font-bold text-[#FF5A30] bg-orange-50 px-3 py-1 rounded-full">
										{user.role}
									</span>
								</div>
							))}
							<button
								type="button"
								className="w-full py-3 border-2 border-dashed border-outline-variant/40 rounded-xl text-sm font-bold text-on-surface-variant hover:border-[#FF5A30]/40 hover:text-[#FF5A30] transition-all flex items-center justify-center gap-2 mt-4"
							>
								<span className="material-symbols-outlined text-sm">
									person_add
								</span>
								{t("team.invite")}
							</button>
						</div>
					</div>
				</div>

				<div className="space-y-6">
					<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
						<h3 className="font-(family-name:--font-manrope) font-bold text-lg mb-4 pb-4 border-b border-outline-variant/20 text-red-600">
							{t("danger.title")}
						</h3>
						<p className="text-sm text-on-surface-variant mb-4">
							{t("danger.description")}
						</p>
						<button
							type="button"
							className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm border border-red-200 hover:bg-red-100 transition-colors"
						>
							{t("danger.purge")}
						</button>
					</div>
				</div>
			</div>
		</>
	);
}

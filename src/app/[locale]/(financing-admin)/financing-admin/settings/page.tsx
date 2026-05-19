import { getTranslations, setRequestLocale } from "next-intl/server";

type PolicyItem = {
	key: string;
	title: string;
	description: string;
	enabled: boolean;
};

export default async function FinancingAdminSettingsPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("FinancingAdminSettingsPage");
	const policies = t.raw("policies.items") as PolicyItem[];
	const team = t.raw("team.members") as {
		name: string;
		email: string;
		role: string;
	}[];
	const thresholds = t.raw("thresholds.items") as {
		label: string;
		value: string;
		description: string;
		icon: string;
	}[];

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
					className="flex items-center gap-2 px-4 py-2.5 bg-[#FF5A30] text-white rounded-xl font-(family-name:--font-manrope) text-sm font-bold shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-opacity"
				>
					{t("saveChanges")}
				</button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2 space-y-6">
					<form className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
						<h3 className="font-(family-name:--font-manrope) font-bold text-base mb-4 pb-4 border-b border-outline-variant/20">
							{t("policies.title")}
						</h3>
						<div className="space-y-4">
							{policies.map((policy) => (
								<div
									key={policy.key}
									className="flex items-center justify-between gap-4 p-4 bg-surface-container-low rounded-xl"
								>
									<div>
										<p
											id={`finance-policy-${policy.key}`}
											className="font-bold text-sm text-on-surface"
										>
											{policy.title}
										</p>
										<p className="text-xs text-on-surface-variant mt-1">
											{policy.description}
										</p>
									</div>
									<label className="relative w-11 h-6 rounded-full shrink-0 cursor-pointer bg-surface-container-high has-[:checked]:bg-[#FF5A30]">
										<input
											type="checkbox"
											role="switch"
											aria-labelledby={`finance-policy-${policy.key}`}
											defaultChecked={policy.enabled}
											className="peer sr-only"
										/>
										<span
											className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"
										/>
									</label>
								</div>
							))}
						</div>
					</form>

					<form className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
						<h3 className="font-(family-name:--font-manrope) font-bold text-base mb-4 pb-4 border-b border-outline-variant/20">
							{t("team.title")}
						</h3>
						<div className="space-y-3">
							{team.map((user) => (
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
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
								<input
									type="email"
									placeholder={t("team.emailPlaceholder")}
									className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
								/>
								<button
									type="button"
									className="py-2.5 border-2 border-dashed border-outline-variant/40 rounded-xl text-sm font-bold text-on-surface-variant hover:border-[#FF5A30]/40 hover:text-[#FF5A30] transition-all flex items-center justify-center gap-2"
								>
									<span className="material-symbols-outlined text-sm">
										person_add
									</span>
									{t("team.invite")}
								</button>
							</div>
						</div>
					</form>
				</div>

				<div className="space-y-6">
					<form className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
						<h3 className="font-(family-name:--font-manrope) font-bold text-base mb-4 pb-4 border-b border-outline-variant/20">
							{t("thresholds.title")}
						</h3>
						<div className="space-y-3">
							{thresholds.map((item) => (
								<div
									key={item.label}
									className="bg-surface-container-low rounded-xl p-4"
								>
									<div className="flex items-center justify-between gap-3 mb-2">
										<div className="flex items-center gap-2">
											<span className="material-symbols-outlined text-[#FF5A30] text-base">
												{item.icon}
											</span>
											<p className="text-xs font-black uppercase tracking-wider text-on-surface-variant">
												{item.label}
											</p>
										</div>
										<input
											type="text"
											defaultValue={item.value}
											className="w-20 rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-2 py-1 text-sm font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
										/>
									</div>
									<p className="text-xs text-on-surface-variant leading-5">
										{item.description}
									</p>
								</div>
							))}
						</div>
					</form>

					<form className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
						<h3 className="font-(family-name:--font-manrope) font-bold text-base mb-4 pb-4 border-b border-outline-variant/20">
							{t("productForm.title")}
						</h3>
						<div className="space-y-4">
							<label className="block">
								<span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
									{t("productForm.fields.product")}
								</span>
								<input
									type="text"
									placeholder={t("productForm.placeholders.product")}
									className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
								/>
							</label>
							<label className="block">
								<span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
									{t("productForm.fields.limit")}
								</span>
								<input
									type="text"
									placeholder={t("productForm.placeholders.limit")}
									className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
								/>
							</label>
						</div>
						<button
							type="button"
							className="mt-4 w-full py-3 bg-[#FF5A30] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-opacity"
						>
							{t("productForm.submit")}
						</button>
					</form>
				</div>
			</div>
		</>
	);
}

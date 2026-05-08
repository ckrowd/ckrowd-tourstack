import { getTranslations, setRequestLocale } from "next-intl/server";

type PartnerCard = {
	name: string;
	type: string;
	markets: string;
	capacity: string;
	status: string;
	statusKey: "ready" | "review" | "pending";
	icon: string;
};

function statusClass(status: PartnerCard["statusKey"]) {
	if (status === "ready") return "bg-emerald-100 text-emerald-800";
	if (status === "review") return "bg-blue-100 text-blue-800";
	return "bg-yellow-100 text-yellow-800";
}

export default async function FinancingAdminPartnersPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("FinancingAdminPartnersPage");
	const cards = t.raw("cards") as {
		key: string;
		title: string;
		description: string;
		icon: string;
	}[];
	const partners = t.raw("partners") as PartnerCard[];
	const lanes = t.raw("lanes") as {
		title: string;
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
					className="flex items-center gap-2 px-4 py-2.5 bg-[#FF5A30] text-white rounded-xl font-(family-name:--font-manrope) text-sm font-bold shadow-lg shadow-[#FF5A30]/20 hover:scale-[1.02] transition-transform active:scale-95 shrink-0"
				>
					<span className="material-symbols-outlined text-base">add_business</span>
					{t("actions.addPartner")}
				</button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
				{cards.map((card) => (
					<div
						key={card.key}
						className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10"
					>
						<span className="material-symbols-outlined text-3xl text-[#FF5A30] block mb-5">
							{card.icon}
						</span>
						<h2 className="font-(family-name:--font-manrope) font-bold text-base text-on-surface">
							{card.title}
						</h2>
						<p className="text-sm text-on-surface-variant mt-2 leading-6">
							{card.description}
						</p>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-[1fr_0.85fr] gap-8">
				<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
					<div className="flex items-center justify-between mb-5">
						<h2 className="font-(family-name:--font-manrope) font-bold text-base">
							{t("directoryTitle")}
						</h2>
					</div>
					<div className="space-y-4">
						{partners.map((partner) => (
							<div
								key={partner.name}
								className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-outline-variant/10 last:border-none"
							>
								<div className="flex items-start gap-4">
									<div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center shrink-0">
										<span className="material-symbols-outlined text-on-surface-variant">
											{partner.icon}
										</span>
									</div>
									<div>
										<div className="flex items-center gap-2 flex-wrap">
											<p className="font-(family-name:--font-manrope) font-bold text-on-surface">
												{partner.name}
											</p>
											<span
												className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusClass(partner.statusKey)}`}
											>
												{partner.status}
											</span>
										</div>
										<p className="text-sm text-on-surface-variant mt-1">
											{partner.type} · {partner.markets}
										</p>
									</div>
								</div>
								<div className="md:text-right">
									<p className="font-(family-name:--font-manrope) font-extrabold text-on-surface">
										{partner.capacity}
									</p>
									<p className="text-xs text-on-surface-variant">
										{t("capacityLabel")}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="space-y-6">
					<form className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
						<h2 className="font-(family-name:--font-manrope) font-bold text-base mb-4 pb-4 border-b border-outline-variant/20">
							{t("partnerForm.title")}
						</h2>
						<div className="space-y-4">
							<label className="block">
								<span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
									{t("partnerForm.fields.name")}
								</span>
								<input
									type="text"
									placeholder={t("partnerForm.placeholders.name")}
									className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
								/>
							</label>
							<label className="block">
								<span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
									{t("partnerForm.fields.type")}
								</span>
								<select className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20">
									<option>{t("partnerForm.options.bank")}</option>
									<option>{t("partnerForm.options.insurance")}</option>
									<option>{t("partnerForm.options.credit")}</option>
								</select>
							</label>
							<label className="block">
								<span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
									{t("partnerForm.fields.markets")}
								</span>
								<input
									type="text"
									placeholder={t("partnerForm.placeholders.markets")}
									className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
								/>
							</label>
							<button
								type="button"
								className="w-full py-3 bg-[#FF5A30] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-opacity"
							>
								{t("partnerForm.submit")}
							</button>
						</div>
					</form>

					<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
						<h2 className="font-(family-name:--font-manrope) font-bold text-base mb-5">
							{t("lanesTitle")}
						</h2>
						<div className="space-y-4">
							{lanes.map((lane) => (
								<div
									key={lane.title}
									className="bg-surface-container-low rounded-2xl p-4 flex items-start gap-3"
								>
									<span className="material-symbols-outlined text-[#FF5A30] shrink-0">
										{lane.icon}
									</span>
									<div className="flex-1">
										<p className="font-bold text-sm text-on-surface">
											{lane.title}
										</p>
										<p className="text-xs text-on-surface-variant mt-1 leading-5">
											{lane.description}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

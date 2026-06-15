import { getTranslations, setRequestLocale } from "next-intl/server";
import { getFinancingSettings } from "@/app/actions";
import FinancingProductsPanel from "@/components/FinancingProductsPanel";
import FinancingSettingsForm from "@/components/FinancingSettingsForm";
import FinancingTeamPanel from "@/components/FinancingTeamPanel";

type Settings = {
	auto_reject_below_threshold: boolean;
	require_term_sheet_for_approval: boolean;
	notify_promoter_on_decision: boolean;
	auto_review_limit_usd: number;
	committee_review_threshold_usd: number;
	max_application_usd: number;
};

const DEFAULT_SETTINGS: Settings = {
	auto_reject_below_threshold: true,
	require_term_sheet_for_approval: true,
	notify_promoter_on_decision: true,
	auto_review_limit_usd: 15000,
	committee_review_threshold_usd: 50000,
	max_application_usd: 500000,
};

export default async function FinancingAdminSettingsPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("FinancingAdminSettingsPage");

	const result = await getFinancingSettings();
	const data = result.success ? (result.data as Settings | null) : null;
	const initial: Settings = data
		? {
				auto_reject_below_threshold: data.auto_reject_below_threshold,
				require_term_sheet_for_approval: data.require_term_sheet_for_approval,
				notify_promoter_on_decision: data.notify_promoter_on_decision,
				auto_review_limit_usd: data.auto_review_limit_usd,
				committee_review_threshold_usd: data.committee_review_threshold_usd,
				max_application_usd: data.max_application_usd,
			}
		: DEFAULT_SETTINGS;

	return (
		<>
			<div className="mb-8">
				<span className="text-xs font-semibold uppercase tracking-widest text-[#FF5A30] block mb-2">
					{t("badge")}
				</span>
				<h1 className="text-2xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
					{t("title")}
				</h1>
				<p className="text-on-surface-variant text-sm font-medium max-w-3xl">
					{t("description")}
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2 space-y-6">
					{!result.success ? (
						<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
							<p className="text-sm text-red-600">
								{result.error || t("loadError")}
							</p>
						</div>
					) : (
						<FinancingSettingsForm initial={initial} />
					)}
					<FinancingTeamPanel />
				</div>

				<div className="space-y-6">
					<FinancingProductsPanel />
				</div>
			</div>
		</>
	);
}

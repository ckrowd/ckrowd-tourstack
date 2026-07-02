import { setRequestLocale } from "next-intl/server";
import { getFinancingApplications, getStakeholders } from "@/app/actions";
import FinancingApplyClient from "@/components/FinancingApplyClient";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import PageTour from "@/components/PageTour";
import { computeEcosystemReadiness } from "@/lib/eligibility";

export const dynamic = "force-dynamic";

const INSURANCE_PRODUCT_IDS = [
	"Event Cancellation",
	"Event Insurance Bundle",
	"Touring Workforce",
	"Aviation & Equipment",
	"Audience Ticket Protection",
];

type Props = {
	params: Promise<{ locale: string }>;
};

export default async function FinancingPage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);

	const [appsResult, stakeholdersResult] = await Promise.all([
		getFinancingApplications(),
		getStakeholders(),
	]);

	const allApps = (appsResult.data ?? []) as { id: string; product?: string | null; amount_requested?: number | null; currency?: string | null; status?: string | null; created_at?: Date | string | null; tour?: { artist?: { name?: string | null } | null } | null }[];
	const applications = allApps.filter((a) => !INSURANCE_PRODUCT_IDS.includes(String(a.product ?? "")));
	const readiness = computeEcosystemReadiness(
		stakeholdersResult.data ?? [],
		allApps.map((a) => ({ product: String(a.product ?? "") })),
	);

	return (
		<div className="bg-surface text-on-surface antialiased">
			<TopNav />
			<div className="flex pt-16">
				<SideNav />
				<PageTour pageId="financing" />
				<FinancingApplyClient
					applications={applications}
					locale={locale}
					readiness={readiness}
				/>
			</div>
		</div>
	);
}

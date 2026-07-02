import { setRequestLocale } from "next-intl/server";
import { getFinancingApplications } from "@/app/actions";
import InsuranceApplyClient from "@/components/InsuranceApplyClient";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import PageTour from "@/components/PageTour";

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

export default async function InsurancePage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);

	const appsResult = await getFinancingApplications();

	const allApps = (appsResult.data ?? []) as { id: string; product?: string | null; amount_requested?: number | null; currency?: string | null; status?: string | null; created_at?: Date | string | null; tour?: { artist?: { name?: string | null } | null } | null }[];
	const applications = allApps.filter((a) => INSURANCE_PRODUCT_IDS.includes(String(a.product ?? "")));

	return (
		<div className="bg-surface text-on-surface antialiased">
			<TopNav />
			<div className="flex pt-16">
				<SideNav />
				<PageTour pageId="insurance" />
				<InsuranceApplyClient
					applications={applications}
					locale={locale}
				/>
			</div>
		</div>
	);
}

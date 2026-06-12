import { setRequestLocale } from "next-intl/server";
import { getFinancingApplications, getTours } from "@/app/actions";
import FinancingApplyClient from "@/components/FinancingApplyClient";
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

export default async function FinancingPage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);

	const [toursResult, appsResult] = await Promise.all([
		getTours(),
		getFinancingApplications(),
	]);

	const tours = (toursResult.data ?? []) as { id: string; name?: string | null; city?: string | null; artist?: { name?: string | null } | null }[];
	const allApps = (appsResult.data ?? []) as { id: string; product?: string | null; amount_requested?: number | null; currency?: string | null; status?: string | null; created_at?: Date | string | null; tour?: { artist?: { name?: string | null } | null } | null }[];
	const applications = allApps.filter((a) => !INSURANCE_PRODUCT_IDS.includes(String(a.product ?? "")));

	return (
		<div className="bg-surface text-on-surface antialiased">
			<TopNav />
			<div className="flex pt-16 h-screen">
				<SideNav />
				<PageTour pageId="financing" />
				<FinancingApplyClient
					tours={tours}
					applications={applications}
					locale={locale}
				/>
			</div>
		</div>
	);
}

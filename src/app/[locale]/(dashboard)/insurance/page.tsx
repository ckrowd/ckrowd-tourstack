import { setRequestLocale } from "next-intl/server";
import { getEOIs, getFinancingApplications, getTours } from "@/app/actions";
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

type TourEntry = { id: string; name?: string | null; city?: string | null; artist?: { name?: string | null } | null };

export default async function InsurancePage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);

	const [toursResult, eoisResult, appsResult] = await Promise.all([
		getTours(),
		getEOIs(),
		getFinancingApplications(),
	]);

	const confirmedTours = (toursResult.data ?? []) as TourEntry[];
	const rawEois = (eoisResult.data ?? []) as { id: string; city: string; artist: { name: string } | null }[];
	const eoiEntries: TourEntry[] = rawEois.map((e) => ({
		id: `eoi:${e.id}`,
		city: e.city,
		artist: e.artist ?? null,
	}));
	const tours = [...confirmedTours, ...eoiEntries];

	const allApps = (appsResult.data ?? []) as { id: string; product?: string | null; amount_requested?: number | null; currency?: string | null; status?: string | null; created_at?: Date | string | null; tour?: { artist?: { name?: string | null } | null } | null }[];
	const applications = allApps.filter((a) => INSURANCE_PRODUCT_IDS.includes(String(a.product ?? "")));

	return (
		<div className="bg-surface text-on-surface antialiased">
			<TopNav />
			<div className="flex pt-16 h-screen">
				<SideNav />
				<PageTour pageId="insurance" />
				<InsuranceApplyClient
					tours={tours}
					applications={applications}
					locale={locale}
				/>
			</div>
		</div>
	);
}

import { setRequestLocale } from "next-intl/server";
import { getTours } from "@/app/actions";
import DiscoveryClient from "@/components/DiscoveryClient";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";

export const dynamic = "force-dynamic";

export default async function DiscoveryPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const toursResult = await getTours();
	const myTours = (toursResult.data ?? []) as {
		id: string;
		tour_name?: string | null;
		city?: string;
		status?: string;
		date?: string | Date;
		artist?: { name?: string | null } | null;
	}[];

	return (
		<div className="bg-surface text-on-surface antialiased">
			<TopNav />
			<div className="flex pt-16">
				<SideNav />
				<DiscoveryClient myTours={myTours} />
			</div>
		</div>
	);
}

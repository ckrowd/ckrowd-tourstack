import { setRequestLocale } from "next-intl/server";
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

	return (
		<div className="bg-surface text-on-surface antialiased">
			<TopNav />
			<div className="flex pt-16 h-screen">
				<SideNav />
				<DiscoveryClient />
			</div>
		</div>
	);
}

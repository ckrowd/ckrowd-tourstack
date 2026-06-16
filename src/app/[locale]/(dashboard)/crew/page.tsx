import { setRequestLocale } from "next-intl/server";
import CrewClient from "@/components/CrewClient";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";

export const dynamic = "force-dynamic";

export default async function CrewPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	return (
		<div className="bg-surface text-on-surface">
			<TopNav />
			<div className="flex pt-16">
				<SideNav />
				<CrewClient />
			</div>
		</div>
	);
}

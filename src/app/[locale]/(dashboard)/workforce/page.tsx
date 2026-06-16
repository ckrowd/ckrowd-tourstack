import { setRequestLocale } from "next-intl/server";
import WorkforceClient from "@/components/WorkforceClient";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";

export const dynamic = "force-dynamic";

export default async function WorkforcePage({
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
				<WorkforceClient />
			</div>
		</div>
	);
}

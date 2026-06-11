import { setRequestLocale } from "next-intl/server";
import InsuranceClient from "@/components/InsuranceClient";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";

export const dynamic = "force-dynamic";

export default async function InsurancePage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	return (
		<div className="bg-surface text-on-surface antialiased min-h-screen">
			<TopNav />
			<div className="flex pt-16 h-screen">
				<SideNav />
				<InsuranceClient />
			</div>
		</div>
	);
}

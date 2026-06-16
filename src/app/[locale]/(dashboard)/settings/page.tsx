import { setRequestLocale } from "next-intl/server";
import SettingsClient from "@/components/SettingsClient";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
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
				<SettingsClient />
			</div>
		</div>
	);
}

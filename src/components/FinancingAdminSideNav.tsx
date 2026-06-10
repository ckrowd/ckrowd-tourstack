import { getTranslations } from "next-intl/server";
import FinancingAdminSideNavClient from "@/components/FinancingAdminSideNavClient";

export default async function FinancingAdminSideNav() {
	const t = await getTranslations("FinancingAdminSideNav");

	const navItems = [
		{
			key: "overview",
			label: t("overview"),
			icon: "dashboard",
			href: "/financing-admin",
		},
		{
			key: "applications",
			label: t("applications"),
			icon: "request_quote",
			href: "/financing-admin/applications",
		},
		{
			key: "partners",
			label: t("partners"),
			icon: "account_balance",
			href: "/financing-admin/partners",
		},
		{
			key: "settings",
			label: t("settings"),
			icon: "tune",
			href: "/financing-admin/settings",
		},
	];

	return (
		<FinancingAdminSideNavClient
			navItems={navItems}
			reviewQueueLabel={t("reviewQueue")}
		/>
	);
}

import { getTranslations } from "next-intl/server";
import SideNavClient from "@/components/SideNavClient";

export default async function SideNav() {
	const t = await getTranslations("SideNav");

	const navItems = [
		{
			key: "overview",
			label: t("dashboard"),
			icon: "dashboard",
			href: "/dashboard",
			tourAttr: "nav-dashboard",
		},
		{
			key: "tours",
			label: t("tours"),
			icon: "confirmation_number",
			href: "/tours",
			tourAttr: "nav-tours",
		},
		{
			key: "onboarding",
			label: t("onboarding"),
			icon: "how_to_reg",
			href: "/onboarding",
			tourAttr: "nav-onboarding",
		},
		{
			key: "stakeholders",
			label: t("stakeholders"),
			icon: "groups",
			href: "/stakeholders",
			tourAttr: "nav-stakeholders",
		},
		{
			key: "discovery",
			label: t("discovery"),
			icon: "explore",
			href: "/discovery",
			tourAttr: "nav-discovery",
		},
		{
			key: "financing",
			label: t("financing"),
			icon: "account_balance",
			href: "/financing",
			tourAttr: "nav-financing",
		},
		{
			key: "insurance",
			label: t("insurance"),
			icon: "shield",
			href: "/insurance",
			tourAttr: "nav-insurance",
		},
		{
			key: "ai",
			label: t("aiTools"),
			icon: "auto_awesome",
			href: "/tour-intelligence",
			tourAttr: "nav-ai",
		},
		{
			key: "profile",
			label: t("profile"),
			icon: "person",
			href: "/profile",
			tourAttr: "nav-profile",
		},
		{
			key: "settings",
			label: t("settings"),
			icon: "settings",
			href: "/settings",
			tourAttr: "nav-settings",
		},
	];

	return (
		<SideNavClient
			navItems={navItems}
			startNewTourLabel={t("startNewTour")}
		/>
	);
}

import { getTranslations } from "next-intl/server";
import SideNavClient from "@/components/SideNavClient";

export default async function SideNav() {
	const t = await getTranslations("SideNav");

	const navItems = [
		{
			key: "overview",
			label: t("dashboard"),
			icon: "overview",
			href: "/dashboard",
			tourAttr: "nav-dashboard",
		},
		{
			key: "tours",
			label: t("tours"),
			icon: "tours",
			href: "/tours",
			tourAttr: "nav-tours",
			group: t("groupTourOps"),
		},
		{
			key: "discovery",
			label: t("discovery"),
			icon: "discovery",
			href: "/discovery",
			tourAttr: "nav-discovery",
			group: t("groupTourOps"),
		},
		{
			key: "ai",
			label: t("aiTools"),
			icon: "ai",
			href: "/tour-intelligence",
			tourAttr: "nav-ai",
			group: t("groupTourOps"),
		},
		{
			key: "onboarding",
			label: t("onboarding"),
			icon: "onboarding",
			href: "/onboarding",
			tourAttr: "nav-onboarding",
			group: t("groupEcosystem"),
		},
		{
			key: "stakeholders",
			label: t("stakeholders"),
			icon: "stakeholders",
			href: "/stakeholders",
			tourAttr: "nav-stakeholders",
			group: t("groupEcosystem"),
		},
		{
			key: "financing",
			label: t("financing"),
			icon: "financing",
			href: "/financing",
			tourAttr: "nav-financing",
			group: t("groupCapital"),
		},
		{
			key: "insurance",
			label: t("insurance"),
			icon: "insurance",
			href: "/insurance",
			tourAttr: "nav-insurance",
			group: t("groupCapital"),
		},
		{
			key: "tickets",
			label: t("tickets"),
			icon: "tickets",
			href: "/dashboard/tickets",
			tourAttr: "nav-tickets",
			group: t("groupCapital"),
		},
		{
			key: "profile",
			label: t("profile"),
			icon: "profile",
			href: "/profile",
			tourAttr: "nav-profile",
			group: t("groupAccount"),
		},
		{
			key: "settings",
			label: t("settings"),
			icon: "settings",
			href: "/settings",
			tourAttr: "nav-settings",
			group: t("groupAccount"),
		},
	];

	return (
		<SideNavClient
			navItems={navItems}
			startNewTourLabel={t("startNewTour")}
		/>
	);
}

import { getTranslations } from "next-intl/server";
import AdminSideNavClient from "@/components/AdminSideNavClient";

export default async function AdminSideNav() {
	const t = await getTranslations("AdminSideNav");

	const navItems = [
		{
			key: "overview",
			label: t("overview"),
			icon: "dashboard",
			href: "/admin",
			tourAttr: "admin-nav-overview",
		},
		{
			key: "artists",
			label: t("artists"),
			icon: "album",
			href: "/admin/artists",
			tourAttr: "admin-nav-artists",
		},
		{
			key: "tours",
			label: t("tours"),
			icon: "confirmation_number",
			href: "/admin/tours",
			tourAttr: "admin-nav-tours",
		},
		{
			key: "eoi",
			label: t("eoi"),
			icon: "send",
			href: "/admin/eoi",
			tourAttr: "admin-nav-eoi",
		},
		{
			key: "financing",
			label: t("financing"),
			icon: "account_balance_wallet",
			href: "/admin/financing",
			tourAttr: "admin-nav-financing",
		},
		{
			key: "insurance",
			label: t("insurance"),
			icon: "shield",
			href: "/admin/insurance",
			tourAttr: "admin-nav-insurance",
		},
		{
			key: "claims",
			label: t("claims"),
			icon: "health_and_safety",
			href: "/admin/claims",
			tourAttr: "admin-nav-claims",
		},
		{
			key: "tickets",
			label: t("tickets"),
			icon: "confirmation_number",
			href: "/admin/tickets",
			tourAttr: "admin-nav-tickets",
		},
		{
			key: "directory",
			label: t("directory"),
			icon: "groups",
			href: "/admin/directory",
			tourAttr: "admin-nav-directory",
		},
		{
			key: "submissions",
			label: t("submissions"),
			icon: "folder_open",
			href: "/admin/submissions",
			tourAttr: "admin-nav-submissions",
		},
		{
			key: "reports",
			label: t("reports"),
			icon: "bar_chart",
			href: "/admin/reports",
			tourAttr: "admin-nav-reports",
		},
		{
			key: "profile",
			label: t("profile"),
			icon: "person",
			href: "/admin/profile",
			tourAttr: "admin-nav-profile",
		},
		{
			key: "settings",
			label: t("settings"),
			icon: "settings",
			href: "/admin/settings",
			tourAttr: "admin-nav-settings",
		},
	];

	return (
		<AdminSideNavClient
			navItems={navItems}
			newTourLabel={t("newTour")}
		/>
	);
}

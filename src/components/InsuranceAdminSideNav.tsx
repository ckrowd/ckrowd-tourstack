import { getTranslations } from "next-intl/server";
import InsuranceAdminSideNavClient from "@/components/InsuranceAdminSideNavClient";

export default async function InsuranceAdminSideNav() {
	const t = await getTranslations("InsuranceAdminSideNav");

	const navItems = [
		{
			key: "overview",
			label: t("overview"),
			icon: "shield",
			href: "/insurance-admin",
		},
		{
			key: "applications",
			label: t("applications"),
			icon: "description",
			href: "/insurance-admin/applications",
		},
		{
			key: "claims",
			label: t("claims"),
			icon: "assignment_late",
			href: "/insurance-admin/claims",
		},
		{
			key: "partners",
			label: t("partners"),
			icon: "handshake",
			href: "/insurance-admin/partners",
		},
	];

	return (
		<InsuranceAdminSideNavClient
			navItems={navItems}
			portalLabel={t("portalLabel")}
		/>
	);
}

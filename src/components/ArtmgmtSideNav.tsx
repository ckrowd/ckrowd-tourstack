import { getTranslations } from "next-intl/server";
import ArtmgmtSideNavClient from "@/components/ArtmgmtSideNavClient";

export default async function ArtmgmtSideNav() {
	const t = await getTranslations("ArtmgmtSideNav");

	const navItems = [
		{ key: "artists", label: t("artists"), icon: "star", href: "/artmgmt" },
		{ key: "submissions", label: t("submissions"), icon: "send", href: "/artmgmt/submissions" },
		{ key: "reports", label: t("reports"), icon: "bar_chart", href: "/artmgmt/reports" },
		{ key: "profile", label: t("profile"), icon: "manage_accounts", href: "/artmgmt/profile" },
	];

	return (
		<ArtmgmtSideNavClient
			navItems={navItems}
			portalLabel={t("portalLabel")}
		/>
	);
}

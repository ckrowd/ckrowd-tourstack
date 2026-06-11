import { getTranslations } from "next-intl/server";
import ArtmgmtSideNavClient from "@/components/ArtmgmtSideNavClient";

export default async function ArtmgmtSideNav() {
	const t = await getTranslations("ArtmgmtSideNav");

	const navItems = [
		{ key: "artists", label: t("artists"), icon: "star", href: "/artmgmt" },
		{ key: "submissions", label: t("submissions"), icon: "send", href: "/artmgmt/submissions" },
		{ key: "reports", label: t("reports"), icon: "bar_chart", href: "/artmgmt/reports" },
	];

	return (
		<ArtmgmtSideNavClient
			navItems={navItems}
			portalLabel={t("portalLabel")}
		/>
	);
}

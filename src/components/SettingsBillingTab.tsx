"use client";

import { useTranslations } from "next-intl";
import { Section } from "@/components/SettingsPrimitives";
import EmptyState from "@/components/ui/EmptyState";

export default function SettingsBillingTab() {
	const t = useTranslations("SettingsPage.billingTab");

	return (
		<Section title={t("title")}>
			<EmptyState
				icon="credit-card"
				title={t("comingSoon")}
				description={t("comingSoonDesc")}
			/>
		</Section>
	);
}

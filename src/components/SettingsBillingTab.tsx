"use client";

import { useTranslations } from "next-intl";
import Icon from "@/components/icons";
import { Section } from "@/components/SettingsPrimitives";

export default function SettingsBillingTab() {
	const t = useTranslations("SettingsPage.billingTab");

	return (
		<Section title={t("title")}>
			<div className="text-center py-10">
				<Icon name="credit-card" size={44} className="text-on-surface-variant block mb-4" />
				<h3 className="font-(family-name:--font-manrope) font-semibold text-on-surface text-lg mb-2">
					{t("comingSoon")}
				</h3>
				<p className="text-sm text-on-surface-variant max-w-md mx-auto">
					{t("comingSoonDesc")}
				</p>
			</div>
		</Section>
	);
}

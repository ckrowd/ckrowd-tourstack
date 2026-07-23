"use client";

import { useTranslations } from "next-intl";
import Icon from "@/components/icons";
import { useState } from "react";
import PageHero from "@/components/PageHero";
import SettingsBillingTab from "@/components/SettingsBillingTab";
import SettingsNotificationsTab from "@/components/SettingsNotificationsTab";
import SettingsSecurityTab from "@/components/SettingsSecurityTab";
import SettingsVenueTab from "@/components/SettingsVenueTab";
import PageTour from "@/components/PageTour";

type Tab = "venue" | "notifications" | "billing" | "security";

export default function SettingsClient() {
	const t = useTranslations("SettingsPage");
	const [activeTab, setActiveTab] = useState<Tab>("venue");

	const tabs: { key: Tab; label: string; icon: string }[] = [
		{ key: "venue", label: t("tabs.venue"), icon: "stadium" },
		{
			key: "notifications",
			label: t("tabs.notifications"),
			icon: "bell",
		},
		{ key: "billing", label: t("tabs.billing"), icon: "credit-card" },
		{ key: "security", label: t("tabs.security"), icon: "lock" },
	];

	const tabContent: Record<Tab, React.ReactNode> = {
		venue: <SettingsVenueTab />,
		notifications: <SettingsNotificationsTab />,
		billing: <SettingsBillingTab />,
		security: <SettingsSecurityTab />,
	};

	return (
		<main className="flex-1 lg:ml-64 bg-surface p-6 md:px-10 md:pt-5 md:pb-10">
			<PageTour pageId="settings" />
			{/* Header */}
			<PageHero
				eyebrow={t("promoterPortal")}
				title={t("title")}
				description={t("description")}
			/>

			{/* Tabs */}
			<div data-tour="settings-tabs" className="tsd-card flex gap-1 p-1 mb-8 w-fit flex-wrap">
				{tabs.map((tab) => (
					<button
						key={tab.key}
						type="button"
						onClick={() => setActiveTab(tab.key)}
						className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
							activeTab === tab.key
								? "bg-[#FF5A2E] text-white shadow-sm"
								: "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
						}`}
					>
						<Icon name={tab.icon} size={14} />
						{tab.label}
					</button>
				))}
			</div>

			{/* Tab Content */}
			{tabContent[activeTab]}
		</main>
	);
}

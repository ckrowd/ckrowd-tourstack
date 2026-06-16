"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import SettingsBillingTab from "@/components/SettingsBillingTab";
import SettingsNotificationsTab from "@/components/SettingsNotificationsTab";
import SettingsSecurityTab from "@/components/SettingsSecurityTab";
import SettingsVenueTab from "@/components/SettingsVenueTab";

type Tab = "venue" | "notifications" | "billing" | "security";

export default function SettingsClient() {
	const t = useTranslations("SettingsPage");
	const [activeTab, setActiveTab] = useState<Tab>("venue");

	const tabs: { key: Tab; label: string; icon: string }[] = [
		{ key: "venue", label: t("tabs.venue"), icon: "stadium" },
		{
			key: "notifications",
			label: t("tabs.notifications"),
			icon: "notifications",
		},
		{ key: "billing", label: t("tabs.billing"), icon: "credit_card" },
		{ key: "security", label: t("tabs.security"), icon: "lock" },
	];

	const tabContent: Record<Tab, React.ReactNode> = {
		venue: <SettingsVenueTab />,
		notifications: <SettingsNotificationsTab />,
		billing: <SettingsBillingTab />,
		security: <SettingsSecurityTab />,
	};

	return (
		<main className="flex-1 lg:ml-64 bg-surface p-6 md:p-10">
			{/* Header */}
			<div className="mb-8">
				<span className="text-xs font-semibold uppercase tracking-widest text-[#FF5A30] block mb-2">
					{t("promoterPortal")}
				</span>
				<h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
					{t("title")}
				</h1>
				<p className="text-on-surface-variant font-medium">
					{t("description")}
				</p>
			</div>

			{/* Tabs */}
			<div className="flex gap-1 bg-surface-container-lowest rounded-xl p-1 mb-8 w-fit shadow-sm flex-wrap">
				{tabs.map((tab) => (
					<button
						key={tab.key}
						type="button"
						onClick={() => setActiveTab(tab.key)}
						className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
							activeTab === tab.key
								? "bg-[#FF5A30] text-white shadow-sm"
								: "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
						}`}
					>
						<span className="material-symbols-outlined text-sm">
							{tab.icon}
						</span>
						{tab.label}
					</button>
				))}
			</div>

			{/* Tab Content */}
			{tabContent[activeTab]}
		</main>
	);
}

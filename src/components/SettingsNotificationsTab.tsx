"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
	getSession,
	getTourstackNotifications,
	subscribeNewsletter,
	unsubscribeNewsletter,
	updateTourstackNotifications,
} from "@/app/actions";
import { Section, Toggle } from "@/components/SettingsPrimitives";

type DigestFrequency = "realTime" | "daily" | "weekly";

type NotificationPrefs = {
	email_eoi_updates: boolean;
	email_announcements: boolean;
	email_financing: boolean;
	email_reminders: boolean;
	email_settlement: boolean;
	email_platform: boolean;
	inapp_eoi: boolean;
	inapp_messages: boolean;
	inapp_milestones: boolean;
	inapp_tips: boolean;
	digest_frequency: DigestFrequency;
};

function toDigest(value: unknown): DigestFrequency {
	return value === "daily" || value === "weekly" ? value : "realTime";
}

export default function SettingsNotificationsTab() {
	const t = useTranslations("SettingsPage.notificationsTab");
	const queryClient = useQueryClient();

	const sessionQuery = useQuery({ queryKey: ["session"], queryFn: getSession });
	const [isSubscribed, setIsSubscribed] = useState(false);

	const newsletterMutation = useMutation({
		mutationFn: async (subscribe: boolean) => {
			const email = sessionQuery.data?.user?.email;
			if (!email) throw new Error("No email found in session");
			return subscribe ? subscribeNewsletter(email) : unsubscribeNewsletter(email);
		},
		onSuccess: (result, subscribe) => {
			if (result.success) setIsSubscribed(subscribe);
		},
	});

	const prefsQuery = useQuery({
		queryKey: ["tourstackNotifications"],
		queryFn: getTourstackNotifications,
	});

	// Derive the editable view from server data + local edits — no effect needed.
	const serverPrefs = useMemo<NotificationPrefs | null>(() => {
		const d = prefsQuery.data?.success ? prefsQuery.data.data : undefined;
		if (!d) return null;
		return {
			email_eoi_updates: Boolean(d.email_eoi_updates),
			email_announcements: Boolean(d.email_announcements),
			email_financing: Boolean(d.email_financing),
			email_reminders: Boolean(d.email_reminders),
			email_settlement: Boolean(d.email_settlement),
			email_platform: Boolean(d.email_platform),
			inapp_eoi: Boolean(d.inapp_eoi),
			inapp_messages: Boolean(d.inapp_messages),
			inapp_milestones: Boolean(d.inapp_milestones),
			inapp_tips: Boolean(d.inapp_tips),
			digest_frequency: toDigest(d.digest_frequency),
		};
	}, [prefsQuery.data]);

	const [localEdits, setLocalEdits] = useState<Partial<NotificationPrefs>>({});

	const prefs: NotificationPrefs | null = serverPrefs
		? { ...serverPrefs, ...localEdits }
		: null;

	const saveMutation = useMutation({
		mutationFn: updateTourstackNotifications,
		onSuccess: (result) => {
			if (result.success) {
				setLocalEdits({});
				void queryClient.invalidateQueries({
					queryKey: ["tourstackNotifications"],
				});
			}
		},
	});

	const setPref =
		<K extends keyof NotificationPrefs>(key: K) =>
		(value: NotificationPrefs[K]) =>
			setLocalEdits((p) => ({ ...p, [key]: value }));

	const saveFailed =
		saveMutation.error != null ||
		(saveMutation.data != null && !saveMutation.data.success);

	const digestOptions: { key: DigestFrequency; label: string }[] = [
		{ key: "realTime", label: t("digest.options.realTime") },
		{ key: "daily", label: t("digest.options.daily") },
		{ key: "weekly", label: t("digest.options.weekly") },
	];

	return (
		<div className="space-y-6">
			<Section title={t("email.title")}>
				<div>
					<Toggle
						label={t("email.toggles.eoiUpdates.label")}
						description={t("email.toggles.eoiUpdates.description")}
						checked={prefs?.email_eoi_updates ?? false}
						disabled={!prefs}
						onChange={setPref("email_eoi_updates")}
					/>
					<Toggle
						label={t("email.toggles.announcements.label")}
						description={t("email.toggles.announcements.description")}
						checked={prefs?.email_announcements ?? false}
						disabled={!prefs}
						onChange={setPref("email_announcements")}
					/>
					<Toggle
						label={t("email.toggles.financing.label")}
						description={t("email.toggles.financing.description")}
						checked={prefs?.email_financing ?? false}
						disabled={!prefs}
						onChange={setPref("email_financing")}
					/>
					<Toggle
						label={t("email.toggles.reminders.label")}
						description={t("email.toggles.reminders.description")}
						checked={prefs?.email_reminders ?? false}
						disabled={!prefs}
						onChange={setPref("email_reminders")}
					/>
					<Toggle
						label={t("email.toggles.settlement.label")}
						description={t("email.toggles.settlement.description")}
						checked={prefs?.email_settlement ?? false}
						disabled={!prefs}
						onChange={setPref("email_settlement")}
					/>
					<Toggle
						label={t("email.toggles.platform.label")}
						description={t("email.toggles.platform.description")}
						checked={prefs?.email_platform ?? false}
						disabled={!prefs}
						onChange={setPref("email_platform")}
					/>
				</div>
			</Section>

			<Section title={t("inApp.title")}>
				<div>
					<Toggle
						label={t("inApp.toggles.eoi")}
						checked={prefs?.inapp_eoi ?? false}
						disabled={!prefs}
						onChange={setPref("inapp_eoi")}
					/>
					<Toggle
						label={t("inApp.toggles.messages")}
						checked={prefs?.inapp_messages ?? false}
						disabled={!prefs}
						onChange={setPref("inapp_messages")}
					/>
					<Toggle
						label={t("inApp.toggles.milestones")}
						checked={prefs?.inapp_milestones ?? false}
						disabled={!prefs}
						onChange={setPref("inapp_milestones")}
					/>
					<Toggle
						label={t("inApp.toggles.tips")}
						checked={prefs?.inapp_tips ?? false}
						disabled={!prefs}
						onChange={setPref("inapp_tips")}
					/>
				</div>
			</Section>

			<Section title={t("digest.title")}>
				<div className="space-y-3">
					{digestOptions.map((opt) => (
						<label
							key={opt.key}
							className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl cursor-pointer hover:bg-surface-container transition-colors"
						>
							<input
								type="radio"
								name="digest"
								checked={prefs?.digest_frequency === opt.key}
								disabled={!prefs}
								onChange={() => setPref("digest_frequency")(opt.key)}
								className="accent-[#FF5A30]"
							/>
							<span className="text-sm font-semibold text-on-surface">
								{opt.label}
							</span>
						</label>
					))}
				</div>
			</Section>

			<Section title={t("newsletter.title")}>
				<Toggle
					label={t("newsletter.label")}
					description={t("newsletter.description")}
					checked={isSubscribed}
					disabled={newsletterMutation.isPending || sessionQuery.isLoading}
					onChange={(val) => newsletterMutation.mutate(val)}
				/>
				{newsletterMutation.isPending && (
					<p className="text-xs text-on-surface-variant mt-2">
						{isSubscribed
							? t("newsletter.unsubscribing")
							: t("newsletter.subscribing")}
					</p>
				)}
			</Section>

			<div className="flex items-center justify-end gap-4">
				{saveMutation.data?.success && (
					<span className="text-sm font-semibold text-emerald-600">
						{t("saveSuccess")}
					</span>
				)}
				{saveFailed && (
					<span className="text-sm font-semibold text-rose-600">
						{t("saveError")}
					</span>
				)}
				<button
					type="button"
					onClick={() => prefs && saveMutation.mutate(prefs)}
					disabled={!prefs || saveMutation.isPending}
					className="bg-[#FF5A30] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all disabled:cursor-not-allowed disabled:opacity-60"
				>
					{saveMutation.isPending ? t("saving") : t("actions.save")}
				</button>
			</div>
		</div>
	);
}

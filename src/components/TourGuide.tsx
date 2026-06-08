"use client";

import "driver.js/dist/driver.css";
import type { DriveStep } from "driver.js";
import { useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { applyTourStyles } from "@/lib/tour-styles";
import { useSession } from "@/context/AuthContext";

type TourId = "promoter" | "admin";

const NEW_ACCOUNT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

/** Returns true only if the account was created within the last 24 hours.
 * Tours auto-play once per new account; existing accounts never see the
 * tour automatically (even on a fresh device). */
function isNewAccount(user: unknown): boolean {
	const u = user as Record<string, unknown> | null | undefined;
	if (!u) return false;
	const raw = (u.created_at ?? u.createdAt) as string | Date | null | undefined;
	if (!raw) return false;
	const ts = raw instanceof Date ? raw.getTime() : new Date(raw as string).getTime();
	return !Number.isNaN(ts) && Date.now() - ts < NEW_ACCOUNT_WINDOW_MS;
}

const STORAGE_KEY_BASE: Record<TourId, string> = {
	promoter: "ts_tour_promoter_v1",
	admin: "ts_tour_admin_v1",
};

/** Returns a per-account storage key so different users on the same device
 * each track their own tour completion state. */
function storageKey(tourId: TourId, userId: string | undefined): string {
	const base = STORAGE_KEY_BASE[tourId];
	return userId ? `${base}_${userId}` : base;
}

function buildPromoterSteps(t: ReturnType<typeof useTranslations<"Tour">>): DriveStep[] {
	return [
		{ popover: { title: t("promoter.step0.title"), description: t("promoter.step0.description") } },
		{
			element: '[data-tour="nav-discovery"]',
			popover: { title: t("promoter.step1.title"), description: t("promoter.step1.description"), side: "right", align: "center" },
		},
		{
			element: '[data-tour="nav-tours"]',
			popover: { title: t("promoter.step2.title"), description: t("promoter.step2.description"), side: "right", align: "center" },
		},
		{
			element: '[data-tour="nav-financing"]',
			popover: { title: t("promoter.step3.title"), description: t("promoter.step3.description"), side: "right", align: "center" },
		},
		{
			element: '[data-tour="nav-insurance"]',
			popover: { title: t("promoter.step4.title"), description: t("promoter.step4.description"), side: "right", align: "center" },
		},
		{
			element: '[data-tour="nav-cta"]',
			popover: { title: t("promoter.step5.title"), description: t("promoter.step5.description"), side: "top", align: "center" },
		},
		{ popover: { title: t("promoter.step6.title"), description: t("promoter.step6.description") } },
	];
}

function buildAdminSteps(t: ReturnType<typeof useTranslations<"Tour">>): DriveStep[] {
	return [
		{ popover: { title: t("admin.step0.title"), description: t("admin.step0.description") } },
		{
			element: '[data-tour="admin-nav-eoi"]',
			popover: { title: t("admin.step1.title"), description: t("admin.step1.description"), side: "right", align: "center" },
		},
		{
			element: '[data-tour="admin-nav-tours"]',
			popover: { title: t("admin.step2.title"), description: t("admin.step2.description"), side: "right", align: "center" },
		},
		{
			element: '[data-tour="admin-nav-artists"]',
			popover: { title: t("admin.step3.title"), description: t("admin.step3.description"), side: "right", align: "center" },
		},
		{
			element: '[data-tour="admin-nav-reports"]',
			popover: { title: t("admin.step4.title"), description: t("admin.step4.description"), side: "right", align: "center" },
		},
		{
			element: '[data-tour="admin-nav-cta"]',
			popover: { title: t("admin.step5.title"), description: t("admin.step5.description"), side: "top", align: "center" },
		},
		{ popover: { title: t("admin.step6.title"), description: t("admin.step6.description") } },
	];
}

export default function TourGuide({ tourId }: { tourId: TourId }) {
	const t = useTranslations("Tour");
	const { data: session } = useSession();
	const userId = session?.user?.id as string | undefined;

	// Build the driver.js progress template in code — ICU/next-intl cannot
	// safely hold {{x}} or {x} placeholders for driver.js, so we only translate
	// the connector word and compose the template string here.
	const progressTemplate = `{{current}} ${t("progressSeparator")} {{total}}`;

	const startTour = useCallback(async () => {
		const { driver } = await import("driver.js");
		const steps = tourId === "promoter" ? buildPromoterSteps(t) : buildAdminSteps(t);
		const key = storageKey(tourId, userId);

		const driverObj = driver({
			showProgress: true,
			allowClose: true,
			overlayOpacity: 0.55,
			smoothScroll: true,
			progressText: progressTemplate,
			nextBtnText: t("next"),
			prevBtnText: t("prev"),
			doneBtnText: t("done"),
			steps,
			onPopoverRender: (popover) => applyTourStyles(popover as unknown as Record<string, Element>),
			onDestroyStarted: () => {
				localStorage.setItem(key, "1");
				driverObj.destroy();
			},
		});
		driverObj.drive();
	}, [tourId, t, userId, progressTemplate]);

	useEffect(() => {
		// Wait until the session is resolved before deciding whether to auto-start.
		// session === undefined means still loading; null means logged out.
		if (session === undefined) return;
		// Only auto-play for accounts created in the last 24 hours so the tour
		// never repeats on a new device for existing users.
		if (!isNewAccount(session?.user)) return;
		const key = storageKey(tourId, userId);
		const seen = localStorage.getItem(key);
		if (seen) return;
		const timeout = setTimeout(startTour, 1200);
		return () => clearTimeout(timeout);
	}, [tourId, startTour, session, userId]);

	return (
		<button
			type="button"
			onClick={startTour}
			className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-[#FF5A30] hover:bg-orange-50 transition-colors w-full"
		>
			<span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
				travel_explore
			</span>
			{t("replayButton")}
		</button>
	);
}

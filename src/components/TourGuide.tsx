"use client";

import "driver.js/dist/driver.css";
import type { DriveStep } from "driver.js";
import { useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";

type TourId = "promoter" | "admin";

const STORAGE_KEY: Record<TourId, string> = {
	promoter: "ts_tour_promoter_v1",
	admin: "ts_tour_admin_v1",
};

function buildPromoterSteps(t: ReturnType<typeof useTranslations<"Tour">>): DriveStep[] {
	return [
		{
			popover: {
				title: t("promoter.step0.title"),
				description: t("promoter.step0.description"),
				side: "over" as never,
			},
		},
		{
			element: '[data-tour="nav-discovery"]',
			popover: {
				title: t("promoter.step1.title"),
				description: t("promoter.step1.description"),
				side: "right",
				align: "center",
			},
		},
		{
			element: '[data-tour="nav-tours"]',
			popover: {
				title: t("promoter.step2.title"),
				description: t("promoter.step2.description"),
				side: "right",
				align: "center",
			},
		},
		{
			element: '[data-tour="nav-financing"]',
			popover: {
				title: t("promoter.step3.title"),
				description: t("promoter.step3.description"),
				side: "right",
				align: "center",
			},
		},
		{
			element: '[data-tour="nav-insurance"]',
			popover: {
				title: t("promoter.step4.title"),
				description: t("promoter.step4.description"),
				side: "right",
				align: "center",
			},
		},
		{
			element: '[data-tour="nav-cta"]',
			popover: {
				title: t("promoter.step5.title"),
				description: t("promoter.step5.description"),
				side: "top",
				align: "center",
			},
		},
		{
			popover: {
				title: t("promoter.step6.title"),
				description: t("promoter.step6.description"),
				side: "over" as never,
			},
		},
	];
}

function buildAdminSteps(t: ReturnType<typeof useTranslations<"Tour">>): DriveStep[] {
	return [
		{
			popover: {
				title: t("admin.step0.title"),
				description: t("admin.step0.description"),
				side: "over" as never,
			},
		},
		{
			element: '[data-tour="admin-nav-eoi"]',
			popover: {
				title: t("admin.step1.title"),
				description: t("admin.step1.description"),
				side: "right",
				align: "center",
			},
		},
		{
			element: '[data-tour="admin-nav-tours"]',
			popover: {
				title: t("admin.step2.title"),
				description: t("admin.step2.description"),
				side: "right",
				align: "center",
			},
		},
		{
			element: '[data-tour="admin-nav-artists"]',
			popover: {
				title: t("admin.step3.title"),
				description: t("admin.step3.description"),
				side: "right",
				align: "center",
			},
		},
		{
			element: '[data-tour="admin-nav-reports"]',
			popover: {
				title: t("admin.step4.title"),
				description: t("admin.step4.description"),
				side: "right",
				align: "center",
			},
		},
		{
			element: '[data-tour="admin-nav-cta"]',
			popover: {
				title: t("admin.step5.title"),
				description: t("admin.step5.description"),
				side: "top",
				align: "center",
			},
		},
		{
			popover: {
				title: t("admin.step6.title"),
				description: t("admin.step6.description"),
				side: "over" as never,
			},
		},
	];
}

export default function TourGuide({ tourId }: { tourId: TourId }) {
	const t = useTranslations("Tour");

	const startTour = useCallback(async () => {
		const { driver } = await import("driver.js");

		const steps =
			tourId === "promoter" ? buildPromoterSteps(t) : buildAdminSteps(t);

		const driverObj = driver({
			showProgress: true,
			allowClose: true,
			overlayOpacity: 0.55,
			smoothScroll: true,
			progressText: t("progress"),
			nextBtnText: t("next"),
			prevBtnText: t("prev"),
			doneBtnText: t("done"),
			steps,
			onDestroyStarted: () => {
				localStorage.setItem(STORAGE_KEY[tourId], "1");
				driverObj.destroy();
			},
		});

		driverObj.drive();
	}, [tourId, t]);

	// Auto-play on first visit
	useEffect(() => {
		const seen = localStorage.getItem(STORAGE_KEY[tourId]);
		if (seen) return;
		const timeout = setTimeout(startTour, 1200);
		return () => clearTimeout(timeout);
	}, [tourId, startTour]);

	return (
		<button
			type="button"
			onClick={startTour}
			className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-[#FF5A30] hover:bg-orange-50 transition-colors w-full"
		>
			<span
				className="material-symbols-outlined text-base"
				style={{ fontVariationSettings: "'FILL' 1" }}
			>
				travel_explore
			</span>
			{t("replayButton")}
		</button>
	);
}

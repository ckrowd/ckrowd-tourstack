"use client";

import type { DriveStep } from "driver.js";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { applyTourStyles } from "@/lib/tour-styles";

export type PageTourId =
	| "discovery"
	| "tours"
	| "eoi"
	| "financing"
	| "insurance"
	| "dashboard"
	| "admin-dashboard"
	| "admin-eoi"
	| "admin-tours";

function buildSteps(
	pageId: PageTourId,
	t: ReturnType<typeof useTranslations<"PageTour">>,
): DriveStep[] {
	const k = (step: number, field: "title" | "description") =>
		t(`${pageId}.step${step}.${field}` as never);

	const step = (i: number, element?: string): DriveStep => ({
		...(element ? { element } : {}),
		popover: {
			title: k(i, "title"),
			description: k(i, "description"),
			...(element ? { side: "bottom" as const, align: "start" as const } : {}),
		},
	});

	switch (pageId) {
		case "discovery":
			return [
				step(0),
				step(1, '[data-tour="discovery-filters"]'),
				step(2, '[data-tour="discovery-grid"]'),
				step(3, '[data-tour="discovery-how-it-works"]'),
				step(4),
			];
		case "tours":
			return [
				step(0),
				step(1, '[data-tour="tours-stats"]'),
				step(2, '[data-tour="tours-pipeline"]'),
				step(3, '[data-tour="tours-list"]'),
			];
		case "eoi":
			return [
				step(0),
				step(1, '[data-tour="eoi-selector"]'),
				step(2, '[data-tour="eoi-form"]'),
				step(3),
			];
		case "financing":
			return [step(0), step(1, '[data-tour="financing-apply"]'), step(2, '[data-tour="financing-products"]')];
		case "insurance":
			return [step(0), step(1, '[data-tour="insurance-products"]'), step(2)];
		case "dashboard":
			return [step(0), step(1, '[data-tour="dashboard-stats"]'), step(2, '[data-tour="dashboard-eois"]'), step(3)];
		case "admin-dashboard":
			return [
				step(0),
				step(1, '[data-tour="admin-stats"]'),
				step(2, '[data-tour="admin-recent-tours"]'),
				step(3, '[data-tour="admin-recent-eois"]'),
			];
		case "admin-eoi":
			return [step(0), step(1, '[data-tour="admin-eoi-list"]'), step(2)];
		case "admin-tours":
			return [step(0), step(1, '[data-tour="admin-tours-list"]'), step(2)];
		default:
			return [step(0)];
	}
}

export default function PageTour({ pageId }: { pageId: PageTourId }) {
	const t = useTranslations("PageTour");
	const storageKey = `ts_page_tour_${pageId}_v1`;
	const steps = useMemo(() => buildSteps(pageId, t), [pageId, t]);

	const startTour = useCallback(async () => {
		const { driver } = await import("driver.js");
		const driverObj = driver({
			showProgress: true,
			allowClose: true,
			overlayOpacity: 0.5,
			smoothScroll: true,
			steps,
			onPopoverRender: (popover) =>
				applyTourStyles(popover as unknown as Record<string, Element>),
			onDestroyStarted: () => {
				localStorage.setItem(storageKey, "1");
				driverObj.destroy();
			},
		});
		driverObj.drive();
	}, [steps, storageKey]);

	// Auto-play on first visit to this page
	useEffect(() => {
		const seen = localStorage.getItem(storageKey);
		if (seen) return;
		const timeout = setTimeout(startTour, 1400);
		return () => clearTimeout(timeout);
	}, [storageKey, startTour]);

	// Listen for guide button click dispatched by TopNav
	useEffect(() => {
		const handler = () => startTour();
		window.addEventListener("ts:start-tour", handler);
		return () => window.removeEventListener("ts:start-tour", handler);
	}, [startTour]);

	return null;
}

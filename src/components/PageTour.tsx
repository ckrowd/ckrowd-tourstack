"use client";

import type { DriveStep } from "driver.js";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { applyTourStyles } from "@/lib/tour-styles";
import { useSession } from "@/context/AuthContext";

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

/** Returns a per-account storage key so different users on the same device
 * each track their own page-tour completion state. */
function makeStorageKey(pageId: PageTourId, userId: string | undefined): string {
	const base = `ts_page_tour_${pageId}_v1`;
	return userId ? `${base}_${userId}` : base;
}

export default function PageTour({ pageId }: { pageId: PageTourId }) {
	const t = useTranslations("PageTour");
	const tTour = useTranslations("Tour");
	const { data: session } = useSession();
	const userId = session?.user?.id as string | undefined;

	const steps = useMemo(() => buildSteps(pageId, t), [pageId, t]);

	// Build the driver.js progress template in code — ICU/next-intl cannot
	// safely hold {{x}} or {x} placeholders for driver.js, so we only translate
	// the connector word and compose the template string here.
	const progressTemplate = `{{current}} ${tTour("progressSeparator")} {{total}}`;

	const startTour = useCallback(async () => {
		const { driver } = await import("driver.js");
		const storageKey = makeStorageKey(pageId, userId);

		const driverObj = driver({
			showProgress: true,
			allowClose: true,
			overlayOpacity: 0.5,
			smoothScroll: true,
			progressText: progressTemplate,
			nextBtnText: tTour("next"),
			prevBtnText: tTour("prev"),
			doneBtnText: tTour("done"),
			steps,
			onPopoverRender: (popover) =>
				applyTourStyles(popover as unknown as Record<string, Element>),
			onDestroyStarted: () => {
				localStorage.setItem(storageKey, "1");
				driverObj.destroy();
			},
		});
		driverObj.drive();
	}, [steps, pageId, userId, progressTemplate, tTour]);

	// Listen for guide button click dispatched by TopNav
	useEffect(() => {
		const handler = () => startTour();
		window.addEventListener("ts:start-tour", handler);
		return () => window.removeEventListener("ts:start-tour", handler);
	}, [startTour]);

	return null;
}

"use client";

import { useCallback, useSyncExternalStore } from "react";

export type TsTheme = "dark" | "light";

const STORAGE_KEY = "ts-theme";

// useSyncExternalStore avoids the server/client hydration mismatch that a
// lazy-initialiser useState would cause (server has no localStorage), same
// pattern as TopNav's notification read-state.
function getSnapshot(): TsTheme {
	let saved: string | null = null;
	try {
		saved = localStorage.getItem(STORAGE_KEY);
	} catch {}
	if (saved === "light" || saved === "dark") return saved;
	return typeof matchMedia !== "undefined" &&
		matchMedia("(prefers-color-scheme: light)").matches
		? "light"
		: "dark";
}

function getServerSnapshot(): TsTheme {
	return "dark";
}

/**
 * Shared light/dark theme state for the public funnel (sign in, sign up,
 * onboarding, contact). Persists to the same `ts-theme` localStorage key the
 * marketing landing uses, so a choice on any surface carries across all of
 * them. Defaults to dark on the server; hydrates from storage / system
 * preference on mount.
 */
export function useTsTheme() {
	const theme = useSyncExternalStore(
		(cb) => {
			window.addEventListener("storage", cb);
			return () => window.removeEventListener("storage", cb);
		},
		getSnapshot,
		getServerSnapshot,
	);

	const toggle = useCallback(() => {
		const next: TsTheme = getSnapshot() === "dark" ? "light" : "dark";
		try {
			localStorage.setItem(STORAGE_KEY, next);
		} catch {}
		// Dispatch storage event so useSyncExternalStore re-reads in this tab.
		window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
	}, []);

	return { theme, toggle, isLight: theme === "light" };
}

"use client";

import { useEffect, useState } from "react";

export type TsTheme = "dark" | "light";

/**
 * Shared light/dark theme state for the public funnel (sign in, sign up,
 * onboarding, contact). Persists to the same `ts-theme` localStorage key the
 * marketing landing uses, so a choice on any surface carries across all of
 * them. Defaults to dark on the server; hydrates from storage / system
 * preference on mount.
 */
export function useTsTheme() {
	const [theme, setTheme] = useState<TsTheme>("dark");

	useEffect(() => {
		let saved: string | null = null;
		try {
			saved = localStorage.getItem("ts-theme");
		} catch {}
		const next: TsTheme =
			saved === "light" || saved === "dark"
				? saved
				: typeof matchMedia !== "undefined" &&
						matchMedia("(prefers-color-scheme: light)").matches
					? "light"
					: "dark";
		setTheme(next);
	}, []);

	function toggle() {
		setTheme((cur) => {
			const next: TsTheme = cur === "dark" ? "light" : "dark";
			try {
				localStorage.setItem("ts-theme", next);
			} catch {}
			return next;
		});
	}

	return { theme, toggle, isLight: theme === "light" };
}

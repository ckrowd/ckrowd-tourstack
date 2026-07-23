"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import Icon from "@/components/icons";

const noopSubscribe = () => () => {};

export default function ThemeToggle({ className }: { className?: string }) {
	const { resolvedTheme, setTheme } = useTheme();
	// resolvedTheme is undefined until after mount (the real value only exists
	// client-side, via localStorage) — useSyncExternalStore's getServerSnapshot
	// keeps the first client render matching the server (both "not mounted"),
	// same pattern already used above for notification read-state.
	const mounted = useSyncExternalStore(
		noopSubscribe,
		() => true,
		() => false,
	);

	const isDark = mounted && resolvedTheme === "dark";

	return (
		<button
			type="button"
			role="switch"
			aria-checked={isDark}
			aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
			onClick={() => setTheme(isDark ? "light" : "dark")}
			className={`p-2 hover:bg-surface-container-high rounded-full transition-all active:scale-95 ${className ?? ""}`}
		>
			<Icon
				name={mounted && isDark ? "sun" : "moon"}
				size={19}
				className="text-on-surface-variant"
			/>
		</button>
	);
}

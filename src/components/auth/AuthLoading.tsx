"use client";

import { useTsTheme } from "@/components/theme/useTsTheme";

/**
 * Full-screen placeholder shown while an auth page's session check is
 * pending, before AuthShell mounts. Wraps itself in the same `.ts-theme`
 * scope AuthShell uses so it doesn't flash the wrong theme.
 */
export default function AuthLoading({ label }: { label: string }) {
	const { theme } = useTsTheme();
	return (
		<div
			className={`ts-theme ${theme === "light" ? "light" : ""} min-h-[100dvh] bg-[var(--bg)] flex items-center justify-center px-4 text-[var(--muted)] text-sm font-(family-name:--font-geist)`}
		>
			{label}
		</div>
	);
}

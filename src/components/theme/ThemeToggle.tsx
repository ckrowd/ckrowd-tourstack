"use client";

import type { TsTheme } from "./useTsTheme";

/**
 * Sun / moon theme toggle for the funnel surfaces. Presentational: the parent
 * owns the theme state (via useTsTheme) and passes it in, so the page root and
 * the button stay in sync.
 */
export default function ThemeToggle({
	theme,
	onToggle,
	className = "",
}: {
	theme: TsTheme;
	onToggle: () => void;
	className?: string;
}) {
	return (
		<button
			type="button"
			onClick={onToggle}
			aria-label="Toggle theme"
			className={`grid h-9 w-9 place-items-center rounded-full border border-[var(--hair)] text-[var(--muted)] hover:text-[var(--text)] hover:border-orange/40 transition-colors ${className}`}
		>
			<span className="material-symbols-outlined text-[20px]">
				{theme === "dark" ? "light_mode" : "dark_mode"}
			</span>
		</button>
	);
}

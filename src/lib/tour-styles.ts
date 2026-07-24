// Shared driver.js popover styling applied via onPopoverRender.
// Using inline styles guarantees the look regardless of CSS loading order or
// specificity wars with driver.js defaults. The popover renders at
// document.body (outside the .ts-dash token scope), so we resolve concrete
// colours per theme here — reading the `.dark` class next-themes sets on
// <html> — to keep the guide theme-appropriate in both light and dark.

type PopoverEl = Record<string, Element | undefined>;

function s(popover: PopoverEl, key: string): HTMLElement | null {
	const el = popover[key];
	return el instanceof HTMLElement ? el : null;
}

export function applyTourStyles(popover: PopoverEl) {
	const isDark =
		typeof document !== "undefined" &&
		document.documentElement.classList.contains("dark");

	const surface = isDark ? "#161616" : "#ffffff";
	const onSurface = isDark ? "#d7d7d7" : "#374151";
	const outline = isDark ? "rgba(255,255,255,0.10)" : "rgba(12,12,12,0.08)";
	const prevText = isDark ? "#a8a8a8" : "#6b7280";
	const prevBorder = isDark ? "rgba(255,255,255,0.16)" : "#e5e7eb";
	const shadow = isDark
		? "0 24px 64px rgba(0,0,0,0.55)"
		: "0 24px 64px rgba(0,0,0,0.18)";

	const wrapper = s(popover, "wrapper");
	if (wrapper) {
		Object.assign(wrapper.style, {
			padding: "0",
			overflow: "hidden",
			borderRadius: "16px",
			boxShadow: shadow,
			minWidth: "300px",
			maxWidth: "380px",
			background: surface,
			border: `1px solid ${outline}`,
			fontFamily: "system-ui, -apple-system, sans-serif",
		});
		// Arrow (driver.js colours it via border-*-color) reads this var — set in
		// globals.css — so the pointer matches the themed popover body.
		wrapper.style.setProperty("--tour-arrow", surface);
	}

	const title = s(popover, "title");
	if (title) {
		Object.assign(title.style, {
			background: "#FF5A30", // solid — deliberately gradient-free
			color: "#ffffff",
			padding: "18px 46px 14px 22px",
			margin: "0",
			fontSize: "15px",
			fontWeight: "800",
			lineHeight: "1.4",
			letterSpacing: "-0.01em",
		});
	}

	const desc = s(popover, "description");
	if (desc) {
		Object.assign(desc.style, {
			padding: "16px 22px 8px",
			margin: "0",
			fontSize: "14px",
			lineHeight: "1.65",
			color: onSurface,
			background: surface,
		});
	}

	const footer = s(popover, "footer");
	if (footer) {
		Object.assign(footer.style, {
			padding: "12px 22px 18px",
			borderTop: "none",
			background: surface,
			display: "flex",
			alignItems: "center",
			justifyContent: "space-between",
		});
	}

	const next = s(popover, "nextButton");
	if (next) {
		Object.assign(next.style, {
			background: "#FF5A30",
			color: "#ffffff",
			border: "none",
			borderRadius: "10px",
			padding: "9px 22px",
			fontSize: "12px",
			fontWeight: "800",
			textTransform: "uppercase",
			letterSpacing: "0.08em",
			cursor: "pointer",
			boxShadow: "0 4px 12px rgba(255,90,48,0.3)",
		});
	}

	const prev = s(popover, "previousButton");
	if (prev) {
		Object.assign(prev.style, {
			background: "transparent",
			color: prevText,
			border: `1px solid ${prevBorder}`,
			borderRadius: "10px",
			padding: "8px 16px",
			fontSize: "12px",
			fontWeight: "700",
			cursor: "pointer",
		});
	}

	const close = s(popover, "closeButton");
	if (close) {
		Object.assign(close.style, {
			color: "rgba(255,255,255,0.85)",
			background: "none",
			border: "none",
			cursor: "pointer",
			fontSize: "18px",
		});
	}

	const progress = s(popover, "progress");
	if (progress) {
		Object.assign(progress.style, {
			color: isDark ? "#8a8a8a" : "#9ca3af",
			fontSize: "11px",
			fontWeight: "600",
		});
	}
}

// Shared driver.js popover styling applied via onPopoverRender.
// Using inline styles guarantees the orange header / clean-card look regardless
// of CSS loading order or specificity wars with driver.js defaults.

type PopoverEl = Record<string, Element | undefined>;

function s(popover: PopoverEl, key: string): HTMLElement | null {
	const el = popover[key];
	return el instanceof HTMLElement ? el : null;
}

export function applyTourStyles(popover: PopoverEl) {
	const wrapper = s(popover, "wrapper");
	if (wrapper) {
		Object.assign(wrapper.style, {
			padding: "0",
			overflow: "hidden",
			borderRadius: "16px",
			boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
			minWidth: "300px",
			maxWidth: "380px",
			border: "none",
			fontFamily: "system-ui, -apple-system, sans-serif",
		});
	}

	const title = s(popover, "title");
	if (title) {
		Object.assign(title.style, {
			background: "linear-gradient(135deg, #FF5A30, #E04820)",
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
			color: "#374151",
		});
	}

	const footer = s(popover, "footer");
	if (footer) {
		Object.assign(footer.style, {
			padding: "12px 22px 18px",
			borderTop: "none",
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
			color: "#6b7280",
			border: "1px solid #e5e7eb",
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
			color: "#9ca3af",
			fontSize: "11px",
			fontWeight: "600",
		});
	}
}

"use client";

import { useEffect, useRef, useState } from "react";

/* Animated numeral — counts from 0 to `value` on mount with an ease-out rAF
   loop. SSR and reduced-motion render the final value immediately, so there
   is no layout shift and no motion for users who opted out. Formatting goes
   through Intl.NumberFormat so fr/en group digits correctly. */
interface CountUpProps {
	value: number;
	locale?: string;
	prefix?: string;
	suffix?: string;
	durationMs?: number;
	className?: string;
}

export default function CountUp({
	value,
	locale = "en",
	prefix = "",
	suffix = "",
	durationMs = 900,
	className,
}: CountUpProps) {
	const [display, setDisplay] = useState(value);
	const animated = useRef(false);

	useEffect(() => {
		if (animated.current) return;
		animated.current = true;
		if (
			value === 0 ||
			(typeof window !== "undefined" &&
				window.matchMedia("(prefers-reduced-motion: reduce)").matches)
		) {
			return;
		}
		let raf: number;
		const start = performance.now();
		const tick = (now: number) => {
			const t = Math.min((now - start) / durationMs, 1);
			const eased = 1 - (1 - t) ** 3;
			setDisplay(Math.round(value * eased));
			if (t < 1) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [value, durationMs]);

	return (
		<span className={className}>
			{prefix}
			{new Intl.NumberFormat(locale).format(display)}
			{suffix}
		</span>
	);
}

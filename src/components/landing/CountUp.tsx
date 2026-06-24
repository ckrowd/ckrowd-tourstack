"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type CountUpProps = {
	end: number;
	prefix?: string;
	suffix?: string;
	decimals?: number;
	durationSec?: number;
	className?: string;
};

/**
 * Counts from 0 to `end` the first time it enters view (motion/react `animate`
 * drives a value off the main React render path). Jumps straight to `end`
 * under prefers-reduced-motion.
 */
export default function CountUp({
	end,
	prefix = "",
	suffix = "",
	decimals = 0,
	durationSec = 1.6,
	className,
}: CountUpProps) {
	const ref = useRef<HTMLSpanElement>(null);
	const inView = useInView(ref, { once: true, amount: 0.4 });
	const reduce = useReducedMotion();
	const [display, setDisplay] = useState(0);

	useEffect(() => {
		if (!inView) return;
		if (reduce) {
			setDisplay(end);
			return;
		}
		const controls = animate(0, end, {
			duration: durationSec,
			ease: [0.16, 1, 0.3, 1],
			onUpdate: (v) => setDisplay(v),
		});
		return () => controls.stop();
	}, [inView, end, durationSec, reduce]);

	const formatted = display.toLocaleString("en-US", {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	});

	return (
		<span ref={ref} className={className}>
			{prefix}
			{formatted}
			{suffix}
		</span>
	);
}

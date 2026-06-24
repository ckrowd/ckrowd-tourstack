"use client";

import {
	motion,
	useMotionTemplate,
	useMotionValue,
	useReducedMotion,
} from "motion/react";

type SpotlightCardProps = {
	children: React.ReactNode;
	className?: string;
};

/**
 * Card with a cursor-following radial highlight (Stripe / Ramp style), driven
 * by motion values so the glow tracks the pointer without re-rendering React.
 * Under reduced motion the glow is omitted entirely.
 */
export default function SpotlightCard({
	children,
	className = "",
}: SpotlightCardProps) {
	const reduce = useReducedMotion();
	const mx = useMotionValue(-200);
	const my = useMotionValue(-200);
	const background = useMotionTemplate`radial-gradient(260px circle at ${mx}px ${my}px, rgba(255,90,48,0.15), transparent 65%)`;

	function handleMove(e: React.MouseEvent<HTMLDivElement>) {
		const rect = e.currentTarget.getBoundingClientRect();
		mx.set(e.clientX - rect.left);
		my.set(e.clientY - rect.top);
	}

	return (
		<div
			onMouseMove={reduce ? undefined : handleMove}
			className={`group relative isolate overflow-hidden ${className}`}
		>
			{!reduce && (
				<motion.div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
					style={{ background }}
				/>
			)}
			<div className="relative z-[1]">{children}</div>
		</div>
	);
}

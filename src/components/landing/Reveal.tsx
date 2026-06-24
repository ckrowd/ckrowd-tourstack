"use client";

import { motion, useReducedMotion } from "motion/react";
import { motionTokens } from "@/lib/motionTokens";

type RevealProps = {
	children: React.ReactNode;
	/** Stagger delay in ms (kept in ms for call-site readability). */
	delay?: number;
	/** Lift distance in px before reveal. */
	y?: number;
	className?: string;
};

/**
 * Scroll-reveal wrapper (motion/react). Fades + lifts children the first time
 * they enter the viewport. Collapses to a static, instant render under
 * prefers-reduced-motion.
 */
export default function Reveal({
	children,
	delay = 0,
	y = motionTokens.distance.lg,
	className,
}: RevealProps) {
	const reduce = useReducedMotion();

	return (
		<motion.div
			className={className}
			initial={reduce ? false : { opacity: 0, y }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.15, margin: "0px 0px -8% 0px" }}
			transition={{
				duration: motionTokens.duration.reveal,
				ease: motionTokens.easing.smooth,
				delay: delay / 1000,
			}}
		>
			{children}
		</motion.div>
	);
}

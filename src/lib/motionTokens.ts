/**
 * Shared motion tokens (motion-ui system v4.2).
 * Use these instead of ad-hoc durations/easings so motion stays consistent.
 *   transition={{ duration: motionTokens.duration.normal, ease: motionTokens.easing.smooth }}
 */
export const motionTokens = {
	duration: {
		fast: 0.18,
		normal: 0.35,
		slow: 0.6,
		reveal: 0.7,
	},
	easing: {
		smooth: [0.22, 1, 0.36, 1] as [number, number, number, number],
		sharp: [0.4, 0, 0.2, 1] as [number, number, number, number],
	},
	distance: {
		sm: 8,
		md: 16,
		lg: 24,
	},
	spring: {
		soft: { type: "spring", stiffness: 120, damping: 18 } as const,
		snappy: { type: "spring", stiffness: 220, damping: 22 } as const,
	},
} as const;

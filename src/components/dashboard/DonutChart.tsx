/* Status composition donut — pure SVG, server-safe. Thin ring, 2px surface
   gaps between segments, hero total in the center. Colors are the validated
   --chart-* status tokens (theme-aware); identity is never color-alone — the
   caller renders a legend with labels + counts beside it. Empty data renders
   a muted full ring so the card degrades gracefully. */

export interface DonutSegment {
	value: number;
	color: string; // CSS color, e.g. "var(--chart-approved)"
	label: string;
}

interface DonutChartProps {
	segments: DonutSegment[];
	centerValue: string;
	centerLabel?: string;
	size?: number;
}

export default function DonutChart({
	segments,
	centerValue,
	centerLabel,
	size = 148,
}: DonutChartProps) {
	const R = 40;
	const STROKE = 11;
	const C = 2 * Math.PI * R;
	const GAP = 2.5; // px along the circumference between segments
	const total = segments.reduce((s, seg) => s + seg.value, 0);
	const visible = segments.filter((s) => s.value > 0);

	const arcs = visible.reduce<{
		list: Array<DonutSegment & { len: number; offset: number }>;
		offset: number;
	}>(
		(acc, seg) => {
			const frac = seg.value / total;
			const len = Math.max(frac * C - (visible.length > 1 ? GAP : 0), 1.5);
			acc.list.push({ ...seg, len, offset: acc.offset });
			return { list: acc.list, offset: acc.offset + frac * C };
		},
		{ list: [], offset: 0 },
	).list;

	return (
		<div className="relative shrink-0" style={{ width: size, height: size }}>
			<svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={centerLabel ? `${centerLabel}: ${centerValue}` : centerValue}>
				<g transform="rotate(-90 50 50)">
					<circle
						cx="50"
						cy="50"
						r={R}
						fill="none"
						stroke="var(--color-outline-variant)"
						strokeWidth={total === 0 ? STROKE : STROKE - 4}
						opacity={total === 0 ? 1 : 0.45}
					/>
					{arcs.map((a) => (
						<circle
							key={a.label}
							cx="50"
							cy="50"
							r={R}
							fill="none"
							stroke={a.color}
							strokeWidth={STROKE}
							strokeDasharray={`${a.len} ${C - a.len}`}
							strokeDashoffset={-a.offset}
							className="transition-[stroke-dashoffset,stroke-dasharray] duration-700 [transition-timing-function:var(--ease-out)]"
						/>
					))}
				</g>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
				<span className="text-2xl font-(family-name:--font-display) text-on-surface leading-none">
					{centerValue}
				</span>
				{centerLabel ? (
					<span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant mt-1 max-w-[70%] leading-tight">
						{centerLabel}
					</span>
				) : null}
			</div>
		</div>
	);
}

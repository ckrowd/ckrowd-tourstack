/* Single-series sparkline — pure SVG, server-safe. Supplementary trend strip
   for a stat tile (the tile's numeral carries the value; this is aria-hidden
   decoration derived from the same real data). 2px line, soft gradient fill,
   flat dashed baseline when the series is empty/all-zero. Inherits its color
   from `currentColor` so callers theme it with a text-* class. */

interface SparklineProps {
	data: number[];
	className?: string;
	height?: number;
}

export default function Sparkline({ data, className = "", height = 36 }: SparklineProps) {
	const W = 120;
	const H = 36; // viewBox height; rendered height via prop
	const PAD = 3;
	const max = Math.max(...data, 0);
	const gradId = `spark-${data.join("-").slice(0, 24)}-${data.length}`;

	if (data.length < 2 || max === 0) {
		return (
			<svg
				viewBox={`0 0 ${W} ${H}`}
				width="100%"
				height={height}
				preserveAspectRatio="none"
				aria-hidden="true"
				className={className}
			>
				<line
					x1={PAD}
					y1={H - PAD - 1}
					x2={W - PAD}
					y2={H - PAD - 1}
					stroke="currentColor"
					strokeOpacity="0.25"
					strokeWidth="2"
					strokeDasharray="3 4"
					strokeLinecap="round"
				/>
			</svg>
		);
	}

	const step = (W - PAD * 2) / (data.length - 1);
	const y = (v: number) => H - PAD - (v / max) * (H - PAD * 2);
	const points = data.map((v, i) => [PAD + i * step, y(v)] as const);
	const line = points.map(([px, py], i) => `${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`).join(" ");
	const area = `${line} L${(W - PAD).toFixed(1)},${H - PAD} L${PAD},${H - PAD} Z`;

	return (
		<svg
			viewBox={`0 0 ${W} ${H}`}
			width="100%"
			height={height}
			preserveAspectRatio="none"
			aria-hidden="true"
			className={className}
		>
			<defs>
				<linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
					<stop offset="100%" stopColor="currentColor" stopOpacity="0" />
				</linearGradient>
			</defs>
			<path d={area} fill={`url(#${gradId})`} />
			<path
				d={line}
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				vectorEffect="non-scaling-stroke"
			/>
			<circle
				cx={points[points.length - 1][0]}
				cy={points[points.length - 1][1]}
				r="2.5"
				fill="currentColor"
			/>
		</svg>
	);
}

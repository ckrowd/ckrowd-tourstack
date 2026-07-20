"use client";

import { useEffect, useId, useRef, useState } from "react";

/* Framed hero area chart — the analytics centerpiece. Real y-axis ticks
   (integer-aware for counts), recessive gridlines, month labels, a clip-path
   draw-in reveal, and a live hover crosshair + shared tooltip. Responsive via
   ResizeObserver (crisp text and non-distorted 2px marks). Supports 1–2
   series: the first is the filled hero, a second renders as a comparison
   line (fill vs line = secondary encoding beyond color). A legend is always
   shown for ≥2 series so identity is never color-alone. Reduced-motion skips
   the draw. Colors are passed as CSS custom-property strings so the chart
   follows the validated per-theme tokens. */

export interface ChartSeries {
	values: number[];
	label: string;
	color: string; // CSS color, e.g. "var(--color-primary)"
	fill?: boolean;
}

interface AreaChartProps {
	series: ChartSeries[];
	labels: string[];
	locale?: string;
	valuePrefix?: string;
	valueSuffix?: string;
	unitLabel?: string;
	integer?: boolean;
	height?: number;
	className?: string;
}

function niceScale(max: number, integer: boolean, target = 4) {
	if (max <= 0) return { yMax: integer ? 1 : 4, ticks: 1 };
	const raw = max / target;
	const pow = 10 ** Math.floor(Math.log10(raw || 1));
	const f = raw / pow;
	let step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * pow;
	if (integer) step = Math.max(1, Math.round(step));
	let yMax = Math.ceil(max / step) * step;
	// Headroom: keep the line off the top frame (and clear of the legend) by
	// bumping one step when the peak would touch the ceiling.
	if (yMax <= max) yMax += step;
	return { yMax, ticks: Math.round(yMax / step) };
}

export default function AreaChart({
	series,
	labels,
	locale = "en",
	valuePrefix = "",
	valueSuffix = "",
	unitLabel,
	integer = false,
	height = 260,
	className = "",
}: AreaChartProps) {
	const wrapRef = useRef<HTMLDivElement>(null);
	const [w, setW] = useState(640);
	const [active, setActive] = useState<number | null>(null);
	const [drawn, setDrawn] = useState(false);
	const uid = useId().replace(/:/g, "");

	useEffect(() => {
		const el = wrapRef.current;
		if (!el) return;
		const ro = new ResizeObserver((entries) => {
			const cw = entries[0]?.contentRect.width;
			if (cw) setW(cw);
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	useEffect(() => {
		const reduce =
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (reduce) {
			setDrawn(true);
			return;
		}
		const r = requestAnimationFrame(() => setDrawn(true));
		return () => cancelAnimationFrame(r);
	}, []);

	const PAD_L = 40;
	const PAD_R = 12;
	const PAD_T = 14;
	const PAD_B = 26;
	const H = height;
	const plotW = Math.max(w - PAD_L - PAD_R, 10);
	const plotH = H - PAD_T - PAD_B;

	const n = labels.length;
	const rawMax = Math.max(...series.flatMap((s) => s.values), 1);
	const { yMax, ticks } = niceScale(rawMax, integer);
	const xAt = (i: number) =>
		PAD_L + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
	const yAt = (v: number) => PAD_T + plotH - (v / yMax) * plotH;

	const paths = series.map((s) => {
		const pts = s.values.map((v, i) => [xAt(i), yAt(v)] as const);
		const line = pts
			.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
			.join(" ");
		const area = `${line} L${xAt(n - 1).toFixed(1)},${(PAD_T + plotH).toFixed(1)} L${PAD_L.toFixed(1)},${(PAD_T + plotH).toFixed(1)} Z`;
		return { pts, line, area };
	});

	const fmt = (v: number) =>
		`${valuePrefix}${new Intl.NumberFormat(locale).format(v)}${valueSuffix}`;

	function onMove(e: React.PointerEvent<SVGSVGElement>) {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		let best = 0;
		let bestD = Infinity;
		for (let i = 0; i < n; i++) {
			const d = Math.abs(xAt(i) - x);
			if (d < bestD) {
				bestD = d;
				best = i;
			}
		}
		setActive(best);
	}

	const multi = series.length > 1;

	return (
		<div ref={wrapRef} className={`relative w-full ${className}`}>
			{/* Legend (identity never color-alone) */}
			{multi && (
				<div className="absolute right-1 top-0 z-10 flex items-center gap-3 rounded-md border border-outline-variant/60 bg-surface-container-lowest/80 px-2.5 py-1 backdrop-blur-sm">
					{series.map((s) => (
						<span key={s.label} className="flex items-center gap-1.5">
							<span
								className={`w-2.5 rounded-full ${s.fill === false ? "h-0.5" : "h-2.5"}`}
								style={{ background: s.color }}
							/>
							<span className="text-[11px] font-medium text-on-surface-variant">
								{s.label}
							</span>
						</span>
					))}
				</div>
			)}

			<svg
				width={w}
				height={H}
				role="img"
				aria-label={series.map((s) => s.label).join(", ")}
				className="block touch-none"
				onPointerMove={onMove}
				onPointerLeave={() => setActive(null)}
			>
				<defs>
					{series.map((s, si) => (
						<linearGradient key={s.label} id={`area-${uid}-${si}`} x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor={s.color} stopOpacity="0.20" />
							<stop offset="100%" stopColor={s.color} stopOpacity="0" />
						</linearGradient>
					))}
					<clipPath id={`reveal-${uid}`}>
						<rect
							x="0"
							y="0"
							width={drawn ? w : 0}
							height={H}
							className="transition-[width] duration-[900ms] [transition-timing-function:var(--ease-out)]"
						/>
					</clipPath>
				</defs>

				{/* Y grid + axis labels */}
				{Array.from({ length: ticks + 1 }, (_, i) => {
					const v = (yMax / ticks) * i;
					const y = yAt(v);
					return (
						<g key={i}>
							<line
								x1={PAD_L}
								y1={y}
								x2={w - PAD_R}
								y2={y}
								stroke="var(--color-outline-variant)"
								strokeWidth="1"
								opacity={i === 0 ? 0.9 : 0.5}
							/>
							<text
								x={PAD_L - 8}
								y={y + 3}
								textAnchor="end"
								className="fill-on-surface-variant"
								style={{ fontSize: 10, fontWeight: 500 }}
							>
								{new Intl.NumberFormat(locale, { notation: "compact" }).format(v)}
							</text>
						</g>
					);
				})}

				{/* X labels */}
				{labels.map((lab, i) => (
					<text
						key={lab + i}
						x={xAt(i)}
						y={H - 8}
						textAnchor="middle"
						className="fill-on-surface-variant"
						style={{ fontSize: 10, fontWeight: 500 }}
					>
						{lab}
					</text>
				))}

				{/* Series (revealed via clip). Fill first (hero) so comparison
				    lines sit on top. */}
				<g clipPath={`url(#reveal-${uid})`}>
					{series.map((s, si) =>
						s.fill !== false ? (
							<path key={`f-${s.label}`} d={paths[si].area} fill={`url(#area-${uid}-${si})`} />
						) : null,
					)}
					{series.map((s, si) => (
						<path
							key={`l-${s.label}`}
							d={paths[si].line}
							fill="none"
							stroke={s.color}
							strokeWidth={s.fill === false ? 2 : 2.5}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeDasharray={s.fill === false ? "5 4" : undefined}
						/>
					))}
				</g>

				{/* Hover crosshair + markers */}
				{active != null && (
					<g className="pointer-events-none">
						<line
							x1={xAt(active)}
							y1={PAD_T}
							x2={xAt(active)}
							y2={PAD_T + plotH}
							stroke="var(--color-on-surface-variant)"
							strokeWidth="1"
							strokeDasharray="3 3"
							opacity="0.4"
						/>
						{series.map((s, si) => (
							<circle
								key={s.label}
								cx={xAt(active)}
								cy={paths[si].pts[active][1]}
								r="3.5"
								fill={s.color}
								stroke="var(--color-surface-container-lowest)"
								strokeWidth="2"
							/>
						))}
					</g>
				)}
			</svg>

			{/* Shared tooltip */}
			{active != null && (
				<div
					className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 shadow-lg"
					style={{ left: xAt(active), top: paths[0].pts[active][1] - 12 }}
				>
					<p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant whitespace-nowrap">
						{labels[active]}
					</p>
					<div className="mt-1 space-y-0.5">
						{series.map((s) => (
							<div key={s.label} className="flex items-center gap-2 whitespace-nowrap">
								<span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
								<span className="text-[11px] font-medium text-on-surface-variant">
									{s.label}
								</span>
								<span className="text-[11px] font-semibold text-on-surface ml-auto tabular-nums">
									{fmt(s.values[active])}
									{unitLabel ? (
										<span className="text-on-surface-variant font-medium ml-1">{unitLabel}</span>
									) : null}
								</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

"use client";

import { useEffect, useId, useRef, useState } from "react";

/* Framed hero area chart — the analytics centerpiece. Real y-axis ticks,
   recessive gridlines, month labels, a draw-in reveal on mount, and a live
   hover crosshair + tooltip. Responsive via ResizeObserver (crisp text and
   non-distorted 2px marks, not a squashed preserveAspectRatio). Single
   series keeps it honest and on-brand; identity is carried by the title,
   so no legend box is needed (dataviz rule). Reduced-motion skips the draw. */

interface AreaChartProps {
	values: number[];
	labels: string[];
	locale?: string;
	valuePrefix?: string;
	valueSuffix?: string;
	unitLabel?: string; // e.g. "EOIs" — shown in the tooltip
	integer?: boolean; // ticks stay whole numbers (counts, not currency)
	height?: number;
	className?: string;
}

// Returns { yMax, ticks } so every gridline lands on a "nice" value. For
// integer series (counts) the step is forced to a whole number, so a max of
// 2 reads 0·1·2 instead of 0·0.5·1·1.5·2.
function niceScale(max: number, integer: boolean, target = 4) {
	if (max <= 0) return { yMax: integer ? 1 : 4, ticks: 1 };
	const raw = max / target;
	const pow = 10 ** Math.floor(Math.log10(raw || 1));
	const f = raw / pow;
	let step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * pow;
	if (integer) step = Math.max(1, Math.round(step));
	const yMax = Math.ceil(max / step) * step;
	return { yMax, ticks: Math.round(yMax / step) };
}

export default function AreaChart({
	values,
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

	const rawMax = Math.max(...values, 1);
	const { yMax, ticks } = niceScale(rawMax, integer);
	const xAt = (i: number) =>
		PAD_L + (values.length <= 1 ? plotW / 2 : (i / (values.length - 1)) * plotW);
	const yAt = (v: number) => PAD_T + plotH - (v / yMax) * plotH;

	const pts = values.map((v, i) => [xAt(i), yAt(v)] as const);
	const line = pts
		.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
		.join(" ");
	const area = `${line} L${xAt(values.length - 1).toFixed(1)},${(PAD_T + plotH).toFixed(1)} L${PAD_L.toFixed(1)},${(PAD_T + plotH).toFixed(1)} Z`;

	const fmt = (v: number) =>
		`${valuePrefix}${new Intl.NumberFormat(locale).format(v)}${valueSuffix}`;

	function onMove(e: React.PointerEvent<SVGSVGElement>) {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		let best = 0;
		let bestD = Infinity;
		for (let i = 0; i < pts.length; i++) {
			const d = Math.abs(pts[i][0] - x);
			if (d < bestD) {
				bestD = d;
				best = i;
			}
		}
		setActive(best);
	}

	const activePt = active != null ? pts[active] : null;

	return (
		<div ref={wrapRef} className={`relative w-full ${className}`}>
			<svg
				width={w}
				height={H}
				role="img"
				aria-label="Monthly trend"
				className="block touch-none"
				onPointerMove={onMove}
				onPointerLeave={() => setActive(null)}
			>
				<defs>
					<linearGradient id={`area-${uid}`} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.20" />
						<stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
					</linearGradient>
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

				{/* Y grid + axis labels (recessive) */}
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

				{/* Area + line (revealed via clip) */}
				<g clipPath={`url(#reveal-${uid})`}>
					<path d={area} fill={`url(#area-${uid})`} />
					<path
						d={line}
						fill="none"
						stroke="var(--color-primary)"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</g>

				{/* Hover crosshair + marker */}
				{activePt && (
					<g className="pointer-events-none">
						<line
							x1={activePt[0]}
							y1={PAD_T}
							x2={activePt[0]}
							y2={PAD_T + plotH}
							stroke="var(--color-primary)"
							strokeWidth="1"
							strokeDasharray="3 3"
							opacity="0.5"
						/>
						<circle cx={activePt[0]} cy={activePt[1]} r="6" fill="var(--color-primary)" opacity="0.18" />
						<circle
							cx={activePt[0]}
							cy={activePt[1]}
							r="3.5"
							fill="var(--color-primary)"
							stroke="var(--color-surface-container-lowest)"
							strokeWidth="2"
						/>
					</g>
				)}
			</svg>

			{/* Tooltip */}
			{active != null && activePt && (
				<div
					className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 shadow-lg"
					style={{ left: activePt[0], top: activePt[1] - 10 }}
				>
					<p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant whitespace-nowrap">
						{labels[active]}
					</p>
					<p className="text-sm font-(family-name:--font-display) text-on-surface whitespace-nowrap leading-tight mt-0.5">
						{fmt(values[active])}
						{unitLabel ? (
							<span className="text-[11px] font-medium font-sans text-on-surface-variant ml-1">
								{unitLabel}
							</span>
						) : null}
					</p>
				</div>
			)}
		</div>
	);
}

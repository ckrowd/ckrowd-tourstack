"use client";

import { useState } from "react";

type FundingSliderProps = {
	cardTitle: string;
	rangeLabel: string;
	feeLabel: string;
	min?: number;
	max?: number;
};

const fmt = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

/**
 * Interactive tour-financing estimator. The user drags the range to size a
 * facility; the amount and a 1.5% settlement-fee estimate update live.
 */
export default function FundingSlider({
	cardTitle,
	rangeLabel,
	feeLabel,
	min = 150000,
	max = 300000,
}: FundingSliderProps) {
	const [value, setValue] = useState(240000);
	const pct = ((value - min) / (max - min)) * 100;

	return (
		<div className="bg-[#101d3a] border border-white/10 rounded-[22px] p-8 float-slow">
			<div className="flex items-center justify-between mb-6">
				<span className="text-sm font-bold text-white">{cardTitle}</span>
				<span className="material-symbols-outlined text-[#FF5A30]">request_quote</span>
			</div>

			<div className="font-(family-name:--font-manrope) text-5xl font-black text-white tracking-tight tabular-nums mb-1.5">
				{fmt(value)}
			</div>
			<p className="text-[13px] text-slate-400 mb-6">{rangeLabel}</p>

			{/* Native range input, brand-styled via accent-color */}
			<input
				type="range"
				min={min}
				max={max}
				step={5000}
				value={value}
				onChange={(e) => setValue(Number(e.target.value))}
				aria-label={rangeLabel}
				className="w-full h-2 mb-3 cursor-pointer appearance-none rounded-full bg-white/10 accent-[#FF5A30]"
				style={{
					background: `linear-gradient(to right, #FF5A30 ${pct}%, rgba(255,255,255,0.1) ${pct}%)`,
				}}
			/>
			<div className="flex justify-between text-xs text-slate-500 mb-6">
				<span>{fmt(min)}</span>
				<span>{fmt(max)}</span>
			</div>

			<div className="flex items-center justify-between pt-5 border-t border-white/10">
				<span className="text-[13px] text-slate-400">{feeLabel}</span>
				<span className="text-[15px] font-extrabold text-[#FF5A30] tabular-nums">
					{fmt(value * 0.015)}
				</span>
			</div>
		</div>
	);
}

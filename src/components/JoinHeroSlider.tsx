"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export type HeroSlide = {
	key: string;
	icon: string;
	title: string;
	tagline: string;
	cta: string;
	href: string;
	examplesLabel: string;
	examples: string[];
};

/**
 * Hero carousel for the /join landing. Each slide is a home-style two-column
 * hero panel for one ecosystem category — left: badge + big white headline +
 * tagline + register CTA; right: a glass-framed white "who qualifies" card.
 * Auto-advances, pausable on hover, with arrows + dots below.
 */
export default function JoinHeroSlider({
	slides,
	joinAsLabel,
	readMoreLabel,
	readMoreHref,
	prevLabel,
	nextLabel,
}: {
	slides: HeroSlide[];
	joinAsLabel: string;
	readMoreLabel: string;
	readMoreHref: string;
	prevLabel: string;
	nextLabel: string;
}) {
	const n = slides.length;
	const [rawIndex, setRawIndex] = useState(0);
	const index = n > 0 ? rawIndex % n : 0;
	const [paused, setPaused] = useState(false);
	const go = useCallback(
		(i: number) => {
			if (n === 0) return;
			setRawIndex(((i % n) + n) % n);
		},
		[n],
	);

	useEffect(() => {
		if (paused || n <= 1) return;
		const id = setInterval(() => setRawIndex((p) => (p + 1) % n), 6000);
		return () => clearInterval(id);
	}, [paused, n]);

	return (
		<div
			className="w-full"
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			role="group"
			aria-roledescription="carousel"
		>
			<div className="overflow-hidden">
				<div
					className="flex transition-transform duration-500 ease-out"
					style={{ transform: `translateX(-${index * 100}%)` }}
				>
					{slides.map((s, i) => (
						<div
							key={s.key}
							className="w-full shrink-0"
							aria-hidden={i !== index}
						>
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
								{/* Left — copy + CTA */}
								<div className="space-y-7">
									<div className="inline-flex items-center gap-2 px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed rounded-full">
										<span
											className="material-symbols-outlined text-sm"
											style={{ fontVariationSettings: "'FILL' 1" }}
										>
											{s.icon}
										</span>
										<span className="text-xs font-semibold tracking-widest uppercase">
											{joinAsLabel}
										</span>
									</div>

									<h2 className="font-(family-name:--font-manrope) font-extrabold text-5xl md:text-7xl text-white leading-[1.1] tracking-tight">
										{s.title}
									</h2>

									<p className="text-xl text-white/85 max-w-xl leading-relaxed">
										{s.tagline}
									</p>

									<div className="flex flex-col sm:flex-row gap-4 pt-2">
										<Link
											href={s.href}
											className="justify-center inline-flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 bg-[#FF5A30] text-white rounded-xl font-semibold shadow-2xl shadow-[#FF5A30]/40 hover:scale-[1.02] active:scale-[0.98] transition-transform"
										>
											{s.cta}
											<span className="material-symbols-outlined">arrow_forward</span>
										</Link>
										<a
											href={readMoreHref}
											className="justify-center inline-flex items-center px-6 md:px-8 py-3 md:py-4 glass-effect bg-white/10 text-white border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-all"
										>
											{readMoreLabel}
										</a>
									</div>
								</div>

								{/* Right — glass-framed "who qualifies" card */}
								<div className="hidden lg:block">
									<div className="glass-effect bg-white/10 p-1 rounded-2xl border border-white/20 shadow-2xl">
										<div className="bg-white rounded-xl p-6">
											<div className="flex items-center justify-between mb-5">
												<h3 className="font-(family-name:--font-manrope) font-semibold text-slate-900">
													{s.examplesLabel}
												</h3>
												<span
													className="material-symbols-outlined text-[#FF5A30]"
													style={{ fontVariationSettings: "'FILL' 1" }}
												>
													verified
												</span>
											</div>
											<ul className="space-y-1">
												{s.examples.map((ex) => (
													<li
														key={ex}
														className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-b-0"
													>
														<span className="w-2 h-2 rounded-full bg-[#FF5A30] shrink-0" />
														<span className="text-sm font-semibold text-slate-700">
															{ex}
														</span>
													</li>
												))}
											</ul>
										</div>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Controls — tucked under the left column, like a hero accent */}
			<div className="flex items-center gap-3 mt-12 justify-center lg:justify-start">
				<button
					type="button"
					aria-label={prevLabel}
					onClick={() => go(index - 1)}
					className="w-10 h-10 rounded-full glass-effect bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors shrink-0"
				>
					<span className="material-symbols-outlined text-lg">chevron_left</span>
				</button>
				<div className="flex items-center gap-2 px-1">
					{slides.map((s, i) => (
						<button
							key={s.key}
							type="button"
							aria-label={s.title}
							aria-current={i === index}
							onClick={() => go(i)}
							className={`h-2 rounded-full transition-all ${
								i === index ? "w-7 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
							}`}
						/>
					))}
				</div>
				<button
					type="button"
					aria-label={nextLabel}
					onClick={() => go(index + 1)}
					className="w-10 h-10 rounded-full glass-effect bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors shrink-0"
				>
					<span className="material-symbols-outlined text-lg">chevron_right</span>
				</button>
			</div>
		</div>
	);
}

"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/routing";

// Slideshow images paired by index with the AuthShowcase.slides copy.
const SLIDE_IMAGES = [
	"/finance-dark.jpg",
	"/insurers-meeting.jpg",
	"/landing-market.jpg",
	"/landing-promoter.jpg",
];

const ADVANCE_MS = 5500;

type Slide = { title: string; text: string };

/**
 * The auth left panel: an auto-advancing, crossfading slideshow of TourStack's
 * product offerings. Follows the funnel's light/dark toggle via the `.ts-theme`
 * vars inherited from AuthShell's wrapper. Pauses auto-advance under
 * prefers-reduced-motion and lets users pick a slide.
 */
export default function BrandShowcase() {
	const tShow = useTranslations("AuthShowcase");
	const tLanding = useTranslations("TourstackLanding");
	const tCommon = useTranslations("Common");

	const slides = tShow.raw("slides") as Slide[];
	const n = slides.length;
	const [index, setIndex] = useState(0);
	const reduced = useRef(false);

	useEffect(() => {
		reduced.current =
			typeof matchMedia !== "undefined" &&
			matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (reduced.current || n <= 1) return;
		const id = setInterval(() => setIndex((i) => (i + 1) % n), ADVANCE_MS);
		return () => clearInterval(id);
	}, [n]);

	// Reuse three already-translated proof points from the landing stat band.
	const stats = tLanding.raw("stats.items") as Array<{
		prefix?: string;
		count: number;
		suffix?: string;
		label: string;
	}>;
	const proof = [stats[0], stats[3], stats[2]].filter(Boolean);

	return (
		<aside className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 xl:p-16 bg-[var(--bg)] text-[var(--text)]">
			{/* Crossfading images */}
			{SLIDE_IMAGES.map((src, i) => (
				<Image
					key={src}
					src={src}
					alt=""
					fill
					priority={i === 0}
					sizes="50vw"
					className={`object-cover object-center transition-opacity duration-1000 ease-out ${
						i === index ? "opacity-55" : "opacity-0"
					}`}
				/>
			))}
			<div className="absolute inset-0 bg-gradient-to-tr from-[var(--bg)] via-[var(--bg)]/85 to-[var(--bg)]/40" />
			<div
				className="absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none"
				style={{
					backgroundImage:
						"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
				}}
			/>

			{/* Wordmark */}
			<Link
				href="/"
				className="relative z-10 flex items-center gap-2.5 w-fit"
				aria-label={tCommon("brandLockupLabel")}
			>
				<Image src="/ckrowd-logo.png" alt={tCommon("logoAlt")} width={34} height={34} />
				<span className="flex flex-col leading-tight">
					<span className="text-base font-bold tracking-tight text-orange">
						{tCommon("brandName")}
					</span>
					<span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
						{tCommon("brandBy")}
					</span>
				</span>
			</Link>

			{/* Rotating offering caption */}
			<div className="relative z-10 max-w-md">
				<p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange mb-4">
					{tShow("label")}
				</p>
				<div className="relative min-h-[9.5rem]">
					{slides.map((s, i) => (
						<div
							key={s.title}
							aria-hidden={i !== index}
							className={`absolute inset-0 transition-opacity duration-700 ease-out ${
								i === index ? "opacity-100" : "opacity-0 pointer-events-none"
							}`}
						>
							<h2 className="font-(family-name:--font-display) text-3xl xl:text-4xl leading-[1.08] tracking-tight text-[var(--text)]">
								{s.title}
							</h2>
							<p className="mt-4 text-sm leading-relaxed text-[var(--muted)] max-w-sm">
								{s.text}
							</p>
						</div>
					))}
				</div>

				{/* Slide indicators */}
				<div className="mt-6 flex items-center gap-2">
					{slides.map((s, i) => (
						<button
							key={s.title}
							type="button"
							onClick={() => setIndex(i)}
							aria-label={s.title}
							aria-current={i === index}
							className={`h-1.5 rounded-full transition-all duration-300 ${
								i === index ? "w-7 bg-orange" : "w-3 bg-[var(--hair)] hover:bg-[var(--muted)]"
							}`}
						/>
					))}
				</div>
			</div>

			{/* Proof stats */}
			<dl className="relative z-10 grid grid-cols-3 gap-6 border-t border-[var(--hair)] pt-7">
				{proof.map((s) => (
					<div key={s.label}>
						<dt className="font-(family-name:--font-geist-mono) text-2xl xl:text-[1.75rem] font-semibold text-[var(--text)] tabular-nums">
							{s.prefix}
							{s.count}
							{s.suffix}
						</dt>
						<dd className="mt-1 text-[11px] leading-snug text-[var(--muted)]">{s.label}</dd>
					</div>
				))}
			</dl>
		</aside>
	);
}

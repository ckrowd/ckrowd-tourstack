"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useTsTheme } from "@/components/theme/useTsTheme";
import { Link } from "@/i18n/routing";

/**
 * Dark-cinematic split-screen chrome for the auth funnel (sign in / sign up).
 * Left: a brand panel with photography, the TourStack wordmark, the value
 * proposition, and three proof stats (all copy reused from the marketing
 * landing namespace so it stays translated). Right: the form column.
 *
 * The page passes its form markup as `children`; this component owns the
 * layout, theme, and brand surface only. Collapses to a single column with a
 * slim brand header below `lg`.
 */
export default function AuthShell({ children }: { children: React.ReactNode }) {
	const tLanding = useTranslations("TourstackLanding");
	const tCommon = useTranslations("Common");
	const { theme, toggle } = useTsTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Reuse three already-translated proof points from the landing stat band.
	const stats = tLanding.raw("stats.items") as Array<{
		prefix?: string;
		count: number;
		suffix?: string;
		label: string;
	}>;
	const proof = [stats[0], stats[3], stats[2]].filter(Boolean);

	return (
		<div
			className={`ts-theme ${theme === "light" ? "light" : ""} min-h-[100dvh] w-full font-(family-name:--font-geist) grid lg:grid-cols-[1.05fr_1fr]`}
		>
			{/* Brand panel */}
			<aside className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 xl:p-16">
				<Image
					src="/landing-promoter.jpg"
					alt=""
					fill
					priority
					sizes="50vw"
					className="object-cover object-center opacity-55"
				/>
				<div className="absolute inset-0 bg-gradient-to-tr from-[#0a0a0a] via-[#0a0a0a]/85 to-[#0a0a0a]/40" />
				<div
					className="absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none"
					style={{
						backgroundImage:
							"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
					}}
				/>

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
						<span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
							{tCommon("brandBy")}
						</span>
					</span>
				</Link>

				<div className="relative z-10 max-w-md">
					<h2 className="font-(family-name:--font-display) text-4xl xl:text-5xl leading-[1.05] tracking-tight">
						{tLanding("hero.title1")} {tLanding("hero.title2")}{" "}
						<span className="text-orange">{tLanding("hero.title3")}</span>
					</h2>
					<p className="mt-5 text-sm leading-relaxed text-white/65 max-w-sm">
						{tLanding("stats.desc")}
					</p>
				</div>

				<dl className="relative z-10 grid grid-cols-3 gap-6 border-t border-white/10 pt-7">
					{proof.map((s) => (
						<div key={s.label}>
							<dt className="font-(family-name:--font-geist-mono) text-2xl xl:text-[1.75rem] font-semibold text-white tabular-nums">
								{s.prefix}
								{s.count}
								{s.suffix}
							</dt>
							<dd className="mt-1 text-[11px] leading-snug text-white/50">{s.label}</dd>
						</div>
					))}
				</dl>
			</aside>

			{/* Form column */}
			<main className="relative flex flex-col px-5 py-8 sm:px-10 md:px-12">
				<div className="absolute right-5 top-6 sm:right-8 md:right-10 z-10">
					<ThemeToggle theme={theme} onToggle={toggle} />
				</div>
				{/* Mobile brand row */}
				<Link
					href="/"
					className="flex lg:hidden items-center gap-2.5 mb-10"
					aria-label={tCommon("brandLockupLabel")}
				>
					<Image src="/ckrowd-logo.png" alt={tCommon("logoAlt")} width={32} height={32} />
					<span className="flex flex-col leading-tight">
						<span className="text-base font-bold tracking-tight text-orange">
							{tCommon("brandName")}
						</span>
						<span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
							{tCommon("brandBy")}
						</span>
					</span>
				</Link>

				<div
					className={`flex flex-1 flex-col justify-center w-full max-w-md mx-auto transition-all duration-700 ease-out ${
						mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
					}`}
				>
					{children}
				</div>
			</main>
		</div>
	);
}

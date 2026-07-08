"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useSyncExternalStore } from "react";
import BrandShowcase from "@/components/auth/BrandShowcase";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useTsTheme } from "@/components/theme/useTsTheme";
import { Link } from "@/i18n/routing";

const noopSubscribe = () => () => {};

/**
 * Split-screen chrome for the auth funnel (sign in / sign up).
 * Left: a dark product-offering slideshow (BrandShowcase). Right: the
 * theme-aware form column. The page passes its form markup as `children`;
 * this component owns the layout, theme, and mobile brand header.
 * Collapses to a single column below `lg`.
 */
export default function AuthShell({ children }: { children: React.ReactNode }) {
	const tCommon = useTranslations("Common");
	const { theme, toggle } = useTsTheme();
	// Drives the form column's fade-in-on-mount transition; getServerSnapshot
	// keeps the first client render matching the server, same pattern as
	// ThemeToggle's mount detection.
	const mounted = useSyncExternalStore(
		noopSubscribe,
		() => true,
		() => false,
	);

	return (
		<div
			className={`ts-theme ${theme === "light" ? "light" : ""} min-h-[100dvh] w-full font-(family-name:--font-geist) grid lg:grid-cols-[1.05fr_1fr]`}
		>
			<BrandShowcase />

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
						<span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
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

import Image from "next/image";
import type { ReactNode } from "react";

/* Shared page header for dashboard pages — one consistent, premium language.
   Text lives on a solid card surface (theme-aware). When `image` is provided
   it sits in a side panel and the card fill feathers into the image edge (a
   single surface-coloured fade, not a decorative gradient) so the seam is soft
   instead of a hard line. Utility pages omit the image for a purely
   typographic header. No client/server-only APIs, so it renders in both
   server pages and client components. */

interface PageHeroProps {
	eyebrow?: string;
	title: ReactNode;
	description?: ReactNode;
	image?: string;
	children?: ReactNode;
	className?: string;
}

export default function PageHero({
	eyebrow,
	title,
	description,
	image,
	children,
	className = "",
}: PageHeroProps) {
	return (
		<div className={`tsd-rise tsd-card overflow-hidden mb-8 flex flex-col md:flex-row ${className}`}>
			<div className="flex-1 p-6 md:p-8 lg:p-9 flex flex-col justify-center">
				{eyebrow ? (
					<span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary mb-3">
						<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
						{eyebrow}
					</span>
				) : null}
				<h1 className="text-3xl md:text-4xl font-semibold font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
					{title}
				</h1>
				{description ? (
					<p className="text-on-surface-variant font-medium max-w-xl">{description}</p>
				) : null}
				{children ? (
					<div className="mt-6 flex items-center gap-2 flex-wrap">{children}</div>
				) : null}
			</div>
			{image ? (
				<div className="relative h-44 md:h-auto md:w-[42%] md:min-h-[240px] shrink-0">
					<Image src={image} alt="" fill sizes="(max-width: 768px) 100vw, 42vw" className="object-cover object-center" />
					{/* Feather the card fill into the image so there is no hard seam.
					    Mobile stacks the image below the text (fade from top); desktop
					    places it to the right (fade from the left edge). */}
					<div className="absolute inset-0 bg-linear-to-b md:bg-linear-to-r from-[var(--color-surface-container-lowest)] from-0% to-transparent to-[46%]" />
				</div>
			) : null}
		</div>
	);
}

import Image from "next/image";

/**
 * Brand loader — a breathing logo tile behind a rotating accent arc. Pure CSS
 * (keyframes in globals.css) so it paints instantly during Suspense/route
 * fallbacks with no JS. Shared across every portal, so it stays brand-neutral
 * (ckrowd mark + accent orange).
 */
export default function Loader({
	fullscreen = false,
	size = 48,
	label,
}: {
	fullscreen?: boolean;
	size?: number;
	label?: string;
}) {
	const tile = Math.round(size * 1.15);
	const ring = tile + 18;

	const loader = (
		<div className="flex flex-col items-center justify-center gap-5">
			<div
				className="relative flex items-center justify-center"
				style={{ width: ring, height: ring }}
			>
				{/* Rotating accent arc */}
				<span
					aria-hidden
					className="ckld-ring absolute inset-0 rounded-[28%]"
					style={{
						background:
							"conic-gradient(from 0deg, transparent 0deg, transparent 250deg, #FF5A2E 320deg, #ff8a63 360deg)",
						mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
						WebkitMask:
							"radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
					}}
				/>
				{/* Breathing brand tile */}
				<span
					className="ckld-tile relative flex items-center justify-center rounded-[24%] bg-white ring-1 ring-black/5 dark:bg-[#161616] dark:ring-white/10"
					style={{ width: tile, height: tile }}
				>
					<Image
						src="/ckrowd-logo.png"
						alt="Loading…"
						width={Math.round(size * 0.62)}
						height={Math.round(size * 0.62)}
						priority
					/>
				</span>
			</div>

			{label ? (
				<p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-on-surface-variant">
					{label}
					<span className="ckld-dots inline-flex gap-0.5" aria-hidden>
						<span className="h-1 w-1 rounded-full bg-current" />
						<span className="h-1 w-1 rounded-full bg-current" />
						<span className="h-1 w-1 rounded-full bg-current" />
					</span>
				</p>
			) : null}
		</div>
	);

	if (fullscreen) {
		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/90 backdrop-blur-sm">
				{loader}
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center py-16">{loader}</div>
	);
}

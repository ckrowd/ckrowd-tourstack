import Image from "next/image";

export default function Loader({
	fullscreen = false,
	size = 48,
}: {
	fullscreen?: boolean;
	size?: number;
}) {
	const spinner = (
		<div className="relative flex items-center justify-center" style={{ width: size + 16, height: size + 16 }}>
			{/* Spinning orange arc ring */}
			<span
				className="absolute inset-0 rounded-full border-2 border-[#FF5A2E]/20 border-t-[#FF5A2E] animate-spin"
				style={{ animationDuration: "0.9s" }}
			/>
			{/* Logo counter-rotating slightly for a layered feel */}
			<Image
				src="/ckrowd-logo.png"
				alt="Loading…"
				width={size}
				height={size}
				className="animate-spin"
				style={{ animationDuration: "2.4s", animationDirection: "reverse" }}
				priority
			/>
		</div>
	);

	if (fullscreen) {
		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/90 backdrop-blur-sm">
				{spinner}
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center py-16">
			{spinner}
		</div>
	);
}

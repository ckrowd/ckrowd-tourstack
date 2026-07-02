import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
	// Emit a self-contained server bundle (.next/standalone) so the Docker
	// image can run `node server.js` without the full node_modules tree.
	output: "standalone",
	experimental: {
		serverActions: {
			// File uploads (profile logos, EOI documents, tour images) go through
			// server actions as multipart FormData. Next's default 1MB body limit
			// rejects those before the handler ever runs.
			bodySizeLimit: "8mb",
		},
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
			{
				protocol: "https",
				hostname: "gateway.ckrowd.com",
				pathname: "/storage/**",
			},
		],
	},
	// Baseline security headers on every response. A strict Content-Security-Policy
	// is intentionally omitted to avoid breaking inline styles / third-party images
	// and fonts; add it (report-only first) as a dedicated follow-up.
	async headers() {
		const securityHeaders = [
			{ key: "X-Content-Type-Options", value: "nosniff" },
			{ key: "X-Frame-Options", value: "SAMEORIGIN" },
			{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
			{
				key: "Permissions-Policy",
				value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
			},
			{
				key: "Strict-Transport-Security",
				value: "max-age=31536000; includeSubDomains",
			},
		];
		return [
			{ source: "/:path*", headers: securityHeaders },
			{
				// `output: "standalone"` means this app is self-hosted (no
				// platform CDN in front), so /public assets need explicit
				// long-lived caching or every request re-fetches them.
				source: "/:all*(svg|jpg|jpeg|png|webp|gif|ico|mp4|webm)",
				headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
			},
		];
	},
	async redirects() {
		return [
			{
				source: "/apply",
				destination: "/onboarding",
				permanent: true,
			},
			{
				source: "/apply/:path*",
				destination: "/onboarding/:path*",
				permanent: true,
			},
			{
				source: "/crew",
				destination: "/workforce",
				permanent: true,
			},
			{
				source: "/crew/:path*",
				destination: "/workforce/:path*",
				permanent: true,
			},
		];
	},
};

export default withNextIntl(nextConfig);

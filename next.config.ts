import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
	// Emit a self-contained server bundle (.next/standalone) so the Docker
	// image can run `node server.js` without the full node_modules tree.
	output: "standalone",
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
		return [{ source: "/:path*", headers: securityHeaders }];
	},
	async redirects() {
		return [
			{
				// Orphaned pre-redesign application form — the unified onboarding
				// funnel now lives at /get-started. (Locale-prefixed paths like
				// /en/apply are handled by src/app/[locale]/apply/page.tsx, which
				// redirects to the same place.)
				source: "/apply",
				destination: "/get-started",
				permanent: true,
			},
			{
				source: "/apply/:path*",
				destination: "/get-started",
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

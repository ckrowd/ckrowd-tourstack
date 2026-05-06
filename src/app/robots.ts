import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const baseUrl =
		process.env.NEXT_PUBLIC_BASE_URL || "https://tourstack.ckrowd.com";

	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: [
				"/admin/",
				"/*/admin/",
				"/dashboard/",
				"/*/dashboard/",
				"/settings/",
				"/*/settings/",
				"/api/",
				"/*/api/",
			],
		},
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}

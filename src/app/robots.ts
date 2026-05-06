import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tourstack.ckrowd.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/dashboard/', '/settings/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

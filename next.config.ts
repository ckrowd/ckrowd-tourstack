import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
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

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/insights', destination: '/knowledge', permanent: true },
      { source: '/insights/:slug*', destination: '/knowledge/:slug*', permanent: true },
      { source: '/case-studies', destination: '/projects', permanent: true },
      { source: '/case-studies/:slug*', destination: '/projects/:slug*', permanent: true },
    ]
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [{
      source:'/(.*)',
      headers:[
        {key:'X-Content-Type-Options',value:'nosniff'},
        {key:'X-Frame-Options',value:'DENY'},
        {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
        {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=(), payment=()'},
        {key:'Content-Security-Policy',value:"frame-ancestors 'none'; object-src 'none'; base-uri 'self'"},
      ],
    }]
  },
  async redirects() {
    return [
      // Historical service URLs found in the 28 October 2026 Google Search Console
      // 404 export. All five targets are verified published SEO service pages.
      // Permanent 308 redirects preserve users and search equity without
      // generating new duplicate service pages.
      { source: '/services/demand-forecasting-0', destination: '/services/demand-forecasting', permanent: true },
      { source: '/services/route-optimization-1', destination: '/services/route-optimization', permanent: true },
      { source: '/services/supply-chain-analytics-1', destination: '/services/supply-chain-analytics', permanent: true },
      { source: '/services/inventory-optimization-0', destination: '/services/inventory-optimization', permanent: true },
      { source: '/services/operations-research-1', destination: '/services/operations-research', permanent: true },
      { source: '/insights', destination: '/knowledge', permanent: true },
      { source: '/insights/:slug*', destination: '/knowledge/:slug*', permanent: true },
      { source: '/case-studies', destination: '/projects', permanent: true },
      { source: '/case-studies/:slug*', destination: '/projects/:slug*', permanent: true },
    ]
  },
};

export default nextConfig;

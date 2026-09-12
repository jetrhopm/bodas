import type { NextConfig } from 'next';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const apiInternalUrl = process.env.API_INTERNAL_URL || 'http://127.0.0.1:3001';
const nextConfig: NextConfig = {
  basePath,
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiInternalUrl}/api/:path*` }];
  },
};
export default nextConfig;

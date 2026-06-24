import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    turbo: false,     // This disables Turbopack
  },
};

export default nextConfig;
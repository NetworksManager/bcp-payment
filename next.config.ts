import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: false,     // Force Webpack instead of Turbopack
};

export default nextConfig;
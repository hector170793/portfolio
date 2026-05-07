import withBundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';
import { build } from 'velite';

const nextConfig: NextConfig = {
  // Empty turbopack config to silence the webpack+turbopack conflict warning in Next 16.
  // Velite uses a webpack plugin; turbopack is default in Next 16.
  // The velite webpack plugin runs in the webpack build path only.
  // [design risk §5 — velite + turbopack rough edges]
  turbopack: {},
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 640, 828, 1080, 1280, 1600, 1920, 2400],
    imageSizes: [64, 128, 256, 384, 512],
    minimumCacheTTL: 31536000,
  },
  webpack(config) {
    config.plugins.push(
      new (class {
        apply(compiler: import('webpack').Compiler) {
          compiler.hooks.beforeCompile.tapPromise('VeliteWebpackPlugin', async () => {
            if (this.started) return;
            this.started = true;
            const dev = compiler.options.mode === 'development';
            await build({ watch: dev, clean: !dev });
          });
        }
        started = false;
      })(),
    );
    return config;
  },
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig);

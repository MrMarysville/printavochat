/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Next.js 15 no longer supports isrMemoryCacheSize
  },
  // Add proper image domains for Next.js Image optimization
  images: {
    domains: ['www.printavo.com', 'localhost'],
  },
  // Improve webpack configuration to avoid chunk load errors
  webpack: (config, { isServer, dev }) => {
    // Optimize chunk loading
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        // Merge all chunks together
        commons: {
          name: 'commons',
          chunks: 'all',
          minChunks: 2,
          reuseExistingChunk: true,
        },
        // Create a separate chunk for react libraries
        react: {
          name: 'react',
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          chunks: 'all',
          priority: 40,
          enforce: true,
        },
      },
    };
    
    return config;
  },
};

module.exports = nextConfig;

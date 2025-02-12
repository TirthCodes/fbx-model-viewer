/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(fbx)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/[hash][ext][query]'
      }
    });
    return config;
  }
};

export default nextConfig;

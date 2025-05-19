/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  webpack: (config: any) => {
    return config;
  },
};

module.exports = nextConfig;

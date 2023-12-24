/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_ZEGO_APP_ID: "149062653",
    NEXT_PUBLIC_ZEGO_SERVER_ID: "28fef1bd7430d8360a4fd4f5a94de160",
  },
  images: {
    domains: ["localhost"],
  },
};

module.exports = nextConfig;

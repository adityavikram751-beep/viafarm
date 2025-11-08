/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, 

  images: {
    
    domains: ["res.cloudinary.com", "cdn-icons-png.flaticon.com"],

    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "cdn-icons-png.flaticon.com",
        pathname: "**",
      },
    ],
    unoptimized: true, 
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;

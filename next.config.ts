/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    // ✅ Allow Cloudinary images
    domains: ['res.cloudinary.com'],

    // ✅ Allow remote patterns (optional safety)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
    ],
  },
};

module.exports = nextConfig;

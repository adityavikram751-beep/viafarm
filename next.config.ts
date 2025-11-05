module.exports = {
  images: {
    domains: ['res.cloudinary.com', 'cdn-icons-png.flaticon.com'],
  },
};
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Ignore ESLint errors during build
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ Ignore TypeScript errors
  },
};

module.exports = nextConfig;

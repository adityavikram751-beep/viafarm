/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ✅ allow Cloudinary + Flaticon
    domains: ['res.cloudinary.com', 'cdn-icons-png.flaticon.com'],
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ Ignore ESLint errors during build
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ Ignore TypeScript errors
  },
}

module.exports = nextConfig

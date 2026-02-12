/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Explicit defaults so JS/CSS chunks are served correctly (avoids 404s)
  distDir: ".next",
  trailingSlash: false,
};

export default nextConfig;


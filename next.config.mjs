/** @type {import('next').NextConfig} */

// MOBILE_EXPORT=1 builds a static copy of the app into dist-mobile/ for the Android APK (npm run build:mobile).
const isMobileExport = process.env.MOBILE_EXPORT === '1';

const nextConfig = {
  reactStrictMode: true,
  ...(isMobileExport && {
    output: 'export',
    // With output: 'export' the export lands in distDir; keeping it out of .next never clobbers a running `next dev`.
    distDir: 'dist-mobile',
    // Capacitor serves files from disk, so /login must resolve to login/index.html.
    trailingSlash: true,
  }),
  images: {
    unoptimized: isMobileExport,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;

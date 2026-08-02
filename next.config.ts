import type { NextConfig } from "next";

/**
 * Firebase Storage download URLs all live on two hosts; Unsplash is here for
 * the placeholder imagery that ships with the seed data. Add any other CDN an
 * admin might paste a URL from.
 */
const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  { protocol: "https", hostname: "firebasestorage.googleapis.com" },
  { protocol: "https", hostname: "storage.googleapis.com" },
  { protocol: "https", hostname: "lh3.googleusercontent.com" },
  { protocol: "https", hostname: "images.unsplash.com" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
    remotePatterns,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [400, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  experimental: {
    // Keeps the icon and animation bundles out of pages that don't use them.
    optimizePackageImports: ["lucide-react", "framer-motion", "date-fns"],
  },

  // `firebase-admin` pulls in optional native deps that must not be bundled.
  serverExternalPackages: ["firebase-admin"],

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
      {
        // The admin panel must never be indexed or embedded.
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;

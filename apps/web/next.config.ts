import type { NextConfig } from "next";
import path from "path";

const isProd = process.env.NODE_ENV === "production";
const isElectron = process.env.BUILD_TARGET === "electron";
const origin = process.env.NEXT_PUBLIC_HOST || "http://localhost:3000";
const sequreHeaders = [
  { key: "Access-Control-Allow-Origin", value: origin },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];
isProd &&
  sequreHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  });

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: {
              svgo: false,
            },
          },
        ],
        as: "*.js",
      },
    },
  },
  poweredByHeader: false,
  images: {
    minimumCacheTTL: 60,
    // Electron環境では画像最適化を無効化
    unoptimized: isElectron,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  output: "standalone",
  reactStrictMode: true,
  // Electron環境用の設定
  ...(isElectron && {
    outputFileTracingRoot: path.join(__dirname, "../../"),
    outputFileTracingIncludes: {
      "*": ["public/**/*", ".next/static/**/*"],
    },
    serverExternalPackages: ["electron", "@electric-sql/pglite"],
    // typescript: {
    //   tsconfigPath: "tsconfig.electron.json",
    // },
  }),
  async headers() {
    return [
      {
        source: "/((?!auth/registered).*)",
        headers: sequreHeaders,
      },
    ];
  },
};

// if (!isProd) delete nextConfig.output; // for HMR
export default nextConfig;

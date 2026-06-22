import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { withSentryConfig } from "@sentry/nextjs";

/** Directory containing this config (not a parent folder that has its own package-lock.json). */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** Allow `next/image` optimizer to fetch same-origin media on any deployment host (VPS, sslip.io, etc.). */
function buildImageRemotePatterns(): NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> {
  const patterns: NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> = [
    { protocol: "http", hostname: "localhost", pathname: "/**" },
    { protocol: "https", hostname: "localhost", pathname: "/**" },
    { protocol: "http", hostname: "127.0.0.1", pathname: "/**" },
    { protocol: "https", hostname: "127.0.0.1", pathname: "/**" },
    { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    // Common staging / preview hostnames (Coolify, raw IP via sslip, etc.)
    { protocol: "http", hostname: "**.sslip.io", pathname: "/**" },
    { protocol: "https", hostname: "**.sslip.io", pathname: "/**" },
  ];

  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabase) {
    try {
      const u = new URL(supabase);
      patterns.push({
        protocol: "https",
        hostname: u.hostname,
        pathname: "/storage/v1/object/public/**",
      });
    } catch {
      /* ignore */
    }
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) {
    try {
      const u = new URL(site);
      const protocol = u.protocol === "https:" ? "https" : "http";
      patterns.push({
        protocol,
        hostname: u.hostname,
        pathname: "/**",
        ...(u.port ? { port: u.port } : {}),
      });
    } catch {
      /* ignore invalid URL */
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: projectRoot,
  /** When a parent directory has a lockfile, Turbopack can pick the wrong root; dev uses `--webpack` anyway. */
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: buildImageRemotePatterns(),
    formats: ["image/avif", "image/webp"],
    /**
     * Local paths allowed for `next/image` optimization. When this list is set, anything
     * else under `public/` returns 400 from `/_next/image` (e.g. `/agc-logo.png` in admin).
     */
    localPatterns: [
      { pathname: "/uploads/**", search: "" },
      { pathname: "/agc-logo.png", search: "" },
      { pathname: "/logo.png", search: "" },
    ],
    /**
     * Allows the optimizer to fetch same-origin URLs that resolve to loopback/private IPs (dev)
     * and Docker/internal networks (production). Without this, some deployments return 400 for
     * `/uploads/*` when the upstream fetch hits 127.0.0.1.
     */
    dangerouslyAllowLocalIP: true,
  },
};

export default process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      silent: !process.env.CI,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    })
  : nextConfig;

import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "172.30.0.2",
    "null",
    "*.cursor.sh",
    "*.cursor.com",
  ],
  turbopack: {
    root,
  },
  // Pattern pages use the pattern ids (S20). The old slugs redirect; /patterns/settings now
  // shows the settings pattern (it was settings-form, which moved to /patterns/settings-form).
  async redirects() {
    return [
      { source: "/patterns/settings-area", destination: "/patterns/settings", permanent: true },
      { source: "/patterns/empty", destination: "/patterns/empty-first-run", permanent: true },
      { source: "/frame/patterns/settings-area", destination: "/frame/patterns/settings", permanent: true },
      { source: "/frame/patterns/empty", destination: "/frame/patterns/empty-first-run", permanent: true },
    ];
  },
};

export default nextConfig;

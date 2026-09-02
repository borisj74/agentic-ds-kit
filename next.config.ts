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
  transpilePackages: ["agentic-ds-kit"],
  turbopack: {
    root,
  },
};

export default nextConfig;

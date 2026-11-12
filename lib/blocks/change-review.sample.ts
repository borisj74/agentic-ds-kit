import type { ChangeItem, ChangeReviewComment, ChangeReviewFile, DiffLine } from "agentic-ds-kit";

/** Sample change set for the ChangeReview docs: the diff the rate-limiting plan produced. */

function added(texts: string[], from = 1): DiffLine[] {
  return texts.map((text, index) => ({ type: "add", text, newNo: from + index }));
}

export const CHANGE_REVIEW_FILES: ChangeReviewFile[] = [
  {
    id: "middleware",
    path: "src/middleware/rateLimit.ts",
    kind: "added",
    hunkHeader: "@@ -0,0 +1,22 @@",
    lines: added([
      'import rateLimit from "express-rate-limit";',
      'import { RedisStore } from "rate-limit-redis";',
      'import { redis } from "../lib/redis";',
      "",
      "const MINUTE = 60_000;",
      "",
      "/** 100 requests a minute per API key, 20 per IP without one. */",
      "export const apiRateLimit = rateLimit({",
      "  windowMs: MINUTE,",
      "  limit: (req) => (req.apiKey ? 100 : 20),",
      "  keyGenerator: (req) => req.apiKey ?? req.ip,",
      '  standardHeaders: "draft-7",',
      "  legacyHeaders: false,",
      '  skip: (req) => req.path === "/v1/health",',
      "  store: new RedisStore({",
      "    sendCommand: (...args) => redis.sendCommand(args),",
      '    prefix: "rl:",',
      "  }),",
      "  handler: (req, res) => {",
      '    res.status(429).json({ error: "rate_limited", retryAfter: res.getHeader("Retry-After") });',
      "  },",
      "});",
    ]),
  },
  {
    id: "app",
    path: "src/app.ts",
    kind: "modified",
    hunkHeader: "@@ -12,9 +12,11 @@ createApp",
    reviewed: true,
    lines: [
      { type: "context", text: 'import { authenticate } from "./middleware/auth";', oldNo: 12, newNo: 12 },
      { type: "add", text: 'import { apiRateLimit } from "./middleware/rateLimit";', newNo: 13 },
      { type: "context", text: 'import { v1 } from "./routes/v1";', oldNo: 13, newNo: 14 },
      { type: "context", text: "", oldNo: 14, newNo: 15 },
      { type: "context", text: "export function createApp() {", oldNo: 15, newNo: 16 },
      { type: "context", text: "  const app = express();", oldNo: 16, newNo: 17 },
      { type: "remove", text: '  app.use("/v1", authenticate, v1);', oldNo: 17 },
      { type: "add", text: '  app.set("trust proxy", 1);', newNo: 18 },
      { type: "add", text: '  app.use("/v1", authenticate, apiRateLimit, v1);', newNo: 19 },
      { type: "context", text: "  return app;", oldNo: 18, newNo: 20 },
      { type: "context", text: "}", oldNo: 19, newNo: 21 },
    ],
  },
  {
    id: "package",
    path: "package.json",
    kind: "modified",
    hunkHeader: "@@ -18,6 +18,8 @@ dependencies",
    verdict: "accepted",
    reviewed: true,
    lines: [
      { type: "context", text: '    "express": "^4.21.2",', oldNo: 18, newNo: 18 },
      { type: "add", text: '    "express-rate-limit": "^7.5.0",', newNo: 19 },
      { type: "context", text: '    "ioredis": "^5.4.2",', oldNo: 19, newNo: 20 },
      { type: "add", text: '    "rate-limit-redis": "^4.2.0",', newNo: 21 },
      { type: "context", text: '    "zod": "^3.24.1"', oldNo: 20, newNo: 22 },
    ],
  },
  {
    id: "tests",
    path: "test/rateLimit.test.ts",
    kind: "added",
    hunkHeader: "@@ -0,0 +1,16 @@",
    lines: added([
      'import request from "supertest";',
      'import { createApp } from "../src/app";',
      "",
      'describe("rate limit", () => {',
      '  it("answers 429 after 20 calls without a key", async () => {',
      "    const app = createApp();",
      '    for (let i = 0; i < 20; i++) await request(app).get("/v1/orders");',
      '    const res = await request(app).get("/v1/orders");',
      "    expect(res.status).toBe(429);",
      '    expect(res.headers["retry-after"]).toBeDefined();',
      "  });",
      "",
      '  it("never limits /v1/health", async () => {',
      '    for (let i = 0; i < 30; i++) expect((await request(createApp()).get("/v1/health")).status).toBe(200);',
      "  });",
      "});",
    ]),
  },
  {
    id: "docs",
    path: "docs/api/rate-limits.md",
    kind: "added",
    hunkHeader: "@@ -0,0 +1,8 @@",
    lines: added([
      "# Rate limits",
      "",
      "Every /v1 route is limited per minute:",
      "",
      "- **100 requests** with an API key, counted per key",
      "- **20 requests** without a key, counted per IP",
      "",
      "Over the limit the API answers `429` with a `Retry-After` header.",
    ]),
  },
];

export const CHANGE_REVIEW_SUMMARY: ChangeItem[] = [
  { id: "routes", label: "Rate-limited routes", before: "0", after: "12", delta: "+12", direction: "up", sentiment: "good" },
  { id: "tests", label: "Tests passing", before: "214", after: "223", delta: "+9", direction: "up", sentiment: "good" },
  { id: "coverage", label: "Line coverage", before: "81.4%", after: "82.0%", delta: "+0.6 pts", direction: "up", sentiment: "good" },
  { id: "p95", label: "p95 latency, /v1/orders", before: "38 ms", after: "40 ms", delta: "+2 ms", direction: "up", sentiment: "bad" },
];

export const CHANGE_REVIEW_ME = { id: "maya", name: "Maya Chen" };
const AGENT = { id: "agent", name: "Backend agent", initials: "BA" };

export const CHANGE_REVIEW_COMMENTS: ChangeReviewComment[] = [
  {
    id: "c1",
    fileId: "middleware",
    line: 10,
    author: CHANGE_REVIEW_ME,
    createdAt: "6m",
    body: "Can the two limits come from config? Enterprise keys will need more than 100.",
  },
  {
    id: "c2",
    fileId: "middleware",
    parentId: "c1",
    author: AGENT,
    createdAt: "5m",
    body: "Yes: I can read RATE_LIMIT_KEYED and RATE_LIMIT_ANON with these as defaults.",
  },
  {
    id: "c3",
    fileId: "app",
    line: 18,
    author: CHANGE_REVIEW_ME,
    createdAt: "3m",
    body: "trust proxy 1 is right for our single load balancer. Good catch.",
  },
];

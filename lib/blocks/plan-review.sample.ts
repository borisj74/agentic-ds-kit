import type { AgentPlanStep, ChangeItem } from "agentic-ds-kit";

/** Sample plan for the PlanReview docs: a backend agent proposes rate limiting for a public API. */
export const PLAN_REVIEW_TITLE = "Add rate limiting to the public API";

export const PLAN_REVIEW_STEPS: AgentPlanStep[] = [
  {
    id: "read",
    label: "Map the public routes",
    tool: "read_file",
    target: "src/app.ts, src/routes/*.ts",
    note: "List every route under /v1 and which ones take an API key.",
  },
  {
    id: "store",
    label: "Add a Redis-backed counter store",
    tool: "bash",
    target: "npm i rate-limit-redis@4",
    note: "Use the existing REDIS_URL; no new service.",
    needsApproval: true,
  },
  {
    id: "middleware",
    label: "Write the limiter middleware",
    tool: "edit_file",
    target: "src/middleware/rateLimit.ts",
    note: "100 requests a minute per API key, 20 per IP without a key. Answer 429 with Retry-After.",
  },
  {
    id: "wire",
    label: "Apply it to the /v1 router",
    tool: "edit_file",
    target: "src/app.ts",
    note: "Skip /v1/health so uptime checks never hit the limit.",
  },
  {
    id: "tests",
    label: "Add tests and run the suite",
    tool: "run_tests",
    target: "test/rateLimit.test.ts",
  },
  {
    id: "docs",
    label: "Document the limits",
    tool: "edit_file",
    target: "docs/api/rate-limits.md",
  },
];

export const PLAN_REVIEW_CHANGES: ChangeItem[] = [
  { id: "routes", label: "Rate-limited routes", before: "0", after: "12", delta: "+12", direction: "up", sentiment: "good" },
  { id: "files", label: "Files touched", before: "0", after: "5", delta: "+5", direction: "up", sentiment: "neutral" },
  { id: "deps", label: "Dependencies", before: "38", after: "39", delta: "+1", direction: "up", sentiment: "neutral" },
  { id: "tests", label: "Tests", before: "214", after: "223", delta: "+9", direction: "up", sentiment: "good" },
  { id: "p95", label: "Added p95 latency", before: "0 ms", after: "~2 ms", delta: "+2 ms", direction: "up", sentiment: "bad" },
];

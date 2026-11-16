import type { AccordionItem, AgentFleetAgent, LinkListItem, MemoryItem, PermissionScope, TraceSpan } from "agentic-ds-kit";

/**
 * Example data for the docs home page (app/page.tsx). Fake names and numbers, the same story the
 * component docs tell: one agent refactoring a billing service.
 */

export const HOME_PERMISSION_SCOPES: PermissionScope[] = [
  {
    id: "docs",
    resource: "~/acme/ledger/docs",
    access: "read",
    icon: "Folder",
    reason: "Summarise weekly doc changes for the Monday digest.",
    expiry: "Expires in 7 days",
  },
  {
    id: "mail",
    resource: "Send email as ops@acme.dev",
    access: "write",
    icon: "Mail",
    reason: "Post the digest to the #ops mailing list.",
    expiry: "No expiry",
  },
];

export const HOME_PERMISSION_DESCRIPTION =
  "Research agent wants standing access, not a single action. It applies to every run until you revoke it or it expires.";

export const HOME_PERMISSION_WARNING =
  "Standing access. Every future run can send email without asking again. Revoke any time in Settings → Agents.";

export const HOME_MEMORIES: MemoryItem[] = [
  { id: "1", content: "Prefers sentence case for headings", source: "from chat · 12 Oct", age: "3w", pinned: true, usedHere: true },
  { id: "2", content: "Billing code lives in src/billing; tests in invoice.test.ts", source: "from repo scan", age: "5d", pinned: true },
  { id: "3", content: "Deploys need an approval on Fridays", source: "from you", age: "2d", usedHere: true },
  { id: "4", content: "Uses pnpm, not npm", source: "from repo scan", age: "1d" },
];

/** The orchestrator in the bento: four sub-agents, one waiting for review. */
export const HOME_FLEET: AgentFleetAgent[] = [
  {
    id: "billing",
    name: "Billing refactor",
    status: "running",
    cost: "$1.28",
    elapsed: "6m 40s",
    meta: "Orchestrator · Opus 5.5 · example data",
    subAgents: [
      { id: "scan", name: "scan-codebase", status: "done", elapsed: "58s", cost: "$0.14" },
      { id: "edit", name: "edit-invoice", status: "done", elapsed: "2m 02s", cost: "$0.61" },
      { id: "tests", name: "write-tests", status: "running", elapsed: "1m 18s", cost: "$0.41" },
      { id: "migrate", name: "migrate-db", status: "waiting", elapsed: "0:31", cost: "$0.12" },
    ],
  },
];

/** The smaller fleet card in the hero stage. */
export const HOME_FLEET_HERO: AgentFleetAgent[] = [
  {
    id: "billing",
    name: "Billing refactor",
    status: "running",
    cost: "$1.28",
    elapsed: "6m 40s",
    subAgents: [
      { id: "scan", name: "scan-codebase", status: "done" },
      { id: "edit", name: "edit-invoice", status: "done" },
      { id: "tests", name: "write-tests", status: "running" },
      { id: "migrate", name: "migrate-db", status: "queued" },
    ],
  },
];

export const HOME_TRACE: TraceSpan[] = [
  { id: "plan", label: "Plan", kind: "model", startMs: 0, endMs: 4_000, cost: 0.03 },
  { id: "read", label: "read_file", kind: "tool", startMs: 4_000, endMs: 6_000 },
  { id: "edit", label: "edit_file", kind: "tool", startMs: 6_000, endMs: 9_500, cost: 0.12 },
  { id: "ok", label: "Approval", kind: "approval", startMs: 9_500, endMs: 20_000 },
];

export const HOME_FAQ: AccordionItem[] = [
  {
    id: "agent",
    title: "Do I have to use a specific coding agent?",
    content:
      "No. Any agent that can read files or call an MCP server works. The contracts are plain JSON, so the agent reads the same rules you do.",
  },
  {
    id: "contract",
    title: "What is a contract?",
    content:
      "A JSON file per component: its props, the states it must handle, the tokens it uses and when to pick it over a neighbour. Agents read it before they write a line.",
  },
  {
    id: "brand",
    title: "Can I use my own brand colours and type?",
    content:
      "Yes. Every part reads semantic tokens, so you change the tokens, not the components. The Theme panel exports a CSS file you drop into your app.",
  },
  {
    id: "without",
    title: "Does it work without an agent?",
    content:
      "Yes. It is a normal React component library with tokens and layout classes. The contracts double as documentation for people.",
  },
  {
    id: "needs",
    title: "What does it need to run?",
    content: "React 19 and a bundler that handles CSS imports, such as Next.js 15 or later or Vite. Tokens load with the first import.",
  },
  {
    id: "license",
    title: "How is it licensed?",
    content: "MIT. Use it in personal and commercial work.",
  },
];

const GITHUB = "https://github.com/borisj74/agentic-ds-kit";

export const FOOTER_COLUMNS: { label: string; items: LinkListItem[] }[] = [
  {
    label: "Kit",
    items: [
      { id: "components", label: "Components", href: "/components" },
      { id: "blocks", label: "Blocks", href: "/blocks" },
      { id: "patterns", label: "Patterns", href: "/patterns" },
      { id: "tokens", label: "Tokens", href: "/foundations" },
    ],
  },
  {
    label: "For agents",
    items: [
      { id: "mcp", label: "MCP server", href: "/mcp" },
      { id: "agents", label: "AGENTS.md", href: "/get-started" },
      { id: "review", label: "review and inspect", href: "/contract-fit" },
      { id: "questions", label: "Questions list", href: `${GITHUB}/blob/main/docs/questions.md`, external: true },
    ],
  },
  {
    label: "Project",
    items: [
      { id: "start", label: "Getting started", href: "/get-started" },
      { id: "changelog", label: "Changelog", href: `${GITHUB}/blob/main/CHANGELOG.md`, external: true },
      { id: "github", label: "GitHub", href: GITHUB, external: true },
      { id: "npm", label: "npm", href: "https://www.npmjs.com/package/agentic-ds-kit", external: true },
    ],
  },
];

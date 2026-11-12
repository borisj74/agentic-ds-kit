import type { ChatMessage, LiveSessionAgent, LiveSessionRequest } from "agentic-ds-kit";

/** Sample session for the LiveSession docs: three agents on an invoicing change. */
export const LIVE_SESSION_MESSAGES: ChatMessage[] = [
  { id: "m1", role: "user", content: "Move the invoice totals into their own module and keep refunds rounding to the cent.", timestamp: "14:01" },
  {
    id: "m2",
    role: "assistant",
    content: "On it. Billing refactor is editing totals.ts, Test runner is watching invoice.test.ts, and Migrations is getting the staging schema ready.",
    timestamp: "14:01",
  },
  { id: "m3", role: "user", content: "Leave the public API alone, other teams import calculateTotal.", timestamp: "14:03" },
  {
    id: "m4",
    role: "assistant",
    content: "Noted. calculateTotal stays exported from invoice.ts and now calls the new module. Migrations wants to drop three legacy columns on staging; it's waiting for your OK.",
    timestamp: "14:04",
  },
];

export const LIVE_SESSION_AGENTS: LiveSessionAgent[] = [
  {
    id: "billing",
    name: "Billing refactor",
    status: "running",
    activity: "editing totals.ts",
    meta: "step 6 · editing src/billing/totals.ts",
    elapsed: "04:12",
    suggestions: ["Focus on refunds", "Keep calculateTotal exported", "Skip the tax rules"],
  },
  { id: "tests", name: "Test runner", status: "running", activity: "watching invoice.test.ts", meta: "24 of 24 passing", elapsed: "02:40", suggestions: ["Run the full suite"] },
  { id: "migrations", name: "Migrations", status: "waiting", activity: "staging migration", meta: "0042_drop_legacy.sql", elapsed: "00:18" },
  { id: "docs", name: "Docs writer", status: "done", activity: "changelog drafted" },
];

export const LIVE_SESSION_REQUESTS: LiveSessionRequest[] = [
  {
    id: "r1",
    agentId: "migrations",
    title: "Run 0042_drop_legacy.sql on staging?",
    description: "Drops the three legacy invoice columns the new totals no longer read.",
    risk: "high",
    action: {
      kind: "command",
      command: "npm run db:migrate -- --env staging",
      note: "applies 2 migrations · drops 3 columns",
      target: "acme / staging",
    },
  },
  {
    id: "r2",
    agentId: "billing",
    title: "Change the refund rounding?",
    risk: "medium",
    action: {
      kind: "diff",
      file: "src/billing/refunds.ts",
      lines: [
        { type: "context", text: "export function refundAmount(line: InvoiceLine) {" },
        { type: "remove", text: "  return line.total * line.refundRate;" },
        { type: "add", text: "  return roundToCent(line.total * line.refundRate);" },
        { type: "context", text: "}" },
      ],
    },
  },
];

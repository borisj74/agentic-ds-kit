import type { FailureCluster } from "agentic-ds-kit";

/** Sample failures for the FailureClusters docs: 6 causes across 5 agents over the last 24 hours. */

const HOURS = ["00", "03", "06", "09", "12", "15", "18", "21"].map((h) => `${h}:00`);

const BILLING = { name: "Billing agent" };
const SUPPORT = { name: "Support agent" };
const RESEARCH = { name: "Research agent" };
const DATA = { name: "Data sync agent" };
const EMAIL = { name: "Email agent" };

export const FAILURE_CLUSTERS: FailureCluster[] = [
  {
    id: "stripe-429",
    title: "Stripe 429 rate limit",
    status: "new",
    count: 42,
    agents: [BILLING, SUPPORT],
    trend: [0, 0, 1, 2, 4, 6, 11, 18],
    trendLabels: HOURS,
    firstSeen: "Today 06:12",
    lastSeen: "4 min ago",
    sample: {
      name: "stripe.refunds.create",
      summary: "charge ch_48213",
      args: { charge: "ch_48213", amount: 7400, currency: "eur" },
      error: ["429 Too Many Requests", "Request rate limit exceeded. Retry after 2s."],
      duration: "0.3s",
    },
    runs: [
      { id: "r1", label: "run_9132", href: "#run_9132", agent: "Billing agent", when: "21:48", step: "stripe.refunds.create" },
      { id: "r2", label: "run_9127", href: "#run_9127", agent: "Support agent", when: "21:40", step: "stripe.charges.retrieve" },
      { id: "r3", label: "run_9119", href: "#run_9119", agent: "Billing agent", when: "21:31", step: "stripe.refunds.create" },
    ],
  },
  {
    id: "context-overflow",
    title: "Context window exceeded on long threads",
    status: "known",
    count: 27,
    agents: [SUPPORT, EMAIL, RESEARCH],
    trend: [3, 4, 3, 2, 4, 3, 4, 4],
    trendLabels: HOURS,
    firstSeen: "Mon 10:02",
    lastSeen: "18 min ago",
    sample: {
      name: "model.generate",
      summary: "thread t_5521, 214 messages",
      args: { thread: "t_5521", messages: 214 },
      error: "context_length_exceeded: 212,488 tokens > 200,000",
      duration: "1.1s",
    },
    runs: [
      { id: "r4", label: "run_9124", href: "#run_9124", agent: "Support agent", when: "21:36", step: "model.generate" },
      { id: "r5", label: "run_9101", href: "#run_9101", agent: "Email agent", when: "20:58", step: "model.generate" },
    ],
  },
  {
    id: "sheets-auth",
    title: "Google Sheets token expired",
    status: "regressed",
    count: 19,
    agents: [DATA],
    trend: [0, 0, 0, 0, 0, 3, 7, 9],
    trendLabels: HOURS,
    firstSeen: "Last week (fixed Thu)",
    lastSeen: "9 min ago",
    sample: {
      name: "sheets.values.get",
      summary: "EU price list!A1:F900",
      args: { spreadsheet: "1Bx…eU", range: "EU price list!A1:F900" },
      error: ["401 Unauthorized", "invalid_grant: Token has been expired or revoked."],
      duration: "0.2s",
    },
    runs: [
      { id: "r6", label: "run_9130", href: "#run_9130", agent: "Data sync agent", when: "21:45", step: "sheets.values.get" },
      { id: "r7", label: "run_9112", href: "#run_9112", agent: "Data sync agent", when: "21:12", step: "sheets.values.get" },
    ],
  },
  {
    id: "search-timeout",
    title: "Web search times out after 30s",
    status: "new",
    count: 11,
    agents: [RESEARCH],
    trend: [2, 1, 2, 1, 1, 2, 1, 1],
    trendLabels: HOURS,
    firstSeen: "Today 01:40",
    lastSeen: "1 h ago",
    sample: {
      name: "web.search",
      summary: "\"EU VAT rates 2027\"",
      args: { query: "EU VAT rates 2027", results: 10 },
      error: "TimeoutError: no response after 30000ms",
      duration: "30.0s",
    },
    runs: [{ id: "r8", label: "run_9088", href: "#run_9088", agent: "Research agent", when: "20:31", step: "web.search" }],
  },
  {
    id: "smtp-bounce",
    title: "SMTP 550 mailbox unavailable",
    status: "known",
    count: 6,
    agents: [EMAIL, SUPPORT],
    trend: [1, 1, 0, 1, 1, 1, 1, 0],
    trendLabels: HOURS,
    firstSeen: "Sep 2",
    lastSeen: "2 h ago",
    mutedUntil: "until 09:00",
    sample: {
      name: "email.send",
      summary: "to ops@freight-partner.example",
      args: { to: "ops@freight-partner.example", subject: "Q3 freight rates" },
      error: "550 5.1.1 Recipient address rejected: mailbox unavailable",
      duration: "0.9s",
    },
    runs: [{ id: "r9", label: "run_9050", href: "#run_9050", agent: "Email agent", when: "19:22", step: "email.send" }],
  },
  {
    id: "json-schema",
    title: "Tool output fails JSON schema",
    status: "fixed",
    count: 3,
    agents: [DATA, BILLING],
    trend: [2, 1, 0, 0, 0, 0, 0, 0],
    trendLabels: HOURS,
    firstSeen: "Yesterday 22:10",
    lastSeen: "Today 03:05",
    sample: {
      name: "invoices.parse",
      summary: "invoice_7781.pdf",
      args: { file: "invoice_7781.pdf" },
      error: "ValidationError: total must be number, got string \"1.204,50\"",
      duration: "0.6s",
    },
    runs: [{ id: "r10", label: "run_8990", href: "#run_8990", agent: "Billing agent", when: "03:05", step: "invoices.parse" }],
  },
];

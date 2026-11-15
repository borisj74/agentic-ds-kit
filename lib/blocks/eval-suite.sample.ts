import type { EvalCase, EvalMetrics } from "agentic-ds-kit";

/** Sample eval run for the EvalSuite docs: 40 cases from a support-reply agent, v12 against v13. */

type Kind = "same" | "regression" | "improvement" | "error" | "bothFail";

const TOPICS: [string, string, string, Kind][] = [
  ["Refund for a double charge", "billing", "refunds", "regression"],
  ["Cancel before renewal", "billing", "cancellations", "same"],
  ["Change the card on file", "billing", "payments", "same"],
  ["Invoice shows the wrong VAT number", "billing", "invoices", "regression"],
  ["Upgrade mid-cycle proration", "billing", "plans", "improvement"],
  ["Discount code not applied", "billing", "plans", "same"],
  ["Charged after cancelling", "billing", "refunds", "regression"],
  ["Pause a subscription", "billing", "cancellations", "same"],
  ["Password reset email never arrives", "account", "login", "same"],
  ["Two-factor code rejected", "account", "login", "improvement"],
  ["Merge two accounts", "account", "profile", "error"],
  ["Delete my account and data", "account", "privacy", "same"],
  ["Change the account owner", "account", "profile", "same"],
  ["SSO login loops back", "account", "login", "bothFail"],
  ["Export all my data", "account", "privacy", "same"],
  ["Where is my order?", "orders", "shipping", "same"],
  ["Parcel marked delivered, not here", "orders", "shipping", "regression"],
  ["Wrong size delivered", "orders", "returns", "same"],
  ["Return label not working", "orders", "returns", "improvement"],
  ["Change the delivery address", "orders", "shipping", "same"],
  ["Order split into two parcels", "orders", "shipping", "same"],
  ["Item arrived broken", "orders", "returns", "same"],
  ["Customs fee surprise", "orders", "shipping", "error"],
  ["API returns 429", "technical", "api", "same"],
  ["Webhook signatures fail", "technical", "api", "regression"],
  ["CSV import drops rows", "technical", "imports", "same"],
  ["Dashboard loads slowly", "technical", "performance", "same"],
  ["Zapier connection expired", "technical", "integrations", "improvement"],
  ["Slack alerts stopped", "technical", "integrations", "same"],
  ["Mobile app crashes on launch", "technical", "mobile", "same"],
  ["Angry customer, third contact", "tone", "escalation", "same"],
  ["Customer writes in German", "tone", "language", "same"],
  ["Customer asks for a manager", "tone", "escalation", "same"],
  ["Legal threat in the ticket", "tone", "escalation", "same"],
  ["Thank-you note, no question", "tone", "small-talk", "same"],
  ["Feature request: dark mode", "product", "feedback", "same"],
  ["Is there an on-prem version?", "product", "pre-sales", "same"],
  ["Compare Team and Pro plans", "product", "pre-sales", "same"],
  ["Student discount", "product", "pre-sales", "same"],
  ["Roadmap date for exports", "product", "feedback", "same"],
];

const GOOD = (topic: string) => `Hi Sam,\n\nThanks for reaching out about "${topic.toLowerCase()}".\nI've checked your account and here is what happens next.\nYou'll get a confirmation email within one business day.\n\nBest,\nAcme Support`;
const BAD = (topic: string) => `Hi Sam,\n\nThanks for reaching out about "${topic.toLowerCase()}".\nThis should be fixed by Friday, sorry for the trouble.\nYou'll get a confirmation email within one business day.\n\nBest,\nAcme Support`;

const NOTES: Record<Kind, string | undefined> = {
  same: undefined,
  regression: "Candidate promises a date (\"by Friday\"). The support policy forbids promising dates.",
  improvement: "Candidate now explains the next step instead of asking the customer to wait.",
  error: "Candidate called lookup_order with a missing order id and the tool returned an error.",
  bothFail: "Both versions miss that SSO is configured by the customer's admin.",
};

function run(kind: Kind, version: "baseline" | "candidate", topic: string, i: number) {
  const cost = Number((0.011 + (i % 7) * 0.0013 + (version === "candidate" ? 0.0011 : 0)).toFixed(4));
  if (kind === "bothFail") return { result: "fail" as const, output: BAD(topic), score: 0.35, cost };
  if (kind === "regression") return version === "baseline" ? { result: "pass" as const, output: GOOD(topic), score: 0.92, cost } : { result: "fail" as const, output: BAD(topic), score: 0.41, cost };
  if (kind === "improvement") return version === "baseline" ? { result: "fail" as const, output: BAD(topic), score: 0.44, cost } : { result: "pass" as const, output: GOOD(topic), score: 0.9, cost };
  if (kind === "error") return version === "baseline" ? { result: "pass" as const, output: GOOD(topic), score: 0.88, cost } : { result: "error" as const, output: "ToolError: lookup_order(order_id=undefined) → 400 Bad Request", cost };
  return { result: "pass" as const, output: GOOD(topic), score: 0.9 + (i % 5) * 0.01, cost };
}

export const EVAL_CASES: EvalCase[] = TOPICS.map(([topic, tag, dataset, kind], i) => ({
  id: `case-${i + 1}`,
  name: topic,
  tags: [tag],
  dataset,
  input: `Ticket #${4800 + i}\nSubject: ${topic}\n\nHi, ${topic.toLowerCase()}. Can you help? — Sam`,
  baseline: run(kind, "baseline", topic, i),
  candidate: run(kind, "candidate", topic, i),
  graderNote: NOTES[kind],
}));

export const EVAL_BASELINE: { label: string; metrics: EvalMetrics } = {
  label: "v12",
  metrics: { passRate: 35 / 40, avgCost: 0.0149, p50LatencyMs: 2140 },
};

export const EVAL_CANDIDATE: { label: string; metrics: EvalMetrics } = {
  label: "v13",
  metrics: { passRate: 32 / 40, avgCost: 0.016, p50LatencyMs: 1720 },
};

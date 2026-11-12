import type { ActivityActor, ActivityEvent } from "agentic-ds-kit";

/**
 * Sample workspace activity for the ActivityFeed docs: people and agents in a small product team.
 * Times hang off a fixed clock (Thu 12 Nov 2026, 14:30 UTC) so the server and the browser agree on
 * Today and Yesterday. Three pages: the first shows, Load more brings in the other two.
 */
export const ACTIVITY_NOW = Date.UTC(2026, 10, 12, 14, 30);
export const ACTIVITY_TIME_ZONE = "UTC";

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const ago = (ms: number) => ACTIVITY_NOW - ms;

const maya: ActivityActor = { id: "maya", name: "Maya Chen" };
const tomas: ActivityActor = { id: "tomas", name: "Tomás Rivera" };
const priya: ActivityActor = { id: "priya", name: "Priya Nair" };
const sam: ActivityActor = { id: "sam", name: "Sam Okafor" };
const relay: ActivityActor = { id: "relay", name: "Relay", kind: "agent", initials: "RL" };
const scout: ActivityActor = { id: "scout", name: "Scout", kind: "agent", initials: "SC" };
const ledger: ActivityActor = { id: "ledger-bot", name: "Ledger", kind: "agent", initials: "LG" };

export const ACTIVITY_PAGES: ActivityEvent[][] = [
  [
    { id: "a01", type: "comment", actor: maya, verb: "commented on", object: "Pricing page copy", at: ago(12 * MIN), detail: "Can we lead with the yearly price and show monthly underneath?" },
    { id: "a02", type: "run", actor: relay, verb: "finished a run on", object: "Weekly churn report", at: ago(48 * MIN), detail: "412 accounts scored, 9 flagged as at risk.", status: { label: "Done", tone: "success" } },
    { id: "a03", type: "change", actor: tomas, verb: "merged", object: "PR #482 Usage meter tooltips", at: ago(1 * HOUR + 20 * MIN) },
    { id: "a04", type: "run", actor: scout, verb: "stopped a run on", object: "Competitor price scan", at: ago(2 * HOUR + 5 * MIN), detail: "Two sources timed out after 3 retries.", status: { label: "Failed", tone: "danger" } },
    { id: "a05", type: "member", actor: priya, verb: "invited", object: "Lena Fischer to Design", at: ago(3 * HOUR + 40 * MIN) },
    { id: "a06", type: "comment", actor: sam, verb: "replied on", object: "Onboarding checklist", at: ago(5 * HOUR + 10 * MIN), detail: "Agreed. Let's drop the second survey step." },
    { id: "a07", type: "billing", actor: ledger, verb: "recorded payment for", object: "invoice INV-1042", at: ago(15 * HOUR), detail: "€1,240.00 by card ending 4242.", status: { label: "Paid", tone: "success" } },
    { id: "a08", type: "change", actor: maya, verb: "edited", object: "Q4 launch plan", at: ago(18 * HOUR + 30 * MIN) },
    { id: "a09", type: "comment", actor: tomas, verb: "commented on", object: "Incident 2211 review", at: ago(20 * HOUR), detail: "The retry storm started at 03:12, not 03:40." },
    { id: "a10", type: "run", actor: relay, verb: "asked for approval on", object: "Refund for Acme Corp", at: ago(22 * HOUR + 15 * MIN), status: { label: "Waiting", tone: "warning" } },
    { id: "a11", type: "member", actor: sam, verb: "changed the role of", object: "Diego Alves to Admin", at: ago(1 * DAY + 2 * HOUR) },
    { id: "a12", type: "change", actor: scout, verb: "opened", object: "PR #479 Update competitor list", at: ago(2 * DAY + 3 * HOUR) },
  ],
  [
    { id: "b01", type: "comment", actor: priya, verb: "commented on", object: "Settings redesign", at: ago(2 * DAY + 6 * HOUR), detail: "The danger zone needs more space above it." },
    { id: "b02", type: "billing", actor: maya, verb: "upgraded the workspace to", object: "Team plan", at: ago(2 * DAY + 9 * HOUR), status: { label: "Upgraded", tone: "info" } },
    { id: "b03", type: "run", actor: ledger, verb: "finished a run on", object: "October reconciliation", at: ago(3 * DAY + 1 * HOUR), detail: "All 318 payouts matched.", status: { label: "Done", tone: "success" } },
    { id: "b04", type: "change", actor: tomas, verb: "deployed", object: "api v2.14.0 to production", at: ago(3 * DAY + 5 * HOUR) },
    { id: "b05", type: "member", actor: maya, verb: "removed", object: "a guest from Marketing", at: ago(4 * DAY) },
    { id: "b06", type: "comment", actor: relay, verb: "commented on", object: "Weekly churn report", at: ago(4 * DAY + 2 * HOUR), detail: "Churn risk moved most in the Starter plan this week.", canReply: true },
  ],
  [
    { id: "c01", type: "billing", actor: ledger, verb: "flagged", object: "invoice INV-1031", at: ago(5 * DAY + 3 * HOUR), detail: "Card declined twice.", status: { label: "Past due", tone: "danger" } },
    { id: "c02", type: "change", actor: priya, verb: "published", object: "Brand guidelines v3", at: ago(6 * DAY) },
    { id: "c03", type: "member", actor: sam, verb: "joined", object: "the workspace", at: ago(7 * DAY + 4 * HOUR) },
    { id: "c04", type: "run", actor: scout, verb: "started", object: "Competitor price scan", at: ago(8 * DAY), status: { label: "Scheduled", tone: "neutral" } },
  ],
];

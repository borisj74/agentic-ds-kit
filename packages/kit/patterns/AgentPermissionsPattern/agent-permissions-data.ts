import type { AutonomyStop } from "../../ui/AutonomyDial";
import type { PermissionScope } from "../../ui/PermissionRequest";
import type { SideNavGroup } from "../../ui/SideNav";

/** Demo data: Northwind's billing agents. Replace it with your agents and actions. */

/** Where the pending request stands. pending and error keep the card; granted and denied are one line. */
export type AgentPermissionsRequestState = "pending" | "error" | "granted" | "denied";

/** run: on its own · limit: up to an amount · ask: asks first · never: never on its own (policy). */
export type AgentActionLevel = "run" | "limit" | "ask" | "never";

export interface AgentAction {
  id: string;
  /** What the agent does, e.g. "Issue refunds". */
  name: string;
  agent: string;
  /** When or how it acts, e.g. "7 days after due". */
  condition: string;
  level: AgentActionLevel;
  /** USD, for level "limit". */
  limit?: number;
  /** The action moves money, so "Up to an amount" is offered. */
  amount?: boolean;
  /** One word for the thing it acts on, e.g. "refund". */
  noun: string;
  lastUsed: string;
  /** Set by workspace policy: no Edit, no drill. */
  locked?: boolean;
}

export const PERMISSIONS_PAGE = {
  product: "Northwind",
  account: { name: "Boris Jov", initials: "BJ" },
  title: "Agent permissions",
  purpose: "What each billing agent may do on its own",
  waiting: "1 request waiting",
  noneWaiting: "No requests waiting",
  tableTitle: "What agents may do",
  locked: "set by workspace policy",
  lockedShort: "Workspace policy",
};

/** The app's nav, as in the app-shell example (opens in a Drawer below 640). */
export const PERMISSIONS_NAV: SideNavGroup[] = [
  {
    label: "Work",
    items: [
      { id: "home", label: "Home", icon: "House" },
      { id: "reviews", label: "Reviews", icon: "Check", badge: "3" },
      { id: "runs", label: "Agent runs", icon: "Sparkles" },
    ],
  },
  {
    label: "Library",
    items: [
      { id: "docs", label: "Docs", icon: "Folder" },
      { id: "people", label: "People", icon: "User" },
    ],
  },
];

export const REQUEST = {
  /** The action the request changes. */
  actionId: "refunds",
  /** The limit the agent asks for, in USD. */
  limit: 500,
  title: "Refund up to $500 without asking",
  description: "3 refunds this week were $260 to $480. Each waited over 6 hours, and INV-1842 is still waiting.",
  scopes: [
    {
      id: "refunds",
      resource: "Refunds",
      access: "write",
      limit: "$500 per refund",
      expiry: "30 days, until 22 Dec",
      reason: "Refunds over $500 still ask",
    },
  ] satisfies PermissionScope[],
  warning: "Change it any time in the table.",
  /** The warning Badge above the title while the request waits. */
  badge: "Needs you",
  /** What changes, in the strip under the description. */
  summary: [
    { label: "Changes", value: "Refund limit goes from $250 to $500" },
    { label: "For", value: "30 days, until 22 Dec" },
    { label: "Still asks", value: "Refunds over $500" },
  ],
  /** The same strip below 640, as label and value rows. */
  summaryShort: [
    { label: "Refund limit", value: "$250 to $500" },
    { label: "For", value: "30 days, until 22 Dec" },
    { label: "Still asks", value: "Refunds over $500" },
  ],
  requestedAt: "Collections agent · requested 09:41",
  requestedAtShort: "Collections agent · 09:41",
  requested: "$500 requested",
  /** The refunds row's second line below 640 while the request waits, then the ask in the warning tone. */
  requestedSecondary: "Collections",
  requestedNote: "$500 asked",
  /** When the request was granted or denied, on the right of the one-line result. */
  resolvedAt: "09:52",
  errorMessage: "Stripe didn't answer. The limit is still $250.",
};

export const ACTIONS: AgentAction[] = [
  {
    id: "reminders",
    name: "Send payment reminders",
    agent: "Collections agent",
    condition: "7 days after due",
    level: "run",
    noun: "reminder",
    lastUsed: "Today 08:05",
  },
  {
    id: "refunds",
    name: "Issue refunds",
    agent: "Collections agent",
    condition: "asks above the limit",
    level: "limit",
    limit: 250,
    amount: true,
    noun: "refund",
    lastUsed: "Yesterday 16:40",
  },
  {
    id: "pause",
    name: "Pause subscriptions",
    agent: "Subscriptions agent",
    condition: "after 2 failed payments",
    level: "ask",
    noun: "pause",
    lastUsed: "18 Nov",
  },
  {
    id: "prices",
    name: "Change prices",
    agent: "Subscriptions agent",
    condition: "set by workspace policy",
    level: "never",
    noun: "price change",
    lastUsed: "Never used",
    locked: true,
  },
];

/** The default level for a new action (AutonomyDial), from more oversight to more autonomy. */
export const DEFAULT_LEVELS: AutonomyStop[] = [
  { id: "never", label: "Never on its own", description: "A new action never runs on its own." },
  { id: "ask", label: "Asks first", description: "A new action asks every time until you set its level in the table." },
  { id: "limit", label: "Up to a limit", description: "A new action runs on its own up to a limit, and asks above it." },
  { id: "run", label: "On its own", description: "A new action runs on its own and tells you after." },
];

export const SWITCH_COPY = {
  title: "Agents can act on their own",
  on: "On",
  off: "Off",
  hint: "Turn off and every action asks first. Use it if something looks wrong.",
  hintShort: "Turn off to make every action ask first.",
};

export const DEFAULT_COPY = {
  label: "Default for new actions",
  appliesTo: "All billing agents",
};

export const EDIT_COPY = {
  legend: "What may it do?",
  amountLabel: "USD per refund",
  cancel: "Cancel",
  save: "Save level",
};

const money = (value: number) => `$${value.toLocaleString("en-US")}`;

/** The level word shown in the table, the list and the Drawer. */
export function levelWord(action: Pick<AgentAction, "level" | "limit">): string {
  switch (action.level) {
    case "run":
      return "On its own";
    case "limit":
      return `Up to ${money(action.limit ?? 0)}`;
    case "ask":
      return "Asks first";
    case "never":
      return "Never on its own";
  }
}

/** Radio options in the Edit Drawer for one action. */
export function editOptions(action: AgentAction) {
  const options = [{ value: "run", label: "On its own", description: action.amount ? "Any amount. Tells you after." : "Tells you after." }];
  if (action.amount) options.push({ value: "limit", label: "Up to an amount", description: "Asks you above it." });
  options.push({ value: "ask", label: "Asks first", description: `Every ${action.noun} waits for you.` });
  return options;
}

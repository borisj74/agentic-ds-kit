/** Demo data: Northwind's agents over one week. Replace it with your own steps. */

/** Sat 21 Nov 2026, 14:14 in London: the demo's clock. */
export const NOW = Date.UTC(2026, 10, 21, 14, 14);
export const TIME_ZONE = "Europe/London";

const at = (day: number, hour: number, minute: number) => Date.UTC(2026, 10, day, hour, minute);

export const PAGE = {
  product: "Northwind",
  account: { name: "Boris Jov", initials: "BJ" },
  title: "Agent activity",
};

/** The app's nav, shown in the Drawer below 640 (the app-shell example's groups). */
export const NAV_GROUPS = [
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
] as const;

export interface Agent {
  id: string;
  name: string;
  /** Chip text when it is the only agent picked, and the Empty title. */
  short: string;
  initials: string;
  /** For the Empty state when no step this week matches. */
  lastStep: string;
}

export const AGENTS: Agent[] = [
  { id: "collections", name: "Collections agent", short: "Collections", initials: "CA", lastStep: "Last reminder: 21 Nov" },
  { id: "invoicing", name: "Invoicing agent", short: "Invoicing", initials: "IA", lastStep: "Last invoice: 20 Nov" },
  { id: "reporting", name: "Reporting agent", short: "Reporting", initials: "RA", lastStep: "Last report: 19 Nov" },
  { id: "reconciliation", name: "Reconciliation agent", short: "Reconciliation", initials: "RE", lastStep: "Last payment match: 14 Nov" },
];

export const ALLOWED_BY = ["On its own", "Approved by Boris"] as const;
export const APPS = ["Gmail", "Stripe", "Sheets"] as const;

export interface Step {
  id: string;
  agent: string;
  at: number;
  app: (typeof APPS)[number];
  task: string;
  allowedBy: (typeof ALLOWED_BY)[number];
  sentence: string;
  reason?: string;
  /** The meta line drops the task below 640 on these steps, so it fits two lines. */
  shortMeta?: boolean;
  undoUntil?: number;
  state?: "undone" | "final";
  note?: string;
  /** The note below 640, where it sits beside the Badge. */
  noteShort?: string;
}

export const STEPS: Step[] = [
  {
    id: "s1",
    agent: "collections",
    at: at(21, 14, 12),
    app: "Gmail",
    task: "Overdue follow-up",
    allowedBy: "On its own",
    sentence: "Sent reminder for INV-1842 to Northwind",
    reason: "Allowed 7 days after the due date. Undo stops the email before it leaves Gmail.",
    undoUntil: at(21, 14, 22),
  },
  {
    id: "s2",
    agent: "invoicing",
    at: at(21, 13, 40),
    app: "Stripe",
    task: "Plan change",
    allowedBy: "Approved by Boris",
    sentence: "Applied £48.00 credit to INV-1851 for Fernway Tours",
    shortMeta: true,
    state: "undone",
    note: "Undone by Boris at 13:52. INV-1851 is £480.00 due again.",
    noteShort: "by Boris at 13:52",
  },
  {
    id: "s3",
    agent: "invoicing",
    at: at(20, 16, 20),
    app: "Stripe",
    task: "November invoices",
    allowedBy: "Approved by Boris",
    sentence: "Issued INV-1856 to Quarry Coffee for £260.00",
    reason: "Boris approved the November run. Already with the customer, so void it from the invoice.",
    shortMeta: true,
    state: "final",
    note: "Void it from the invoice",
  },
  {
    id: "s4",
    agent: "collections",
    at: at(20, 9, 30),
    app: "Gmail",
    task: "Overdue follow-up",
    allowedBy: "On its own",
    sentence: "Paused reminders for Hollis and Grey after they replied",
    reason: "A customer reply always pauses reminders. Resume them from the customer page.",
    state: "final",
    note: "Resume them from the customer page",
  },
  {
    id: "s5",
    agent: "reporting",
    at: at(20, 8, 0),
    app: "Sheets",
    task: "Weekly cash report",
    allowedBy: "On its own",
    sentence: "Exported the weekly cash report to Sheets",
    reason: "Runs every Friday at 08:00.",
    state: "final",
    note: "Delete the sheet in Sheets",
  },
  {
    id: "s6",
    agent: "invoicing",
    at: at(19, 17, 5),
    app: "Stripe",
    task: "November invoices",
    allowedBy: "Approved by Boris",
    sentence: "Issued INV-1849 to Halvorsen Freight for £1,240.00",
    reason: "Boris approved the November run. Already with the customer, so void it from the invoice.",
    shortMeta: true,
    state: "final",
    note: "Void it from the invoice",
  },
  {
    id: "s7",
    agent: "collections",
    at: at(19, 10, 15),
    app: "Gmail",
    task: "Overdue follow-up",
    allowedBy: "On its own",
    sentence: "Sent reminder for INV-1838 to Brightline Studio",
    reason: "Allowed 7 days after the due date. The email has left Gmail.",
    state: "final",
    note: "Follow up from Gmail",
  },
  {
    id: "s8",
    agent: "reporting",
    at: at(19, 8, 0),
    app: "Sheets",
    task: "Aged debt summary",
    allowedBy: "On its own",
    sentence: "Updated the aged debt summary in Sheets",
    reason: "Runs every Thursday at 08:00.",
    state: "final",
    note: "Restore an earlier version in Sheets",
  },
  {
    id: "s9",
    agent: "collections",
    at: at(18, 15, 40),
    app: "Gmail",
    task: "Overdue follow-up",
    allowedBy: "On its own",
    sentence: "Paused reminders for Marlow and Finch after a payment promise",
    reason: "A promise to pay pauses reminders for 5 days. Resume them from the customer page.",
    state: "final",
    note: "Resume them from the customer page",
  },
  {
    id: "s10",
    agent: "invoicing",
    at: at(18, 9, 0),
    app: "Stripe",
    task: "November invoices",
    allowedBy: "On its own",
    sentence: "Drafted November invoices for 14 customers",
    reason: "Drafts wait for approval before they're sent.",
    state: "final",
    note: "Delete a draft in Stripe",
  },
  {
    id: "s11",
    agent: "reporting",
    at: at(17, 8, 0),
    app: "Sheets",
    task: "Weekly cash report",
    allowedBy: "On its own",
    sentence: "Shared the cash forecast with the finance channel",
    reason: "Boris turned on sharing for this report.",
    state: "final",
    note: "Unshare it in Sheets",
  },
  {
    id: "s12",
    agent: "collections",
    at: at(17, 11, 20),
    app: "Gmail",
    task: "Overdue follow-up",
    allowedBy: "Approved by Boris",
    sentence: "Sent a final notice for INV-1833 to Fernway Tours",
    reason: "Final notices need approval. Boris approved it at 11:12.",
    state: "final",
    note: "Follow up from Gmail",
  },
];

/** What Undo on s1 leaves behind. */
export const UNDONE = {
  note: "Undone by you at 14:15. The email never left Gmail.",
  noteShort: "by you at 14:15",
  toast: "Reminder for INV-1842 stopped",
};

export const ERROR = {
  title: "Couldn't load agent activity",
  body: "Undo still works from each invoice. Try again in a moment.",
};

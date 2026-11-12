import type { WorkBoardColumn, WorkBoardPerson, WorkBoardTask } from "agentic-ds-kit";

/** Sample team and board for the WorkBoard docs. */
export const WORK_BOARD_PEOPLE: WorkBoardPerson[] = [
  { id: "maya", name: "Maya Chen" },
  { id: "omar", name: "Omar Haddad" },
  { id: "priya", name: "Priya Raman" },
  { id: "jonas", name: "Jonas Berg" },
];

export const WORK_BOARD_ME = "maya";

const [maya, omar, priya, jonas] = WORK_BOARD_PEOPLE;

export const WORK_BOARD_COLUMNS: WorkBoardColumn[] = [
  { id: "todo", label: "To do", cardIds: ["eu-vat", "dunning", "credit-notes"] },
  { id: "doing", label: "In progress", cardIds: ["pdf-footer", "proration"] },
  { id: "review", label: "In review", cardIds: ["retry-rules"] },
  { id: "done", label: "Done", cardIds: ["tax-export"] },
];

export const WORK_BOARD_TASKS: WorkBoardTask[] = [
  {
    id: "eu-vat",
    title: "EU VAT rates for 2027",
    description: "Load the new standard and reduced rates for the 27 member states and check them against the tax provider before 1 January.",
    tags: ["Tax"],
    assigneeId: "priya",
    dueOn: "28 Nov",
    comments: [
      { id: "c1", author: omar, createdAt: "2d", body: "Ireland and Estonia change in January, the rest stay. I put the list in the tax doc." },
      { id: "c2", author: priya, createdAt: "1d", body: "Thanks. I'll check reduced rates too, those moved in Finland.", parentId: "c1" },
    ],
  },
  {
    id: "dunning",
    title: "Draft dunning emails",
    description: "Three reminders for failed card payments: day 1, day 4 and day 10. Plain tone, one link to update the card.",
    tags: ["Email", "Billing"],
    dueOn: "21 Nov",
  },
  { id: "credit-notes", title: "Credit notes in the customer portal", tags: ["Portal"], assigneeId: "jonas", dueOn: "5 Dec" },
  {
    id: "pdf-footer",
    title: "Invoice PDF footer",
    description: "Add the registered office, company number and bank details to every invoice PDF. Legal wants it before the audit.",
    tags: ["Invoices"],
    assigneeId: "omar",
    dueOn: "18 Nov",
    comments: [
      { id: "c3", author: maya, createdAt: "3h", body: "Can the bank details come from the payout account, so we don't keep them twice?" },
      { id: "c4", author: omar, createdAt: "2h", body: "Yes, wiring that now. Draft PDF this afternoon.", parentId: "c3" },
      { id: "c5", author: jonas, createdAt: "40m", body: "Footer wraps on A5 receipts, worth a look." },
    ],
  },
  { id: "proration", title: "Prorate mid-cycle seat changes", tags: ["Billing"], assigneeId: "maya", dueOn: "2 Dec" },
  {
    id: "retry-rules",
    title: "Smart retry rules",
    description: "Retry failed payments on the customer's usual pay day instead of a fixed 3 days.",
    tags: ["Payments"],
    assigneeId: "jonas",
    dueOn: "15 Nov",
    comments: [{ id: "c6", author: priya, createdAt: "1h", body: "Looks good. Can we cap it at four retries?" }],
  },
  { id: "tax-export", title: "Quarterly tax export", tags: ["Tax"], assigneeId: "priya" },
];

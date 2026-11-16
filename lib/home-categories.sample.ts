/**
 * Example data for the landing page's category bentos (SaaS, Forms, Data display, Navigation,
 * Feedback, Overlays). Fake companies and people only; adapted from the component docs.
 */
import type {
  AnchorNavItem,
  AppNavGroup,
  CommandGroup,
  DataTableColumn,
  DataTableRow,
  FileUploadItem,
  IntegrationItem,
  NotificationItem,
  PricingPlan,
  ProgressStepsItem,
  SetupTask,
  SideNavGroup,
  TableColumn,
  TimelineItem,
  UsageListItem,
} from "agentic-ds-kit";

/* ---------- SaaS ---------- */

export const CAT_PLANS: PricingPlan[] = [
  { id: "starter", name: "Starter", tagline: "For trying things out", price: 9, yearlyPrice: 7, features: ["1 workspace", "100 invoices / month", "Email support"] },
  {
    id: "pro",
    name: "Pro",
    tagline: "For growing teams",
    price: 29,
    yearlyPrice: 24,
    features: ["5 workspaces", "Unlimited invoices", "Integrations", "Priority support"],
    recommended: true,
  },
  { id: "business", name: "Business", tagline: "For finance teams", price: 79, yearlyPrice: 66, features: ["Unlimited workspaces", "SSO and audit log", "Custom roles", "Dedicated manager"] },
];

export const CAT_NOTIFICATIONS: NotificationItem[] = [
  { id: "pay", title: "Payment received", body: "$782.40 from Acme Co for INV-2026-0117", createdAt: "5m", read: false, tone: "success", icon: "CreditCard" },
  { id: "signin", title: "New sign-in", body: "Chrome on macOS · London · example", createdAt: "1h", read: false, tone: "info" },
  { id: "card", title: "Card expiring", body: "Visa 4242 expires next month", createdAt: "1d", read: true, tone: "warning" },
  { id: "sent", title: "Invoice sent", body: "INV-2026-0116 to Globex", createdAt: "2d", read: true, tone: "neutral" },
];

export const CAT_SETUP: SetupTask[] = [
  { id: "company", label: "Add your company details", description: "Name, address and tax ID for invoices", status: "done" },
  { id: "payments", label: "Connect a payment method", description: "So customers can pay online", status: "done" },
  { id: "customers", label: "Import customers", description: "CSV or connect your CRM · 5 min", status: "current" },
  { id: "invoice", label: "Send your first invoice", description: "Use a template or start blank · 3 min", status: "todo" },
  { id: "team", label: "Invite your team", description: "Optional · add finance teammates · 1 min", status: "todo" },
];

export const CAT_INTEGRATIONS: IntegrationItem[] = [
  { id: "ledger", name: "Northwind Ledger", description: "Sync invoices and payments", category: "Accounting", status: "connected", icon: "FileText" },
  { id: "bank", name: "Harbor Bank", description: "Match bank feeds to invoices", category: "Banking", status: "available", icon: "Landmark" },
  { id: "mail", name: "Mailroom", description: "Send invoices from your domain", category: "Email", status: "available", icon: "Mail" },
  { id: "chat", name: "Team Chat", description: "Post payment alerts to a channel", category: "Messaging", status: "connected", icon: "Hash" },
  { id: "db", name: "Warehouse DB", description: "Nightly export of billing data", category: "Data", status: "available", icon: "Database" },
  { id: "tax", name: "TaxBridge", description: "Automatic tax rates by region", category: "Tax", status: "comingSoon", icon: "Gauge" },
];

export const CAT_INTEGRATION_CATEGORIES = ["Accounting", "Banking", "Email", "Data"];

/* ---------- Forms ---------- */

/** Brand colours are user data, painted by ColorPicker itself. */
export const CAT_BRAND_DEFAULT = "#2B2BF5";
export const CAT_BRAND_SWATCHES = [
  { value: "#2B2BF5", label: "Electric blue" },
  { value: "#0E9F6E", label: "Green" },
  { value: "#D97706", label: "Amber" },
  { value: "#DB2777", label: "Pink" },
  { value: "#111827", label: "Ink" },
];

export const CAT_FILES: FileUploadItem[] = [
  { id: "contract", name: "acme-contract-2026.pdf", size: 1_840_000, status: "done" },
  { id: "logo", name: "northwind-logo.svg", size: 42_000, status: "uploading", progress: 40 },
  { id: "export", name: "customers-export.csv", size: 12_600_000, status: "error", error: "Over the 10 MB limit" },
];

/* ---------- Data display ---------- */

export const CAT_CUSTOMER_COLUMNS: DataTableColumn[] = [
  { key: "name", header: "Customer", sortable: true },
  { key: "plan", header: "Plan", sortable: true },
  { key: "status", header: "Status", sortable: true },
  { key: "mrr", header: "MRR", type: "number", sortable: true },
];

export type CatCustomer = { id: string; name: string; contact: string; plan: string; paid: boolean; mrr: number };

export const CAT_CUSTOMERS: CatCustomer[] = [
  { id: "acme", name: "Acme Co", contact: "Maya Chen", plan: "Business", paid: true, mrr: 790 },
  { id: "globex", name: "Globex", contact: "Noah Williams", plan: "Pro", paid: false, mrr: 290 },
  { id: "initech", name: "Initech", contact: "Iris Okafor", plan: "Pro", paid: true, mrr: 290 },
  { id: "umbrella", name: "Umbrella Labs", contact: "Jordan Lee", plan: "Starter", paid: false, mrr: 90 },
  { id: "hooli", name: "Hooli Studio", contact: "Alex Rivera", plan: "Business", paid: true, mrr: 790 },
];

export function catCustomerRows(customers: CatCustomer[]): DataTableRow[] {
  return customers.map((customer) => ({
    id: customer.id,
    name: { type: "avatar", label: customer.name, name: customer.contact },
    plan: customer.plan,
    status: { type: "badge", label: customer.paid ? "Paid" : "Overdue", tone: customer.paid ? "success" : "warning" },
    mrr: customer.mrr,
  }));
}

export const CAT_USAGE: UsageListItem[] = [
  { id: "invoices", label: "Invoices", used: 840, limit: 1000, note: "Resets on 1 Dec" },
  { id: "storage", label: "Storage", used: 32, limit: 50, unit: "GB" },
  { id: "api", label: "API calls", used: 8420, limit: 10000 },
  { id: "seats", label: "Seats", used: 12, limit: 12, note: "All seats in use" },
];

export const CAT_TIMELINE: TimelineItem[] = [
  { id: "q4", phase: "Now", title: "Usage-based billing", body: "Metered plans for API customers.", status: "now" },
  { id: "q1", phase: "Next", title: "Tax by region", body: "Rates applied at checkout.", status: "next" },
  { id: "q2", phase: "Later", title: "Multi-entity books", body: "One login, many companies.", status: "later" },
];

/* ---------- Navigation ---------- */

export const CAT_SIDENAV: SideNavGroup[] = [
  {
    label: "Workspace",
    items: [
      { id: "home", label: "Home", icon: "House" },
      { id: "invoices", label: "Invoices", icon: "FileText", badge: "3" },
      { id: "customers", label: "Customers", icon: "Users" },
      { id: "reports", label: "Reports", icon: "ChartBar" },
    ],
  },
  {
    label: "Settings",
    items: [
      { id: "billing", label: "Billing", icon: "CreditCard" },
      { id: "team", label: "Team", icon: "User" },
      { id: "settings", label: "Settings", icon: "Settings" },
    ],
  },
];


export const CAT_INVOICE_COLUMNS: TableColumn[] = [
  { key: "number", header: "Invoice", emphasis: true },
  { key: "customer", header: "Customer" },
  { key: "due", header: "Due" },
  { key: "status", header: "Status" },
  { key: "amount", header: "Amount", numeric: true, align: "end" },
];

const INVOICE_ROWS = [
  { number: "INV-2026-0117", customer: "Acme Co", due: "15 Nov", status: "Overdue", amount: "$782.40" },
  { number: "INV-2026-0116", customer: "Globex", due: "12 Nov", status: "Paid", amount: "$290.00" },
  { number: "INV-2026-0115", customer: "Initech", due: "10 Nov", status: "Paid", amount: "$1,240.00" },
  { number: "INV-2026-0114", customer: "Umbrella Labs", due: "8 Nov", status: "Overdue", amount: "$96.00" },
  { number: "INV-2026-0113", customer: "Hooli Studio", due: "5 Nov", status: "Paid", amount: "$2,410.00" },
];

export const CAT_INVOICES: Record<"all" | "paid" | "overdue", typeof INVOICE_ROWS> = {
  all: INVOICE_ROWS,
  paid: INVOICE_ROWS.filter((row) => row.status === "Paid"),
  overdue: INVOICE_ROWS.filter((row) => row.status === "Overdue"),
};

/** The docs-style nav in the Navigation tab. Links go nowhere: the tile is a demo. */
export const CAT_APPNAV: AppNavGroup[] = [
  {
    label: "Getting started",
    defaultOpen: true,
    items: [
      { href: "#intro", label: "Introduction" },
      { href: "#install", label: "Installation" },
      { href: "#theming", label: "Theming" },
    ],
  },
  {
    label: "Billing",
    defaultOpen: true,
    items: [
      { href: "#invoices", label: "Invoices" },
      { href: "#payments", label: "Payments" },
      { href: "#tax", label: "Tax rates" },
      { href: "#webhooks", label: "Webhooks" },
    ],
  },
];

export const CAT_ANCHORS: AnchorNavItem[] = [
  { id: "cat-anchor-summary", label: "Summary" },
  { id: "cat-anchor-lines", label: "Line items" },
  { id: "cat-anchor-payments", label: "Payments" },
  { id: "cat-anchor-activity", label: "Activity" },
];

/* ---------- Feedback ---------- */

export const CAT_IMPORT_STEPS: ProgressStepsItem[] = [
  { id: "upload", label: "Upload", description: "customers.csv" },
  { id: "map", label: "Map columns", description: "12 of 12" },
  { id: "import", label: "Import", description: "In progress" },
  { id: "review", label: "Review" },
];

/* ---------- Overlays ---------- */

export const CAT_COMMANDS: CommandGroup[] = [
  {
    heading: "Suggestions",
    items: [
      { id: "new-invoice", label: "New invoice", icon: "Plus", shortcut: "⌘I" },
      { id: "find-customer", label: "Find a customer", icon: "Search" },
      { id: "reports", label: "Open reports", icon: "ChartBar" },
    ],
  },
  {
    heading: "Settings",
    items: [
      { id: "profile", label: "Profile", icon: "User", shortcut: "⌘P" },
      { id: "billing", label: "Billing", icon: "CreditCard", shortcut: "⌘B" },
      { id: "settings", label: "Settings", icon: "Settings", shortcut: "⌘S" },
    ],
  },
];

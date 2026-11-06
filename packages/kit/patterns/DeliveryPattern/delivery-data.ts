/** Demo data for DeliveryPattern. Replace with your own metrics, timeline, and members. */
import type { DataTableRow } from "../../ui/DataTable";

export const DELIVERY_METRICS = [
  { label: "On track", value: "8", delta: "+2", trend: "up" as const, hint: "this cycle", size: "lg" as const, badge: "Now", badgeTone: "success" as const },
  { label: "At risk", value: "2", delta: "0", trend: "flat" as const, hint: "need owners", size: "lg" as const, badge: "Watch", badgeTone: "warning" as const },
  { label: "Shipped", value: "14", delta: "+3", trend: "up" as const, hint: "last 30 days", size: "lg" as const, badge: "Done", badgeTone: "info" as const },
];

export const DELIVERY_STEPS = [
  { status: "now" as const, phase: "Now", title: "Token studio", body: "Live font, primary, radius, and shadow write semantic variables." },
  { status: "next" as const, phase: "Next", title: "Contract freeze", body: "Agents compose from the catalog. No local cousins." },
  { status: "later" as const, phase: "Later", title: "Product screens", body: "Copy a pattern, replace the data, keep the must lines." },
];

export const MEMBER_ROWS: DataTableRow[] = [
  {
    id: "ava",
    member: { type: "avatar", name: "Ava Laurent", initials: "AL", label: "ava@example.com" },
    role: "Owner",
    status: { type: "badge", label: "Active", tone: "success" },
  },
  {
    id: "milo",
    member: { type: "avatar", name: "Milo Kovac", initials: "MK", label: "milo@example.com" },
    role: "Admin",
    status: { type: "badge", label: "Active", tone: "success" },
  },
  {
    id: "jun",
    member: { type: "avatar", name: "Jun Sato", initials: "JS", label: "jun@example.com" },
    role: "Editor",
    status: { type: "badge", label: "Invited", tone: "info" },
  },
];

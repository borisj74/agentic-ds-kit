import { DataTable } from "@/ui/DataTable";
import type { DataTableColumn, DataTableRow } from "@/ui/DataTable";

const EVENT_COLUMNS: DataTableColumn[] = [
  { key: "actor", header: "Person", sortable: true },
  { key: "event", header: "Event", sortable: true },
  { key: "type", header: "Type", sortable: true },
  { key: "when", header: "When", sortable: true },
];

const EVENT_ROWS: DataTableRow[] = [
  {
    id: "comment-launch",
    actor: { type: "avatar", label: "Maya Chen", name: "Maya Chen", src: "/faces/maya-chen.jpg" },
    event: { type: "file", label: "Commented on Launch brief" },
    type: { type: "badge", label: "Comment", tone: "info" },
    when: "2h ago",
  },
  {
    id: "blocked-qa",
    actor: { type: "avatar", label: "Unassigned", name: "Unassigned" },
    event: { type: "file", label: "QA checklist marked Blocked" },
    type: { type: "badge", label: "Status", tone: "danger" },
    when: "4h ago",
  },
  {
    id: "macros-update",
    actor: { type: "avatar", label: "Alex Rivera", name: "Alex Rivera", src: "/faces/alex-rivera.jpg" },
    event: { type: "file", label: "Updated Support macros" },
    type: { type: "badge", label: "Edit", tone: "neutral" },
    when: "5h ago",
  },
  {
    id: "ready-notes",
    actor: { type: "avatar", label: "Jordan Lee", name: "Jordan Lee", src: "/faces/jordan-lee.jpg" },
    event: { type: "file", label: "Moved Release notes to Ready" },
    type: { type: "badge", label: "Status", tone: "success" },
    when: "Yesterday",
  },
  {
    id: "mention-launch",
    actor: { type: "avatar", label: "Maya Chen", name: "Maya Chen", src: "/faces/maya-chen.jpg" },
    event: { type: "file", label: "Mentioned you in Launch brief" },
    type: { type: "badge", label: "Mention", tone: "brand" },
    when: "Yesterday",
  },
  {
    id: "macros-comment",
    actor: { type: "avatar", label: "Alex Rivera", name: "Alex Rivera", src: "/faces/alex-rivera.jpg" },
    event: { type: "file", label: "Replied on Support macros" },
    type: { type: "badge", label: "Comment", tone: "info" },
    when: "Mon",
  },
];

function rowsFor(tab: string): DataTableRow[] {
  if (tab === "all") return EVENT_ROWS;
  const label = tab === "comments" ? "Comment" : tab === "status" ? "Status" : "Mention";
  return EVENT_ROWS.filter((row) => {
    const cell = row.type;
    return typeof cell === "object" && cell !== null && "label" in cell && cell.label === label;
  });
}

export function ActivityFeed({ tab, caption }: { tab: string; caption: string }) {
  return (
    <DataTable
      caption={caption}
      toolbar
      cellSize="sm"
      searchPlaceholder="Search activity..."
      emptyMessage="No activity in this filter."
      columns={EVENT_COLUMNS}
      rows={rowsFor(tab)}
    />
  );
}

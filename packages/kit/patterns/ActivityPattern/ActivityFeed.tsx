import { DataTable } from "../../ui/DataTable";
import type { DataTableColumn, DataTableRow } from "../../ui/DataTable";
import { EVENT_ROWS } from "./activity-data";

const EVENT_COLUMNS: DataTableColumn[] = [
  { key: "actor", header: "Person", sortable: true },
  { key: "event", header: "Event", sortable: true },
  { key: "type", header: "Type", sortable: true },
  { key: "when", header: "When", sortable: true },
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

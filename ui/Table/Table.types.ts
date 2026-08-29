export interface TableColumn {
  key: string;
  header: string;
}

export interface TableProps {
  columns: TableColumn[];
  rows: Record<string, string>[];
  caption?: string;
}

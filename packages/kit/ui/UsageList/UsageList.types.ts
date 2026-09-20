export interface UsageListItem {
  id: string;
  label: string;
  used: number;
  limit: number;
  unit?: string;
  note?: string;
}

export interface UsageListProps {
  items: UsageListItem[];
  label?: string;
}

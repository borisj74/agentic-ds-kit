export interface LinkListItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: string;
  description?: string;
  external?: boolean;
}

export interface LinkListProps {
  items: LinkListItem[];
  label?: string;
}

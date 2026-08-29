export interface CommandItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
}

export interface CommandGroup {
  heading?: string;
  items: CommandItem[];
}

export interface CommandProps {
  placeholder?: string;
  empty?: string;
  groups: CommandGroup[];
  onSelect?: (id: string) => void;
  label?: string;
}

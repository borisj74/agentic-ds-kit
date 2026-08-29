export interface AppNavLeaf {
  href: string;
  label: string;
  active?: boolean;
}

/** A nav link, optionally with one nested subgroup of leaves. */
export interface AppNavItem extends AppNavLeaf {
  items?: AppNavLeaf[];
}

export interface AppNavGroup {
  label: string;
  defaultOpen?: boolean;
  items: AppNavItem[];
}

export interface AppNavProps {
  title: string;
  /** Flat list for simple shells (e.g. list-detail). Ignored when `groups` is provided. */
  items?: AppNavItem[];
  /** Grouped catalog nav for docs/playground shells. Takes precedence over `items`. */
  groups?: AppNavGroup[];
}

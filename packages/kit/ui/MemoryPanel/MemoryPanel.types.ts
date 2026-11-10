import type { ComponentPropsWithoutRef, Ref } from "react";

export interface MemoryItem {
  id: string;
  content: string;
  /** e.g. "from chat · 12 Oct" or "from repo scan" */
  source?: string;
  /** e.g. "3w" */
  age?: string;
  pinned?: boolean;
  /** This thread used it. */
  usedHere?: boolean;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type MemoryPanelOwnedKeys = "children" | "title" | "aria-labelledby";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface MemoryPanelProps extends Omit<ComponentPropsWithoutRef<"section">, MemoryPanelOwnedKeys> {
  items: MemoryItem[];
  /** Default "Memory". */
  label?: string;
  query?: string;
  onQueryChange?: (query: string) => void;
  onAdd?: (content: string) => void;
  onEdit?: (id: string, content: string) => void;
  onPin?: (id: string, pinned: boolean) => void;
  /** Called after the AlertDialog confirm. */
  onDelete?: (id: string) => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  /** Always visible. Default "Only you and this workspace's agents can read these." */
  privacyNote?: string;
  ref?: Ref<HTMLElement>;
}

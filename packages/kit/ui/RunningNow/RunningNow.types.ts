import type { ComponentPropsWithoutRef, Ref } from "react";

export type RunningNowStatus = "running" | "waiting" | "failed";
export type RunningNowLayout = "row" | "stack";

export interface RunningNowItem {
  id: string;
  name: string;
  /** What it does now, e.g. "editing invoice.ts". Waiting and failed items say why. */
  activity?: string;
  status: RunningNowStatus;
  /** Clock, e.g. "02:14". */
  elapsed?: string;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type RunningNowOwnedKeys = "children" | "onSelect";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface RunningNowProps extends Omit<ComponentPropsWithoutRef<"section">, RunningNowOwnedKeys> {
  items: RunningNowItem[];
  /** row: chips that wrap, for a header. stack: one line each, for a sidebar. */
  layout?: RunningNowLayout;
  /** Items shown before the overflow. Default 3 for row, 4 for stack. */
  maxVisible?: number;
  /** Default "Running now". */
  label?: string;
  /** Click an item. Without it items are plain text. */
  onSelect?: (id: string) => void;
  /** The "+N" / "View all" overflow. */
  onShowAll?: () => void;
  /** Stop a running or waiting item. Adds an icon-only Stop named "Stop <name>" to the item. */
  onStop?: (id: string) => void;
  loading?: boolean;
  /** Empty text. Default "Nothing running right now". */
  emptyText?: string;
  /**
   * Idle state when items is empty, e.g. "Idle · last run 2h ago": the label drops its count and
   * the line drops its icon. Takes the place of emptyText. Ignored while items run or load.
   */
  idleText?: string;
  ref?: Ref<HTMLElement>;
}

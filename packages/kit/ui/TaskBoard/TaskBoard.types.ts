import type { ComponentPropsWithoutRef, Ref } from "react";

export interface TaskBoardColumn {
  id: string;
  label: string;
  /** Card ids in order. */
  cardIds: string[];
}

export interface TaskBoardCard {
  id: string;
  title: string;
  /** Short labels, e.g. ["Billing"]. */
  tags?: string[];
  assignee?: { name: string; initials?: string; avatarSrc?: string };
  /** Display date, e.g. "14 Nov". */
  dueOn?: string;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type TaskBoardOwnedKeys = "children" | "title" | "aria-labelledby";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface TaskBoardProps extends Omit<ComponentPropsWithoutRef<"section">, TaskBoardOwnedKeys> {
  columns: TaskBoardColumn[];
  cards: TaskBoardCard[];
  /** Board name, e.g. "Billing Q4". */
  title: string;
  /** Muted note after the title, e.g. "example tasks". */
  note?: string;
  /** A card was dropped: by drag, or by keyboard (Space, arrows, Space). */
  onMove: (cardId: string, toColumnId: string, index: number) => void;
  /** "Add card" under a column. */
  onAdd?: (columnId: string) => void;
  onCardClick?: (cardId: string) => void;
  /** Header: New task (outline). */
  onNewTask?: () => void;
  /** Header: Filter (ghost). */
  onFilter?: () => void;
  /** Cards shown per column before "+ N more". Default: all. */
  maxCardsPerColumn?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  ref?: Ref<HTMLElement>;
}

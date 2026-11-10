import type { ComponentPropsWithoutRef, Ref } from "react";

export type AgentTreeStatus = "queued" | "running" | "waiting" | "done" | "failed";

export interface AgentTreeNode {
  id: string;
  name: string;
  status: AgentTreeStatus;
  /** e.g. "2m 10s" */
  elapsed?: string;
  /** Cost in the fleet currency. Branches without a cost sum their children (Σ). */
  cost?: number;
  /** Second line for waiting or failed nodes, e.g. "Needs your OK · psql migration" or "3 failed · exit code 1". */
  note?: string;
  children?: AgentTreeNode[];
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type AgentTreeOwnedKeys = "children" | "onSelect";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface AgentTreeProps extends Omit<ComponentPropsWithoutRef<"section">, AgentTreeOwnedKeys> {
  /** The orchestrator. Null or undefined with loading false shows the empty state. */
  root?: AgentTreeNode | null;
  /** Header label, e.g. "Orchestrator". */
  label?: string;
  /** Ids of folded branches. */
  folded?: string[];
  onFoldedChange?: (folded: string[]) => void;
  onApprove?: (id: string) => void;
  onRetry?: (id: string) => void;
  /** Currency symbol for costs. Default "$". */
  currency?: string;
  loading?: boolean;
  ref?: Ref<HTMLElement>;
}

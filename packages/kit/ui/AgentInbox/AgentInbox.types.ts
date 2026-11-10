import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import type { ApprovalCardAction, ApprovalCardRisk } from "../ApprovalCard/ApprovalCard.types";
import type { DecisionOption } from "../DecisionCard/DecisionCard.types";

export type AgentInboxItemType = "approval" | "question" | "failure" | "recap";
export type AgentInboxFilter = "all" | AgentInboxItemType;

export interface AgentInboxItem {
  id: string;
  agentName: string;
  type: AgentInboxItemType;
  /** One-line preview, e.g. "Run 0042_drop_legacy.sql on staging?". */
  preview: string;
  /** Relative time, e.g. "2m". */
  time?: string;
  read?: boolean;
  /** approval: the exact action, rendered as a kit ApprovalCard. */
  approval?: { title: string; description?: string; risk?: ApprovalCardRisk; action: ApprovalCardAction };
  /** question: rendered as a kit DecisionCard. */
  question?: { question: string; options?: DecisionOption[]; allowFreeText?: boolean; meta?: string };
  /** recap and failure: heading, meta and lines. */
  detail?: { heading?: string; meta?: string; lines?: string[] };
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type AgentInboxOwnedKeys = "children" | "title" | "onSelect";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface AgentInboxProps extends Omit<ComponentPropsWithoutRef<"section">, AgentInboxOwnedKeys> {
  items: AgentInboxItem[];
  /** Default "Agent inbox". */
  title?: string;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  filter?: AgentInboxFilter;
  onFilterChange?: (filter: AgentInboxFilter) => void;
  onMarkAllRead?: () => void;
  onApprove?: (id: string) => void;
  onDeny?: (id: string) => void;
  /** question: the confirmed answer (option id or free text). */
  onAnswer?: (id: string, value: string) => void;
  onRetryItem?: (id: string) => void;
  onViewDiff?: (id: string) => void;
  onOpenTrail?: (id: string) => void;
  /** Replace the default detail pane for an item. */
  renderDetail?: (item: AgentInboxItem) => ReactNode;
  loading?: boolean;
  /** Load error, e.g. "Couldn't load the inbox. Network timed out." */
  error?: string;
  onRetry?: () => void;
  ref?: Ref<HTMLElement>;
}

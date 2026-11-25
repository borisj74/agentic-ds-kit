import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import type { KitIcon } from "../Button/lucideName";
import type { ChartDatum } from "../shared/chartMath";
import type { ScorecardTrend } from "../Scorecard/Scorecard.types";
import type { TableColumn, TableFooter } from "../Table/Table.types";

export type ChatMessageRole = "user" | "assistant";

/** One figure an answer quotes. Drawn as a kit Scorecard sm. */
export interface ChatMetric {
  label: string;
  value: string;
  delta?: string;
  trend?: ScorecardTrend;
}

/**
 * Typed parts of an assistant answer, drawn in order under the text:
 * `metrics` (Scorecard sm), `table` (Table sm), `chart` (LineChart area), `sources` (footer line),
 * `followups` (pill Buttons that send their text).
 */
export type ChatPart =
  | { type: "metrics"; items: ChatMetric[] }
  | {
      type: "table";
      columns: TableColumn[];
      rows: Record<string, string | number | ReactNode>[];
      footer?: TableFooter;
      caption?: string;
    }
  | { type: "chart"; label: string; range?: string; data: ChartDatum[] }
  | { type: "sources"; label: string }
  | { type: "followups"; items: string[] };

export type ChatStepStatus = "done" | "active" | "pending";

/** One step of the work behind an answer. */
export interface ChatStep {
  label: string;
  status: ChatStepStatus;
  /** Time the step took, in milliseconds. Shown as seconds. */
  durationMs?: number;
}

/** What went wrong on an assistant message with status "error". */
export interface ChatError {
  title: string;
  description?: string;
  onRetry?: () => void;
  onCopyDetails?: () => void;
}

export type ChatMessageStatus = "streaming" | "error";

export interface ChatMessage {
  id?: string;
  role: ChatMessageRole;
  content: string;
  timestamp?: string;
  /** Assistant only: figures, a table, a chart, sources and follow-ups under the text. */
  parts?: ChatPart[];
  /** Assistant only: the steps behind the answer, collapsed into one row that opens the list. */
  steps?: ChatStep[];
  /** `streaming` shows a caret and a placeholder for parts still coming. `error` shows `error`. */
  status?: ChatMessageStatus;
  error?: ChatError;
}

/** A suggested prompt with a hint line, shown as a row in the empty state. */
export interface ChatSuggestion {
  label: string;
  /** What it looks at, like "Looks at MRR movements · 3 months". */
  hint?: string;
  icon?: KitIcon;
}

/** A recent question, shown under the suggestions in the empty state. */
export interface ChatRecent {
  id?: string;
  label: string;
  /** Short text at the row's end, like "Yesterday". */
  meta?: string;
  /** Runs when the row is picked. Without it, the row sends `label` through onSend, like a suggestion. */
  onSelect?: () => void;
}

export interface ChatMenuItem {
  id?: string;
  label: string;
  tone?: "default" | "danger";
  onSelect?: () => void;
}

export type ChatRadius = "lg" | "none";

/** What the next message is about, shown as a kit Tag above the composer. */
export interface ChatContext {
  /** Short text, like "MRR movements · Last 3 months". */
  label: string;
  /** When set, the Tag is removable and this runs when its X is pressed. */
  onRemove?: () => void;
}

/** Root attributes the kit sets itself or replaces with its own prop (`title` is the header text). */
type ChatOwnedKeys = "children" | "title" | "defaultValue" | "aria-label";

/** `ref`, `className` and other attributes land on the root `<section>`. */
export interface ChatProps extends Omit<ComponentPropsWithoutRef<"section">, ChatOwnedKeys> {
  title?: string;
  status?: string;
  messages?: ChatMessage[];
  /**
   * Prompts that send their text. Plain strings are Buttons above the composer. Objects with a
   * hint are rows (kit LinkList) in the empty state.
   */
  suggestions?: (string | ChatSuggestion)[];
  /** Context chip above the composer; the composer's description reads it to screen readers. */
  context?: ChatContext;
  placeholder?: string;
  emptyState?: string;
  /** Empty state heading, like "Good morning, Ada". */
  greeting?: string;
  /** Empty state line under the greeting: what the assistant can do here. */
  intro?: string;
  /** Recent questions in the empty state (kit ListView). */
  recent?: ChatRecent[];
  /** Shown under the Recent heading when `recent` is an empty array. */
  recentEmptyLabel?: string;
  /**
   * Data the assistant reads is still loading. The guided empty state keeps the greeting and intro,
   * shows Skeleton rows in place of the suggestions, and the composer is disabled. The section is
   * aria-busy. With no placeholder set, the composer reads "Available when your data loads".
   */
  loading?: boolean;
  isThinking?: boolean;
  /** While thinking: a live step list in place of the thinking dots. */
  thinkingSteps?: ChatStep[];
  /** While thinking: the composer reads "Working…" and Send becomes Stop, which calls this. */
  onStop?: () => void;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSend?: (message: string) => void;
  /**
   * Send button look. Default "solid" (the view's one solid primary). Use "soft" when another
   * solid primary shares the view, e.g. an ApprovalCard waiting beside the chat.
   */
  sendAppearance?: "solid" | "soft";
  onClose?: () => void;
  closeLabel?: string;
  menuItems?: ChatMenuItem[];
  menuLabel?: string;
  /** `lg` is the standalone card. `none` squares the panel and drops the outer block/end borders so Chat can sit flush in a workspace rail. */
  radius?: ChatRadius;
  /**
   * Inside a host that already has a title, an edge and padding (a work panel tab, a Drawer): no
   * header band, no outer border, no inline insets of its own, and it fills the host's height.
   * title still names the section; status, onClose and menuItems are not shown.
   */
  embedded?: boolean;
  className?: string;
  ref?: Ref<HTMLElement>;
}

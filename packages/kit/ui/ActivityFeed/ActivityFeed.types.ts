import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import type { BadgeTone } from "../Badge/Badge.types";

/** What kind of thing happened. Drives the Type filter and the event's type Badge. */
export type ActivityEventType = "comment" | "change" | "run" | "member" | "billing";

/** Who did it: a person or an agent. Both show as a kit Avatar; agents add an Agent Badge. */
export interface ActivityActor {
  id: string;
  name: string;
  kind?: "person" | "agent";
  /** Avatar image. Initials show when it is missing. */
  src?: string;
  initials?: string;
}

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  actor: ActivityActor;
  /** The verb phrase, lower case: "commented on", "merged", "finished a run on". */
  verb: string;
  /** What it happened to: "Pricing page copy", "PR #482". */
  object: string;
  /** When, as epoch ms or an ISO string. */
  at: number | string;
  /** Optional second line: a comment excerpt, a run summary, an amount. */
  detail?: string;
  /** Optional outcome Badge, like Failed (danger) or Paid (success). It joins the sentence. */
  status?: { label: string; tone?: BadgeTone };
  /** Comments show Reply when onReply is set; set false to hide it on one event. */
  canReply?: boolean;
}

/** Controlled filter value. Empty arrays mean no filter on that axis. */
export interface ActivityFeedFilters {
  types: ActivityEventType[];
  /** Actor ids. */
  people: string[];
}

/** One step an agent took, for variant="agent". The row is a sentence, a meta line and a reason. */
export interface ActivityAgentEvent {
  id: string;
  /** When, as epoch ms or an ISO string. */
  at: number | string;
  /** The agent. Shows as the Avatar marker on the rail. */
  actor: { id: string; name: string; initials?: string };
  /** The step as one sentence: "Sent reminder for INV-1842 to Northwind". Text, or inline nodes (a mono id). */
  sentence: ReactNode;
  /** agent · app · task · who allowed it: "Collections agent · Gmail · Overdue follow-up · On its own". */
  meta: string;
  /** Why the agent did it, one plain line. */
  reason?: string;
  /** The step can still be undone until `until`: an sm Undo Button and a mono deadline. */
  undo?: { until: number | string; onUndo: () => void };
  /** undone: struck sentence and an Undone Badge. final: a Lock Badge Final. Pair either with note. */
  state?: "undone" | "final";
  /** With state: who undid it and what that changed, or what to do instead of undoing. */
  note?: string;
}

/** feed: workspace activity with Avatars, Type and Person filters, Open and Reply. history: one record's
 *  events on a rail with a time column and a status word, like an invoice's history. agent: an agent's
 *  steps on the rail with Avatar markers, Undo, Undone and Final, and no built-in filters. */
export type ActivityFeedVariant = "feed" | "history" | "agent";

/** Root attributes the block sets itself. */
type ActivityFeedOwnedKeys = "children" | "aria-labelledby" | "title";

/** Props every variant shares. `ref`, `className` and other native attributes land on the root `<section>`. */
interface ActivityFeedBaseProps extends Omit<ComponentPropsWithoutRef<"section">, ActivityFeedOwnedKeys> {
  /** Controlled filters. */
  filters?: ActivityFeedFilters;
  /** Uncontrolled starting filters. */
  defaultFilters?: ActivityFeedFilters;
  onFiltersChange?: (filters: ActivityFeedFilters) => void;
  /** Open an event's object. Each event gets an Open button when set. */
  onOpen?: (eventId: string) => void;
  /** Reply to a comment event. Comment events get a Reply button when set. */
  onReply?: (eventId: string) => void;
  /** Fetch the next page. The Load more button shows when this is set and hasMore is true. */
  onLoadMore?: () => void;
  hasMore?: boolean;
  /** A page is loading: Skeleton rows (the whole feed when there are no events yet). */
  loading?: boolean;
  /** Clock for Today / Yesterday. Defaults to the time of render. */
  now?: number;
  /** BCP 47 locale for dates and times. Default en-GB. */
  locale?: string;
  /** IANA time zone for day groups and times. Default the viewer's own. */
  timeZone?: string;
  title?: string;
  /** Line under the title. Default: how many events show. */
  description?: string;
  /** Status words to filter on, like Created, Sent, Paid. Shows All plus one chip each (kit SegmentedControl, sm). */
  statusChips?: string[];
  /** Controlled chip: a status word, or null for All. Matches event.status.label. */
  statusChip?: string | null;
  onStatusChipChange?: (chip: string | null) => void;
  /** The events could not load: the reason, shown under "Couldn't load activity". */
  error?: string;
  /** Retry after an error. Shows an outline Retry button. */
  onRetry?: () => void;
  ref?: Ref<HTMLElement>;
}

/** feed and history: workspace or record events. */
export interface ActivityFeedEventProps extends ActivityFeedBaseProps {
  /** feed (default) or history. */
  variant?: "feed" | "history";
  /** Loaded events, any order; the feed shows newest first, grouped by day. */
  events: ActivityEvent[];
}

/** agent: an agent's steps. Filters, status chips, Open and Reply don't apply; the page supplies a FilterBar. */
export interface ActivityFeedAgentProps extends ActivityFeedBaseProps {
  variant: "agent";
  /** Loaded steps, any order; shown newest first, grouped by day. */
  events: ActivityAgentEvent[];
}

export type ActivityFeedProps = ActivityFeedEventProps | ActivityFeedAgentProps;

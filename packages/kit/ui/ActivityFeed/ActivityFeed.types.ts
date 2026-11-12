import type { ComponentPropsWithoutRef, Ref } from "react";
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

/** Root attributes the block sets itself. */
type ActivityFeedOwnedKeys = "children" | "aria-labelledby" | "title";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface ActivityFeedProps extends Omit<ComponentPropsWithoutRef<"section">, ActivityFeedOwnedKeys> {
  /** Loaded events, any order; the feed shows newest first, grouped by day. */
  events: ActivityEvent[];
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
  ref?: Ref<HTMLElement>;
}

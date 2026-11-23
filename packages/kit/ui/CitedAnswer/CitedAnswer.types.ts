import type { ComponentPropsWithoutRef, Ref } from "react";

export interface Citation {
  /** The mark number as written in the content, e.g. "1" for [1]. */
  id: string;
  title: string;
  href?: string;
  /** Where it came from, e.g. "docs.example.com/billing/rounding" or "repo · src/billing". */
  origin?: string;
  snippet?: string;
  /** The source could not be found: the mark reads "[n] missing" and the list opens on first render. */
  missing?: boolean;
  /** Why it is missing. */
  missingReason?: string;
}

/** Native article attributes the kit sets itself (or replaces with its own prop). */
type CitedAnswerOwnedKeys = "children" | "content";

/** `ref`, `className` and other native attributes land on the root `<article>`. */
export interface CitedAnswerProps extends Omit<ComponentPropsWithoutRef<"article">, CitedAnswerOwnedKeys> {
  /** The reply text. Marks like [1] become citation links. */
  content: string;
  citations: Citation[];
  /** Default "Assistant". */
  author?: string;
  /** e.g. "14:02" */
  time?: string;
  /** Sources list open (controlled). */
  openSources?: boolean;
  onOpenSourcesChange?: (open: boolean) => void;
  /** A mark was clicked; the source list opens and highlights it. */
  onCitationClick?: (id: string) => void;
  loading?: boolean;
  /** Loading line, e.g. "Reading 3 sources…". */
  loadingText?: string;
  error?: string;
  onRetry?: () => void;
  /** Shown when citations is []. Default "No sources. Check before you act on this."; "" hides it. */
  emptyText?: string;
  ref?: Ref<HTMLElement>;
}

import type { ComponentPropsWithoutRef, Ref } from "react";

export interface CommentAuthor {
  id: string;
  name: string;
  /** Two letters for the kit Avatar; derived from the name when omitted. */
  initials?: string;
  avatarSrc?: string;
}

export interface ThreadComment {
  id: string;
  author: CommentAuthor;
  /** Display time, e.g. "2h". */
  createdAt: string;
  body: string;
  edited?: boolean;
  /** Replies nest one level under the comment they answer. */
  parentId?: string;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type CommentThreadOwnedKeys = "children" | "title" | "aria-labelledby" | "onSubmit";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface CommentThreadProps extends Omit<ComponentPropsWithoutRef<"section">, CommentThreadOwnedKeys> {
  /** What the thread is about, e.g. "Invoice INV-2026-0117". Omit to hide the header (inside CommentsPanel). */
  title?: string;
  comments: ThreadComment[];
  /** The signed-in user: their comments get Edit and Delete. */
  currentUserId?: string;
  /** Composer text (controlled). */
  value: string;
  onValueChange: (value: string) => void;
  /** Post the composer text. Comment is the solid primary; ⌘/Ctrl+Enter posts too. */
  onSubmit: () => void;
  /** Comment button look. Default "solid"; "soft" when another solid primary shares the view. */
  submitAppearance?: "solid" | "soft";
  /** Posting: the button reads "Sending…" and the composer is busy. */
  submitting?: boolean;
  /** Reply to a comment: focus moves to the composer. */
  onReply?: (id: string) => void;
  onEdit?: (id: string, body: string) => void;
  /** Delete one of your comments. Confirms with a kit AlertDialog first. */
  onDelete?: (id: string) => void;
  /** Composer placeholder. Default "Reply or @mention…". */
  placeholder?: string;
  /** Composer and thread names for assistive tech. Default "Comments". */
  label?: string;
  /** Empty state title. Pass "" to show only the composer (a page-level note inside CommentsPanel). */
  emptyTitle?: string;
  emptyDescription?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  ref?: Ref<HTMLElement>;
}

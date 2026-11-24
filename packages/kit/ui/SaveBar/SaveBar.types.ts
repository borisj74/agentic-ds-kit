import type { ComponentPropsWithoutRef, Ref } from "react";

/** saved: nothing to save. dirty: unsaved changes. error: the last Save failed or fields need fixing. */
export type SaveBarState = "saved" | "dirty" | "error";

/** Native div attributes the kit sets itself. */
type SaveBarOwnedKeys = "children" | "role";

/** `ref`, `className` and other native attributes land on the root `<div role="region">`. */
export interface SaveBarProps extends Omit<ComponentPropsWithoutRef<"div">, SaveBarOwnedKeys> {
  /** Default "dirty". */
  state?: SaveBarState;
  /** Names of the changed fields, e.g. ["Legal name", "Invoice currency"]. Their count makes the dirty status line. */
  changes?: string[];
  /** When it was last saved, pre-formatted, e.g. "10:42" or "Nov 14 by Maya Chen". */
  savedAt?: string;
  /**
   * The status line in your words. Replaces the default ("2 unsaved changes", "Saved at 10:42", "Not saved").
   * Set it in the error state to say what to fix, e.g. "Not saved · 1 field to fix", or to translate.
   */
  message?: string;
  /** Renders an outline Discard Button. Hidden in the saved state. */
  onDiscard?: () => void;
  /** The solid primary Save Button. Disabled in the saved state. */
  onSave: () => void;
  /** Default "Save changes". Also names the region. */
  saveLabel?: string;
  /** Default "Discard". Use "Cancel" when leaving the page is the outcome. */
  discardLabel?: string;
  /** The save request is running: Save shows its spinner and ignores clicks. */
  saving?: boolean;
  ref?: Ref<HTMLDivElement>;
}

import type { KeyboardEvent } from "react";

const CONTROL = "button, a, input, textarea, select, [role='radio'], [role='checkbox'], [role='option'], [contenteditable='true']";

/**
 * The review cards' and blocks' one key rule: ⌘/Ctrl+Enter is the yes, Escape the no. Plain Enter
 * never says yes. Escape only counts when focus is in the card but not on another control, so Esc
 * on a button, a field or a radio never decides for the person. Returns true when it handled the key.
 */
export function handleReviewKeys(
  event: KeyboardEvent<HTMLElement>,
  { onYes, onNo }: { onYes?: () => void; onNo?: () => void },
): boolean {
  if (event.defaultPrevented) return false;
  if (event.key === "Enter" && (event.metaKey || event.ctrlKey) && onYes) {
    event.preventDefault();
    onYes();
    return true;
  }
  if (event.key === "Escape" && onNo) {
    const target = event.target as HTMLElement;
    if (target !== event.currentTarget && target.closest?.(CONTROL)) return false;
    event.preventDefault();
    onNo();
    return true;
  }
  return false;
}

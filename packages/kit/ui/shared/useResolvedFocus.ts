import { useEffect, useRef, type FocusEvent } from "react";

/**
 * Keeps focus with the person when a card swaps itself for a one-line resolved row
 * (ApprovalCard, PermissionRequest): if focus was inside the open card, the row takes it.
 */
export function useResolvedFocus(resolved: boolean) {
  const rowRef = useRef<HTMLElement | null>(null);
  const hadFocus = useRef(false);

  useEffect(() => {
    if (resolved && hadFocus.current) {
      hadFocus.current = false;
      rowRef.current?.focus();
    }
  }, [resolved]);

  return {
    rowRef,
    onFocusCapture: () => {
      hadFocus.current = true;
    },
    onBlurCapture: (event: FocusEvent<HTMLElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) hadFocus.current = false;
    },
  };
}

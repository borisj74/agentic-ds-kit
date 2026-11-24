/*
 * Page lock for the modal overlays (Modal, AlertDialog, Drawer): the page behind turns inert,
 * scrolling stops without the page shifting (the scrollbar's width is kept as padding), and focus
 * goes back to the opener, or to the page heading or <main> when the opener is gone.
 */

// Tabbable controls only: links with href, enabled form controls, and positive or zero tabindex.
export const FOCUSABLE =
  "a[href], button:not(:disabled), input:not(:disabled):not([type='hidden']), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])";

/** First tabbable control in the overlay's body (not Close in the header), else null. */
export function firstBodyFocusable(root: HTMLElement): HTMLElement | null {
  const body = root.querySelector<HTMLElement>("[data-part='body']");
  return body?.querySelector<HTMLElement>(FOCUSABLE) ?? null;
}

/** Locks scrolling and makes everything in <body> except `keep` inert. Returns the undo. */
export function lockPage(keep: HTMLElement | null, { scroll = true, inert = true } = {}): () => void {
  const undo: Array<() => void> = [];
  const body = document.body;

  if (scroll) {
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    if (gutter > 0) {
      const current = parseFloat(getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${current + gutter}px`;
    }
    body.style.overflow = "hidden";
    undo.push(() => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    });
  }

  if (inert && keep) {
    for (const child of Array.from(body.children)) {
      if (child === keep || child.contains(keep) || child.hasAttribute("inert")) continue;
      if (child.tagName === "SCRIPT" || child.tagName === "STYLE") continue;
      child.setAttribute("inert", "");
      undo.push(() => child.removeAttribute("inert"));
    }
  }

  return () => {
    for (let i = undo.length - 1; i >= 0; i -= 1) undo[i]();
  };
}

/** Focus back to `previous` if it is still in the page, else the page heading or <main>. */
export function restoreFocus(previous: HTMLElement | null) {
  // Nothing was focused when the overlay opened: leave focus where the browser puts it.
  if (!previous || previous === document.body) return;
  if (previous.isConnected) {
    previous.focus();
    return;
  }
  const fallback = document.querySelector<HTMLElement>("main h1, h1") ?? document.querySelector<HTMLElement>("main");
  if (!fallback) return;
  if (!fallback.hasAttribute("tabindex")) fallback.setAttribute("tabindex", "-1");
  fallback.focus();
}

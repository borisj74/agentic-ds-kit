"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { OverlayFooter, OverlayHeader } from "../ModalCard/ModalCardParts";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import type { DrawerProps } from "./Drawer.types";
import styles from "./Drawer.module.css";
import { useIsClient } from "../shared/useIsClient";
import { useThemeScopeMarker } from "../shared/themeScope";
import { DrawerBodyContext } from "../shared/drawerContext";
import { nisthaAttr } from "../shared/inspect";
import { FOCUSABLE, firstBodyFocusable, lockPage, restoreFocus } from "../shared/overlayLock";

export type { DrawerProps, DrawerSide, DrawerSize } from "./Drawer.types";

const SIZE_CLASS = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
} as const;

export function Drawer({
  open,
  title,
  description,
  eyebrow,
  tone,
  side = "right",
  size = "md",
  showClose = true,
  onClose,
  children,
  footer,
  footerStart,
  className,
  ref,
  ...rest
}: DrawerProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const setPanelRef = useMemo(() => mergeRefs(panelRef, ref), [ref]);
  const onCloseRef = useRef(onClose);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const mounted = useIsClient();
  const scope = useThemeScopeMarker();

  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const root = panelRef.current;
    if (!root) return;

    const getFocusable = () => Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
    // The first field in the body, not Close; with no field the panel itself takes focus.
    (firstBodyFocusable(root) ?? root).focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // A nested overlay (Select, DatePicker) already handled this Escape.
        if (event.defaultPrevented) return;
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const items = getFocusable();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const inside = active instanceof Node && root.contains(active);

      if (event.shiftKey) {
        if (!inside || active === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (!inside || active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const unlock = lockPage(overlayRef.current);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      unlock();
      // The opener may have unmounted while open; then the page heading or main takes focus.
      restoreFocus(previousFocusRef.current);
    };
  }, [open, mounted]);

  if (!open) return null;
  if (!mounted) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className={[styles.overlay, scope.fontClassName].filter(Boolean).join(" ")}
      data-theme-scope={scope.id}
      data-theme={scope.mode === "dark" ? "dark" : undefined}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target !== event.currentTarget) return;
        // Keep the browser from moving focus to <body> after the cleanup restores it.
        event.preventDefault();
        onClose();
      }}
    >
      <div
        {...rest}
        {...nisthaAttr("drawer", rest)}
        ref={setPanelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cx(styles.panel, styles[side], SIZE_CLASS[size], className)}
        tabIndex={-1}
      >
        <OverlayHeader
          className={styles.header}
          title={title}
          titleId={titleId}
          description={description}
          descriptionId={descriptionId}
          eyebrow={eyebrow}
          tone={tone}
          onClose={showClose ? onClose : undefined}
        />
        <div className={styles.body} data-part="body">
          <DrawerBodyContext.Provider value>{children}</DrawerBodyContext.Provider>
        </div>
        {footer || footerStart ? (
          <div className={styles.footer}>
            <OverlayFooter footer={footer} footerStart={footerStart} />
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

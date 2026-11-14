"use client";

import { useCallback, useId, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent } from "react";
import { createPortal } from "react-dom";
import { cx } from "../shared/cx";
import { useIsClient } from "../shared/useIsClient";
import { useThemeScopeMarker } from "../shared/themeScope";
import type { ContextMenuItem, ContextMenuProps } from "./ContextMenu.types";
import styles from "./ContextMenu.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { ContextMenuItem, ContextMenuProps } from "./ContextMenu.types";

function place(x: number, y: number, panel: HTMLElement): { top: number; left: number } {
  const margin = 8;
  const rect = panel.getBoundingClientRect();
  const maxLeft = Math.max(margin, window.innerWidth - rect.width - margin);
  const maxTop = Math.max(margin, window.innerHeight - rect.height - margin);
  return {
    left: Math.min(Math.max(x, margin), maxLeft),
    top: Math.min(Math.max(y, margin), maxTop),
  };
}

export function ContextMenu({ items, onSelect, children, ariaLabel = "Actions", className }: ContextMenuProps) {
  const scope = useThemeScopeMarker();
  const menuId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const mounted = useIsClient();
  const [open, setOpen] = useState(false);
  const [point, setPoint] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(0);
  const enabled = items.filter((item) => !item.disabled);

  const close = useCallback(() => setOpen(false), []);

  function openAt(x: number, y: number) {
    setPoint({ x, y });
    setActive(0);
    setOpen(true);
  }

  useLayoutEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const box = place(point.x, point.y, panel);
    panel.style.left = `${box.left}px`;
    panel.style.top = `${box.top}px`;
    panel.querySelector<HTMLElement>("[data-active='true']")?.focus();
  }, [open, point, active]);

  useLayoutEffect(() => {
    if (!open) return undefined;
    function onPointerDown(event: PointerEvent) {
      if (!panelRef.current?.contains(event.target as Node)) close();
    }
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      close();
    }
    document.addEventListener("pointerdown", onPointerDown);
    // Capture phase: runs before a parent Modal/Drawer listener, which then skips the prevented Escape.
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open, close]);

  function choose(item: ContextMenuItem) {
    if (item.disabled) return;
    onSelect?.(item.id);
    close();
  }

  function onMenuKey(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => (index + 1) % Math.max(enabled.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => (index - 1 + enabled.length) % Math.max(enabled.length, 1));
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(Math.max(enabled.length - 1, 0));
    }
  }

  function onContextMenu(event: ReactMouseEvent<HTMLDivElement>) {
    event.preventDefault();
    openAt(event.clientX, event.clientY);
  }

  const menu =
    open && mounted
      ? createPortal(
          <div
            ref={panelRef}
            id={menuId}
            role="menu"
            aria-label={ariaLabel}
            data-theme-scope={scope.id}
            data-theme={scope.mode === "dark" ? "dark" : undefined}
            className={cx(styles.menu, className, scope.fontClassName)}
            onKeyDown={onMenuKey}
          >
            {items.map((item) => {
              const index = enabled.findIndex((entry) => entry.id === item.id);
              const isActive = index === active && !item.disabled;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  className={styles.item}
                  data-danger={item.danger || undefined}
                  data-active={isActive || undefined}
                  aria-disabled={item.disabled || undefined}
                  tabIndex={isActive ? 0 : -1}
                  onMouseEnter={() => {
                    if (!item.disabled && index >= 0) setActive(index);
                  }}
                  onClick={() => choose(item)}
                >
                  <span>{item.label}</span>
                  {item.shortcut ? <span className={styles.shortcut}>{item.shortcut}</span> : null}
                </button>
              );
            })}
          </div>,
          document.body,
        )
      : null;

  return (
    <div {...nisthaAttr("contextmenu")}
      className={styles.target}
      onContextMenu={onContextMenu}
      onKeyDown={(event) => {
        if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
          event.preventDefault();
          const rect = event.currentTarget.getBoundingClientRect();
          openAt(rect.left, rect.bottom);
        }
      }}
    >
      {children}
      {menu}
    </div>
  );
}

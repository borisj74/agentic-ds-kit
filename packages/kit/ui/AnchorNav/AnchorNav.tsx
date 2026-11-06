"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cx } from "../shared/cx";
import { useOverlayDismiss } from "../shared/useOverlayDismiss";
import type { AnchorNavItem, AnchorNavProps } from "./AnchorNav.types";
import styles from "./AnchorNav.module.css";

export type { AnchorNavItem, AnchorNavProps, AnchorNavVariant } from "./AnchorNav.types";

function scrollableParent(element: HTMLElement): HTMLElement | null {
  let node = element.parentElement;
  while (node) {
    const style = getComputedStyle(node);
    if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight) return node;
    node = node.parentElement;
  }
  return null;
}

function jumpTo(id: string, offset: number) {
  const target = document.getElementById(id);
  if (!target) return;
  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  const parent = scrollableParent(target);
  if (parent) {
    const top = target.getBoundingClientRect().top - parent.getBoundingClientRect().top + parent.scrollTop - offset;
    parent.scrollTo({ top, behavior });
  } else {
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior });
  }
  if (target.tabIndex < 0) target.tabIndex = -1;
  target.focus({ preventScroll: true });
}

function useCurrentSection(items: AnchorNavItem[], spy: boolean, offset: number) {
  const [current, setCurrent] = useState(items[0]?.id ?? "");
  const key = items.map((item) => item.id).join("\u0000");

  useEffect(() => {
    if (!spy) return undefined;
    const nodes = key
      .split("\u0000")
      .filter(Boolean)
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node instanceof HTMLElement);
    if (nodes.length === 0) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const next = visible[0]?.target.id;
        if (next) setCurrent(next);
      },
      { root: null, rootMargin: `-${offset}px 0px -55% 0px`, threshold: [0, 0.1, 0.5] },
    );
    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [key, offset, spy]);

  const active = items.some((item) => item.id === current) ? current : (items[0]?.id ?? "");
  return [active, setCurrent] as const;
}

function onListKeyDown(event: KeyboardEvent<HTMLElement>) {
  const links = Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>("a"));
  if (links.length === 0) return;
  const index = links.findIndex((link) => link === document.activeElement);
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    const delta = event.key === "ArrowDown" ? 1 : -1;
    const next = links[(index + delta + links.length) % links.length];
    next?.focus();
  } else if (event.key === "Home") {
    event.preventDefault();
    links[0]?.focus();
  } else if (event.key === "End") {
    event.preventDefault();
    links.at(-1)?.focus();
  }
}

function AnchorLinks({
  items,
  active,
  onJump,
}: {
  items: AnchorNavItem[];
  active: string;
  onJump: (id: string) => void;
}) {
  return (
    <ul className={styles.list}>
      {items.map((item) => {
        const current = item.id === active;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={styles.link}
              aria-current={current ? "location" : undefined}
              onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                event.preventDefault();
                onJump(item.id);
              }}
            >
              <span className={styles.caret} aria-hidden>
                {current ? <ChevronRight size={16} /> : null}
              </span>
              {item.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function AnchorNav({
  items,
  variant = "rail",
  spy = true,
  offset = 0,
  ariaLabel = "On this page",
  menuLabel = "On this page",
  className,
}: AnchorNavProps) {
  const [active, setActive] = useCurrentSection(items, spy, offset);
  const go = useCallback(
    (id: string) => {
      setActive(id);
      jumpTo(id, offset);
    },
    [offset, setActive],
  );

  if (variant === "menu") {
    return (
      <AnchorMenu
        items={items}
        active={active}
        ariaLabel={ariaLabel}
        menuLabel={menuLabel}
        className={className}
        onJump={go}
      />
    );
  }

  return (
    <nav className={cx(styles.rail, className)} aria-label={ariaLabel} onKeyDown={onListKeyDown}>
      <AnchorLinks items={items} active={active} onJump={go} />
    </nav>
  );
}

function AnchorMenu({
  items,
  active,
  ariaLabel,
  menuLabel,
  className,
  onJump,
}: {
  items: AnchorNavItem[];
  active: string;
  ariaLabel: string;
  menuLabel: string;
  className?: string;
  onJump: (id: string) => void;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const current = items.find((item) => item.id === active);
  const close = useCallback((reason: "escape" | "outside") => {
    setOpen(false);
    if (reason === "escape") rootRef.current?.querySelector("button")?.focus();
  }, []);
  useOverlayDismiss(open, rootRef, close);

  useEffect(() => {
    if (!open) return;
    const currentLink =
      rootRef.current?.querySelector<HTMLElement>("[aria-current='location']") ??
      rootRef.current?.querySelector<HTMLElement>("a");
    currentLink?.focus();
  }, [open]);

  return (
    <div ref={rootRef} className={cx(styles.menuRoot, className)}>
      <button
        type="button"
        className={styles.menuTrigger}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={current ? `${ariaLabel}, ${current.label}` : ariaLabel}
        onClick={() => setOpen((was) => !was)}
      >
        <span className={styles.menuLabel}>{current?.label ?? menuLabel}</span>
        <ChevronDown size={16} aria-hidden />
      </button>
      {open ? (
        <nav id={listId} className={styles.menu} aria-label={ariaLabel} onKeyDown={onListKeyDown}>
          <AnchorLinks
            items={items}
            active={active}
            onJump={(id) => {
              onJump(id);
              setOpen(false);
            }}
          />
        </nav>
      ) : null}
    </div>
  );
}

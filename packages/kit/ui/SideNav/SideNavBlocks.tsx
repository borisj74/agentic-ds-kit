"use client";

import {
  Children,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { Button } from "../Button";
import { LucideByName } from "../Button/lucideName";
import { Tooltip } from "../Tooltip";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import { SideNavContext, useSideNav, type SideNavContextValue } from "./SideNavContext";
import type {
  SideNavBrandProps,
  SideNavFooterProps,
  SideNavHeaderProps,
  SideNavItemProps,
  SideNavNavProps,
  SideNavRootProps,
  SideNavSectionProps,
  SideNavSlotProps,
  SideNavToggleProps,
} from "./SideNav.types";
import styles from "./SideNav.module.css";

const ICON_SIZE = 16;

/* ---------- Root ---------- */

/** `<aside>` + panel. Owns open/closed state; every block below reads it from context. */
export function SideNavRoot({
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  side = "left",
  radius = "md",
  children,
  className,
  ref,
  ...rest
}: SideNavRootProps) {
  const isControlled = typeof openProp === "boolean";
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = isControlled ? openProp : uncontrolledOpen;
  const rootRef = useRef<HTMLElement | null>(null);
  const label = rest["aria-label"];

  const context = useMemo<SideNavContextValue>(() => {
    function setOpen(next: boolean) {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    }
    return { open, rail: !open, setOpen, toggle: () => setOpen(!open), side, label, rootRef };
  }, [open, isControlled, onOpenChange, side, label]);

  return (
    <SideNavContext.Provider value={context}>
      <aside
        {...rest}
        ref={mergeRefs(rootRef, ref)}
        className={cx(styles.root, radius === "none" && styles.radiusNone, !open && styles.rootClosed, className)}
        data-side={side}
      >
        <div className={styles.panel}>{children}</div>
      </aside>
    </SideNavContext.Provider>
  );
}

/* ---------- Header ---------- */

/** Top bar. With a `SideNav.Toggle` as a direct child, everything else in it fades on the closed rail. */
export function SideNavHeader({ className, children, ref, ...rest }: SideNavHeaderProps) {
  return (
    <header {...rest} ref={ref} className={cx(styles.header, className)}>
      {children}
    </header>
  );
}

/* ---------- Brand ---------- */

/**
 * Mark + title, inside `SideNav.Header`. The mark stays on the closed rail and reopens it;
 * a `SideNav.Toggle` beside it steps aside there instead of moving to the start edge.
 */
export function SideNavBrand({
  title,
  mark,
  openLabel = "Open",
  onClick,
  className,
  ref,
  ...rest
}: SideNavBrandProps) {
  const { open, setOpen } = useSideNav();
  const hasMark = mark !== undefined && mark !== null && mark !== false && mark !== "";
  const markContent = hasMark ? mark : (typeof title === "string" && title.charAt(0)) || "·";
  return (
    <>
      <button
        {...rest}
        ref={ref}
        type="button"
        className={cx(styles.mark, styles.markButton, className)}
        aria-label={open ? undefined : openLabel}
        aria-hidden={open ? true : undefined}
        tabIndex={open ? -1 : 0}
        disabled={open}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented && !open) setOpen(true);
        }}
      >
        {markContent}
      </button>
      <p className={styles.title}>{title}</p>
    </>
  );
}

/* ---------- Toggle ---------- */

/** Closes the open rail; reopens the closed one from the rail's start edge. */
export function SideNavToggle({
  closeLabel = "Close",
  openLabel = "Open",
  onClick,
  className,
  ref,
  ...rest
}: SideNavToggleProps) {
  const { open, side, toggle } = useSideNav();
  const right = side === "right";
  const icon = open
    ? right
      ? "PanelRightClose"
      : "PanelLeftClose"
    : right
      ? "PanelRightOpen"
      : "PanelLeftOpen";

  return (
    <span className={styles.toggle}>
      <Button
        {...rest}
        ref={ref}
        className={className}
        variant="tertiary"
        size="sm"
        iconStart={icon}
        ariaLabel={open ? closeLabel : openLabel}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) toggle();
        }}
      />
    </span>
  );
}

/* ---------- Slot ---------- */

/** Pinned content above or below the scrolling nav. Faded and inert on the closed rail unless keepOnRail. */
export function SideNavSlot({
  placement = "before",
  keepOnRail = false,
  className,
  children,
  ref,
  ...rest
}: SideNavSlotProps) {
  const { rail } = useSideNav();
  const hidden = rail && !keepOnRail;
  return (
    <div
      {...rest}
      ref={ref}
      className={cx(
        styles.slot,
        placement === "after" ? styles.slotAfter : styles.slotBefore,
        keepOnRail && styles.slotKeep,
        className,
      )}
      {...(hidden ? { inert: true } : {})}
    >
      {children}
    </div>
  );
}

/* ---------- Nav ---------- */

/** The scrolling `<nav>` landmark. */
export function SideNavNav({ className, children, ref, ...rest }: SideNavNavProps) {
  const context = useContext(SideNavContext);
  return (
    <nav aria-label={context?.label} {...rest} ref={ref} className={cx(styles.nav, className)}>
      {children}
    </nav>
  );
}

/* ---------- Section ---------- */

/** Optional caption plus the list of rows. */
export function SideNavSection({ label, className, children, ref, ...rest }: SideNavSectionProps) {
  return (
    <div {...rest} ref={ref} className={cx(styles.section, className)}>
      {label ? <p className={styles.sectionLabel}>{label}</p> : null}
      <ul className={styles.list}>{children}</ul>
    </div>
  );
}

/** Internal: bare list (preset flat items and footer rows). */
export function SideNavList({ children }: { children: ReactNode }) {
  return <ul className={styles.list}>{children}</ul>;
}

/* ---------- Footer ---------- */

/** Bottom bar: a `SideNav.Section` of rows or any node. */
export function SideNavFooter({ className, children, ref, ...rest }: SideNavFooterProps) {
  return (
    <div {...rest} ref={ref} className={cx(styles.footer, className)}>
      {children}
    </div>
  );
}

/* ---------- Item ---------- */

function ItemBody({
  label,
  icon,
  badge,
  nested,
  expanded,
}: {
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
  nested: boolean;
  expanded?: boolean;
}) {
  return (
    <>
      {icon ? (
        <span className={styles.icon} aria-hidden>
          {typeof icon === "string" ? <LucideByName name={icon} size={ICON_SIZE} /> : icon}
        </span>
      ) : null}
      <span className={styles.label}>{label}</span>
      {badge || nested ? (
        <span className={styles.meta}>
          {badge ? <span className={styles.badge}>{badge}</span> : null}
          {nested ? (
            <span className={`${styles.chevron} ${expanded ? styles.chevronOpen : ""}`}>
              <LucideByName name="ChevronRight" size={ICON_SIZE} />
            </span>
          ) : null}
        </span>
      ) : null}
    </>
  );
}

/** Internal props: the preset passes `wrap` to apply `renderItem` to the row control. */
interface ItemImplProps extends SideNavItemProps {
  wrap?: (control: ReactElement) => ReactNode;
}

export function SideNavItemImpl({
  label,
  icon,
  badge,
  active,
  disabled,
  href,
  onClick,
  children,
  defaultExpanded = true,
  wrap,
  className: userClassName,
  ref,
  ...rest
}: ItemImplProps) {
  const { rail, side, rootRef } = useSideNav();
  const nested = Children.toArray(children).length > 0;
  const submenuId = useId();
  const [expanded, setExpanded] = useState(nested && defaultExpanded);
  const submenuOpen = expanded && !rail;
  const controlRef = useRef<HTMLElement | null>(null);
  const [tipStyle, setTipStyle] = useState<CSSProperties | undefined>(undefined);

  const className = cx(
    styles.item,
    active && styles.itemActive,
    disabled && styles.itemDisabled,
    userClassName,
  );
  const current = active ? ("page" as const) : undefined;
  const controlRefs = mergeRefs<HTMLElement>(controlRef, ref);
  const body = <ItemBody label={label} icon={icon} badge={badge} nested={nested} expanded={submenuOpen} />;

  let control: ReactElement;

  if (nested) {
    control = (
      <button
        {...rest}
        ref={controlRefs}
        type="button"
        className={className}
        disabled={disabled}
        aria-expanded={submenuOpen}
        aria-controls={submenuId}
        aria-current={current}
        onClick={() => {
          if (!rail) setExpanded((value) => !value);
        }}
      >
        {body}
      </button>
    );
  } else if (onClick && !disabled) {
    control = (
      <button {...rest} ref={controlRefs} type="button" className={className} aria-current={current} onClick={onClick}>
        {body}
      </button>
    );
  } else if (href && !disabled) {
    control = (
      <a {...rest} ref={controlRefs} href={href} className={className} aria-current={current}>
        {body}
      </a>
    );
  } else {
    control = (
      <button
        {...rest}
        ref={controlRefs}
        type="button"
        className={className}
        disabled={disabled}
        aria-current={current}
      >
        {body}
      </button>
    );
  }

  // Closed rail: labels are clipped, so the kit Tooltip names the row. The rail clips
  // overflow, so the bubble is fixed to the viewport just outside the rail's edge.
  function placeTip() {
    const root = rootRef.current?.getBoundingClientRect();
    const row = controlRef.current?.getBoundingClientRect();
    if (!root || !row) return;
    const top = row.top + row.height / 2;
    setTipStyle(
      side === "right"
        ? { position: "fixed", top, left: "auto", right: `calc(${window.innerWidth - root.left}px + var(--space-inline-sm))` }
        : { position: "fixed", top, left: `calc(${root.right}px + var(--space-inline-sm))` },
    );
  }

  const row = rail ? (
    <Tooltip content={label} placement={side === "right" ? "left" : "right"} style={tipStyle}>
      {control}
    </Tooltip>
  ) : (
    control
  );

  return (
    <li
      className={styles.entry}
      onPointerEnter={rail ? placeTip : undefined}
      onFocus={rail ? placeTip : undefined}
    >
      {wrap ? wrap(row as ReactElement) : row}
      {nested ? (
        <div className={`${styles.submenuSlot} ${submenuOpen ? "" : styles.submenuSlotClosed}`.trim()}>
          <ul className={styles.submenu} id={submenuId}>
            {children}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

/** One row: icon, label, badge; `active` → aria-current="page"; nested `SideNav.Item` children → disclosure. */
export function SideNavItem(props: SideNavItemProps) {
  return <SideNavItemImpl {...props} />;
}


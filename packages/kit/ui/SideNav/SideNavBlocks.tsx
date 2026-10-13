"use client";

import {
  Children,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { Avatar } from "../Avatar";
import { Button } from "../Button";
import { LucideByName, isKitIcon, type KitIcon } from "../Button/lucideName";
import { Tooltip } from "../Tooltip";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import { useInDrawer } from "../shared/drawerContext";
import { SideNavContext, useSideNav, type SideNavContextValue } from "./SideNavContext";
import type {
  SideNavAccountProps,
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

interface FocusRequest {
  /** The open state the user asked for. */
  open: boolean;
  /** What had focus when they asked (the pressed control, or body after a pointer press in Safari). */
  origin: Element | null;
}

/**
 * Hidden on the closed rail by SideNav.module.css: inside an inert slot, a Toggle beside a
 * SideNav.Brand, or header content other than the Toggle, mark and title. Mirrors the CSS
 * rather than reading computed visibility, which flips only after the fade-out.
 */
function hiddenOnRail(element: Element): boolean {
  if (element.closest("[inert]")) return true;
  const header = element.closest(`.${styles.header}`);
  if (!header) return false;
  const child = Array.from(header.children).find((node) => node.contains(element));
  if (!child) return false;
  const hasToggle = header.querySelector(`:scope > .${styles.toggle}`) !== null;
  const hasMark = header.querySelector(`:scope > .${styles.markButton}`) !== null;
  if (child.classList.contains(styles.toggle)) return hasMark;
  return (
    hasToggle &&
    !child.classList.contains(styles.markButton) &&
    !child.classList.contains(styles.title)
  );
}

/**
 * Closed rail: labels are clipped, so the kit Tooltip names the row. The rail clips
 * overflow, so the bubble is fixed to the viewport just outside the rail's edge.
 */
function useRailTip(anchor: { current: HTMLElement | null }) {
  const { side, rootRef } = useSideNav();
  const [tipStyle, setTipStyle] = useState<CSSProperties | undefined>(undefined);
  function placeTip() {
    const root = rootRef.current?.getBoundingClientRect();
    const row = anchor.current?.getBoundingClientRect();
    if (!root || !row) return;
    const top = row.top + row.height / 2;
    setTipStyle(
      side === "right"
        ? { position: "fixed", top, left: "auto", right: `calc(${window.innerWidth - root.left}px + var(--space-inline-sm))` }
        : { position: "fixed", top, left: `calc(${root.right}px + var(--space-inline-sm))` },
    );
  }
  return { tipStyle, placeTip, placement: side === "right" ? ("left" as const) : ("right" as const) };
}

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
  // Inside a kit Drawer the nav fills the Drawer and is always open (no rail to collapse to).
  const inDrawer = useInDrawer();
  const open = inDrawer || (isControlled ? openProp : uncontrolledOpen);
  const rootRef = useRef<HTMLElement | null>(null);
  const focusRequest = useRef<FocusRequest | null>(null);
  const label = rest["aria-label"];

  const context = useMemo<SideNavContextValue>(() => {
    function setOpen(next: boolean, options?: { focus?: boolean }) {
      const request = options?.focus ? { open: next, origin: document.activeElement } : null;
      focusRequest.current = request;
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
      // A controlled parent may ignore the request; drop it so a later programmatic
      // change doesn't move focus. A request that was applied is handled by then.
      if (request) {
        setTimeout(() => {
          if (focusRequest.current === request) focusRequest.current = null;
        });
      }
    }
    return {
      open,
      rail: !open,
      setOpen,
      toggle: (options) => setOpen(!open, options),
      side,
      label,
      rootRef,
    };
  }, [open, isControlled, onOpenChange, side, label]);

  // A user open or close (mark or Toggle) keeps keyboard focus in the rail. Layout effect, so
  // it runs in the same commit, before setOpen's timeout drops an ignored request.
  // Open: focus the Toggle ("Close") if there is one, else the first nav row; the mark that
  // was pressed is disabled once open. Close: if the control that had focus is hidden on the
  // closed rail (the Toggle beside a Brand), focus the mark ("Open"), else the visible Toggle.
  useLayoutEffect(() => {
    const request = focusRequest.current;
    focusRequest.current = null;
    const root = rootRef.current;
    if (!request || request.open !== open || !root) return;
    if (open) {
      const target =
        root.querySelector<HTMLElement>(`.${styles.toggle} button:not(:disabled)`) ??
        root.querySelector<HTMLElement>(
          `.${styles.nav} :is(a[href], button:not(:disabled)):not([tabindex="-1"])`,
        );
      target?.focus();
      return;
    }
    const origin = request.origin;
    const lost = !origin || origin === document.body || !origin.isConnected;
    if (!lost && (!root.contains(origin) || !hiddenOnRail(origin))) return;
    const target =
      root.querySelector<HTMLElement>(`.${styles.markButton}:not(:disabled)`) ??
      Array.from(root.querySelectorAll<HTMLElement>(`.${styles.toggle} button:not(:disabled)`)).find(
        (button) => !hiddenOnRail(button),
      );
    target?.focus();
  }, [open]);

  return (
    <SideNavContext.Provider value={context}>
      <aside
        {...rest}
        ref={mergeRefs(rootRef, ref)}
        className={cx(
          styles.root,
          radius === "none" && styles.radiusNone,
          !open && styles.rootClosed,
          inDrawer && styles.inDrawer,
          className,
        )}
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
  markIcon,
  openLabel = "Open",
  onClick,
  className,
  ref,
  ...rest
}: SideNavBrandProps) {
  const { open, setOpen } = useSideNav();
  const hasMark = mark !== undefined && mark !== null && mark !== false && mark !== "";
  const markContent = markIcon ? (
    <LucideByName name={markIcon} size={ICON_SIZE} />
  ) : hasMark ? (
    mark
  ) : (
    (typeof title === "string" && title.charAt(0)) || "·"
  );
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
          if (!event.defaultPrevented && !open) setOpen(true, { focus: true });
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
          if (!event.defaultPrevented) toggle({ focus: true });
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
  icon?: KitIcon | ReactNode;
  badge?: ReactNode;
  nested: boolean;
  expanded?: boolean;
}) {
  return (
    <>
      {icon ? (
        <span className={styles.icon} aria-hidden>
          {isKitIcon(icon) ? <LucideByName name={icon} size={ICON_SIZE} /> : icon}
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
  const { rail } = useSideNav();
  const nested = Children.toArray(children).length > 0;
  const submenuId = useId();
  const [expanded, setExpanded] = useState(nested && defaultExpanded);
  const submenuOpen = expanded && !rail;
  const controlRef = useRef<HTMLElement | null>(null);
  const { tipStyle, placeTip, placement } = useRailTip(controlRef);

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

  const row = rail ? (
    <Tooltip content={label} placement={placement} style={tipStyle}>
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


/* ---------- Account ---------- */

/**
 * The signed-in user: Avatar, name, secondary line, optional trailing action. On the closed
 * rail only the avatar shows (on the icon axis), named by a tooltip; the action is inert there.
 */
export function SideNavAccount({
  name,
  secondary,
  src,
  initials,
  action,
  className,
  ref,
  ...rest
}: SideNavAccountProps) {
  const { rail } = useSideNav();
  const avatarRef = useRef<HTMLSpanElement | null>(null);
  const { tipStyle, placeTip, placement } = useRailTip(avatarRef);
  // The visible name (kept in the tree on the rail) names the block, so the avatar is decorative.
  const avatar = (
    <span ref={avatarRef} className={styles.accountAvatar} aria-hidden>
      <Avatar name={name} src={src} initials={initials} size="sm" />
    </span>
  );
  return (
    <div
      {...rest}
      ref={ref}
      className={cx(styles.account, className)}
      onPointerEnter={rail ? placeTip : undefined}
    >
      {rail ? (
        <Tooltip content={name} placement={placement} style={tipStyle}>
          {avatar}
        </Tooltip>
      ) : (
        avatar
      )}
      <span className={styles.accountText}>
        <span className={styles.accountName} title={name}>
          {name}
        </span>
        {secondary ? (
          <span className={styles.accountSecondary} title={secondary}>
            {secondary}
          </span>
        ) : null}
      </span>
      {action ? (
        <span className={styles.accountAction} {...(rail ? { inert: true } : {})}>
          <Button
            variant="tertiary"
            size="sm"
            iconStart={action.icon ?? "LogOut"}
            ariaLabel={action.label}
            title={action.label}
            onClick={action.onClick}
          />
        </span>
      ) : null}
    </div>
  );
}

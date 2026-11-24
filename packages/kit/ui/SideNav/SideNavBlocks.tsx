"use client";

import {
  Children,
  isValidElement,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { Avatar } from "../Avatar";
import { Button } from "../Button";
import { Count } from "../Count";
import { LucideByName, isKitIcon, type KitIcon } from "../Button/lucideName";
import { Tooltip } from "../Tooltip";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import { useInDrawer } from "../shared/drawerContext";
import { placeFloating, tokenPx } from "../shared/placeFloating";
import { useThemeScopeMarker } from "../shared/themeScope";
import { useIsClient } from "../shared/useIsClient";
import { useOverlayDismiss } from "../shared/useOverlayDismiss";
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
import { nisthaAttr } from "../shared/inspect";

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
 * Closed rail: labels are clipped, so the kit Tooltip names the row. Tooltip is portaled and
 * placed by the shared helper, so the rail's overflow never clips it; it opens on the outer side.
 */
function useRailTip() {
  const { side } = useSideNav();
  return { placement: side === "right" ? ("left" as const) : ("right" as const) };
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
        {...nisthaAttr("sidenav")}
        ref={mergeRefs(rootRef, ref)}
        className={cx(
          styles.root,
          radius === "none" && styles.radiusNone,
          !open && styles.rootClosed,
          inDrawer && styles.inDrawer,
          className,
        )}
        data-side={side}
        onKeyDown={(event) => {
          rest.onKeyDown?.(event);
          onRowKeyDown(event, rootRef.current);
        }}
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
        appearance="ghost" mode="neutral"
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

/** A badge that is a count: a number, or a string of digits. */
function badgeCount(badge: ReactNode): number | null {
  if (typeof badge === "number" && Number.isFinite(badge)) return badge;
  if (typeof badge === "string" && /^\d+$/.test(badge.trim())) return Number(badge.trim());
  return null;
}

function ItemBody({
  label,
  icon,
  badge,
  nested,
  expanded,
  current,
  disabled,
}: {
  label: string;
  icon?: KitIcon | ReactNode;
  badge?: ReactNode;
  nested: boolean;
  expanded?: boolean;
  /** The row shows the page-active fill: its Count takes the brand tint. */
  current?: boolean;
  disabled?: boolean;
}) {
  const count = badgeCount(badge);
  const hasBadge = badge !== undefined && badge !== null && badge !== false && badge !== "";
  return (
    <>
      {icon ? (
        <span className={styles.icon} aria-hidden>
          {isKitIcon(icon) ? <LucideByName name={icon} size={ICON_SIZE} /> : icon}
        </span>
      ) : null}
      <span className={styles.label}>{label}</span>
      {hasBadge || nested ? (
        <span className={styles.meta}>
          {count !== null ? (
            <Count count={count} intent={current ? "info" : "neutral"} size="md" subtle disabled={disabled} />
          ) : hasBadge ? (
            <span className={styles.badge}>{badge}</span>
          ) : null}
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

/** Row controls a key can move to: in the tree, not disabled, not in an inert or closed submenu. */
function visibleRows(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(`.${styles.item}`)).filter(
    (row) =>
      !(row as HTMLButtonElement).disabled &&
      !row.closest("[inert]") &&
      !row.closest(`.${styles.submenuSlotClosed}`),
  );
}

/** Up, Down, Home and End move focus through `rows`. Returns true when it handled the key. */
function moveFocus(key: string, rows: HTMLElement[], current: Element | null): boolean {
  if (rows.length === 0) return false;
  const index = rows.indexOf(current as HTMLElement);
  let next: HTMLElement | undefined;
  if (key === "ArrowDown") next = rows[index < 0 ? 0 : Math.min(index + 1, rows.length - 1)];
  else if (key === "ArrowUp") next = rows[index < 0 ? 0 : Math.max(index - 1, 0)];
  else if (key === "Home") next = rows[0];
  else if (key === "End") next = rows[rows.length - 1];
  else return false;
  next?.focus();
  return true;
}

/**
 * Arrow keys on the rows of a SideNav.Root: Up and Down move through visible rows (top level, open
 * submenus, footer), Home and End jump to the ends, Left on a nested row goes to its parent. A parent
 * row handles Right and Left itself (open, close, first child) before this runs.
 */
function onRowKeyDown(event: ReactKeyboardEvent<HTMLElement>, root: HTMLElement | null) {
  if (event.defaultPrevented || !root || event.altKey || event.ctrlKey || event.metaKey) return;
  const target = event.target as HTMLElement;
  // Keys inside a portaled flyout bubble through React to here; the flyout handles its own.
  if (!root.contains(target) || !target.classList.contains(styles.item)) return;
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    const back = (event.key === "ArrowLeft") !== (getComputedStyle(root).direction === "rtl");
    const submenu = target.closest(`.${styles.submenu}`);
    if (back && submenu) {
      const parent = submenu.closest(`.${styles.entry}`)?.querySelector<HTMLElement>(`.${styles.item}`);
      if (parent) {
        event.preventDefault();
        parent.focus();
      }
    }
    return;
  }
  if (moveFocus(event.key, visibleRows(root), target)) event.preventDefault();
}

/**
 * Closed-rail flyout: a parent row's nested rows in a panel just outside the rail edge, built on
 * useOverlayDismiss (Escape and outside press close it, newest overlay first). Opens on click or
 * Right, focuses the first row; Up/Down/Home/End move, Left or Escape close it and return focus to
 * the parent; Tab closes it and moves on from the parent; picking a row closes it.
 */
function RailFlyout({
  id,
  label,
  anchorRef,
  controlRef,
  onClose,
  children,
}: {
  id: string;
  label: string;
  anchorRef: RefObject<HTMLLIElement | null>;
  controlRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  children: ReactNode;
}) {
  const context = useSideNav();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const headingId = useId();
  const scope = useThemeScopeMarker();
  const placement = context.side === "right" ? ("left" as const) : ("right" as const);

  const close = (focusParent: boolean) => {
    onClose();
    if (focusParent) controlRef.current?.focus();
  };

  useOverlayDismiss(true, anchorRef, (reason) => close(reason === "escape"), panelRef);

  useLayoutEffect(() => {
    const anchor = controlRef.current;
    const panel = panelRef.current;
    if (!anchor || !panel) return;
    // Next to the parent's icon chip (the rail's visible edge), not the clipped full-width row.
    const rail = context.rootRef.current?.getBoundingClientRect();
    const row = anchor.getBoundingClientRect();
    const space = tokenPx("--space-2", 8);
    const trigger = rail
      ? { top: row.top, bottom: row.bottom, height: row.height, left: rail.left, right: rail.right, width: rail.width }
      : row;
    const box = placeFloating(placement, trigger, { width: panel.offsetWidth, height: panel.offsetHeight }, {
      align: "start",
      gap: space,
      margin: space,
    });
    panel.style.top = `${box.top}px`;
    panel.style.left = `${box.left}px`;
    panel.querySelector<HTMLElement>(`.${styles.item}:not(:disabled)`)?.focus();
    // Placed and focused once when it opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flyoutContext = useMemo<SideNavContextValue>(
    () => ({ ...context, open: true, rail: false }),
    [context],
  );

  return createPortal(
    <div
      ref={panelRef}
      id={id}
      role="group"
      aria-labelledby={headingId}
      data-theme-scope={scope.id}
      data-theme={scope.mode === "dark" ? "dark" : undefined}
      className={cx(styles.flyout, scope.fontClassName)}
      onKeyDown={(event) => {
        const panel = panelRef.current;
        if (!panel || event.defaultPrevented) return;
        const back = context.side === "right" ? "ArrowRight" : "ArrowLeft";
        if (event.key === back) {
          event.preventDefault();
          close(true);
        } else if (event.key === "Tab") {
          // Focus goes back to the parent first, so Tab carries on from there in the rail.
          close(true);
        } else if (moveFocus(event.key, visibleRows(panel), document.activeElement)) {
          event.preventDefault();
        }
      }}
      onClick={(event) => {
        const control = (event.target as HTMLElement).closest("a[href], button:not(:disabled)");
        if (control && panelRef.current?.contains(control)) close(true);
      }}
    >
      <p id={headingId} className={styles.flyoutLabel}>
        {label}
      </p>
      <SideNavContext.Provider value={flyoutContext}>
        <ul className={styles.list}>{children}</ul>
      </SideNavContext.Provider>
    </div>,
    document.body,
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
  expanded: expandedProp,
  onExpandedChange,
  wrap,
  className: userClassName,
  onKeyDown: userKeyDown,
  ref,
  ...rest
}: ItemImplProps) {
  const { rail } = useSideNav();
  const nested = Children.toArray(children).length > 0;
  const submenuId = useId();
  const flyoutId = useId();
  const isControlled = typeof expandedProp === "boolean";
  const [expandedState, setExpandedState] = useState(nested && defaultExpanded);
  const expanded = isControlled ? expandedProp : expandedState;
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const mounted = useIsClient();
  const submenuOpen = expanded && !rail;
  const showFlyout = nested && rail && flyoutOpen && mounted && !disabled;
  const controlRef = useRef<HTMLElement | null>(null);
  const entryRef = useRef<HTMLLIElement | null>(null);
  const { placement } = useRailTip();

  // A parent row holds the current page when one of its nested rows is active.
  const holdsCurrent =
    nested &&
    Children.toArray(children).some(
      (child) => isValidElement<{ active?: boolean }>(child) && Boolean(child.props.active),
    );

  // The flyout belongs to the closed rail: opening the rail closes it.
  const [wasRail, setWasRail] = useState(rail);
  if (wasRail !== rail) {
    setWasRail(rail);
    if (!rail && flyoutOpen) setFlyoutOpen(false);
  }

  function setExpanded(next: boolean) {
    if (!isControlled) setExpandedState(next);
    onExpandedChange?.(next);
  }

  const className = cx(
    styles.item,
    active && !nested && styles.itemActive,
    holdsCurrent && styles.itemHoldsCurrent,
    disabled && styles.itemDisabled,
    userClassName,
  );
  const current = active ? ("page" as const) : undefined;
  const controlRefs = mergeRefs<HTMLElement>(controlRef, ref);
  const body = (
    <ItemBody
      label={label}
      icon={icon}
      badge={badge}
      nested={nested}
      expanded={submenuOpen}
      current={Boolean(active) && !nested}
      disabled={disabled}
    />
  );

  let control: ReactElement;

  if (nested) {
    control = (
      <button
        {...rest}
        ref={controlRefs}
        type="button"
        className={className}
        disabled={disabled}
        aria-expanded={rail ? showFlyout : submenuOpen}
        aria-controls={rail ? (showFlyout ? flyoutId : undefined) : submenuId}
        aria-current={current}
        onClick={() => {
          if (rail) setFlyoutOpen((value) => !value);
          else setExpanded(!expanded);
        }}
        onKeyDown={(event) => {
          userKeyDown?.(event);
          if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
          const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
          const forward = rtl ? "ArrowLeft" : "ArrowRight";
          const back = rtl ? "ArrowRight" : "ArrowLeft";
          if (event.key === forward) {
            event.preventDefault();
            if (rail) setFlyoutOpen(true);
            else if (!expanded) setExpanded(true);
            else entryRef.current?.querySelector<HTMLElement>(`.${styles.submenu} .${styles.item}:not(:disabled)`)?.focus();
          } else if (event.key === back) {
            event.preventDefault();
            if (rail) setFlyoutOpen(false);
            else if (expanded) setExpanded(false);
          }
        }}
      >
        {body}
      </button>
    );
  } else if (onClick && !disabled) {
    control = (
      <button
        {...rest}
        ref={controlRefs}
        type="button"
        className={className}
        aria-current={current}
        onClick={onClick}
        onKeyDown={userKeyDown}
      >
        {body}
      </button>
    );
  } else if (href && !disabled) {
    control = (
      <a {...rest} ref={controlRefs} href={href} className={className} aria-current={current} onKeyDown={userKeyDown}>
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
        onKeyDown={userKeyDown}
      >
        {body}
      </button>
    );
  }

  const count = badgeCount(badge);
  const tip = count !== null && count > 0 ? `${label}, ${count}` : label;
  // The open flyout already names the parent, so its tooltip steps aside (disabled, not unmounted,
  // so the parent control keeps focus).
  const row = rail ? (
    <Tooltip content={tip} placement={placement} disabled={showFlyout}>
      {control}
    </Tooltip>
  ) : (
    control
  );

  return (
    <li ref={entryRef} className={styles.entry}>
      {wrap ? wrap(row as ReactElement) : row}
      {nested ? (
        <div
          className={`${styles.submenuSlot} ${submenuOpen ? "" : styles.submenuSlotClosed}`.trim()}
          {...(submenuOpen ? {} : { inert: true })}
        >
          <ul className={styles.submenu} id={submenuId}>
            {children}
          </ul>
        </div>
      ) : null}
      {showFlyout ? (
        <RailFlyout
          id={flyoutId}
          label={label}
          anchorRef={entryRef}
          controlRef={controlRef}
          onClose={() => setFlyoutOpen(false)}
        >
          {children}
        </RailFlyout>
      ) : null}
    </li>
  );
}

/** One row: icon, label, badge; `active` → aria-current="page"; nested `SideNav.Item` children → disclosure. */
export function SideNavItem({ renderControl, ...props }: SideNavItemProps) {
  return <SideNavItemImpl {...props} wrap={renderControl} />;
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
  const { placement } = useRailTip();
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
    >
      {rail ? (
        <Tooltip content={name} placement={placement}>
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
            appearance="ghost" mode="neutral"
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

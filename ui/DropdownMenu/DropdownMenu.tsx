"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Checkbox } from "@/ui/Checkbox";
import { Input } from "@/ui/Input";
import { LucideByName } from "@/ui/Button/lucideName";
import type { DropdownMenuGroup, DropdownMenuItem, DropdownMenuProps } from "./DropdownMenu.types";
import styles from "./DropdownMenu.module.css";

export type {
  DropdownMenuProps,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuAlign,
  DropdownMenuTriggerStyle,
} from "./DropdownMenu.types";

function flattenItems(groups: DropdownMenuGroup[]): DropdownMenuItem[] {
  return groups.flatMap((group) => group.items);
}

export function DropdownMenu({
  trigger,
  triggerStyle = "button",
  iconStart,
  iconEnd,
  id,
  disabled = false,
  error = false,
  describedBy,
  ariaLabel,
  variant = "secondary",
  size = "md",
  align = "start",
  columns = 1,
  groups,
  open: openProp,
  onOpenChange,
  onSelect,
  closeOnSelect = true,
  triggerMuted = false,
  triggerBadge,
  searchable = false,
  searchPlaceholder = "Search",
}: DropdownMenuProps) {
  const isControlled = typeof openProp === "boolean";
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = isControlled ? openProp : uncontrolledOpen;
  const uid = useId();
  const menuId = `${uid}-menu`;
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const subPanelRef = useRef<HTMLDivElement>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [openSubId, setOpenSubId] = useState<string | null>(null);
  const [coords, setCoords] = useState<CSSProperties | null>(null);
  const [subCoords, setSubCoords] = useState<CSSProperties | null>(null);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const searchId = `${uid}-search`;

  const visibleGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.label.toLowerCase().includes(q)),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, query]);

  const mainItems = useMemo(() => flattenItems(visibleGroups), [visibleGroups]);
  const enabledIds = useMemo(
    () => mainItems.filter((item) => !item.disabled).map((item) => item.id),
    [mainItems],
  );
  const activeId =
    highlightId && enabledIds.includes(highlightId) ? highlightId : (enabledIds[0] ?? null);
  const activeItem = mainItems.find((item) => item.id === activeId) ?? null;
  const subGroups = mainItems.find((item) => item.id === openSubId)?.submenu;
  const subItems = subGroups ? flattenItems(subGroups) : [];
  const subEnabledIds = subItems.filter((item) => !item.disabled).map((item) => item.id);

  function setOpen(next: boolean) {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
    if (!next) {
      setHighlightId(null);
      setOpenSubId(null);
      setQuery("");
    }
  }

  function triggerButton(): HTMLButtonElement | null {
    return rootRef.current?.querySelector("button") ?? null;
  }

  function queryItem(root: HTMLElement | null, id: string): HTMLElement | null {
    const escaped = typeof CSS !== "undefined" && CSS.escape ? CSS.escape(id) : id;
    return root?.querySelector<HTMLElement>(`[data-id="${escaped}"]`) ?? null;
  }

  function placePanel() {
    const button = triggerButton();
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const next: CSSProperties = {
      top: rect.bottom + 4,
    };
    if (columns === 2) {
      next.minWidth = "28rem";
    } else if (triggerStyle === "field") {
      next.minWidth = rect.width;
    } else {
      next.minWidth = Math.max(216, rect.width);
    }
    if (align === "end") {
      next.right = window.innerWidth - rect.right;
      next.left = "auto";
    } else {
      next.left = rect.left;
      next.right = "auto";
    }
    setCoords(next);
  }

  function placeSubPanel(id: string) {
    const el = queryItem(panelRef.current, id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next: CSSProperties = { top: rect.top, minWidth: 160 };
    if (window.innerWidth - rect.right < 168) {
      next.right = window.innerWidth - rect.left + 4;
      next.left = "auto";
    } else {
      next.left = rect.right + 4;
      next.right = "auto";
    }
    setSubCoords(next);
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    const button = triggerButton();
    if (!button) return;
    button.setAttribute("aria-haspopup", "menu");
    button.setAttribute("aria-expanded", open ? "true" : "false");
    button.setAttribute("aria-controls", menuId);
  }, [open, menuId]);

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    placePanel();
  }, [open, align, size, triggerStyle, columns]);

  useLayoutEffect(() => {
    if (!open || !openSubId) {
      setSubCoords(null);
      return;
    }
    placeSubPanel(openSubId);
  }, [open, openSubId, coords]);

  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        rootRef.current?.contains(target) ||
        panelRef.current?.contains(target) ||
        subPanelRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    function onDocumentKey(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (openSubId) {
          setOpenSubId(null);
          if (activeId) queryItem(panelRef.current, activeId)?.focus();
          return;
        }
        setOpen(false);
        triggerButton()?.focus();
      }
    }

    function onReposition() {
      placePanel();
      if (openSubId) placeSubPanel(openSubId);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onDocumentKey);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onDocumentKey);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, align, size, columns, openSubId, activeId]);

  useEffect(() => {
    if (!open || !mounted) return;
    if (searchable) {
      panelRef.current?.querySelector<HTMLInputElement>("input")?.focus();
      return;
    }
    const item = panelRef.current?.querySelector<HTMLElement>("[role='menuitem'][data-enabled='true'], [role='menuitemcheckbox'][data-enabled='true']");
    item?.focus();
  }, [open, mounted, coords, searchable]);

  function findItem(id: string): DropdownMenuItem | undefined {
    return mainItems.find((item) => item.id === id) ?? subItems.find((item) => item.id === id);
  }

  function select(id: string) {
    const item = findItem(id);
    if (!item || item.disabled || item.submenu) return;
    onSelect?.(id);
    if (!closeOnSelect) return;
    setOpen(false);
    triggerButton()?.focus();
  }

  function highlight(id: string) {
    const item = mainItems.find((entry) => entry.id === id);
    if (!item || item.disabled) return;
    setHighlightId(id);
    setOpenSubId(item.submenu ? id : null);
  }

  function move(delta: number) {
    if (enabledIds.length === 0) return;
    const current = activeId ? enabledIds.indexOf(activeId) : -1;
    const next = (current + delta + enabledIds.length) % enabledIds.length;
    highlight(enabledIds[next]);
    queryItem(panelRef.current, enabledIds[next])?.focus();
  }

  function onMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const inSearch = event.target instanceof HTMLInputElement;
    if (inSearch) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (enabledIds[0]) {
          highlight(enabledIds[0]);
          queryItem(panelRef.current, enabledIds[0])?.focus();
        }
      }
      if (event.key === "Tab") setOpen(false);
      if (event.key === "Enter") event.preventDefault();
      return;
    }
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        move(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        move(-1);
        break;
      case "ArrowRight":
        if (activeItem?.submenu) {
          event.preventDefault();
          setOpenSubId(activeItem.id);
          const first = flattenItems(activeItem.submenu).find((item) => !item.disabled);
          if (first) {
            requestAnimationFrame(() => queryItem(subPanelRef.current, first.id)?.focus());
          }
        }
        break;
      case "Home":
        event.preventDefault();
        if (enabledIds[0]) {
          highlight(enabledIds[0]);
          queryItem(panelRef.current, enabledIds[0])?.focus();
        }
        break;
      case "End":
        event.preventDefault();
        if (enabledIds[enabledIds.length - 1]) {
          const last = enabledIds[enabledIds.length - 1];
          highlight(last);
          queryItem(panelRef.current, last)?.focus();
        }
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  }

  function onSubKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const current = document.activeElement instanceof HTMLElement ? document.activeElement.dataset.id : null;
    const index = current ? subEnabledIds.indexOf(current) : -1;
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        if (subEnabledIds.length === 0) return;
        const next = (index + 1 + subEnabledIds.length) % subEnabledIds.length;
        queryItem(subPanelRef.current, subEnabledIds[next])?.focus();
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        if (subEnabledIds.length === 0) return;
        const next = (index - 1 + subEnabledIds.length) % subEnabledIds.length;
        queryItem(subPanelRef.current, subEnabledIds[next])?.focus();
        break;
      }
      case "ArrowLeft":
        event.preventDefault();
        setOpenSubId(null);
        if (openSubId) queryItem(panelRef.current, openSubId)?.focus();
        break;
      case "Escape":
        event.preventDefault();
        setOpenSubId(null);
        if (openSubId) queryItem(panelRef.current, openSubId)?.focus();
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  }

  function renderItems(list: DropdownMenuGroup[], inSubmenu: boolean): ReactNode {
    return list.map((group, groupIndex) => (
      <div
        key={group.heading ?? `group-${groupIndex}`}
        className={styles.group}
        role="group"
        aria-label={group.heading}
      >
        {group.heading ? <div className={styles.heading}>{group.heading}</div> : null}
        {group.items.map((item) => {
          const highlighted = !inSubmenu && item.id === activeId;
          const hasSub = Boolean(item.submenu && item.submenu.length > 0);
          const asLink = Boolean(item.href) && !item.disabled && !hasSub;
          const className = [
            styles.item,
            highlighted || openSubId === item.id ? styles.itemHighlighted : "",
            item.disabled ? styles.itemDisabled : "",
            item.danger ? styles.itemDanger : "",
            item.description ? styles.itemWithDescription : "",
          ]
            .filter(Boolean)
            .join(" ");
          const showCheck = typeof item.selected === "boolean" && !item.checkbox;
          const body = (
            <>
              {item.checkbox ? (
                <span className={styles.itemCheckbox} inert aria-hidden>
                  <Checkbox
                    id={`${uid}-cb-${item.id}`}
                    size="sm"
                    checked={Boolean(item.selected)}
                    ariaLabel={item.label}
                    onChange={() => {}}
                  />
                </span>
              ) : showCheck ? (
                item.selected ? (
                  <LucideByName name="Check" size={16} className={styles.itemCheck} />
                ) : (
                  <span className={styles.itemCheck} />
                )
              ) : item.icon ? (
                <LucideByName name={item.icon} size={16} className={styles.itemIcon} />
              ) : null}
              <span className={styles.itemText}>
                <span className={styles.itemLabel}>{item.label}</span>
                {item.description ? (
                  <span className={styles.itemDescription}>{item.description}</span>
                ) : null}
              </span>
              {item.shortcut ? <span className={styles.shortcut}>{item.shortcut}</span> : null}
              {hasSub ? <LucideByName name="ChevronRight" size={16} className={styles.itemChevron} /> : null}
            </>
          );
          const shared = {
            className,
            role: (item.checkbox ? "menuitemcheckbox" : "menuitem") as "menuitem" | "menuitemcheckbox",
            "data-id": item.id,
            "data-enabled": item.disabled ? "false" : "true",
            "aria-checked": item.checkbox ? Boolean(item.selected) : undefined,
            "aria-disabled": item.disabled || undefined,
            "aria-haspopup": hasSub ? ("menu" as const) : undefined,
            "aria-expanded": hasSub ? openSubId === item.id : undefined,
            tabIndex: highlighted ? 0 : -1,
            onMouseEnter: () => {
              if (item.disabled) return;
              if (inSubmenu) return;
              highlight(item.id);
            },
            onClick: () => {
              if (hasSub) {
                setOpenSubId(item.id);
                return;
              }
              select(item.id);
            },
          };
          if (asLink) {
            return (
              <a key={item.id} href={item.href} {...shared}>
                {body}
              </a>
            );
          }
          return (
            <button key={item.id} type="button" {...shared}>
              {body}
            </button>
          );
        })}
      </div>
    ));
  }

  const hasLabel = Boolean(trigger && trigger.trim());

  const panelClass = [
    styles.panel,
    columns === 2 ? styles.panelColumns : "",
    searchable ? styles.panelSearchable : "",
  ]
    .filter(Boolean)
    .join(" ");


  const panel =
    open && mounted && coords
      ? createPortal(
          <div
            ref={panelRef}
            id={menuId}
            role="menu"
            aria-label={ariaLabel || trigger || "Menu"}
            className={panelClass}
            style={coords}
            onKeyDown={onMenuKeyDown}
          >
            {searchable ? (
              <div className={styles.search}>
                <Input
                  id={searchId}
                  size="sm"
                  type="search"
                  iconStart="Search"
                  placeholder={searchPlaceholder}
                  value={query}
                  onChange={setQuery}
                  ariaLabel="Search options"
                />
              </div>
            ) : null}
            {visibleGroups.length === 0 ? (
              <div className={styles.empty}>No results.</div>
            ) : (
              renderItems(visibleGroups, false)
            )}
          </div>,
          document.body,
        )
      : null;

  const subPanel =
    open && mounted && openSubId && subGroups && subCoords
      ? createPortal(
          <div
            ref={subPanelRef}
            role="menu"
            aria-label={mainItems.find((item) => item.id === openSubId)?.label || "Submenu"}
            className={styles.panel}
            style={subCoords}
            onKeyDown={onSubKeyDown}
            onMouseEnter={() => setOpenSubId(openSubId)}
          >
            {renderItems(subGroups, true)}
          </div>,
          document.body,
        )
      : null;

  const fieldTrigger = triggerStyle === "field";
  const navTrigger = triggerStyle === "nav";
  const iconPx = size === "sm" ? 14 : size === "lg" ? 18 : 16;

  return (
    <div ref={rootRef} className={`${styles.root}${fieldTrigger ? ` ${styles.rootField}` : ""}`}>
      {fieldTrigger ? (
        <button
          type="button"
          id={id}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-invalid={error || undefined}
          aria-describedby={describedBy}
          className={`${styles.fieldTrigger} ${styles[`field${size}`]}${error ? ` ${styles.fieldError}` : ""}${triggerMuted ? ` ${styles.fieldMuted}` : ""}`}
          onClick={() => {
            if (!disabled) setOpen(!open);
          }}
        >
          <span className={styles.fieldMain}>
            <span className={styles.fieldLabel}>{trigger || "Select"}</span>
            {triggerBadge ? (
              <Badge size="sm" tone="neutral">
                {triggerBadge}
              </Badge>
            ) : null}
          </span>
          <LucideByName name={iconEnd || "ChevronsUpDown"} size={iconPx} className={styles.fieldIcon} />
        </button>
      ) : navTrigger ? (
        <button
          type="button"
          id={id}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          className={`${styles.navTrigger}${open ? ` ${styles.navOpen}` : ""}`}
          onClick={() => {
            if (!disabled) setOpen(!open);
          }}
        >
          {hasLabel ? trigger : null}
          <LucideByName name="ChevronDown" size={14} className={styles.navChevron} />
        </button>
      ) : (
        <Button
          variant={variant}
          size={size}
          iconStart={iconStart}
          iconEnd={iconEnd}
          ariaLabel={hasLabel ? undefined : ariaLabel}
          onClick={() => setOpen(!open)}
        >
          {hasLabel ? trigger : undefined}
        </Button>
      )}
      {panel}
      {subPanel}
    </div>
  );
}

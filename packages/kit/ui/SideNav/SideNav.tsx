"use client";

import { isValidElement, type ReactNode } from "react";
import { Button } from "../Button";
import type { SideNavItemData, SideNavProps, SideNavRenderItem } from "./SideNav.types";
import {
  SideNavFooter,
  SideNavHeader,
  SideNavItem as SideNavItemBlock,
  SideNavItemImpl,
  SideNavList,
  SideNavNav,
  SideNavRoot,
  SideNavSection,
  SideNavSlot,
  SideNavToggle,
} from "./SideNavBlocks";
import { useSideNav } from "./SideNavContext";
import styles from "./SideNav.module.css";

export type {
  SideNavGroup,
  SideNavItemData,
  SideNavProps,
  SideNavRadius,
  SideNavRenderItem,
  SideNavSide,
} from "./SideNav.types";

/** Preset row from data: the `SideNav.Item` block, with `renderItem` applied to its control. */
function DataItem({ item, renderItem }: { item: SideNavItemData; renderItem?: SideNavRenderItem }) {
  return (
    <SideNavItemImpl
      label={item.label}
      icon={item.icon}
      badge={item.badge}
      active={item.active}
      disabled={item.disabled}
      href={item.href}
      onClick={item.onClick ? () => item.onClick!() : undefined}
      wrap={renderItem ? (control) => renderItem(item, control) : undefined}
    >
      {item.items && item.items.length > 0
        ? item.items.map((child) => <DataItem key={child.id} item={child} renderItem={renderItem} />)
        : null}
    </SideNavItemImpl>
  );
}

function DataList({ items, renderItem }: { items: SideNavItemData[]; renderItem?: SideNavRenderItem }) {
  return (
    <SideNavList>
      {items.map((item) => (
        <DataItem key={item.id} item={item} renderItem={renderItem} />
      ))}
    </SideNavList>
  );
}

/** Preset brand: the mark (reopens the closed rail) and the title. */
function PresetBrand({ title, mark }: { title: string; mark?: string }) {
  const { open, setOpen } = useSideNav();
  const markLetter = (mark && mark.length > 0 ? mark : title.charAt(0)) || "·";
  return (
    <>
      <button
        type="button"
        className={`${styles.mark} ${styles.markButton}`}
        aria-label={open ? undefined : "Open"}
        aria-hidden={open ? true : undefined}
        tabIndex={open ? -1 : 0}
        disabled={open}
        onClick={() => {
          if (!open) setOpen(true);
        }}
      >
        {markLetter}
      </button>
      <p className={styles.title}>{title}</p>
    </>
  );
}

/** Preset Close: hidden on the closed rail, where the mark reopens instead. */
function PresetClose() {
  const { open, side, setOpen } = useSideNav();
  return (
    <span className={styles.close} {...(!open ? { inert: true } : {})}>
      <Button
        variant="tertiary"
        size="sm"
        iconStart={side === "right" ? "PanelRightClose" : "PanelLeftClose"}
        ariaLabel="Close"
        onClick={() => setOpen(false)}
      />
    </span>
  );
}

/** Custom `header` slot wrapper: faded and inert on the closed rail. */
function PresetHeaderSlot({ children }: { children: ReactNode }) {
  const { rail } = useSideNav();
  return (
    <div className={styles.headerSlot} {...(rail ? { inert: true } : {})}>
      {children}
    </div>
  );
}

function isNavItem(value: unknown): value is SideNavItemData {
  return (
    typeof value === "object" &&
    value !== null &&
    !isValidElement(value) &&
    typeof (value as SideNavItemData).id === "string" &&
    typeof (value as SideNavItemData).label === "string"
  );
}

/** footer accepts SideNavItemData, SideNavItemData[], or any ReactNode. */
function footerItems(footer: SideNavProps["footer"]): SideNavItemData[] | null {
  if (Array.isArray(footer)) return footer.length > 0 && footer.every(isNavItem) ? footer : null;
  return isNavItem(footer) ? [footer] : null;
}

/**
 * Preset: the data-driven SideNav, assembled from the building blocks
 * (`SideNav.Root`, `.Header`, `.Slot`, `.Nav`, `.Section`, `.Item`, `.Footer`).
 */
function SideNavPreset({
  title,
  mark,
  showHeader = true,
  radius = "md",
  open,
  defaultOpen = true,
  onOpenChange,
  side = "left",
  groups,
  items = [],
  footer,
  header,
  beforeGroups,
  afterGroups,
  renderItem,
  "aria-label": ariaLabel = title,
  ...rest
}: SideNavProps) {
  const useGroups = Boolean(groups && groups.length > 0);
  const footerRows = footerItems(footer);

  return (
    <SideNavRoot
      {...rest}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      side={side}
      radius={radius}
      aria-label={ariaLabel}
    >
      {showHeader ? (
        <SideNavHeader>
          {header !== undefined ? <PresetHeaderSlot>{header}</PresetHeaderSlot> : <PresetBrand title={title} mark={mark} />}
          <PresetClose />
        </SideNavHeader>
      ) : null}

      {beforeGroups ? <SideNavSlot placement="before">{beforeGroups}</SideNavSlot> : null}

      <SideNavNav aria-label={title}>
        {useGroups ? (
          groups!.map((group) => (
            <SideNavSection key={group.label} label={group.label}>
              {group.items.map((item) => (
                <DataItem key={item.id} item={item} renderItem={renderItem} />
              ))}
            </SideNavSection>
          ))
        ) : (
          <DataList items={items} renderItem={renderItem} />
        )}
      </SideNavNav>

      {afterGroups ? <SideNavSlot placement="after">{afterGroups}</SideNavSlot> : null}

      {footer ? (
        <SideNavFooter>
          {footerRows ? <DataList items={footerRows} renderItem={renderItem} /> : (footer as ReactNode)}
        </SideNavFooter>
      ) : null}
    </SideNavRoot>
  );
}

/**
 * `<SideNav title groups … />` is the preset. Build your own with the blocks:
 * `SideNav.Root`, `.Header`, `.Toggle`, `.Slot`, `.Nav`, `.Section`, `.Item`, `.Footer`
 * (also exported by name: `SideNavRoot`, `SideNavHeader`, … — use those from Server Components).
 */
export const SideNav = Object.assign(SideNavPreset, {
  Root: SideNavRoot,
  Header: SideNavHeader,
  Toggle: SideNavToggle,
  Slot: SideNavSlot,
  Nav: SideNavNav,
  Section: SideNavSection,
  Item: SideNavItemBlock,
  Footer: SideNavFooter,
});

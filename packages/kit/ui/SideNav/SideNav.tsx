"use client";

import { isValidElement, type ReactNode } from "react";
import type { SideNavItemData, SideNavProps, SideNavRenderItem } from "./SideNav.types";
import {
  SideNavAccount,
  SideNavBrand,
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
  SideNavAccountAction,
  SideNavAccountProps,
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
 * (`SideNav.Root`, `.Header`, `.Brand`, `.Toggle`, `.Slot`, `.Nav`, `.Section`, `.Item`, `.Footer`).
 */
function SideNavPreset({
  title,
  mark,
  markIcon,
  showHeader = true,
  radius = "md",
  open,
  defaultOpen = true,
  onOpenChange,
  side = "left",
  groups,
  items = [],
  footer,
  account,
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
          {header !== undefined ? (
            <>
              <PresetHeaderSlot>{header}</PresetHeaderSlot>
              <SideNavToggle />
            </>
          ) : (
            <>
              <SideNavBrand title={title} mark={mark || undefined} markIcon={markIcon} />
              <SideNavToggle />
            </>
          )}
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

      {footer || account ? (
        <SideNavFooter>
          {footer ? (
            footerRows ? (
              <DataList items={footerRows} renderItem={renderItem} />
            ) : (
              (footer as ReactNode)
            )
          ) : null}
          {account ? <SideNavAccount {...account} /> : null}
        </SideNavFooter>
      ) : null}
    </SideNavRoot>
  );
}

/**
 * `<SideNav title groups … />` is the preset. Build your own with the blocks:
 * `SideNav.Root`, `.Header`, `.Brand`, `.Toggle`, `.Slot`, `.Nav`, `.Section`, `.Item`, `.Footer`, `.Account`
 * (also exported by name: `SideNavRoot`, `SideNavHeader`, … — use those from Server Components).
 */
export const SideNav = Object.assign(SideNavPreset, {
  Root: SideNavRoot,
  Header: SideNavHeader,
  Brand: SideNavBrand,
  Toggle: SideNavToggle,
  Slot: SideNavSlot,
  Nav: SideNavNav,
  Section: SideNavSection,
  Item: SideNavItemBlock,
  Footer: SideNavFooter,
  Account: SideNavAccount,
});

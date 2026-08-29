"use client";

import { useState } from "react";
import { DropdownMenu } from "@/ui/DropdownMenu";
import type {
  NavigationMenuDropdownItem,
  NavigationMenuItem,
  NavigationMenuProps,
} from "./NavigationMenu.types";
import styles from "./NavigationMenu.module.css";

export type {
  NavigationMenuDropdownItem,
  NavigationMenuItem,
  NavigationMenuLinkItem,
  NavigationMenuProps,
} from "./NavigationMenu.types";

function isDropdown(item: NavigationMenuItem): item is NavigationMenuDropdownItem {
  return "groups" in item && Array.isArray((item as NavigationMenuDropdownItem).groups);
}

export function NavigationMenu({ items, onSelect }: NavigationMenuProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <nav className={styles.root} aria-label="Site">
      {items.map((item) => {
        if (isDropdown(item)) {
          return (
            <DropdownMenu
              key={item.id}
              trigger={item.label}
              triggerStyle="nav"
              groups={item.groups}
              columns={item.columns}
              open={openId === item.id}
              onOpenChange={(next) => setOpenId(next ? item.id : null)}
              onSelect={onSelect}
            />
          );
        }
        return (
          <a
            key={item.id}
            href={item.href}
            className={`${styles.link}${item.active ? ` ${styles.linkActive}` : ""}`}
            aria-current={item.active ? "page" : undefined}
            onClick={() => onSelect?.(item.id)}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}

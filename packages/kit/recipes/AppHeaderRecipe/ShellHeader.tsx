"use client";

import type { ComponentType, ReactNode } from "react";
import { AppHeader } from "../../ui/AppHeader";
import { Button } from "../../ui/Button";

export interface ShellHeaderProps {
  /** Product name: the title and the header landmark label. */
  title?: string;
  /** Brand letter. Defaults to the first character of title. */
  mark?: string;
  /** Your logo; replaces the letter mark. */
  logo?: ReactNode;
  query?: string;
  onQueryChange?: (value: string) => void;
  /** Trailing kit Buttons / Avatar. At most one primary. */
  actions?: ReactNode;
  /**
   * Wraps the brand mark, e.g. `AppShellMenuButton` from your `add app-shell` copy: it shows
   * the brand when wide and the Menu Button that opens the nav Drawer when narrow.
   * Omit it and the header stands alone.
   */
  menuButton?: ComponentType<{ children?: ReactNode }>;
}

/**
 * The AppHeader preset, rebuilt from its blocks so you can rearrange it. It imports only
 * kit components, so it works on its own (a top bar over your page) or inside the
 * app-shell example: `<AppShellPattern header={<ShellHeader menuButton={AppShellMenuButton} />} …>`.
 */
export function ShellHeader({
  title = "Acme",
  mark,
  logo,
  query,
  onQueryChange,
  actions = <Button variant="tertiary" size="sm" iconStart="Bell" ariaLabel="Notifications" />,
  menuButton: MenuButton,
}: ShellHeaderProps) {
  const brand = logo ?? <AppHeader.Mark>{mark ?? title.charAt(0)}</AppHeader.Mark>;

  return (
    <AppHeader.Root ariaLabel={title}>
      <AppHeader.Brand logo={MenuButton ? <MenuButton>{brand}</MenuButton> : brand}>
        <AppHeader.Title>{title}</AppHeader.Title>
      </AppHeader.Brand>
      <AppHeader.Search placeholder="Search" shortcut="⌘K" value={query} onSearch={onQueryChange} />
      <AppHeader.Actions>{actions}</AppHeader.Actions>
    </AppHeader.Root>
  );
}

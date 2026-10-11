"use client";

import type { ReactNode } from "react";
import { AppHeader } from "../../ui/AppHeader";
import { Button } from "../../ui/Button";
import { AppShellMenuButton } from "../../ui/patterns/AppShellPattern";

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
}

/**
 * The AppHeader preset, rebuilt from its blocks so you can rearrange it.
 * Works on its own or as `<AppShellPattern header={<ShellHeader />} …>`: inside the
 * shell, narrow screens swap the mark for the Menu Button that opens the nav Drawer.
 */
export function ShellHeader({
  title = "Acme",
  mark,
  logo,
  query,
  onQueryChange,
  actions = <Button variant="tertiary" size="sm" iconStart="Bell" ariaLabel="Notifications" />,
}: ShellHeaderProps) {
  const brand = logo ?? <AppHeader.Mark>{mark ?? title.charAt(0)}</AppHeader.Mark>;

  return (
    <AppHeader.Root ariaLabel={title}>
      <AppHeader.Brand logo={<AppShellMenuButton>{brand}</AppShellMenuButton>}>
        <AppHeader.Title>{title}</AppHeader.Title>
      </AppHeader.Brand>
      <AppHeader.Search placeholder="Search" shortcut="⌘K" value={query} onSearch={onQueryChange} />
      <AppHeader.Actions>{actions}</AppHeader.Actions>
    </AppHeader.Root>
  );
}

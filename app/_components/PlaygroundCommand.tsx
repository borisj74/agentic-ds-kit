"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button, Command, Modal } from "agentic-ds-kit";
import type { CommandGroup } from "agentic-ds-kit";
import { playgroundCommandSections } from "@/lib/playground-nav";
import { pushHash } from "@/lib/use-location-hash";
import styles from "./PlaygroundShell.module.css";

const SECTIONS = playgroundCommandSections();

const SECTION_ICONS = {
  Foundations: "Layers",
  Components: "Package",
  Patterns: "LayoutDashboard",
} as const;

const GROUPS: CommandGroup[] = SECTIONS.map((section) => ({
  heading: section.heading,
  items: section.items.map((item) => ({
    id: item.id,
    label: item.label,
    icon: SECTION_ICONS[section.heading],
  })),
}));

const HREF_BY_ID = new Map(
  SECTIONS.flatMap((section) => section.items.map((item) => [item.id, item.href] as const)),
);

export function PlaygroundCommand() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || event.altKey || event.shiftKey) return;
      if (!event.metaKey && !event.ctrlKey) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setOpen((current) => !current);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open]);

  const go = (id: string) => {
    const href = HREF_BY_ID.get(id);
    setOpen(false);
    if (!href) return;
    const [path, fragment] = href.split("#");
    if (fragment && path === pathname) {
      pushHash(fragment);
      return;
    }
    router.push(href);
  };

  return (
    <>
      <Button
        size="sm"
        appearance="outline"
        mode="neutral"
        iconStart="Search"
        block
        className={styles.commandTrigger}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-keyshortcuts="Meta+K Control+K"
        onClick={() => setOpen(true)}
      >
        Search ⌘K
      </Button>
      <Modal ref={dialogRef} open={open} title="Search" size="md" onClose={() => setOpen(false)}>
        <Command
          groups={GROUPS}
          label="Search documentation"
          placeholder="Components, patterns, foundations"
          onSelect={go}
        />
      </Modal>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/ui/Button";
import { Command } from "@/ui/Command";
import type { CommandGroup } from "@/ui/Command";
import { Dialog } from "@/ui/Dialog";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";

const MASTER_GROUPS: CommandGroup[] = [
  {
    heading: "Suggestions",
    items: [
      { id: "calendar", label: "Calendar", icon: "CalendarDays" },
      { id: "emoji", label: "Search Emoji", icon: "Sparkles" },
      { id: "calc", label: "Calculator", icon: "ChartBar" },
    ],
  },
  {
    heading: "Settings",
    items: [
      { id: "profile", label: "Profile", icon: "User", shortcut: "⌘P" },
      { id: "billing", label: "Billing", icon: "CreditCard", shortcut: "⌘B" },
      { id: "settings", label: "Settings", icon: "Settings", shortcut: "⌘S" },
    ],
  },
];

const DISABLED_GROUPS: CommandGroup[] = [
  {
    heading: "Suggestions",
    items: [
      { id: "calendar", label: "Calendar", icon: "CalendarDays" },
      { id: "emoji", label: "Search Emoji", icon: "Sparkles" },
      { id: "calc", label: "Calculator", icon: "ChartBar", disabled: true },
    ],
  },
  {
    heading: "Settings",
    items: [
      { id: "profile", label: "Profile", icon: "User", shortcut: "⌘P" },
      { id: "billing", label: "Billing", icon: "CreditCard", shortcut: "⌘B", disabled: true },
      { id: "settings", label: "Settings", icon: "Settings", shortcut: "⌘S" },
    ],
  },
];

const MASTER_CODE = `<>
  <Button variant="secondary" iconStart="Search" onClick={() => setOpen(true)}>
    Open command
  </Button>
  <Dialog open={open} title="Command menu" onClose={() => setOpen(false)}>
    <Command groups={groups} onSelect={() => setOpen(false)} />
  </Dialog>
</>`;

const INLINE_CODE = `<Command
  placeholder="Type a command or search..."
  empty="No results found."
  groups={[
    {
      heading: "Suggestions",
      items: [
        { id: "calendar", label: "Calendar", icon: "CalendarDays" },
        { id: "emoji", label: "Search Emoji", icon: "Sparkles" },
        { id: "calc", label: "Calculator", icon: "ChartBar" },
      ],
    },
    {
      heading: "Settings",
      items: [
        { id: "profile", label: "Profile", icon: "User", shortcut: "⌘P" },
        { id: "billing", label: "Billing", icon: "CreditCard", shortcut: "⌘B" },
        { id: "settings", label: "Settings", icon: "Settings", shortcut: "⌘S" },
      ],
    },
  ]}
  onSelect={(id) => {}}
/>`;

const EMPTY_CODE = `<Command
  empty="No results found."
  groups={[]}
/>`;

const DISABLED_CODE = `<Command
  groups={[
    {
      heading: "Suggestions",
      items: [
        { id: "calendar", label: "Calendar", icon: "CalendarDays" },
        { id: "calc", label: "Calculator", icon: "ChartBar", disabled: true },
      ],
    },
  ]}
  onSelect={(id) => {}}
/>`;

const PREVIEW_MAX = { maxWidth: "24rem" } as const;

export function CommandDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Command</h1>
        <p className={styles.lede}>Searchable command menu for quick actions.</p>
      </header>

      <section className={styles.master} aria-labelledby="command-master">
        <div className={styles.masterHeader}>
          <h2 id="command-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Kit Button opens kit Dialog with Command. ⌘K or Ctrl+K toggles it. No CommandDialog.
          </p>
          <div className={styles.tabList} role="tablist" aria-label="Master views">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "preview"}
              className={`${styles.tab} ${tab === "preview" ? styles.tabActive : ""}`}
              onClick={() => setTab("preview")}
            >
              Preview
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "variants"}
              className={`${styles.tab} ${tab === "variants" ? styles.tabActive : ""}`}
              onClick={() => setTab("variants")}
            >
              Variants
            </button>
          </div>
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <Button variant="secondary" iconStart="Search" onClick={() => setOpen(true)}>
                  Open command
                </Button>
                <Dialog open={open} title="Command menu" onClose={() => setOpen(false)}>
                  <Command groups={MASTER_GROUPS} onSelect={() => setOpen(false)} />
                </Dialog>
              </div>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Command is the list. A kit Button opens it. Kit Dialog is the overlay. Select stays
                  the short Field dropdown.
                </p>
              </div>
              <CodeBlock code={MASTER_CODE} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Inline</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_MAX}>
                  <Command groups={MASTER_GROUPS} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Command on the page, no overlay. Use this in a sidebar or settings column.
                </p>
              </div>
              <CodeBlock code={INLINE_CODE} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Empty</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_MAX}>
                  <Command groups={[]} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Shown when groups is empty or the query matches nothing.
                </p>
              </div>
              <CodeBlock code={EMPTY_CODE} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>With icons and shortcuts</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_MAX}>
                  <Command groups={MASTER_GROUPS} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Icons are Lucide catalog names. Shortcuts stay a string, typically a modifier plus
                  key.
                </p>
              </div>
              <CodeBlock code={INLINE_CODE} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Disabled item</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_MAX}>
                  <Command groups={DISABLED_GROUPS} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Disabled items stay visible and skip highlight, click, and Enter.
                </p>
              </div>
              <CodeBlock code={DISABLED_CODE} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>In Dialog</h2>
              <div className={styles.exampleCanvas}>
                <Button variant="secondary" iconStart="Search" onClick={() => setOpen(true)}>
                  Open command
                </Button>
                <Dialog open={open} title="Command menu" onClose={() => setOpen(false)}>
                  <Command groups={MASTER_GROUPS} onSelect={() => setOpen(false)} />
                </Dialog>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Same as Master. Command does not close itself. The Button and Dialog own that.
                </p>
              </div>
              <CodeBlock code={MASTER_CODE} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}

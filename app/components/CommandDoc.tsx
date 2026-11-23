"use client";

import { useEffect, useState } from "react";
import { Button } from "agentic-ds-kit";
import { Command } from "agentic-ds-kit";
import type { CommandGroup } from "agentic-ds-kit";
import { Modal } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

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

// Billing example data: a Recent group, pages with descriptions and keywords, chord and sequence shortcuts.
const PALETTE_GROUPS: CommandGroup[] = [
  {
    heading: "Recent",
    items: [{ id: "inv-1842", label: "INV-1842", description: "Northwind Labs · $4,280.00", icon: "FileText" }],
  },
  {
    heading: "Go to",
    items: [
      { id: "profile", label: "Profile", icon: "User", shortcut: "⇧⌘P" },
      { id: "invoices", label: "Invoices", description: "Billing", icon: "FileText", shortcut: "G I", keywords: ["bill", "payment"] },
      { id: "plans", label: "Plans", description: "Billing", icon: "CreditCard", keywords: ["pricing", "upgrade"] },
    ],
  },
  {
    heading: "Actions",
    items: [{ id: "new-invoice", label: "New invoice", icon: "Plus", shortcut: "N" }],
  },
];

const PALETTE_CODE = `<Command
  placeholder="Search pages and actions"
  groups={[
    { heading: "Recent", items: [{ id: "inv-1842", label: "INV-1842", description: "Northwind Labs · $4,280.00", icon: "FileText" }] },
    {
      heading: "Go to",
      items: [
        { id: "profile", label: "Profile", icon: "User", shortcut: "⇧⌘P" },
        { id: "invoices", label: "Invoices", description: "Billing", icon: "FileText", shortcut: "G I", keywords: ["bill", "payment"] },
      ],
    },
    { heading: "Actions", items: [{ id: "new-invoice", label: "New invoice", icon: "Plus", shortcut: "N" }] },
  ]}
  onSelect={(id) => {}}
  onAsk={(query) => openChat(query)}
/>`;

const LOADING_CODE = `<Command
  groups={results}
  loading={isFetching}
  onSelect={(id) => {}}
/>`;

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
  <Button appearance="outline" mode="neutral" iconStart="Search" onClick={() => setOpen(true)}>
    Open command
  </Button>
  <Modal open={open} title="Command menu" onClose={() => setOpen(false)}>
    <Command
      placeholder="Search pages and actions"
      groups={groups}
      onSelect={() => setOpen(false)}
      onAsk={() => setOpen(false)}
    />
  </Modal>
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
        <h2 className={styles.heroTitle}>Command</h2>
        <p className={styles.lede}>Searchable command menu for quick actions.</p>
      </header>

      <section className={styles.master} aria-labelledby="command-master">
        <div className={styles.masterHeader}>
          <h2 id="command-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Kit Button opens kit Modal with Command. ⌘K or Ctrl+K toggles it. No CommandDialog.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <Button appearance="outline" mode="neutral" iconStart="Search" onClick={() => setOpen(true)}>
                  Open command
                </Button>
                <Modal open={open} title="Command menu" onClose={() => setOpen(false)}>
                  <Command
                    placeholder="Search pages and actions"
                    groups={PALETTE_GROUPS}
                    onSelect={() => setOpen(false)}
                    onAsk={() => setOpen(false)}
                  />
                </Modal>
              </div>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Command is the list. A kit Button or ⌘K opens it in a kit Modal, so it never flips
                  or floats. Rows are 40px with the same anatomy as DropdownMenu. If people type to
                  find it, use Command. If they act on one thing, use DropdownMenu. If they pick a
                  value to save, use Select.
                </p>
              </div>
              <CodeBlock code={MASTER_CODE} />
            </DocNotes>
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
              <h2 className={styles.exampleTitle}>Recent, search and Ask</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_MAX}>
                  <Command placeholder="Search pages and actions" groups={PALETTE_GROUPS} onAsk={() => {}} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Recent is a plain group. Search matches labels, descriptions and keywords, so
                  &quot;bill&quot; finds Invoices. onAsk adds an Ask Chat row at the foot of the
                  list, and it stays when nothing matches. The result count is read after each search.
                </p>
              </div>
              <CodeBlock code={PALETTE_CODE} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Loading</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill} style={PREVIEW_MAX}>
                  <Command groups={PALETTE_GROUPS.slice(0, 1)} loading />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  While async results load, a Spinner row shows under what is already there and the
                  list is aria-busy.
                </p>
              </div>
              <CodeBlock code={LOADING_CODE} />
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
                  Icons are Lucide catalog names. Shortcuts are a string shown as one Geist Mono chip
                  per key: modifiers first (⇧⌘P), a sequence with a space (G I), named keys spelled
                  out (Esc, Ctrl K). The item sets aria-keyshortcuts so the shortcut is read once.
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
              <h2 className={styles.exampleTitle}>In Modal</h2>
              <div className={styles.exampleCanvas}>
                <Button appearance="outline" mode="neutral" iconStart="Search" onClick={() => setOpen(true)}>
                  Open command
                </Button>
                <Modal open={open} title="Command menu" onClose={() => setOpen(false)}>
                  <Command
                    placeholder="Search pages and actions"
                    groups={PALETTE_GROUPS}
                    onSelect={() => setOpen(false)}
                    onAsk={() => setOpen(false)}
                  />
                </Modal>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Same as Master. Command does not close itself. The Button and Modal own that.
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

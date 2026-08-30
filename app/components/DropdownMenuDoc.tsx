"use client";

import { useState } from "react";
import { DropdownMenu } from "@/ui/DropdownMenu";
import type { DropdownMenuGroup } from "@/ui/DropdownMenu";
import type { ButtonSize } from "@/ui/Button";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";

const ACCOUNT_GROUPS: DropdownMenuGroup[] = [
  {
    heading: "My Account",
    items: [
      { id: "profile", label: "Profile", shortcut: "⇧⌘P" },
      { id: "billing", label: "Billing", shortcut: "⌘B" },
      { id: "settings", label: "Settings", shortcut: "⌘S" },
    ],
  },
  {
    items: [
      { id: "team", label: "Team" },
      {
        id: "invite",
        label: "Invite users",
        submenu: [
          {
            items: [
              { id: "email", label: "Email" },
              { id: "message", label: "Message" },
            ],
          },
          {
            items: [{ id: "more", label: "More..." }],
          },
        ],
      },
      { id: "new-team", label: "New Team", shortcut: "⌘+T" },
    ],
  },
  {
    items: [
      { id: "github", label: "GitHub" },
      { id: "support", label: "Support" },
      { id: "api", label: "API", disabled: true },
    ],
  },
  {
    items: [{ id: "logout", label: "Log out", shortcut: "⇧⌘Q" }],
  },
];

const ICON_GROUPS: DropdownMenuGroup[] = [
  {
    heading: "My Account",
    items: [
      { id: "profile", label: "Profile", icon: "User", shortcut: "⇧⌘P" },
      { id: "billing", label: "Billing", icon: "CreditCard", shortcut: "⌘B" },
      { id: "settings", label: "Settings", icon: "Settings", shortcut: "⌘S" },
    ],
  },
  {
    items: [
      { id: "new-team", label: "New team", icon: "User", shortcut: "⌘+T" },
    ],
  },
];

const DESTRUCTIVE_GROUPS: DropdownMenuGroup[] = [
  {
    items: [
      { id: "edit", label: "Edit", icon: "Pencil" },
      { id: "share", label: "Share", icon: "Share2" },
      { id: "delete", label: "Delete", icon: "Trash2", danger: true },
    ],
  },
];

const SIZES: ButtonSize[] = ["sm", "md", "lg"];

const MASTER_CODE = `<DropdownMenu
  trigger="Open"
  size="md"
  groups={[
    {
      heading: "My Account",
      items: [
        { id: "profile", label: "Profile", shortcut: "⇧⌘P" },
        { id: "billing", label: "Billing", shortcut: "⌘B" },
        { id: "settings", label: "Settings", shortcut: "⌘S" },
      ],
    },
    {
      items: [
        { id: "team", label: "Team" },
        {
          id: "invite",
          label: "Invite users",
          submenu: [{ items: [{ id: "email", label: "Email" }, { id: "message", label: "Message" }] }],
        },
        { id: "new-team", label: "New Team", shortcut: "⌘+T" },
      ],
    },
  ]}
  onSelect={(id) => {}}
/>`;

const ICONS_CODE = `<DropdownMenu
  trigger="Open"
  groups={[
    {
      heading: "My Account",
      items: [
        { id: "profile", label: "Profile", icon: "User", shortcut: "⇧⌘P" },
        { id: "billing", label: "Billing", icon: "CreditCard", shortcut: "⌘B" },
      ],
    },
  ]}
/>`;

const DESTRUCTIVE_CODE = `<DropdownMenu
  trigger="Actions"
  groups={[
    {
      items: [
        { id: "edit", label: "Edit", icon: "Pencil" },
        { id: "delete", label: "Delete", icon: "Trash2", danger: true },
      ],
    },
  ]}
/>`;

const ICON_ONLY_CODE = `<DropdownMenu
  iconStart="Ellipsis"
  ariaLabel="Row actions"
  variant="tertiary"
  align="end"
  groups={[{ items: [{ id: "edit", label: "Edit" }] }]}
/>`;

export function DropdownMenuDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [open, setOpen] = useState(true);
  const [size, setSize] = useState<ButtonSize>("md");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>DropdownMenu</h1>
        <p className={styles.lede}>
          Actions from a kit Button. Select is a form list. Command is searchable in a Modal.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="dropdownmenu-master">
        <div className={styles.masterHeader}>
          <h2 id="dropdownmenu-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            One component. Groups and items are data. No Trigger, Content, or Item cousins.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={styles.canvas}>
                <div className={styles.previewRow}>
                  <DropdownMenu
                    trigger="Open"
                    size={size}
                    groups={ACCOUNT_GROUPS}
                    open={open}
                    onOpenChange={setOpen}
                  />
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Size</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Size">
                    {SIZES.map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={`${styles.sizeTab} ${size === value ? styles.sizeTabActive : ""}`}
                        aria-pressed={size === value}
                        onClick={() => setSize(value)}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Open</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Open">
                    <button
                      type="button"
                      className={`${styles.sizeTab} ${open ? styles.sizeTabActive : ""}`}
                      aria-pressed={open}
                      onClick={() => setOpen(true)}
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      className={`${styles.sizeTab} ${!open ? styles.sizeTabActive : ""}`}
                      aria-pressed={!open}
                      onClick={() => setOpen(false)}
                    >
                      Closed
                    </button>
                  </div>
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use for actions from a button. Use Select in a Field. Use Command in a Modal when
                  the list is searchable. Do not add Trigger or Item cousins.
                </p>
              </div>
              <CodeBlock code={MASTER_CODE} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Icons and shortcuts</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <DropdownMenu trigger="Open" groups={ICON_GROUPS} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Item icon is a Lucide name. Shortcut is a hint, not a keybinding.
                </p>
              </div>
              <CodeBlock code={ICONS_CODE} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Destructive</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <DropdownMenu trigger="Actions" groups={DESTRUCTIVE_GROUPS} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>danger marks an irreversible item. Not a second menu.</p>
              </div>
              <CodeBlock code={DESTRUCTIVE_CODE} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Icon-only</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <DropdownMenu
                    iconStart="Ellipsis"
                    ariaLabel="Row actions"
                    variant="tertiary"
                    align="end"
                    groups={DESTRUCTIVE_GROUPS}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Icon-only needs ariaLabel. DataTable Cell type=actionMenu composes this.
                </p>
              </div>
              <CodeBlock code={ICON_ONLY_CODE} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}

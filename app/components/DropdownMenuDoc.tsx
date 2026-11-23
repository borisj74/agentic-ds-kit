"use client";

import { useState } from "react";
import { DropdownMenu } from "agentic-ds-kit";
import type { DropdownMenuGroup } from "agentic-ds-kit";
import type { ButtonSize } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const ACCOUNT_GROUPS: DropdownMenuGroup[] = [
  {
    heading: "My account",
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
            items: [{ id: "more", label: "More…" }],
          },
        ],
      },
      { id: "new-team", label: "New team", shortcut: "⌘T" },
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
    heading: "My account",
    items: [
      { id: "profile", label: "Profile", icon: "User", shortcut: "⇧⌘P" },
      { id: "billing", label: "Billing", icon: "CreditCard", shortcut: "⌘B" },
      { id: "settings", label: "Settings", icon: "Settings", shortcut: "⌘S" },
    ],
  },
  {
    items: [
      { id: "new-team", label: "New team", icon: "User", shortcut: "⌘T" },
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
      heading: "My account",
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
        { id: "new-team", label: "New team", shortcut: "⌘T" },
      ],
    },
  ]}
  onSelect={(id) => {}}
/>`;

const ICONS_CODE = `<DropdownMenu
  trigger="Open"
  groups={[
    {
      heading: "My account",
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

// Account menu from the board: start icons stay, the radio check sits in the end slot, Theme opens a submenu.
const WORKSPACE_GROUPS: DropdownMenuGroup[] = [
  {
    heading: "Boris Jovanovic",
    items: [
      { id: "profile", label: "Profile", icon: "User", shortcut: "⇧⌘P" },
      { id: "settings", label: "Settings", icon: "Settings", shortcut: "⌘," },
      {
        id: "theme",
        label: "Theme",
        icon: "Eye",
        submenu: [
          {
            selection: "radio",
            items: [
              { id: "theme-light", label: "Light", icon: "Sun", selected: true },
              { id: "theme-dark", label: "Dark", icon: "Moon", selected: false },
            ],
          },
        ],
      },
    ],
  },
  {
    heading: "Workspaces",
    selection: "radio",
    items: [
      { id: "agentix", label: "Agentix", icon: "LayoutGrid", selected: true },
      { id: "northwind", label: "Northwind Labs", icon: "LayoutGrid", selected: false },
    ],
  },
  { items: [{ id: "create-workspace", label: "Create workspace", icon: "Plus" }] },
  { items: [{ id: "sign-out", label: "Sign out", icon: "LogOut" }] },
];

const WORKSPACE_CODE = `<DropdownMenu
  iconStart="ChevronsUpDown"
  ariaLabel="Account menu"
  appearance="ghost" mode="neutral"
  align="end"
  groups={[
    {
      heading: "Boris Jovanovic",
      items: [
        { id: "profile", label: "Profile", icon: "User", shortcut: "⇧⌘P" },
        { id: "settings", label: "Settings", icon: "Settings", shortcut: "⌘," },
        {
          id: "theme",
          label: "Theme",
          icon: "Eye",
          submenu: [{ selection: "radio", items: [
            { id: "theme-light", label: "Light", icon: "Sun", selected: theme === "light" },
            { id: "theme-dark", label: "Dark", icon: "Moon", selected: theme === "dark" },
          ] }],
        },
      ],
    },
    {
      heading: "Workspaces",
      selection: "radio",
      items: [
        { id: "agentix", label: "Agentix", icon: "LayoutGrid", selected: workspace === "agentix" },
        { id: "northwind", label: "Northwind Labs", icon: "LayoutGrid", selected: workspace === "northwind" },
      ],
    },
    { items: [{ id: "create-workspace", label: "Create workspace", icon: "Plus" }] },
    { items: [{ id: "sign-out", label: "Sign out", icon: "LogOut" }] },
  ]}
  onSelect={(id) => {}}
/>`;

const ICON_ONLY_CODE = `<DropdownMenu
  iconStart="Ellipsis"
  ariaLabel="Row actions"
  appearance="ghost" mode="neutral"
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
        <h2 className={styles.heroTitle}>DropdownMenu</h2>
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
              <div className={`${styles.canvas} ${styles.canvasMenu}`}>
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
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Act on one thing, up to about ten actions, from a button, ⋯ or nav item. Rows follow
                  size: sm 28px for dense tables, md 32px by default, lg 40px. It opens 4px below,
                  flips above when there is more room there, and caps its height at the screen minus
                  16px. Type a letter to jump to an item. If people type to find it, use Command; if
                  they pick a value to save, use Select. Do not add Trigger or Item cousins.
                </p>
              </div>
              <CodeBlock code={MASTER_CODE} />
            </DocNotes>
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
                  Item icon is a Lucide name. Shortcut is a hint, not a keybinding: one Geist Mono chip
                  per key, and the item sets aria-keyshortcuts so it is read once.
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
              <h2 className={styles.exampleTitle}>Account menu with a radio group</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <DropdownMenu
                    iconStart="ChevronsUpDown"
                    ariaLabel="Account menu"
                    appearance="ghost" mode="neutral"
                    align="end"
                    groups={WORKSPACE_GROUPS}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  selection=&quot;radio&quot; makes the group menuitemradio rows; selected marks the
                  one chosen with a check in the end slot, and the start icon stays. Theme opens a
                  submenu with its own radio group. Create workspace is an action, so it sits in its
                  own group rather than the radio group. Checkbox rows stay per item. Align end for
                  account and row menus.
                </p>
              </div>
              <CodeBlock code={WORKSPACE_CODE} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Icon-only</h2>
              <div className={styles.exampleCanvas}>
                <div className={styles.previewFill}>
                  <DropdownMenu
                    iconStart="Ellipsis"
                    ariaLabel="Row actions"
                    appearance="ghost" mode="neutral"
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

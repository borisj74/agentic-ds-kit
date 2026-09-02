"use client";

import { useState } from "react";
import { NavigationMenu } from "agentic-ds-kit";
import type { NavigationMenuItem } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import demo from "./NavigationMenuDoc.module.css";
import { DocTabList } from "./DocTabList";

const H = "/components#navigationmenu";

const MASTER_ITEMS: NavigationMenuItem[] = [
  { id: "home", label: "Home", href: H, active: true },
  {
    id: "getting-started",
    label: "Getting started",
    columns: 1,
    groups: [
      {
        items: [
          {
            id: "shadcn",
            label: "shadcn/ui",
            description: "Beautifully designed components built with Tailwind CSS.",
            href: H,
          },
          {
            id: "intro",
            label: "Introduction",
            description: "Re-usable components built using Radix UI and Tailwind CSS.",
            href: H,
          },
          {
            id: "install",
            label: "Installation",
            description: "How to install dependencies and structure your app.",
            href: H,
          },
          {
            id: "type",
            label: "Typography",
            description: "Styles for headings, paragraphs, lists...etc",
            href: H,
          },
        ],
      },
    ],
  },
  {
    id: "components",
    label: "Components",
    columns: 2,
    groups: [
      {
        items: [
          {
            id: "alertdialog",
            label: "Alert Dialog",
            description:
              "A modal dialog that interrupts the user with important content and expects a response.",
            href: "/components#alertdialog",
          },
          {
            id: "hovercard",
            label: "Hover Card",
            description: "For sighted users to preview content available behind a link.",
            href: H,
          },
          {
            id: "progress",
            label: "Progress",
            description:
              "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
            href: H,
          },
          {
            id: "scrollarea",
            label: "Scroll-area",
            description: "Visually or semantically separates content.",
            href: H,
          },
          {
            id: "tabs",
            label: "Tabs",
            description: "A set of layered sections of content that are displayed one at a time.",
            href: "/components#tabs",
          },
          {
            id: "tooltip",
            label: "Tooltip",
            description:
              "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
            href: "/components#tooltip",
          },
        ],
      },
    ],
  },
  { id: "docs", label: "Docs", href: H },
  {
    id: "list",
    label: "List",
    columns: 1,
    groups: [
      {
        items: [
          {
            id: "list-components",
            label: "Components",
            description: "Browse all components in the library.",
            href: "/components",
          },
          {
            id: "list-docs",
            label: "Documentation",
            description: "Learn how to use the library.",
            href: H,
          },
          {
            id: "list-blog",
            label: "Blog",
            description: "Read our latest blog posts.",
            href: H,
          },
        ],
      },
    ],
  },
  {
    id: "simple",
    label: "Simple",
    columns: 1,
    groups: [
      {
        items: [
          { id: "simple-components", label: "Components", href: "/components" },
          { id: "simple-docs", label: "Documentation", href: H },
          { id: "simple-blocks", label: "Blocks", href: H },
        ],
      },
    ],
  },
  {
    id: "with-icon",
    label: "With Icon",
    columns: 1,
    groups: [
      {
        items: [
          { id: "backlog", label: "Backlog", icon: "CircleHelp" },
          { id: "todo", label: "To Do", icon: "Circle" },
          { id: "done", label: "Done", icon: "CircleCheck" },
        ],
      },
    ],
  },
];

const SIMPLE_LINKS: NavigationMenuItem[] = [
  { id: "home", label: "Home", href: H, active: true },
  { id: "docs", label: "Docs", href: H },
  { id: "components", label: "Components", href: "/components" },
];

const WITH_ICON: NavigationMenuItem[] = [
  { id: "home", label: "Home", href: H, active: true },
  {
    id: "with-icon",
    label: "With Icon",
    columns: 1,
    groups: [
      {
        items: [
          { id: "backlog", label: "Backlog", icon: "CircleHelp" },
          { id: "todo", label: "To Do", icon: "Circle" },
          { id: "done", label: "Done", icon: "CircleCheck" },
        ],
      },
    ],
  },
];

const MASTER_CODE = `<NavigationMenu
  items={[
    { id: "home", label: "Home", href: "/components#navigationmenu", active: true },
    {
      id: "getting-started",
      label: "Getting started",
      columns: 1,
      groups: [{ items: [{ id: "intro", label: "Introduction", description: "...", href: "/components#navigationmenu" }] }],
    },
    {
      id: "components",
      label: "Components",
      columns: 2,
      groups: [{ items: [{ id: "tabs", label: "Tabs", description: "...", href: "/components#tabs" }] }],
    },
    { id: "docs", label: "Docs", href: "/components#navigationmenu" },
  ]}
/>`;

const SIMPLE_CODE = `<NavigationMenu
  items={[
    { id: "home", label: "Home", href: "/components#navigationmenu", active: true },
    { id: "docs", label: "Docs", href: "/components#navigationmenu" },
    { id: "components", label: "Components", href: "/components" },
  ]}
/>`;

const ICON_CODE = `<NavigationMenu
  items={[
    { id: "home", label: "Home", href: "/components#navigationmenu", active: true },
    {
      id: "with-icon",
      label: "With Icon",
      groups: [{
        items: [
          { id: "backlog", label: "Backlog", icon: "CircleHelp" },
          { id: "todo", label: "To Do", icon: "Circle" },
          { id: "done", label: "Done", icon: "CircleCheck" },
        ],
      }],
    },
  ]}
/>`;

export function NavigationMenuDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>NavigationMenu</h1>
        <p className={styles.lede}>
          Horizontal site nav. Dropdowns are kit DropdownMenu. Not SideNav. Not AppNav.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="navigationmenu-master">
        <div className={styles.masterHeader}>
          <h2 id="navigationmenu-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Home and Docs are links. The rest open kit DropdownMenu with ChevronDown.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={demo.layout}>
              <div className={demo.canvas}>
                <div className={demo.bar}>
                  <NavigationMenu items={MASTER_ITEMS} />
                </div>
              </div>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Pass a flat list of links and dropdowns. Dropdowns compose kit DropdownMenu with
                  triggerStyle=nav. Do not invent List, Trigger, Content, or Link cousins.
                </p>
              </div>
              <CodeBlock code={MASTER_CODE} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Simple links only</h2>
              <div className={demo.exampleCanvas}>
                <div className={demo.bar}>
                  <NavigationMenu items={SIMPLE_LINKS} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Link items have href and no groups. Active uses aria-current=page.
                </p>
              </div>
              <CodeBlock code={SIMPLE_CODE} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>With Icon dropdown</h2>
              <div className={demo.exampleCanvas}>
                <div className={demo.bar}>
                  <NavigationMenu items={WITH_ICON} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Item icon is a Lucide name on kit DropdownMenu. Circle, CircleHelp, CircleCheck.
                </p>
              </div>
              <CodeBlock code={ICON_CODE} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}

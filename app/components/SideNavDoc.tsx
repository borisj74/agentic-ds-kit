"use client";

import { useState, type ReactNode } from "react";
import { SideNav } from "@/ui/SideNav";
import type { SideNavGroup, SideNavItem, SideNavSide } from "@/ui/SideNav";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import demo from "./SideNavDoc.module.css";

const H = "/components#sidenav";

const GROUPS: SideNavGroup[] = [
  {
    label: "Workspace",
    items: [
      { id: "overview", label: "Overview", href: H, icon: "House", active: true },
      { id: "activity", label: "Activity", href: H, icon: "ChartBar" },
      { id: "inbox", label: "Inbox", href: H, icon: "Mail", badge: "7" },
    ],
  },
  {
    label: "Sprint 24",
    items: [
      {
        id: "projects",
        label: "Projects",
        icon: "Folder",
        badge: "4",
        items: [
          { id: "launch-brief", label: "Launch brief", href: H, icon: "File" },
          { id: "qa-checklist", label: "QA checklist", href: H, icon: "CircleCheck" },
          { id: "release-notes", label: "Release notes", href: H, icon: "File" },
        ],
      },
      { id: "tasks", label: "Open tasks", href: H, icon: "Check", badge: "18" },
      { id: "insights", label: "Insights", href: H, icon: "Sparkles" },
      {
        id: "resources",
        label: "Resources",
        icon: "Layers",
        items: [
          { id: "support-macros", label: "Support macros", href: H, icon: "File" },
          { id: "research", label: "User research", href: H, icon: "User" },
        ],
      },
    ],
  },
  {
    label: "Tags",
    items: [
      { id: "tag-important", label: "Important", href: H, icon: "TriangleAlert", badge: "3" },
      { id: "tag-at-risk", label: "At risk", href: H, icon: "Info", badge: "5" },
      { id: "tag-shipped", label: "Shipped", href: H, icon: "CircleCheck", badge: "12" },
    ],
  },
];

const FOOTER: SideNavItem[] = [
  { id: "invite", label: "Invite members", href: H, icon: "CirclePlus" },
  { id: "settings", label: "Settings", href: H, icon: "Settings" },
];

function masterCode() {
  return [
    "<SideNav",
    '  title="Agentix"',
    '  mark="A"',
    "  open={open}",
    "  onOpenChange={setOpen}",
    "  groups={groups}",
    "  footer={footer}",
    "/>",
  ].join("\n");
}

const CLOSED_CODE = `<SideNav title="Agentix" mark="A" defaultOpen={false} groups={groups} footer={footer} />`;

const RIGHT_CODE = `<SideNav title="Agentix" mark="A" side="right" groups={groups} footer={footer} />`;

function MainPane() {
  return (
    <div className={demo.main}>
      <h2 className={demo.heading}>Overview</h2>
      <p className={demo.copy}>Workspace overview for the current team.</p>
    </div>
  );
}

function Shell({
  side,
  children,
}: {
  side: SideNavSide;
  children: ReactNode;
}) {
  return (
    <div className={`${demo.shell} ${side === "right" ? demo.shellRight : ""}`}>
      {children}
      <MainPane />
    </div>
  );
}

function DemoBar({
  open,
  onOpenChange,
  side,
  defaultOpen,
}: {
  open?: boolean;
  onOpenChange?: (next: boolean) => void;
  side?: SideNavSide;
  defaultOpen?: boolean;
}) {
  return (
    <SideNav
      title="Agentix"
      mark="A"
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      side={side}
      groups={GROUPS}
      footer={FOOTER}
    />
  );
}

export function SideNavDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [open, setOpen] = useState(true);
  const [side, setSide] = useState<SideNavSide>("left");

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>SideNav</h1>
        <p className={styles.lede}>
          Florence product chrome. AppNav is the catalog list. Drawer is the overlay panel.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="sidenav-master">
        <div className={styles.masterHeader}>
          <h2 id="sidenav-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Brand mark, icon items, badges, and a closeable rail. Stays in the layout.
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
              <div className={demo.canvas}>
                <div className={demo.fill}>
                  <Shell side={side}>
                    <DemoBar open={open} onOpenChange={setOpen} side={side} />
                  </Shell>
                </div>
              </div>
              <aside className={styles.panel} aria-label="Controls">
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
                <div className={styles.panelGroup}>
                  <span className={styles.panelLabel}>Side</span>
                  <div className={styles.sizeGroup} role="group" aria-label="Side">
                    <button
                      type="button"
                      className={`${styles.sizeTab} ${side === "left" ? styles.sizeTabActive : ""}`}
                      aria-pressed={side === "left"}
                      onClick={() => setSide("left")}
                    >
                      left
                    </button>
                    <button
                      type="button"
                      className={`${styles.sizeTab} ${side === "right" ? styles.sizeTabActive : ""}`}
                      aria-pressed={side === "right"}
                      onClick={() => setSide("right")}
                    >
                      right
                    </button>
                  </div>
                </div>
              </aside>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Put SideNav next to the page. Pass groups of icon items with optional badges.
                  X closes. The brand mark reopens. Use AppNav for a docs catalog. Use Drawer
                  for a temporary overlay panel.
                </p>
              </div>
              <CodeBlock code={masterCode()} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Closed</h2>
              <div className={demo.exampleCanvas}>
                <div className={demo.fill}>
                  <Shell side="left">
                    <DemoBar defaultOpen={false} />
                  </Shell>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Starts as a compact rail. The brand mark opens it. Icons stay; labels are
                  clipped. The slot stays in the layout.
                </p>
              </div>
              <CodeBlock code={CLOSED_CODE} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Right side</h2>
              <div className={demo.exampleCanvas}>
                <div className={demo.fill}>
                  <Shell side="right">
                    <DemoBar side="right" />
                  </Shell>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  side="right". The consumer shell uses row-reverse. SideNav is a column and
                  does not wrap the page.
                </p>
              </div>
              <CodeBlock code={RIGHT_CODE} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}

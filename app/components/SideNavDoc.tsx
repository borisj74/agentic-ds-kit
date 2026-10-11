"use client";

import { useState, type ReactNode } from "react";
import { Alert, Avatar, Button, DropdownMenu, Select, SideNav, Tooltip } from "agentic-ds-kit";
import type { SideNavGroup, SideNavItemData, SideNavRadius, SideNavSide } from "agentic-ds-kit";
import contract from "agentic-ds-kit/contracts/sidenav.json";
import { CodeBlock } from "./CodeBlock";
import { CssVarsTable } from "./CssVarsTable";
import styles from "./ComponentDoc.module.css";
import demo from "./SideNavDoc.module.css";
import { DocTabList } from "./DocTabList";

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

const FOOTER: SideNavItemData[] = [
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

const FLUSH_CODE = `<SideNav title="Agentix" mark="A" showHeader={false} radius="none" groups={groups} footer={footer} />`;

const SLOTS_CODE = `<SideNav
  title="Agentix"
  groups={groups}
  header={
    <Select id="workspace" size="sm" ariaLabel="Workspace" defaultValue="agentix" options={workspaces} />
  }
  beforeGroups={<Button variant="secondary" size="sm" iconStart="Plus">New project</Button>}
  afterGroups={<Alert variant="info" title="Trial">5 days left.</Alert>}
  footer={
    <div className="account">
      <Avatar name="Maya Chen" size="sm" />
      <span>Maya Chen</span>
    </div>
  }
  renderItem={(item, node) =>
    item.badge ? <Tooltip content={\`\${item.badge} new\`} placement="right">{node}</Tooltip> : node
  }
/>`;

const WORKSPACES = [
  { value: "agentix", label: "Agentix" },
  { value: "northwind", label: "Northwind" },
];

function SlotsBar() {
  return (
    <SideNav
      title="Agentix"
      groups={GROUPS.slice(0, 1)}
      header={<Select id="sidenav-workspace" size="sm" ariaLabel="Workspace" defaultValue="agentix" options={WORKSPACES} />}
      beforeGroups={
        <Button variant="secondary" size="sm" iconStart="Plus">
          New project
        </Button>
      }
      afterGroups={
        <Alert variant="info" title="Trial">
          5 days left.
        </Alert>
      }
      footer={
        <div className={demo.account}>
          <Avatar name="Maya Chen" size="sm" />
          <span className={demo.accountName}>Maya Chen</span>
        </div>
      }
      renderItem={(item, node) =>
        item.badge ? (
          <Tooltip content={`${item.badge} new`} placement="right">
            {node}
          </Tooltip>
        ) : (
          node
        )
      }
    />
  );
}

const COMPOSE_CODE = `<SideNav.Root aria-label="Agentix">
  <SideNav.Header>
    <SideNav.Brand title="Agentix" />
    <SideNav.Toggle />
  </SideNav.Header>

  <SideNav.Slot>
    <DropdownMenu
      triggerStyle="field"
      size="sm"
      ariaLabel="Workspace"
      trigger={workspace.label}
      groups={[{ heading: "Workspaces", items: workspaces }]}
      onSelect={setWorkspace}
    />
  </SideNav.Slot>

  <SideNav.Slot keepOnRail>
    <SideNav.Section label="Pinned">
      <SideNav.Item label="Q4 roadmap" icon="Star" onClick={() => go("roadmap")} active={page === "roadmap"} />
    </SideNav.Section>
  </SideNav.Slot>

  <SideNav.Nav>
    <SideNav.Section label="Workspace">
      <SideNav.Item label="Overview" icon="House" onClick={() => go("overview")} active={page === "overview"} />
      <SideNav.Item label="Inbox" icon="Mail" badge="7" onClick={() => go("inbox")} active={page === "inbox"} />
    </SideNav.Section>
    <SideNav.Section label="Projects">
      <SideNav.Item label="Launch" icon="Folder" badge="2">
        <SideNav.Item label="Brief" icon="File" onClick={() => go("brief")} active={page === "brief"} />
        <SideNav.Item label="QA checklist" icon="CircleCheck" onClick={() => go("qa")} active={page === "qa"} />
      </SideNav.Item>
    </SideNav.Section>
  </SideNav.Nav>

  <SideNav.Footer>
    <SideNav.Section>
      <SideNav.Item label="Settings" icon="Settings" onClick={() => go("settings")} active={page === "settings"} />
    </SideNav.Section>
  </SideNav.Footer>
</SideNav.Root>`;

const COMPOSE_WORKSPACES = [
  { id: "agentix", label: "Agentix" },
  { id: "northwind", label: "Northwind" },
];

function ComposedBar() {
  const [page, setPage] = useState("overview");
  const [workspace, setWorkspace] = useState("agentix");
  const current = COMPOSE_WORKSPACES.find((w) => w.id === workspace) ?? COMPOSE_WORKSPACES[0];
  const row = (id: string, label: string, icon: string, badge?: string) => (
    <SideNav.Item label={label} icon={icon} badge={badge} active={page === id} onClick={() => setPage(id)} />
  );

  return (
    <SideNav.Root aria-label="Agentix">
      <SideNav.Header>
        <SideNav.Brand title="Agentix" />
        <SideNav.Toggle />
      </SideNav.Header>

      <SideNav.Slot>
        <DropdownMenu
          triggerStyle="field"
          size="sm"
          ariaLabel="Workspace"
          trigger={current.label}
          groups={[
            {
              heading: "Workspaces",
              items: COMPOSE_WORKSPACES.map((w) => ({ ...w, selected: w.id === workspace })),
            },
          ]}
          onSelect={setWorkspace}
        />
      </SideNav.Slot>

      <SideNav.Slot keepOnRail>
        <SideNav.Section label="Pinned">{row("roadmap", "Q4 roadmap", "Star")}</SideNav.Section>
      </SideNav.Slot>

      <SideNav.Nav>
        <SideNav.Section label="Workspace">
          {row("overview", "Overview", "House")}
          {row("inbox", "Inbox", "Mail", "7")}
        </SideNav.Section>
        <SideNav.Section label="Projects">
          <SideNav.Item label="Launch" icon="Folder" badge="2">
            {row("brief", "Brief", "File")}
            {row("qa", "QA checklist", "CircleCheck")}
          </SideNav.Item>
        </SideNav.Section>
      </SideNav.Nav>

      <SideNav.Footer>
        <SideNav.Section>{row("settings", "Settings", "Settings")}</SideNav.Section>
      </SideNav.Footer>
    </SideNav.Root>
  );
}

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
  showHeader,
  radius,
}: {
  open?: boolean;
  onOpenChange?: (next: boolean) => void;
  side?: SideNavSide;
  defaultOpen?: boolean;
  showHeader?: boolean;
  radius?: SideNavRadius;
}) {
  return (
    <SideNav
      title="Agentix"
      mark="A"
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      side={side}
      showHeader={showHeader}
      radius={radius}
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
          Product app chrome side navigation. AppNav is the catalog list. Drawer is the overlay panel.
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
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
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
                  The panel icon closes. The brand mark reopens. Rail corners use
                  radius-surface-md. Item hover, active, and focus fills use
                  radius-control-md. When
                  AppHeader already provides brand, pass <code>showHeader={"{false}"}</code> and{" "}
                  <code>radius="none"</code> so the column sits flush. Use AppNav for a docs
                  catalog. Use Drawer for a temporary overlay panel.
                </p>
              </div>
              <CodeBlock code={masterCode()} />
            </div>
            <CssVarsTable cssVars={contract.cssVars} selector={'.myNav { --sidenav-width: var(--layout-rail); }'} />
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

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Flush</h2>
              <div className={demo.exampleCanvas}>
                <div className={demo.fill}>
                  <Shell side="left">
                    <DemoBar showHeader={false} radius="none" />
                  </Shell>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  radius="none" for a square column in an app shell. Pair with showHeader false
                  when AppHeader already shows brand.
                </p>
              </div>
              <CodeBlock code={FLUSH_CODE} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Slots</h2>
              <div className={demo.exampleCanvas}>
                <div className={demo.fill}>
                  <Shell side="left">
                    <SlotsBar />
                  </Shell>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  header replaces the brand; Close stays. beforeGroups and afterGroups pin above and
                  below the scrolling groups. footer takes items or any node. renderItem wraps one
                  row: keep the node it gives you, it carries aria-current and the disclosure state.
                  With a custom header the mark is gone, so control open yourself.
                </p>
              </div>
              <CodeBlock code={SLOTS_CODE} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Build your own nav</h2>
              <div className={demo.exampleCanvas}>
                <div className={demo.fill}>
                  <Shell side="left">
                    <ComposedBar />
                  </Shell>
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Assemble the blocks when the data props are not enough. SideNav.Root holds the
                  open state. SideNav.Brand is the mark and title; with SideNav.Toggle beside it the
                  Toggle closes the rail and the mark stays on the closed rail to reopen it (without
                  a Brand, the Toggle itself moves to the start edge and reopens, so a header with
                  only a switcher works too). Slot holds the workspace switcher. Section takes a label and Item rows;
                  Item children make a disclosure. Slot pins content outside the scroll
                  (keepOnRail keeps pinned rows usable). On the closed rail every Item shows its
                  label in a kit Tooltip. In Server Components use the named exports
                  (SideNavRoot, SideNavBrand, SideNavItem, …). The preset SideNav is built from these blocks.
                </p>
              </div>
              <CodeBlock code={COMPOSE_CODE} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import {
  Alert,
  AppHeader,
  Breadcrumb,
  AnchorNav,
  AppNav,
  Badge,
  Button,
  ButtonGroup,
  Card,
  ColorPicker,
  Command,
  DataTable,
  Empty,
  Field,
  FieldSet,
  FileUpload,
  Skeleton,
  Input,
  IntegrationPicker,
  KpiBoard,
  ModalCard,
  NotificationStack,
  PageHeader,
  Pagination,
  PricingPlans,
  Progress,
  ProgressSteps,
  SegmentedControl,
  SetupGuide,
  SideNav,
  Slider,
  Switch,
  Table,
  Tabs,
  TagInput,
  Timeline,
  Tooltip,
  UsageList,
  type FileUploadItem,
  type IntegrationItem,
  type NotificationItem,
  type PricingInterval,
  type SetupTask,
  type SideNavGroup,
} from "agentic-ds-kit";
import {
  CAT_BRAND_DEFAULT,
  CAT_BRAND_SWATCHES,
  CAT_COMMANDS,
  CAT_CUSTOMER_COLUMNS,
  CAT_CUSTOMERS,
  CAT_FILES,
  CAT_IMPORT_STEPS,
  CAT_INTEGRATION_CATEGORIES,
  CAT_INTEGRATIONS,
  CAT_ANCHORS,
  CAT_APPNAV,
  CAT_INVOICE_COLUMNS,
  CAT_INVOICES,
  CAT_NOTIFICATIONS,
  CAT_PLANS,
  CAT_SETUP,
  CAT_SIDENAV,
  CAT_TIMELINE,
  CAT_USAGE,
  catCustomerRows,
} from "@/lib/home-categories.sample";
import { KPI_METRICS, KPI_RANGES, KPI_ROWS, KPI_SERIES } from "@/lib/blocks/kpi-board.sample";
import styles from "./Home.module.css";
import { useDemoLoop } from "./useDemoLoop";

/** A timer that is cleared on unmount, for the short "working…" states. */
function useLater() {
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (fn: () => void, ms: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(fn, ms);
  };
}

/** The two-row bento every category tab uses: wide + narrow, then narrow + wide. */
function Bento({ tiles }: { tiles: [JSX.Element, JSX.Element, JSX.Element, JSX.Element] }) {
  return (
    <div className={styles.bento}>
      <div className={`layout-split--primary ${styles.bentoRow}`}>
        <div className={styles.tile}>{tiles[0]}</div>
        <div className={styles.tile}>{tiles[1]}</div>
      </div>
      <div className={`layout-split--secondary ${styles.bentoRow}`}>
        <div className={styles.tile}>{tiles[2]}</div>
        <div className={styles.tile}>{tiles[3]}</div>
      </div>
    </div>
  );
}

/* ---------- SaaS ---------- */

function PricingTile() {
  const [interval, setInterval] = useState<PricingInterval>("month");
  const [plans, setPlans] = useState(CAT_PLANS);
  return (
    <PricingPlans
      plans={plans}
      interval={interval}
      onIntervalChange={setInterval}
      onSelect={(id) => setPlans((list) => list.map((plan) => ({ ...plan, current: plan.id === id })))}
      description="Prices are example data."
      savingsLabel="Save 17% with yearly"
      footnote="Prices exclude tax. Change or cancel any time."
    />
  );
}

function NotificationsTile() {
  const [items, setItems] = useState<NotificationItem[]>(CAT_NOTIFICATIONS);
  const markRead = (id: string) => setItems((list) => list.map((item) => (item.id === id ? { ...item, read: true } : item)));
  return (
    <NotificationStack
      inline
      items={items}
      onItemClick={markRead}
      onMarkRead={markRead}
      onMarkAll={() => setItems((list) => list.map((item) => ({ ...item, read: true })))}
    />
  );
}

function SetupTile() {
  const [tasks, setTasks] = useState<SetupTask[]>(CAT_SETUP);
  const advance = (id: string) =>
    setTasks((current) => {
      const index = current.findIndex((task) => task.id === id);
      const nextOpen = current.findIndex((task, i) => i > index && task.status === "todo");
      return current.map((task, i) =>
        i === index
          ? { ...task, status: "done" }
          : i === nextOpen
            ? { ...task, status: "current" }
            : task.status === "current"
              ? { ...task, status: "todo" }
              : task,
      );
    });
  return <SetupGuide title="Get Northwind ready" tasks={tasks} onTaskAction={advance} onComplete={() => setTasks(CAT_SETUP)} />;
}

function IntegrationsTile() {
  const [items, setItems] = useState<IntegrationItem[]>(CAT_INTEGRATIONS);
  const [connecting, setConnecting] = useState<string | undefined>();
  const later = useLater();
  const connect = (id: string) => {
    setConnecting(id);
    later(() => {
      setItems((list) => list.map((item) => (item.id === id ? { ...item, status: "connected" } : item)));
      setConnecting(undefined);
    }, 900);
  };
  return (
    <IntegrationPicker
      note="example providers"
      items={items}
      categories={CAT_INTEGRATION_CATEGORIES}
      onConnect={connect}
      connectingId={connecting}
    />
  );
}

function SaasBento() {
  return <Bento tiles={[<PricingTile key="a" />, <NotificationsTile key="b" />, <SetupTile key="c" />, <IntegrationsTile key="d" />]} />;
}

/* ---------- Forms ---------- */

function WorkspaceFormTile() {
  const [name, setName] = useState("Northwind Traders");
  const [email, setEmail] = useState("billing@northwind.example");
  const [cadence, setCadence] = useState("monthly");
  const [reminders, setReminders] = useState(true);
  const [saved, setSaved] = useState(false);
  const touch = <T,>(set: (value: T) => void) => (value: T) => {
    set(value);
    setSaved(false);
  };
  return (
    <Card
      title="Workspace settings"
      description={saved ? "Saved. Example data only." : "Used on every invoice you send."}
      actions={[
        { label: "Reset", appearance: "outline", mode: "neutral", onClick: () => setSaved(false) },
        { label: "Save changes", appearance: "soft", mode: "primary", onClick: () => setSaved(true) },
      ]}
    >
      <FieldSet legend="Company" description="Shown in the invoice header.">
        <Field label="Company name" htmlFor="cat-form-name">
          <Input id="cat-form-name" value={name} onChange={touch(setName)} />
        </Field>
        <Field label="Billing email" htmlFor="cat-form-email" hint="Replies from customers land here.">
          <Input id="cat-form-email" type="email" iconStart="Mail" value={email} onChange={touch(setEmail)} />
        </Field>
        <Field label="Invoice cadence" htmlFor="cat-form-cadence">
          <SegmentedControl
            id="cat-form-cadence"
            ariaLabel="Invoice cadence"
            value={cadence}
            onChange={touch(setCadence)}
            items={[
              { value: "weekly", label: "Weekly" },
              { value: "monthly", label: "Monthly" },
              { value: "quarterly", label: "Quarterly" },
            ]}
          />
        </Field>
        <Switch id="cat-form-reminders" label="Send payment reminders" checked={reminders} onChange={touch(setReminders)} />
      </FieldSet>
    </Card>
  );
}

function BrandColourTile() {
  const [colour, setColour] = useState(CAT_BRAND_DEFAULT);
  return (
    <Card title="Brand colour" description="Used on buttons and links in your invoices.">
      <ColorPicker ariaLabel="Brand colour" value={colour} onChange={setColour} swatches={CAT_BRAND_SWATCHES} />
    </Card>
  );
}

function AlertRulesTile() {
  const [threshold, setThreshold] = useState(80);
  const [recipients, setRecipients] = useState(["finance", "maya.chen"]);
  return (
    <Card title="Spend alerts" description="Warn people before the budget runs out.">
      <FieldSet legend="Alert rule">
        <Field label={`Notify at ${threshold}% of budget`} htmlFor="cat-form-threshold">
          <Slider
            id="cat-form-threshold"
            value={threshold}
            min={50}
            max={100}
            step={5}
            onValueChange={(value) => setThreshold(Array.isArray(value) ? value[0] : value)}
          />
        </Field>
        <Field label="Recipients" htmlFor="cat-form-recipients" hint="Press Enter to add one.">
          <TagInput id="cat-form-recipients" placeholder="Add a person or team" value={recipients} onChange={setRecipients} />
        </Field>
      </FieldSet>
    </Card>
  );
}

function AttachmentsTile() {
  const [files, setFiles] = useState<FileUploadItem[]>(CAT_FILES);
  const [ref, tick] = useDemoLoop<HTMLDivElement>(700);
  const progress = 40 + ((tick * 15) % 60);
  const shown = files.map((file) => (file.status === "uploading" ? { ...file, progress } : file));
  return (
    // inert: on the landing page the drop zone must not open the browser's file dialog.
    <div ref={ref} inert>
      <Card title="Attachments" description="Contracts and logos for this customer. Files stay in your browser.">
        <Field label="Upload files" htmlFor="cat-form-files">
          <FileUpload
            id="cat-form-files"
            multiple
            maxSizeLabel="PDF, SVG or CSV up to 10 MB"
            files={shown}
            onFilesSelected={(picked) =>
              setFiles((list) => [
                ...list,
                ...picked.map((file, i) => ({ id: `${file.name}-${list.length + i}`, name: file.name, size: file.size, status: "done" as const })),
              ])
            }
            onRemove={(id) => setFiles((list) => list.filter((file) => file.id !== id))}
            onRetry={(id) =>
              setFiles((list) => list.map((file) => (file.id === id ? { ...file, status: "done", error: undefined, size: 840_000 } : file)))
            }
          />
        </Field>
      </Card>
    </div>
  );
}

function FormsBento() {
  return <Bento tiles={[<WorkspaceFormTile key="a" />, <BrandColourTile key="b" />, <AlertRulesTile key="c" />, <AttachmentsTile key="d" />]} />;
}

/* ---------- Data display ---------- */

function CustomersTile() {
  const [customers, setCustomers] = useState(CAT_CUSTOMERS);
  return (
    <DataTable
      caption="Customers"
      searchPlaceholder="Search customers"
      selectable
      columns={CAT_CUSTOMER_COLUMNS}
      rows={catCustomerRows(customers)}
      bulkActions={[
        {
          id: "paid",
          label: "Mark as paid",
          iconStart: "Check",
          onClick: (ids) => setCustomers((list) => list.map((customer) => (ids.includes(customer.id) ? { ...customer, paid: true } : customer))),
        },
      ]}
    />
  );
}

function UsageTile() {
  return (
    <Card title="Plan usage" description="Pro plan · example data">
      <UsageList label="Plan usage" items={CAT_USAGE} />
    </Card>
  );
}

function RoadmapTile() {
  return (
    <Card title="Roadmap" description="What ships when.">
      <Timeline label="Billing roadmap" headingLevel={4} items={CAT_TIMELINE} />
    </Card>
  );
}

/** The kit's KpiBoard block: pick a KPI to chart it and list its top rows, with one range for all. */
function RevenueTile() {
  return (
    <KpiBoard
      description="Acme Analytics · example data"
      metrics={KPI_METRICS}
      series={KPI_SERIES}
      rows={KPI_ROWS}
      ranges={KPI_RANGES}
      defaultRange="30d"
      rowLimit={3}
    />
  );
}

function DataDisplayBento() {
  return <Bento tiles={[<CustomersTile key="a" />, <UsageTile key="b" />, <RoadmapTile key="c" />, <RevenueTile key="d" />]} />;
}

/* ---------- Navigation ---------- */

const FRAME_TABS = ["overview", "lines", "activity"] as const;

const FRAME_COLUMNS = CAT_INVOICE_COLUMNS.filter((column) => column.key !== "due" && column.key !== "status");

/** A few rows under each frame tab, offset so the table visibly changes with the tab. */
function frameTable(offset: number) {
  const rows = [...CAT_INVOICES.all.slice(offset), ...CAT_INVOICES.all.slice(0, offset)].slice(0, 3);
  return <Table caption="Example rows" size="sm" columns={FRAME_COLUMNS} rows={rows} />;
}

/** A small product frame: AppHeader on top, SideNav beside a PageHeader with breadcrumbs and Tabs.
 *  The active nav item and tab move along by themselves; nothing opens. */
function AppFrameTile() {
  const [ref, tick] = useDemoLoop<HTMLDivElement>(2600);
  const order = ["invoices", "customers", "reports", "invoices"];
  const active = order[tick % order.length];
  const label = CAT_SIDENAV.flatMap((group) => group.items).find((item) => item.id === active)?.label ?? "Invoices";
  const groups: SideNavGroup[] = CAT_SIDENAV.map((group) => ({
    ...group,
    items: group.items.map((item) => ({ ...item, active: item.id === active })),
  }));
  return (
    <div ref={ref} className={styles.navFrame} inert>
      <AppHeader
        title="Northwind"
        start={<Breadcrumb ariaLabel="Example breadcrumb" items={[{ label: "Home", icon: "House", iconOnly: true }, { label: "Workspace" }, { label }]} />}
        searchPlaceholder="Search invoices"
        searchShortcut="⌘K"
      />
      <div className={styles.navFrameBody}>
        <SideNav title="Northwind" mark="N" groups={groups} />
        <div className={styles.navFrameMain}>
          <PageHeader title={label} subtitle="Northwind Traders · example data" />
          <Tabs
            size="sm"
            ariaLabel={`${label} views`}
            value={FRAME_TABS[tick % FRAME_TABS.length]}
            items={[
              { id: "overview", label: "Overview", content: frameTable(0) },
              { id: "lines", label: "Line items", content: frameTable(1) },
              { id: "activity", label: "Activity", content: frameTable(2) },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

/** A docs-style nav: grouped links, with the current page stepping down the list. */
function AppNavTile() {
  const [ref, tick] = useDemoLoop<HTMLDivElement>(1800);
  const leaves = CAT_APPNAV.flatMap((group) => group.items.map((item) => item.href));
  const current = leaves[(tick + 3) % leaves.length];
  const groups = CAT_APPNAV.map((group) => ({ ...group, items: group.items.map((item) => ({ ...item, active: item.href === current })) }));
  return (
    <div ref={ref} inert>
      <Card title="Docs" description="Grouped pages with the current one marked.">
        <AppNav aria-label="Example docs" groups={groups} />
      </Card>
    </div>
  );
}

/** The sections of one long page. A demo: it does not scroll this page. */
function AnchorsTile() {
  return (
    <div inert>
      <Card title="On this page" description="Jump to a section of a long page.">
        <AnchorNav items={CAT_ANCHORS} spy={false} ariaLabel="Example page sections" />
      </Card>
    </div>
  );
}

const INVOICE_VIEWS = ["all", "overdue", "paid"] as const;

/** Tabs, a table and paging. The view and the page move along by themselves. */
function InvoiceTabsTile() {
  const [ref, tick] = useDemoLoop<HTMLDivElement>(2400);
  const view = INVOICE_VIEWS[Math.floor(tick / 2) % INVOICE_VIEWS.length];
  const page = (tick % 3) + 1;
  const tab = (id: (typeof INVOICE_VIEWS)[number], label: string) => ({
    id,
    label: `${label} · ${CAT_INVOICES[id].length}`,
    content: <Table caption={`${label} invoices`} size="sm" columns={CAT_INVOICE_COLUMNS} rows={CAT_INVOICES[id]} />,
  });
  return (
    <div ref={ref} inert>
      <Card title="Invoices" description="Switch views and page through them in place.">
        <div className={styles.tileStack}>
          <Tabs ariaLabel="Invoice status" value={view} items={[tab("all", "All"), tab("overdue", "Overdue"), tab("paid", "Paid")]} />
          <Pagination page={page} pageCount={8} onPageChange={() => {}} size="sm" />
        </div>
      </Card>
    </div>
  );
}

function NavigationBento() {
  return <Bento tiles={[<AppFrameTile key="a" />, <AppNavTile key="b" />, <AnchorsTile key="c" />, <InvoiceTabsTile key="d" />]} />;
}

/* ---------- Feedback ---------- */

function ImportTile() {
  const [ref, tick] = useDemoLoop<HTMLDivElement>(600);
  const value = 20 + ((tick * 8) % 80);
  return (
    <div ref={ref}>
      <Card title="Importing customers" description="customers.csv · 1,284 rows">
        <ProgressSteps ariaLabel="Import steps" steps={CAT_IMPORT_STEPS} current={2} size="sm" />
        <Progress label="Rows imported" value={value} showValue valuePosition="end" />
      </Card>
    </div>
  );
}

function EmptyTile() {
  const [filtered, setFiltered] = useState(true);
  return filtered ? (
    <Empty
      outlined
      icon="SearchX"
      title="No overdue invoices"
      description="Everything sent this month has been paid."
      actions={
        <Button appearance="outline" mode="neutral" size="sm" onClick={() => setFiltered(false)}>
          Clear filter
        </Button>
      }
    />
  ) : (
    <Empty
      outlined
      icon="Inbox"
      title="Filter cleared"
      description="All 42 invoices would show here."
      actions={
        <Button appearance="ghost" mode="neutral" size="sm" iconStart="RotateCcw" onClick={() => setFiltered(true)}>
          Back
        </Button>
      }
    />
  );
}

/** A card that loads: Skeleton placeholders, then the content, on a loop. No portal, nothing floats. */
function LoadingTile() {
  const [ref, tick] = useDemoLoop<HTMLDivElement>(1800);
  const loading = tick % 2 === 0;
  return (
    <div ref={ref}>
      <Card title="Loading" description="Skeleton holds the layout while data loads, then steps aside.">
        <div className={styles.tileStack}>
          <Skeleton loading={loading} shape="text" lines={3} label="Loading invoice summary">
            <p>Invoice INV-0117 for Acme Co is due on 1 December. Two reminders are scheduled.</p>
          </Skeleton>
        </div>
      </Card>
    </div>
  );
}

function AlertsTile() {
  return (
    <div className={styles.tileStack}>
      <Alert variant="info" title="Scheduled maintenance">
        Payments pause for ten minutes on Sunday at 02:00 UTC.
      </Alert>
      <Alert variant="success" title="Invoice sent">
        INV-2026-0117 is on its way to Acme Co.
      </Alert>
      <Alert variant="warning" title="Card expiring">
        Visa 4242 expires next month. Update it to avoid failed payments.
      </Alert>
      <Alert variant="danger" title="Payment failed">
        Globex’s card was declined. We’ll retry in 24 hours.
      </Alert>
    </div>
  );
}

function FeedbackBento() {
  return <Bento tiles={[<ImportTile key="a" />, <EmptyTile key="b" />, <LoadingTile key="c" />, <AlertsTile key="d" />]} />;
}

/* ---------- Overlays (static panels only: nothing here opens an overlay) ---------- */

function EditInvoiceTile() {
  const [customer, setCustomer] = useState("Acme Co");
  const [amount, setAmount] = useState("782.40");
  const [saved, setSaved] = useState(false);
  return (
    <div className={styles.tileCenter}>
      <ModalCard
        size="lg"
        title="Edit invoice"
        description={saved ? "Saved. Example data only." : "INV-2026-0117 · changes apply on save."}
        footer={
          <ButtonGroup ariaLabel="Edit invoice actions">
            <Button appearance="outline" mode="neutral" onClick={() => setSaved(false)}>
              Cancel
            </Button>
            <Button appearance="soft" mode="primary" onClick={() => setSaved(true)}>
              Save
            </Button>
          </ButtonGroup>
        }
      >
        <FieldSet legend="Invoice">
          <Field label="Customer" htmlFor="cat-modal-customer">
            <Input id="cat-modal-customer" value={customer} onChange={(value) => (setCustomer(value), setSaved(false))} />
          </Field>
          <Field label="Amount" htmlFor="cat-modal-amount">
            <Input id="cat-modal-amount" start="$" value={amount} onChange={(value) => (setAmount(value), setSaved(false))} />
          </Field>
        </FieldSet>
      </ModalCard>
    </div>
  );
}

function ConfirmTile() {
  const [deleted, setDeleted] = useState(false);
  return (
    <div className={styles.tileCenter}>
      <ModalCard
        size="sm"
        title={deleted ? "Project deleted" : "Delete project?"}
        description={deleted ? "Example only: nothing was removed." : "Invoices in Q4 Retainers are removed too. This can’t be undone."}
        footer={
          deleted ? (
            <Button appearance="outline" mode="neutral" iconStart="RotateCcw" onClick={() => setDeleted(false)}>
              Undo
            </Button>
          ) : (
            <ButtonGroup ariaLabel="Delete project actions">
              <Button appearance="outline" mode="neutral">
                Cancel
              </Button>
              <Button appearance="solid" mode="danger" onClick={() => setDeleted(true)}>
                Delete
              </Button>
            </ButtonGroup>
          )
        }
      />
    </div>
  );
}

const TOOLBAR = [
  { id: "bold", label: "Bold", icon: "Bold" },
  { id: "link", label: "Insert link", icon: "Link" },
  { id: "comment", label: "Add comment", icon: "MessageSquare" },
] as const;

function TooltipTile() {
  const [ref, tick] = useDemoLoop<HTMLDivElement>(1600);
  const shown = tick % TOOLBAR.length;
  return (
    <div ref={ref}>
      <Card title="Tooltips" description="A short name on hover or focus.">
        <ButtonGroup ariaLabel="Formatting">
          {TOOLBAR.map((tool, i) => (
            <Tooltip key={tool.id} content={tool.label} placement="bottom" open={i === shown}>
              <Button appearance="outline" mode="neutral" size="sm" iconStart={tool.icon} ariaLabel={tool.label} />
            </Tooltip>
          ))}
        </ButtonGroup>
      </Card>
    </div>
  );
}

function CommandTile() {
  const [picked, setPicked] = useState<string | undefined>();
  const labels = new Map(CAT_COMMANDS.flatMap((group) => group.items.map((item) => [item.id, item.label] as const)));
  return (
    <div className={styles.tileStack}>
      <Command label="Search commands" placeholder="Type a command or search…" groups={CAT_COMMANDS} onSelect={(id) => setPicked(labels.get(id))} />
      {picked ? <Badge tone="neutral">{`Picked: ${picked}`}</Badge> : null}
    </div>
  );
}

function OverlaysBento() {
  return <Bento tiles={[<EditInvoiceTile key="a" />, <ConfirmTile key="b" />, <TooltipTile key="c" />, <CommandTile key="d" />]} />;
}

/** One bento per component category, keyed by the group label in COMPONENT_GROUPS. */
export const CATEGORY_BENTOS: Record<string, () => JSX.Element> = {
  SaaS: SaasBento,
  Forms: FormsBento,
  "Data display": DataDisplayBento,
  Navigation: NavigationBento,
  Feedback: FeedbackBento,
  Overlays: OverlaysBento,
};

import type { ReactNode } from "react";
import { Accordion } from "agentic-ds-kit";
import { UsageMeter } from "agentic-ds-kit";
import { TaskBoard } from "agentic-ds-kit";
import { InvoiceDocument } from "agentic-ds-kit";
import { PricingPlans } from "agentic-ds-kit";
import { IntegrationPicker } from "agentic-ds-kit";
import { CommentsPanel } from "agentic-ds-kit";
import { CommentThread } from "agentic-ds-kit";
import { SetupGuide } from "agentic-ds-kit";
import { NotificationStack } from "agentic-ds-kit";
import { ExperimentCard } from "agentic-ds-kit";
import { BlurCrossfade, GradientText, GridBackground, TextReveal, TiltCard } from "agentic-ds-kit";
import { ChangeSummary } from "agentic-ds-kit";
import { TraceWaterfall } from "agentic-ds-kit";
import { MemoryPanel } from "agentic-ds-kit";
import { InlineDiff } from "agentic-ds-kit";
import { MessageActions } from "agentic-ds-kit";
import { CitedAnswer } from "agentic-ds-kit";
import { ContextWindow } from "agentic-ds-kit";
import { ModelPicker } from "agentic-ds-kit";
import { AgentSteering } from "agentic-ds-kit";
import { AutonomyDial } from "agentic-ds-kit";
import { DecisionCard } from "agentic-ds-kit";
import { AgentInbox } from "agentic-ds-kit";
import { AgentLanes } from "agentic-ds-kit";
import { AgentTree } from "agentic-ds-kit";
import { AgentFleet } from "agentic-ds-kit";
import { AgentMonitor } from "agentic-ds-kit";
import { AgentPlan } from "agentic-ds-kit";
import { AgentTrail } from "agentic-ds-kit";
import { Alert } from "agentic-ds-kit";
import { AnchorNav } from "agentic-ds-kit";
import { AppHeader } from "agentic-ds-kit";
import { AppNav } from "agentic-ds-kit";
import { ApprovalCard } from "agentic-ds-kit";
import { PermissionRequest } from "agentic-ds-kit";
import { RunningNow } from "agentic-ds-kit";
import { ToolCallCard } from "agentic-ds-kit";
import { Avatar } from "agentic-ds-kit";
import { AvatarGroup } from "agentic-ds-kit";
import { Badge } from "agentic-ds-kit";
import { BarChart } from "agentic-ds-kit";
import { Breadcrumb } from "agentic-ds-kit";
import { Button } from "agentic-ds-kit";
import { ButtonGroup } from "agentic-ds-kit";
import { Calendar } from "agentic-ds-kit";
import { Card } from "agentic-ds-kit";
import { Carousel } from "agentic-ds-kit";
import { Cell } from "agentic-ds-kit";
import { Chat } from "agentic-ds-kit";
import { Checkbox } from "agentic-ds-kit";
import { CodeSnippet } from "agentic-ds-kit";
import { Collapsible } from "agentic-ds-kit";
import { Combobox } from "agentic-ds-kit";
import { ColorPicker } from "agentic-ds-kit";
import { Command } from "agentic-ds-kit";
import { ContextMenu } from "agentic-ds-kit";
import { Conveyor } from "agentic-ds-kit";
import { Count } from "agentic-ds-kit";
import { CurrencyInput } from "agentic-ds-kit";
import { FileUpload } from "agentic-ds-kit";
import { FilterBar } from "agentic-ds-kit";
import { FilterButton } from "agentic-ds-kit";
import { LinkList } from "agentic-ds-kit";
import { Meter } from "agentic-ds-kit";
import { Skeleton } from "agentic-ds-kit";
import { DataGrid } from "agentic-ds-kit";
import { DataTable } from "agentic-ds-kit";
import { DatePicker } from "agentic-ds-kit";
import { DateRangePicker } from "agentic-ds-kit";
import { DateTimePicker } from "agentic-ds-kit";
import { Divider } from "agentic-ds-kit";
import { DropdownMenu } from "agentic-ds-kit";
import { Empty } from "agentic-ds-kit";
import { Field } from "agentic-ds-kit";
import { FieldSet } from "agentic-ds-kit";
import { HeaderCell } from "agentic-ds-kit";
import { HelpPopover } from "agentic-ds-kit";
import { Input } from "agentic-ds-kit";
import { InputOTP } from "agentic-ds-kit";
import { InsightCard } from "agentic-ds-kit";
import { LineChart } from "agentic-ds-kit";
import { ListView } from "agentic-ds-kit";
import { LoadingAnimation } from "agentic-ds-kit";
import { ModalCard } from "agentic-ds-kit";
import { MultiSelect } from "agentic-ds-kit";
import { NavigationMenu } from "agentic-ds-kit";
import { NumberInput } from "agentic-ds-kit";
import { NumberTransition } from "agentic-ds-kit";
import { PageHeader } from "agentic-ds-kit";
import { Pagination } from "agentic-ds-kit";
import { PieChart } from "agentic-ds-kit";
import { Progress } from "agentic-ds-kit";
import { ProgressSteps } from "agentic-ds-kit";
import { Popover } from "agentic-ds-kit";
import { RadioGroup } from "agentic-ds-kit";
import { Resizable } from "agentic-ds-kit";
import { Scoreboard } from "agentic-ds-kit";
import { Scorecard } from "agentic-ds-kit";
import { Section } from "agentic-ds-kit";
import { Select } from "agentic-ds-kit";
import { ShimmerText } from "agentic-ds-kit";
import { SideNav } from "agentic-ds-kit";
import { Slider } from "agentic-ds-kit";
import { Spinner } from "agentic-ds-kit";
import { Switch } from "agentic-ds-kit";
import { Table } from "agentic-ds-kit";
import { Tabs } from "agentic-ds-kit";
import { Tag } from "agentic-ds-kit";
import { TagInput } from "agentic-ds-kit";
import { Textarea } from "agentic-ds-kit";
import { TimePicker } from "agentic-ds-kit";
import { ThinkingAnimation } from "agentic-ds-kit";
import { Timeline } from "agentic-ds-kit";
import { Tooltip } from "agentic-ds-kit";
import { TreeView } from "agentic-ds-kit";
import { UsageList } from "agentic-ds-kit";
import { PLAYGROUND_APPNAV_DEMO_GROUPS } from "@/lib/playground-nav";
import { ToastGalleryTile } from "./ToastDoc";
import previewStyles from "./GalleryPreview.module.css";

function Stage({
  children,
  variant = "auto",
}: {
  children: ReactNode;
  variant?: "auto" | "wide" | "table" | "panel" | "sidebar";
}) {
  return <div className={previewStyles[variant]}>{children}</div>;
}

const CHART = [
  { label: "Mon", value: 12 },
  { label: "Tue", value: 18 },
  { label: "Wed", value: 14 },
];

const noop = () => undefined;

export function GalleryPreview({ id }: { id: string }) {
  switch (id) {
    case "anchornav":
      return (
        <AnchorNav
          spy={false}
          ariaLabel="Record"
          items={[
            { id: "gallery-anchor-details", label: "Details" },
            { id: "gallery-anchor-billing", label: "Billing" },
            { id: "gallery-anchor-usage", label: "Usage" },
          ]}
        />
      );
    case "agentfleet":
      return (
        <Stage variant="wide">
          <AgentFleet
            totals=""
            agents={[
              {
                id: "billing",
                name: "Billing refactor",
                status: "running",
                cost: "$1.28",
                elapsed: "6m 40s",
                subAgents: [
                  { id: "a", name: "scan-codebase", status: "done" },
                  { id: "b", name: "edit-invoice", status: "done" },
                  { id: "c", name: "write-tests", status: "running" },
                  { id: "d", name: "migrate-db", status: "queued" },
                ],
              },
            ]}
          />
        </Stage>
      );
    case "agentplan":
      return (
        <Stage variant="wide">
          <AgentPlan
            collapsed
            title="Fix invoice rounding"
            summary="5 steps"
            steps={[{ id: "1", label: "Read invoice module" }]}
          />
        </Stage>
      );
    case "agenttrail":
      return (
        <Stage variant="wide">
          <AgentTrail
            title="Rate limit"
            steps={[
              { id: "1", label: "Read auth module", status: "done", duration: "4.1s" },
              { id: "2", label: "Draft patch", status: "running", timer: "0:18" },
              { id: "3", label: "Run tests", status: "pending" },
            ]}
          />
        </Stage>
      );
    case "approvalcard":
      return (
        <div className={previewStyles.stack}>
          <ApprovalCard
            status="approved"
            title="Run migration?"
            action={{ kind: "command", command: "npm run db:migrate" }}
            resolvedBy="you"
            resolvedAt="2s ago"
          />
          <ApprovalCard status="denied" title="Delete exports?" action={{ kind: "command", command: "rm -rf ./tmp" }} resolvedBy="you" />
        </div>
      );
    case "agentmonitor":
      return (
        <Stage variant="wide">
          <AgentMonitor
            collapsed
            name="Refactor billing"
            elapsed="02:14"
            cost="$0.42"
            steps={[
              { id: "a", tool: "search_files", status: "done" },
              { id: "b", tool: "read_file", status: "done" },
              { id: "c", tool: "edit_file", status: "running" },
            ]}
          />
        </Stage>
      );
    case "permissionrequest":
      return (
        <Stage variant="wide">
          <PermissionRequest
            status="granted"
            scopes={[{ id: "docs", resource: "~/acme/docs", access: "read" }]}
            resolvedNote="until 17 Nov"
          />
        </Stage>
      );
    case "runningnow":
      return (
        <Stage variant="wide">
          <RunningNow
            layout="stack"
            items={[
              { id: "a", name: "Billing refactor", status: "running", elapsed: "02:14" },
              { id: "b", name: "Migrate DB", activity: "waiting for OK", status: "waiting", elapsed: "00:31" },
            ]}
          />
        </Stage>
      );
    case "toolcallcard":
      return (
        <div className={previewStyles.stack}>
          <ToolCallCard name="read_file" summary="invoice.ts" duration="0.4s" />
          <ToolCallCard name="search_files" summary="3 matches" status="running" duration="1.2s" />
        </div>
      );
    case "agenttree":
      return (
        <Stage variant="wide">
          <AgentTree
            root={{
              id: "r",
              name: "Ship billing",
              status: "running",
              children: [
                { id: "a", name: "scan", status: "done", cost: 0.14 },
                { id: "b", name: "migrate", status: "waiting", cost: 0.12 },
              ],
            }}
          />
        </Stage>
      );
    case "agentlanes":
      return (
        <Stage variant="wide">
          <AgentLanes
            now={600000}
            agents={[{ id: "a", name: "Coder" }, { id: "b", name: "Tester" }]}
            tasks={[
              { id: "1", agentId: "a", title: "edit", status: "done", start: 60000, end: 300000, handoffTo: "2" },
              { id: "2", agentId: "b", title: "tests", status: "running", start: 320000 },
            ]}
          />
        </Stage>
      );
    case "agentinbox":
      return (
        <Stage variant="wide">
          <AgentInbox
            items={[
              { id: "1", agentName: "Migrate DB", type: "approval", preview: "Run migration on staging?", time: "2m" },
              { id: "2", agentName: "Docs sweep", type: "recap", preview: "Draft ready", time: "1h", read: true },
            ]}
          />
        </Stage>
      );
    case "decisioncard":
      return (
        <Stage variant="wide">
          <DecisionCard title="Billing asks" question="Keep v1?" status="resolved" resolvedLabel="Keep v1 for 30 days" resolvedAt="14:03" />
        </Stage>
      );
    case "autonomydial":
      return (
        <Stage variant="wide">
          <AutonomyDial value="risk" size="sm" />
        </Stage>
      );
    case "agentsteering":
      return (
        <Stage variant="wide">
          <AgentSteering name="Billing refactor" meta="step 6" elapsed="02:14" onSteer={noop} />
        </Stage>
      );
    case "modelpicker":
      return (
        <ModelPicker
          value="sonnet"
          models={[{ id: "sonnet", name: "Claude Sonnet 5.5", costTier: "$$", tagline: "balanced" }]}
        />
      );
    case "contextwindow":
      return <ContextWindow compact used={104000} limit={200000} />;
    case "citedanswer":
      return (
        <Stage variant="wide">
          <CitedAnswer content="Round half-even[1]." citations={[{ id: "1", title: "Rounding rules" }]} />
        </Stage>
      );
    case "messageactions":
      return <MessageActions onCopy={noop} onRetry={noop} onFeedback={noop} />;
    case "inlinediff":
      return (
        <Stage variant="wide">
          <InlineDiff
            title="Proposed edit"
            lines={[
              { type: "remove", text: "return subtotal;", oldNo: 42 },
              { type: "add", text: "return total;", newNo: 42 },
            ]}
            onAccept={noop}
          />
        </Stage>
      );
    case "memorypanel":
      return (
        <Stage variant="wide">
          <MemoryPanel items={[{ id: "1", content: "Uses pnpm, not npm", source: "from repo scan", usedHere: true }]} />
        </Stage>
      );
    case "tracewaterfall":
      return (
        <Stage variant="wide">
          <TraceWaterfall
            compact
            title="Run trace"
            spans={[
              { id: "a", label: "Plan", kind: "model", startMs: 0, endMs: 4000, cost: 0.03 },
              { id: "b", label: "read_file", kind: "tool", startMs: 4000, endMs: 6000 },
              { id: "c", label: "Approval", kind: "approval", startMs: 6000, endMs: 20000 },
            ]}
          />
        </Stage>
      );
    case "changesummary":
      return (
        <Stage variant="wide">
          <ChangeSummary period="Oct → Nov" items={[{ id: "mrr", label: "MRR", before: "$48.2K", after: "$52.9K", delta: "+9.8%", direction: "up", sentiment: "good" }]} />
        </Stage>
      );
    case "experimentcard":
      return (
        <Stage variant="wide">
          <ExperimentCard name="Checkout copy" metricLabel="Conversion" status="running" variants={[{ id: "a", label: "v1", traffic: 50, value: "4.1%" }, { id: "b", label: "v2", traffic: 50, value: "4.6%", isLeading: true }]} />
        </Stage>
      );
    case "notificationstack":
      return (
        <NotificationStack items={[{ id: "a", title: "Payment received", createdAt: "5m", read: false, tone: "success" }]} />
      );
    case "setupguide":
      return (
        <Stage variant="wide">
          <SetupGuide title="Get ready" tasks={[{ id: "a", label: "Add company details", status: "done" }, { id: "b", label: "Import customers", status: "current" }]} />
        </Stage>
      );
    case "commentthread":
      return (
        <Stage variant="wide">
          <CommentThread title="Invoice" comments={[{ id: "a", author: { id: "p", name: "Priya Shah" }, createdAt: "2h", body: "Confirm the tax rate?" }]} value="" onValueChange={noop} onSubmit={noop} />
        </Stage>
      );
    case "commentspanel":
      return (
        <CommentsPanel threads={[{ id: "a", title: "Tax rate", preview: "Marking ready.", count: 3, updatedAt: "45m" }]} open={false} onOpenChange={noop} onSelect={noop} />
      );
    case "integrationpicker":
      return (
        <Stage variant="wide">
          <IntegrationPicker items={[{ id: "a", name: "Northwind Ledger", description: "Sync invoices", status: "connected" }]} onConnect={noop} />
        </Stage>
      );
    case "pricingplans":
      return (
        <Stage variant="wide">
          <PricingPlans interval="month" onIntervalChange={noop} onSelect={noop} plans={[{ id: "pro", name: "Pro", price: 29, features: ["Integrations"], recommended: true }]} />
        </Stage>
      );
    case "invoicedocument":
      return (
        <Stage variant="wide">
          <InvoiceDocument number="INV-0117" status="issued" to="Acme Co" issuedOn="01 Nov" lines={[{ id: "a", description: "Pro plan", quantity: 1, unitPrice: "$480", amount: "$480" }]} subtotal="$480" total="$480" />
        </Stage>
      );
    case "blurcrossfade":
      return (
        <BlurCrossfade contentKey="done">
          <Tag dot="success">Done</Tag>
        </BlurCrossfade>
      );
    case "textreveal":
      return (
        <Stage variant="wide">
          <TextReveal as="p">Agents that ask before they act</TextReveal>
        </Stage>
      );
    case "gridbackground":
      return (
        <GridBackground variant="dots">
          <Tag dot="info">Agent Lanes</Tag>
        </GridBackground>
      );
    case "gradienttext":
      return (
        <Stage variant="wide">
          <GradientText as="span">Ship agents people trust</GradientText>
        </Stage>
      );
    case "tiltcard":
      return (
        <TiltCard title="Pro plan" size="sm">
          <Badge tone="primary" appearance="soft" size="sm">Recommended</Badge>
        </TiltCard>
      );
    case "taskboard":
      return (
        <Stage variant="wide">
          <TaskBoard title="Board" columns={[{ id: "t", label: "Todo", cardIds: ["a"] }, { id: "d", label: "Done", cardIds: [] }]} cards={[{ id: "a", title: "Map tax codes" }]} onMove={noop} />
        </Stage>
      );
    case "usagemeter":
      return (
        <Stage variant="wide">
          <UsageMeter title="AI credits" used={6420} limit={10000} />
        </Stage>
      );
    case "accordion":
      return (
        <Stage variant="wide">
          <Accordion items={[{ id: "a", title: "Details", content: "More" }]} />
        </Stage>
      );
    case "alert":
      return (
        <Stage variant="wide">
          <Alert variant="info" title="Saved">
            Draft is up to date.
          </Alert>
        </Stage>
      );
    case "alertdialog":
      return (
        <Stage variant="wide">
          <Card size="sm" title="Delete project?" description="Invoices in this project are removed too.">
            <Button size="sm" appearance="solid" mode="danger">
              Delete
            </Button>
          </Card>
        </Stage>
      );
    case "appheader":
      return (
        <Stage variant="wide">
          <AppHeader
            title="Acme"
            mark="A"
            search={false}
            actions={
              <Button appearance="ghost" mode="neutral" size="sm" iconStart="Bell" ariaLabel="Notifications" />
            }
          />
        </Stage>
      );
    case "appnav":
      return (
        <Stage variant="sidebar">
          <AppNav title="Kit" groups={PLAYGROUND_APPNAV_DEMO_GROUPS} />
        </Stage>
      );
    case "avatar":
      return (
        <div className={previewStyles.chipRow}>
          <Avatar name="Maya Chen" size="sm" />
          <Avatar name="Jordan Lee" size="md" />
          <Avatar name="Alex Rivera" size="lg" />
        </div>
      );
    case "avatargroup":
      return (
        <AvatarGroup
          size="sm"
          ariaLabel="Team"
          items={[{ name: "Maya Chen" }, { name: "Jordan Lee" }, { name: "Alex Rivera" }]}
        />
      );
    case "badge":
      return (
        <div className={previewStyles.chipRow}>
          <Badge tone="success">Active</Badge>
          <Badge tone="warning">Pending</Badge>
          <Badge tone="danger">Failed</Badge>
          <Badge tone="neutral">Draft</Badge>
        </div>
      );
    case "barchart":
      return (
        <Stage variant="wide">
          <BarChart data={CHART} height={96} showTable={false} />
        </Stage>
      );
    case "breadcrumb":
      return (
        <Stage variant="wide">
          <Breadcrumb items={[{ label: "Home", href: "#" }, { label: "Kit" }]} />
        </Stage>
      );
    case "button":
      return (
        <div className={previewStyles.chipRow}>
          <Button size="sm" appearance="solid" mode="primary">
            Save
          </Button>
          <Button size="sm" appearance="outline" mode="neutral">
            Cancel
          </Button>
          <Button size="sm" appearance="ghost" mode="neutral" iconStart="Pencil" ariaLabel="Edit" />
        </div>
      );
    case "buttongroup":
      return (
        <ButtonGroup ariaLabel="View">
          <Button size="sm" appearance="outline" mode="neutral">
            List
          </Button>
          <Button size="sm" appearance="ghost" mode="neutral">
            Board
          </Button>
        </ButtonGroup>
      );
    case "calendar":
      return (
        <Stage variant="wide">
          <Calendar
            label="Team"
            views={["list"]}
            defaultView="list"
            defaultDate="2026-09-20"
            calendars={[{ id: "meetings", name: "Meetings", tone: "brand" }]}
            defaultEvents={[
              { id: "standup", title: "Standup", start: "2026-09-20T09:00", calendar: "meetings" },
              { id: "review", title: "Review", start: "2026-09-22T13:00", calendar: "meetings" },
            ]}
            readOnly
          />
        </Stage>
      );
    case "card":
      return (
        <Stage variant="wide">
          <Card size="sm" title="Workspace" description="Sprint 24">
            <Badge>Active</Badge>
          </Card>
        </Stage>
      );
    case "carousel":
      return (
        <Stage variant="wide">
          <Carousel
            ariaLabel="Slides"
            showControls={false}
            items={[<Badge key="a">One</Badge>, <Badge key="b">Two</Badge>]}
          />
        </Stage>
      );
    case "cell":
      return (
        <div className={previewStyles.stack}>
          <Cell type="avatar" size="sm" label="Maya Chen" name="Maya Chen" />
          <Cell type="badge" size="sm" label="Active" tone="success" />
          <Cell type="text" size="sm" label="INV-1042" />
        </div>
      );
    case "chat":
      return (
        <Stage variant="panel">
          <Chat title="Assistant" status="Ready" messages={[{ role: "assistant", content: "How can I help?" }]} />
        </Stage>
      );
    case "checkbox":
      return (
        <Stage variant="wide">
          <Checkbox id="gallery-checkbox" label="Email me updates" defaultChecked />
        </Stage>
      );
    case "codesnippet":
      return (
        <Stage variant="wide">
          <CodeSnippet title="install.sh" code="npm i agentic-ds-kit" />
        </Stage>
      );
    case "colorpicker":
      return (
        <Stage variant="wide">
          <ColorPicker defaultValue="#2F6FEB" />
        </Stage>
      );
    case "collapsible":
      return (
        <Collapsible trigger="More" defaultOpen>
          Hidden notes
        </Collapsible>
      );
    case "combobox":
      return (
        <Stage variant="wide">
          <Combobox
            id="gallery-combobox"
            size="sm"
            placeholder="Search"
            options={[
              { value: "berlin", label: "Berlin" },
              { value: "lisbon", label: "Lisbon" },
              { value: "oslo", label: "Oslo" },
            ]}
          />
        </Stage>
      );
    case "command":
      return (
        <Stage variant="wide">
          <Command
            placeholder="Search"
            groups={[{ items: [{ id: "home", label: "Home" }, { id: "docs", label: "Docs" }] }]}
          />
        </Stage>
      );
    case "contextmenu":
      return (
        <Stage variant="wide">
          <ContextMenu items={[{ id: "rename", label: "Rename" }, { id: "delete", label: "Delete", danger: true }]}>
            <Card size="sm" title="Launch brief" description="Right-click for rename or delete.">
              <Badge tone="neutral">Draft</Badge>
            </Card>
          </ContextMenu>
        </Stage>
      );
    case "conveyor":
      return (
        <Stage variant="wide">
          <Conveyor label="Filters">
            <div className={previewStyles.chipRow}>
              <Badge>Open</Badge>
              <Badge>Overdue</Badge>
              <Badge>Paid</Badge>
              <Badge>Disputed</Badge>
              <Badge>Credits</Badge>
            </div>
          </Conveyor>
        </Stage>
      );
    case "count":
      return (
        <div className={previewStyles.chipRow}>
          <Count count={3} label="unread" />
          <Count count={12} label="tasks" />
        </div>
      );
    case "fileupload":
      return (
        <Stage variant="wide">
          <FileUpload
            maxSizeLabel="PDF, max 10 MB"
            onFilesSelected={noop}
            files={[
              { id: "a", name: "invoice-q3.pdf", size: 1_240_000, progress: 64, status: "uploading" },
            ]}
          />
        </Stage>
      );
    case "filterbar":
      return (
        <Stage variant="wide">
          <FilterBar
            size="sm"
            filters={[
              { id: "status", label: "Status", value: "Pending" },
              { id: "owner", label: "Owner" },
            ]}
            onClear={() => undefined}
          />
        </Stage>
      );
    case "filterbutton":
      return (
        <div className={previewStyles.chipRow}>
          <FilterButton size="sm" count={2}>
            Status
          </FilterButton>
          <FilterButton size="sm" value="Maya Chen">
            Owner
          </FilterButton>
        </div>
      );
    case "linklist":
      return (
        <Stage variant="wide">
          <LinkList
            label="Quick links"
            items={[
              { id: "tax", label: "Tax Related List", href: "#" },
              { id: "portal", label: "Customer Portal", href: "#" },
            ]}
          />
        </Stage>
      );
    case "meter":
      return (
        <Stage variant="wide">
          <Meter label="Budget spent" value={60} size="sm" showValue />
        </Stage>
      );
    case "skeleton":
      return (
        <Stage variant="wide">
          <Skeleton lines={3} size="sm" />
        </Stage>
      );
    case "currencyinput":
      return (
        <Stage variant="wide">
          <CurrencyInput id="gallery-currency" size="sm" defaultValue={1280} />
        </Stage>
      );
    case "datagrid":
      return (
        <Stage variant="table">
          <DataGrid
            label="Conditions"
            size="sm"
            columns={[
              { key: "field", header: "Field" },
              { key: "value", header: "Value" },
            ]}
            defaultRows={[{ id: "1", field: "Plan name", value: "Enterprise" }]}
          />
        </Stage>
      );
    case "datatable":
      return (
        <Stage variant="table">
          <DataTable
            caption="Tasks"
            columns={[{ key: "task", header: "Task" }]}
            rows={[{ id: "1", task: "Launch brief" }]}
          />
        </Stage>
      );
    case "datepicker":
      return (
        <Stage variant="wide">
          <DatePicker id="gallery-date" size="sm" placeholder="Sep 20, 2026" />
        </Stage>
      );
    case "daterangepicker":
      return (
        <Stage variant="wide">
          <DateRangePicker id="gallery-range" size="sm" />
        </Stage>
      );
    case "datetimepicker":
      return (
        <Stage variant="wide">
          <DateTimePicker id="gallery-datetime" size="sm" defaultValue={{ date: "2026-11-06", time: "09:30" }} />
        </Stage>
      );
    case "divider":
      return (
        <Stage variant="wide">
          <Divider label="or" />
        </Stage>
      );
    case "drawer":
      return (
        <Stage variant="wide">
          <Card size="sm" title="Invoice 1842" description="Opens from the edge of the page.">
            <Button size="sm" appearance="outline" mode="neutral">
              Open
            </Button>
          </Card>
        </Stage>
      );
    case "dropdownmenu":
      return (
        <Stage variant="wide">
          <DropdownMenu
            size="sm"
            appearance="outline"
            mode="neutral"
            trigger="Actions"
            groups={[
              {
                items: [
                  { id: "rename", label: "Rename" },
                  { id: "delete", label: "Delete", danger: true },
                ],
              },
            ]}
          />
        </Stage>
      );
    case "empty":
      return (
        <Stage variant="wide">
          <Empty title="No tasks" icon="Inbox" />
        </Stage>
      );
    case "field":
      return (
        <Stage variant="wide">
          <Field label="Name" htmlFor="gallery-field">
            <Input id="gallery-field" placeholder="Boris" />
          </Field>
        </Stage>
      );
    case "fieldset":
      return (
        <Stage variant="wide">
          <FieldSet legend="Profile">
            <Input id="gallery-fieldset" placeholder="Email" />
          </FieldSet>
        </Stage>
      );
    case "headercell":
      return (
        <div className={previewStyles.chipRow}>
          <HeaderCell label="Owner" size="sm" sortable sort="asc" />
          <HeaderCell label="Status" size="sm" sortable />
          <HeaderCell label="Updated" size="sm" />
        </div>
      );
    case "helppopover":
      return (
        <HelpPopover content="We use this date on the PDF.">
          <Button appearance="ghost" mode="neutral" size="sm" iconStart="CircleHelp" ariaLabel="Help" />
        </HelpPopover>
      );
    case "input":
      return (
        <Stage variant="wide">
          <Input id="gallery-input" placeholder="Search invoices" defaultValue="Northwind" iconStart="Search" />
        </Stage>
      );
    case "inputotp":
      return <InputOTP id="gallery-otp" length={4} size="sm" defaultValue="1234" />;
    case "insightcard":
      return (
        <Stage variant="wide">
          <InsightCard size="sm" title="Unassigned" description="QA still needs an owner." />
        </Stage>
      );
    case "linechart":
      return (
        <Stage variant="wide">
          <LineChart data={CHART} variant="line" height={96} showTable={false} />
        </Stage>
      );
    case "listview":
      return (
        <Stage variant="wide">
          <ListView
            label="People"
            size="sm"
            items={[
              { id: "maya", primary: "Maya Chen", secondary: "Design", name: "Maya Chen" },
              { id: "jon", primary: "Jon Hale", secondary: "Engineering", name: "Jon Hale" },
            ]}
          />
        </Stage>
      );
    case "loadinganimation":
      return <LoadingAnimation label="Loading" size="sm" />;
    case "modal":
    case "modalcard":
      return (
        <Stage variant="wide">
          <ModalCard size="sm" title="Rename" description="Update the task name." />
        </Stage>
      );
    case "multiselect":
      return (
        <Stage variant="wide">
          <MultiSelect
            id="gallery-multi"
            size="sm"
            defaultValue={["design"]}
            options={[
              { value: "design", label: "Design" },
              { value: "product", label: "Product" },
            ]}
          />
        </Stage>
      );
    case "navigationmenu":
      return (
        <Stage variant="wide">
          <NavigationMenu
            items={[
              { id: "home", label: "Home", href: "#", active: true },
              { id: "docs", label: "Docs", href: "#" },
            ]}
          />
        </Stage>
      );
    case "numberinput":
      return (
        <Stage variant="wide">
          <NumberInput id="gallery-number" size="sm" defaultValue={12} min={0} max={99} />
        </Stage>
      );
    case "numbertransition":
      return <NumberTransition value={1280} size="sm" />;
    case "pageheader":
      return (
        <Stage variant="wide">
          <PageHeader title="Overview" subtitle="Sprint 24" />
        </Stage>
      );
    case "pagination":
      return (
        <Stage variant="wide">
          <Pagination pageCount={5} defaultPage={1} size="sm" showLabels={false} />
        </Stage>
      );
    case "piechart":
      return <PieChart data={CHART} size={96} showTable={false} />;
    case "popover":
      return (
        <Stage variant="wide">
          <Card size="sm" title="Share" description="Send this view to the team.">
            <Popover label="Share" trigger={<Button size="sm" appearance="outline" mode="neutral">Share</Button>}>
              Copy the link.
            </Popover>
          </Card>
        </Stage>
      );
    case "progress":
      return <Progress value={64} size="md" shape="circle" showValue ariaLabel="Progress" />;
    case "progresssteps":
      return (
        <Stage variant="wide">
          <ProgressSteps
            size="sm"
            current={1}
            steps={[
              { id: "one", label: "Details" },
              { id: "two", label: "Company" },
              { id: "three", label: "Review" },
            ]}
          />
        </Stage>
      );
    case "radiogroup":
      return (
        <Stage variant="wide">
          <RadioGroup
            name="gallery-radio"
            legend="Choice"
            size="sm"
            defaultValue="one"
            options={[
              { value: "one", label: "One" },
              { value: "two", label: "Two" },
            ]}
          />
        </Stage>
      );
    case "scoreboard":
      return (
        <Stage variant="wide">
          <Scoreboard aria-label="Metrics" items={[{ label: "Open", value: "4", size: "sm" }]} />
        </Stage>
      );
    case "resizable":
      return (
        <Stage variant="wide">
          <Resizable start={<p>List</p>} end={<p>Detail</p>} defaultSize={40} />
        </Stage>
      );
    case "scorecard":
      return (
        <Stage variant="wide">
          <Scorecard size="sm" label="Revenue" value="$48.2k" delta="+4.1%" trend="up" />
        </Stage>
      );
    case "section":
      return (
        <Stage variant="wide">
          <Section title="Open tasks" description="4 items" size="sm">
            <Badge>Ready</Badge>
          </Section>
        </Stage>
      );
    case "select":
      return (
        <Stage variant="wide">
          <Select
            id="gallery-select"
            size="sm"
            placeholder="Choose a plan"
            defaultValue="team"
            options={[
              { value: "team", label: "Team" },
              { value: "enterprise", label: "Enterprise" },
            ]}
          />
        </Stage>
      );
    case "shimmertext":
      return <ShimmerText size="sm">Thinking</ShimmerText>;
    case "sidenav":
      return (
        <Stage variant="sidebar">
          <SideNav
            title="Ops"
            mark="O"
            items={[
              { id: "home", label: "Overview", icon: "House", active: true },
              { id: "inbox", label: "Inbox", icon: "Mail" },
            ]}
          />
        </Stage>
      );
    case "slider":
      return (
        <Stage variant="wide">
          <Slider aria-label="Volume" value={40} onValueChange={noop} />
        </Stage>
      );
    case "spinner":
      return <Spinner size="sm" label="Loading" />;
    case "switch":
      return (
        <div className={previewStyles.stack}>
          <Switch id="gallery-switch" size="md" label="Alerts" defaultChecked />
          <Switch id="gallery-switch-digest" size="md" label="Weekly digest" />
        </div>
      );
    case "table":
      return (
        <Stage variant="table">
          <Table
            size="sm"
            caption="Tasks"
            columns={[{ key: "task", header: "Task" }]}
            rows={[{ task: "Launch brief" }]}
          />
        </Stage>
      );
    case "tabs":
      return (
        <Stage variant="wide">
          <Tabs
            size="sm"
            variant="line"
            defaultValue="one"
            items={[
              { id: "one", label: "One", content: null },
              { id: "two", label: "Two", content: null },
            ]}
          />
        </Stage>
      );
    case "tag":
      return (
        <div className={previewStyles.chipRow}>
          <Tag removable onRemove={noop}>
            Design
          </Tag>
          <Tag selectable defaultSelected count={4}>
            Engineering
          </Tag>
        </div>
      );
    case "taginput":
      return (
        <Stage variant="wide">
          <TagInput id="gallery-tags" size="sm" defaultValue={["billing", "priority"]} />
        </Stage>
      );
    case "textarea":
      return (
        <Stage variant="wide">
          <Textarea id="gallery-textarea" size="sm" rows={2} placeholder="Notes" />
        </Stage>
      );
    case "thinkinganimation":
      return <ThinkingAnimation label="Thinking" size="sm" />;
    case "timeline":
      return (
        <Stage variant="wide">
          <Timeline
            items={[
              { title: "Now", status: "now" },
              { title: "Next", status: "next" },
            ]}
          />
        </Stage>
      );
    case "timepicker":
      return (
        <TimePicker id="gallery-time" size="sm" defaultValue="09:30" />
      );
    case "toast":
      return (
        <Stage>
          <ToastGalleryTile />
        </Stage>
      );
    case "tooltip":
      return (
        <Tooltip content="More info" open>
          <Badge>Hint</Badge>
        </Tooltip>
      );
    case "usagelist":
      return (
        <Stage variant="wide">
          <UsageList
            label="Plan usage"
            items={[
              { id: "storage", label: "Storage", used: 32, limit: 50, unit: "GB" },
              { id: "api", label: "API calls", used: 8420, limit: 10000 },
              { id: "seats", label: "Seats", used: 12, limit: 12 },
            ]}
          />
        </Stage>
      );
    case "treeview":
      return (
        <Stage variant="wide">
          <TreeView
            label="Workspace"
            size="sm"
            selection="multiple"
            showIcons
            showLines
            defaultExpanded={["org", "design"]}
            defaultSelected={["design", "sienna"]}
            items={[
              {
                id: "org",
                label: "Organization",
                children: [
                  {
                    id: "design",
                    label: "Design",
                    children: [{ id: "sienna", label: "Sienna Hewitt", icon: "User" }],
                  },
                  { id: "eng", label: "Engineering", children: [] },
                ],
              },
              { id: "projects", label: "Projects", children: [] },
            ]}
          />
        </Stage>
      );
    default:
      return <Badge>{id}</Badge>;
  }
}

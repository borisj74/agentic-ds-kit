import type { ReactNode } from "react";
import { Accordion } from "agentic-ds-kit";
import { Alert } from "agentic-ds-kit";
import { AppHeader } from "agentic-ds-kit";
import { AppNav } from "agentic-ds-kit";
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
import { Collapsible } from "agentic-ds-kit";
import { Command } from "agentic-ds-kit";
import { DataTable } from "agentic-ds-kit";
import { DatePicker } from "agentic-ds-kit";
import { Empty } from "agentic-ds-kit";
import { Field } from "agentic-ds-kit";
import { FieldSet } from "agentic-ds-kit";
import { HeaderCell } from "agentic-ds-kit";
import { Input } from "agentic-ds-kit";
import { InputOTP } from "agentic-ds-kit";
import { InsightCard } from "agentic-ds-kit";
import { LineChart } from "agentic-ds-kit";
import { ListView } from "agentic-ds-kit";
import { LoadingAnimation } from "agentic-ds-kit";
import { ModalCard } from "agentic-ds-kit";
import { NavigationMenu } from "agentic-ds-kit";
import { NumberTransition } from "agentic-ds-kit";
import { PageHeader } from "agentic-ds-kit";
import { Pagination } from "agentic-ds-kit";
import { PieChart } from "agentic-ds-kit";
import { Progress } from "agentic-ds-kit";
import { ProgressSteps } from "agentic-ds-kit";
import { RadioGroup } from "agentic-ds-kit";
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
import { Textarea } from "agentic-ds-kit";
import { ThinkingAnimation } from "agentic-ds-kit";
import { Timeline } from "agentic-ds-kit";
import { Toast } from "agentic-ds-kit";
import { Tooltip } from "agentic-ds-kit";
import { PLAYGROUND_APPNAV_DEMO_GROUPS } from "@/lib/playground-nav";
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
        <Button size="sm" variant="danger">
          Delete
        </Button>
      );
    case "appheader":
      return (
        <Stage variant="wide">
          <AppHeader
            title="Acme"
            mark="A"
            searchPlaceholder="Search"
            actions={
              <Button variant="tertiary" size="sm" iconStart="Bell" ariaLabel="Notifications" />
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
      return <Avatar name="Maya Chen" size="sm" />;
    case "avatargroup":
      return (
        <AvatarGroup
          size="sm"
          ariaLabel="Team"
          items={[{ name: "Maya Chen" }, { name: "Jordan Lee" }, { name: "Alex Rivera" }]}
        />
      );
    case "badge":
      return <Badge tone="info">Ready</Badge>;
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
        <Button size="sm" variant="secondary">
          Button
        </Button>
      );
    case "buttongroup":
      return (
        <ButtonGroup ariaLabel="View">
          <Button size="sm" variant="secondary">
            List
          </Button>
          <Button size="sm" variant="tertiary">
            Board
          </Button>
        </ButtonGroup>
      );
    case "calendar":
      return <Calendar size="sm" defaultValue="2026-08-30" />;
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
      return <Cell type="badge" label="In review" tone="warning" />;
    case "chat":
      return (
        <Stage variant="panel">
          <Chat title="Assistant" status="Ready" messages={[{ role: "assistant", content: "How can I help?" }]} />
        </Stage>
      );
    case "checkbox":
      return <Checkbox id="gallery-checkbox" label="Remind me" defaultChecked />;
    case "collapsible":
      return (
        <Collapsible trigger="More" defaultOpen>
          Hidden notes
        </Collapsible>
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
      return <DatePicker id="gallery-date" size="sm" placeholder="Pick date" />;
    case "drawer":
      return (
        <Button size="sm" variant="secondary">
          Open
        </Button>
      );
    case "dropdownmenu":
      return (
        <Button size="sm" variant="secondary">
          Menu
        </Button>
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
      return <HeaderCell label="Owner" size="sm" sortable />;
    case "input":
      return (
        <Stage variant="wide">
          <Input id="gallery-input" placeholder="Search…" />
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
        <Select
          id="gallery-select"
          size="sm"
          placeholder="Choose"
          options={[{ value: "one", label: "One" }]}
        />
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
          <Slider value={40} onValueChange={noop} />
        </Stage>
      );
    case "spinner":
      return <Spinner size="sm" label="Loading" />;
    case "switch":
      return <Switch id="gallery-switch" size="lg" ariaLabel="Alerts" defaultChecked />;
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
    case "toast":
      return (
        <Stage variant="wide">
          <Toast open duration={null} title="Saved" description="Draft updated." status="success" />
        </Stage>
      );
    case "tooltip":
      return (
        <Tooltip content="More info" open>
          <Badge>Hint</Badge>
        </Tooltip>
      );
    default:
      return <Badge>{id}</Badge>;
  }
}

"use client";

import { useState } from "react";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { ButtonGroup } from "@/ui/ButtonGroup";
import { Carousel } from "@/ui/Carousel";
import type { CarouselSlidesPerView } from "@/ui/Carousel";
import { DataTable } from "@/ui/DataTable";
import type { DataTableColumn, DataTableRow } from "@/ui/DataTable";
import { Empty } from "@/ui/Empty";
import { InsightCard } from "@/ui/InsightCard";
import { PageHeader } from "@/ui/PageHeader";
import type { PageHeaderProps } from "@/ui/PageHeader";
import { Scoreboard } from "@/ui/Scoreboard";
import { Section } from "@/ui/Section";
import { Table } from "@/ui/Table";
import { Tabs } from "@/ui/Tabs";
import { TASK_INSIGHTS, TaskDrawer, type TaskInsight } from "./TaskDrawer";

type TaskView = "cards" | "list";

const ACTIVITY_METRICS = [
  { label: "Today", value: "6", delta: "+2", trend: "up" as const, hint: "vs yesterday", size: "lg" as const, badge: "Live", badgeTone: "success" as const },
  { label: "Comments", value: "5", delta: "+1", trend: "up" as const, hint: "this sprint", size: "lg" as const, badge: "Sprint", badgeTone: "info" as const },
  { label: "Status changes", value: "4", delta: "0", trend: "flat" as const, hint: "this sprint", size: "lg" as const, badge: "Ship", badgeTone: "brand" as const },
  { label: "Mentions", value: "2", delta: "+2", trend: "up" as const, hint: "need reply", size: "lg" as const, badge: "At risk", badgeTone: "danger" as const },
];

const EVENT_COLUMNS: DataTableColumn[] = [
  { key: "actor", header: "Person", sortable: true },
  { key: "event", header: "Event", sortable: true },
  { key: "type", header: "Type", sortable: true },
  { key: "when", header: "When", sortable: true },
];

const EVENT_ROWS: DataTableRow[] = [
  {
    id: "comment-launch",
    actor: { type: "avatar", label: "Maya Chen", name: "Maya Chen", src: "/faces/maya-chen.jpg" },
    event: { type: "file", label: "Commented on Launch brief" },
    type: { type: "badge", label: "Comment", tone: "info" },
    when: "2h ago",
  },
  {
    id: "blocked-qa",
    actor: { type: "avatar", label: "Unassigned", name: "Unassigned" },
    event: { type: "file", label: "QA checklist marked Blocked" },
    type: { type: "badge", label: "Status", tone: "danger" },
    when: "4h ago",
  },
  {
    id: "macros-update",
    actor: { type: "avatar", label: "Alex Rivera", name: "Alex Rivera", src: "/faces/alex-rivera.jpg" },
    event: { type: "file", label: "Updated Support macros" },
    type: { type: "badge", label: "Edit", tone: "neutral" },
    when: "5h ago",
  },
  {
    id: "ready-notes",
    actor: { type: "avatar", label: "Jordan Lee", name: "Jordan Lee", src: "/faces/jordan-lee.jpg" },
    event: { type: "file", label: "Moved Release notes to Ready" },
    type: { type: "badge", label: "Status", tone: "success" },
    when: "Yesterday",
  },
  {
    id: "mention-launch",
    actor: { type: "avatar", label: "Maya Chen", name: "Maya Chen", src: "/faces/maya-chen.jpg" },
    event: { type: "file", label: "Mentioned you in Launch brief" },
    type: { type: "badge", label: "Mention", tone: "brand" },
    when: "Yesterday",
  },
  {
    id: "macros-comment",
    actor: { type: "avatar", label: "Alex Rivera", name: "Alex Rivera", src: "/faces/alex-rivera.jpg" },
    event: { type: "file", label: "Replied on Support macros" },
    type: { type: "badge", label: "Comment", tone: "info" },
    when: "Mon",
  },
];

function rowsFor(tab: string): DataTableRow[] {
  if (tab === "all") return EVENT_ROWS;
  const label = tab === "comments" ? "Comment" : tab === "status" ? "Status" : "Mention";
  return EVENT_ROWS.filter((row) => {
    const cell = row.type;
    return typeof cell === "object" && cell !== null && "label" in cell && cell.label === label;
  });
}

function FeedTable({ tab, caption }: { tab: string; caption: string }) {
  const rows = rowsFor(tab);
  return (
    <DataTable
      caption={caption}
      toolbar
      cellSize="sm"
      searchPlaceholder="Search activity..."
      emptyMessage="No activity in this filter."
      columns={EVENT_COLUMNS}
      rows={rows}
    />
  );
}

function TaskCards({
  tasks,
  onOpen,
  onDismiss,
}: {
  tasks: TaskInsight[];
  onOpen: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const slidesPerView = Math.min(3, Math.max(1, tasks.length)) as CarouselSlidesPerView;

  return (
    <div className="layout-carousel">
      <Carousel
        ariaLabel="Tasks that need attention"
        slidesPerView={slidesPerView}
        items={tasks.map((task) => (
          <InsightCard
            key={task.id}
            eyebrow="Task"
            title={task.title}
            description={task.description}
            tone={task.tone}
            source={task.source}
            secondaryAction={{ label: "View task", onClick: () => onOpen(task.id) }}
            onDismiss={() => onDismiss(task.id)}
          />
        ))}
      />
    </div>
  );
}

function TaskList({
  tasks,
  onOpen,
  onDismiss,
}: {
  tasks: TaskInsight[];
  onOpen: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  return (
    <Table
      caption="Open tasks"
      size="sm"
      emptyLabel="No open tasks."
      columns={[
        { key: "task", header: "Task", emphasis: true },
        { key: "owner", header: "Owner" },
        { key: "status", header: "Status" },
        { key: "due", header: "Due" },
        { key: "actions", header: "Actions", align: "end" },
      ]}
      rows={tasks.map((task) => ({
        task: task.title,
        owner: task.owner,
        status: <Badge size="sm" tone={task.statusTone}>{task.status}</Badge>,
        due: task.due,
        actions: (
          <ButtonGroup ariaLabel={`${task.title} actions`}>
            <Button variant="secondary" size="sm" onClick={() => onOpen(task.id)}>
              View task
            </Button>
            <Button variant="tertiary" size="sm" onClick={() => onDismiss(task.id)}>
              Dismiss
            </Button>
          </ButtonGroup>
        ),
      }))}
    />
  );
}

export function ActivityView({
  breadcrumbs,
}: {
  breadcrumbs?: PageHeaderProps["breadcrumbs"];
}) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [taskView, setTaskView] = useState<TaskView>("cards");

  const tasks = TASK_INSIGHTS.filter((task) => !dismissed.includes(task.id));
  const openTask = TASK_INSIGHTS.find((task) => task.id === openTaskId) ?? null;
  const taskCount =
    tasks.length === 0
      ? "All caught up"
      : `${tasks.length} ${tasks.length === 1 ? "needs" : "need"} attention`;

  function dismissTask(id: string) {
    setDismissed((current) => [...current, id]);
    setOpenTaskId((current) => (current === id ? null : current));
  }

  return (
    <div className="layout-canvas layout-canvas--sticky-header">
      <div className="layout-header">
        <PageHeader
          title="Activity"
          subtitle="What the team shipped, blocked, and commented on."
          breadcrumbs={breadcrumbs}
        />
      </div>
      <div className="layout-content">
        <Section title="This week">
          <Scoreboard
            className="layout-metrics layout-metrics--fixed-4"
            aria-label="Activity this week"
            items={ACTIVITY_METRICS}
          />
        </Section>
        <Section
          title="Tasks"
          description={taskCount}
          actions={
            tasks.length > 0 ? (
              <ButtonGroup ariaLabel="Task layout">
                <Button
                  variant={taskView === "cards" ? "secondary" : "tertiary"}
                  size="sm"
                  onClick={() => setTaskView("cards")}
                >
                  Cards
                </Button>
                <Button
                  variant={taskView === "list" ? "secondary" : "tertiary"}
                  size="sm"
                  onClick={() => setTaskView("list")}
                >
                  List
                </Button>
              </ButtonGroup>
            ) : undefined
          }
        >
          {tasks.length > 0 ? (
            taskView === "cards" ? (
              <TaskCards tasks={tasks} onOpen={setOpenTaskId} onDismiss={dismissTask} />
            ) : (
              <TaskList tasks={tasks} onOpen={setOpenTaskId} onDismiss={dismissTask} />
            )
          ) : (
            <Empty
              title="No open tasks"
              description="Nothing in this sprint needs a look right now."
              icon="Check"
              outlined
            />
          )}
        </Section>
        <Section title="Feed" description="Newest first">
          <Tabs
            ariaLabel="Activity type"
            variant="line"
            size="md"
            defaultValue="all"
            items={[
              { id: "all", label: "All", content: <FeedTable tab="all" caption="All activity" /> },
              { id: "comments", label: "Comments", content: <FeedTable tab="comments" caption="Comments" /> },
              { id: "status", label: "Status", content: <FeedTable tab="status" caption="Status changes" /> },
              { id: "mentions", label: "Mentions", content: <FeedTable tab="mentions" caption="Mentions" /> },
            ]}
          />
        </Section>
      </div>
      <TaskDrawer task={openTask} onClose={() => setOpenTaskId(null)} />
    </div>
  );
}

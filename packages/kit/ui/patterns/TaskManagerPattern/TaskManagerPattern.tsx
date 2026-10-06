"use client";

import { useMemo, useState } from "react";
import { Alert } from "../../Alert";
import { Button } from "../../Button";
import { ListView } from "../../ListView";
import type { ListViewItem } from "../../ListView";
import { PageHeader } from "../../PageHeader";
import type { PageHeaderProps } from "../../PageHeader";
import { Scoreboard } from "../../Scoreboard";
import { Section } from "../../Section";
import { Toast } from "../../Toast";
import { TaskCreateModal } from "./TaskCreateModal";
import type { TaskCreatePayload } from "./TaskCreateModal";
import { TaskDetailDrawer } from "./TaskDetailDrawer";
import { badgeFor, INITIAL_TASKS, TASK_GROUPS, type ManagedTask } from "./task-data";

export interface TaskManagerPatternProps {
  breadcrumbs?: PageHeaderProps["breadcrumbs"];
}

function toListItem(task: ManagedTask): ListViewItem {
  const { badge, badgeTone } = badgeFor(task);
  return {
    id: task.id,
    primary: task.title,
    secondary: `${task.owner} · ${task.dueLabel}`,
    name: task.owner,
    initials: task.owner === "Unassigned" ? "—" : undefined,
    badge,
    badgeTone,
    group: task.group,
  };
}

function completeTask(task: ManagedTask): ManagedTask {
  return { ...task, status: "done", group: "done", progress: 100, dueLabel: "Done" };
}

export function TaskManagerPattern({ breadcrumbs }: TaskManagerPatternProps) {
  const [tasks, setTasks] = useState<ManagedTask[]>(INITIAL_TASKS);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastTitle, setToastTitle] = useState("Task updated");

  const doneIds = useMemo(
    () => tasks.filter((task) => task.status === "done").map((task) => task.id),
    [tasks],
  );
  const openTask = tasks.find((task) => task.id === openTaskId) ?? null;
  const blocked = tasks.filter((task) => task.status === "blocked").length;
  const dueToday = tasks.filter((task) => task.group === "today" && task.status !== "done").length;
  const openCount = tasks.filter((task) => task.status !== "done").length;
  const overlayOpen = createOpen || Boolean(openTask);

  function setDone(id: string) {
    setTasks((current) => current.map((task) => (task.id === id ? completeTask(task) : task)));
    setOpenTaskId((current) => (current === id ? null : current));
    setToastTitle("Task marked done");
    setToastOpen(true);
  }

  function handleSelectedChange(selected: string[]) {
    setTasks((current) =>
      current.map((task) => {
        const shouldComplete = selected.includes(task.id);
        if (shouldComplete && task.status !== "done") return completeTask(task);
        if (!shouldComplete && task.status === "done") {
          return { ...task, status: "open", group: "today", dueLabel: "Today", progress: Math.min(task.progress, 90) };
        }
        return task;
      }),
    );
  }

  function handleCreate(payload: TaskCreatePayload) {
    const id = `task-${Date.now()}`;
    const next: ManagedTask = {
      id,
      title: payload.title,
      owner: "You",
      due: payload.due,
      dueLabel: payload.due === "2026-10-06" ? "Today" : payload.due,
      priority: payload.priority,
      status: "open",
      group: payload.due <= "2026-10-06" ? "today" : "upcoming",
      summary: payload.notes || "Added from the task manager.",
      progress: 0,
    };
    setTasks((current) => [next, ...current]);
    setCreateOpen(false);
    setToastTitle("Task added");
    setToastOpen(true);
  }

  return (
    <div className="layout-canvas layout-canvas--sticky-header">
      <div className="layout-header">
        <PageHeader
          title="Tasks"
          subtitle="Sprint 24 work to close, block, or ship."
          breadcrumbs={breadcrumbs}
          actions={
            <Button
              variant={overlayOpen ? "secondary" : "primary"}
              size="md"
              iconStart="Plus"
              onClick={() => setCreateOpen(true)}
            >
              Add task
            </Button>
          }
        />
      </div>
      <div className="layout-content">
        {blocked > 0 ? (
          <Alert variant="danger" title="Blocked work">
            {`${blocked} ${blocked === 1 ? "task needs" : "tasks need"} an owner before Thursday's review.`}
          </Alert>
        ) : null}
        <Section title="This sprint" size="sm">
          <Scoreboard
            aria-label="Task metrics"
            items={[
              { label: "Open", value: String(openCount), delta: "+1", trend: "up", hint: "vs last week", size: "lg", badge: "Sprint", badgeTone: "info" },
              { label: "Due today", value: String(dueToday), delta: "0", trend: "flat", hint: "before standup", size: "lg", badge: "Today", badgeTone: "brand" },
              { label: "Blocked", value: String(blocked), delta: "0", trend: "flat", hint: "need owner", size: "lg", badge: "At risk", badgeTone: "danger" },
              { label: "Done", value: String(doneIds.length), delta: "+1", trend: "up", hint: "this sprint", size: "lg", badge: "Ship", badgeTone: "success" },
            ]}
          />
        </Section>
        <Section title="Backlog" description={`${openCount} open · ${doneIds.length} done`} size="sm">
          <ListView
            label="Sprint tasks"
            size="md"
            selection="multiple"
            selected={doneIds}
            onSelectedChange={handleSelectedChange}
            interaction="drill"
            onOpen={setOpenTaskId}
            groups={[...TASK_GROUPS]}
            collapsibleGroups
            items={tasks.map(toListItem)}
            empty={{ title: "No open tasks", description: "Nothing in this sprint needs a look right now.", icon: "Check", outlined: true }}
          />
        </Section>
      </div>
      <TaskCreateModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
      <TaskDetailDrawer task={openTask} onClose={() => setOpenTaskId(null)} onComplete={setDone} />
      <Toast
        open={toastOpen}
        title={toastTitle}
        status="success"
        duration={3000}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
}

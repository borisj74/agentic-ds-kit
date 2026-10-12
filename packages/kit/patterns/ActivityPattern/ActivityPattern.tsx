"use client";

import { useState } from "react";
import { Button } from "../../ui/Button";
import { ButtonGroup } from "../../ui/ButtonGroup";
import { Empty } from "../../ui/Empty";
import { PageHeader } from "../../ui/PageHeader";
import type { PageHeaderProps } from "../../ui/PageHeader";
import { Scoreboard } from "../../ui/Scoreboard";
import { Section } from "../../ui/Section";
import { Tabs } from "../../ui/Tabs";
import { ActivityFeed } from "./ActivityFeed";
import { TaskCards, TaskList } from "./ActivityTasks";
import { ACTIVITY_METRICS, TASK_INSIGHTS } from "./activity-data";
import { TaskDrawer } from "./TaskDrawer";

type TaskView = "cards" | "list";

export interface ActivityPatternProps {
  breadcrumbs?: PageHeaderProps["breadcrumbs"];
}

export function ActivityPattern({ breadcrumbs }: ActivityPatternProps) {
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
        <Section title="This week" size="sm">
          <Scoreboard aria-label="Activity this week" items={ACTIVITY_METRICS} />
        </Section>
        <Section
          title="Tasks"
          size="sm"
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
        <Section title="Feed" description="Newest first" size="sm">
          <Tabs
            ariaLabel="Activity type"
            variant="line"
            size="md"
            defaultValue="all"
            items={[
              { id: "all", label: "All", content: <ActivityFeed tab="all" caption="All activity" /> },
              { id: "comments", label: "Comments", content: <ActivityFeed tab="comments" caption="Comments" /> },
              { id: "status", label: "Status", content: <ActivityFeed tab="status" caption="Status changes" /> },
              { id: "mentions", label: "Mentions", content: <ActivityFeed tab="mentions" caption="Mentions" /> },
            ]}
          />
        </Section>
      </div>
      <TaskDrawer task={openTask} onClose={() => setOpenTaskId(null)} />
    </div>
  );
}

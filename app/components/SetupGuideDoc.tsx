"use client";

import { useState } from "react";
import { SetupGuide, type SetupTask } from "agentic-ds-kit";
import { AgentDocFrame, DocOptions } from "./AgentDocFrame";

const MID: SetupTask[] = [
  { id: "company", label: "Add your company details", description: "Name, address and tax ID for invoices", status: "done" },
  { id: "payments", label: "Connect a payment method", description: "So customers can pay online", status: "done" },
  { id: "customers", label: "Import customers", description: "CSV or connect your CRM · 5 min", status: "current" },
  { id: "invoice", label: "Send your first invoice", description: "Use a template or start blank · 3 min", status: "todo" },
  { id: "team", label: "Invite your team", description: "Optional · add finance teammates · 1 min", status: "todo" },
];

const SKIPPED: SetupTask[] = [
  { id: "company", label: "Add your company details", description: "Name, address and tax ID for invoices", status: "done" },
  { id: "payments", label: "Connect a payment method", description: "So customers can pay online", status: "skipped" },
  { id: "customers", label: "Import customers", description: "CSV or connect your CRM", status: "done" },
  { id: "invoice", label: "Send your first invoice", description: "Use a template or start blank · 3 min", status: "current" },
  { id: "team", label: "Invite your team", description: "Optional · add finance teammates · 1 min", status: "todo" },
];

const DONE: SetupTask[] = MID.map((task) => ({ ...task, status: "done" }));

const noop = () => {};
const TITLE = "Get Northwind ready";

export function SetupGuideDoc() {
  const [tasks, setTasks] = useState<SetupTask[]>(MID);
  const [state, setState] = useState<"mid-setup" | "skipped" | "complete">("mid-setup");
  const pick = (next: "mid-setup" | "skipped" | "complete") => {
    setState(next);
    setTasks(next === "mid-setup" ? MID : next === "skipped" ? SKIPPED : DONE);
  };
  const advance = (id: string) =>
    setTasks((current) => {
      const index = current.findIndex((task) => task.id === id);
      const nextOpen = current.findIndex((task, i) => i > index && task.status === "todo");
      return current.map((task, i) =>
        i === index ? { ...task, status: "done" } : i === nextOpen ? { ...task, status: "current" } : task.status === "current" ? { ...task, status: "todo" } : task,
      );
    });
  const undo = (id: string) => setTasks((current) => current.map((task) => (task.id === id ? { ...task, status: "todo" } : task)));
  return (
    <AgentDocFrame
      id="setupguide"
      name="SetupGuide"
      lede="A first-run checklist with overall progress and one action per task."
      summary="Continue or Start a task to complete it; the check animates in and progress moves. Undo brings a skipped task back."
      preview={<SetupGuide title={TITLE} tasks={tasks} onTaskAction={advance} onUndoSkip={undo} onComplete={noop} onDismiss={noop} />}
      controls={<DocOptions label="State" options={["mid-setup", "skipped", "complete"] as const} value={state} onChange={pick} />}
      usage="Use SetupGuide for onboarding tasks people can do in any order. Done and Skipped are words next to the icon. The current task's Continue is outline; Go to dashboard becomes the one solid primary when everything is done. Use ProgressSteps for a linear wizard."
      code={`<SetupGuide
  title="Get Northwind ready"
  tasks={tasks}
  onTaskAction={openTask}
  onUndoSkip={undoSkip}
  onComplete={goToDashboard}
  onDismiss={dismiss}
/>`}
      variants={[
        {
          title: "Mid-setup",
          about: "Two tasks done, the current task highlighted with Continue, the rest with Start.",
          code: `<SetupGuide title="Get Northwind ready" tasks={tasks} onTaskAction={openTask} onDismiss={dismiss} />`,
          render: <SetupGuide title={TITLE} tasks={MID} onTaskAction={noop} onDismiss={noop} />,
        },
        {
          title: "Mixed done and skipped",
          about: "A skipped task is struck through with Skipped · Undo, and a note says skipped tasks don't count.",
          code: `<SetupGuide title="Get Northwind ready" tasks={tasks} onTaskAction={openTask} onUndoSkip={undoSkip} />`,
          render: <SetupGuide title={TITLE} tasks={SKIPPED} onTaskAction={noop} onUndoSkip={noop} onDismiss={noop} />,
        },
        {
          title: "All done",
          about: "A Complete badge, a full bar and Go to dashboard as the solid primary.",
          code: `<SetupGuide title="Get Northwind ready" tasks={doneTasks} onComplete={goToDashboard} />`,
          render: <SetupGuide title={TITLE} tasks={DONE} onComplete={noop} />,
        },
        {
          title: "Empty — no tasks for this plan",
          about: "A kit Empty with an outline action.",
          code: `<SetupGuide title="Get Northwind ready" tasks={[]} emptyDescription="…" emptyActionLabel="Open settings" onEmptyAction={openSettings} />`,
          render: (
            <SetupGuide
              title={TITLE}
              tasks={[]}
              emptyDescription="Your workspace came pre-configured. You can review settings any time."
              emptyActionLabel="Open settings"
              onEmptyAction={noop}
            />
          ),
        },
        {
          title: "Loading",
          about: "Skeleton rows while the tasks load.",
          code: `<SetupGuide title="Get Northwind ready" tasks={[]} loading />`,
          render: <SetupGuide title={TITLE} tasks={[]} loading />,
        },
        {
          title: "Error",
          about: "A load error with Retry.",
          code: `<SetupGuide title="Get Northwind ready" tasks={[]} error="Couldn't load setup tasks." onRetry={retry} />`,
          render: <SetupGuide title={TITLE} tasks={[]} error="Couldn’t load setup tasks." onRetry={noop} />,
        },
      ]}
    />
  );
}

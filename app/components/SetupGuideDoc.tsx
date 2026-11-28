"use client";

import { useState } from "react";
import { SetupGuide, type IntegrationItem, type SetupTask } from "agentic-ds-kit";
import { AgentDocFrame } from "./AgentDocFrame";
import { RadioControl } from "./ControlsPanel";

// Example providers.
const PROVIDERS: IntegrationItem[] = [
  { id: "stripe", name: "Stripe", description: "Cards and bank", status: "available", icon: "CreditCard" },
  { id: "gocardless", name: "GoCardless", description: "Direct Debit", status: "available", icon: "Landmark" },
];

const FIRST_RUN: SetupTask[] = [
  { id: "company", label: "Add company details", status: "done" },
  { id: "payments", label: "Connect payments", description: "Pick one provider. You can add another later", status: "current", integrations: PROVIDERS },
  { id: "tax", label: "Add tax info", status: "todo" },
  { id: "invoice", label: "Send your first invoice", status: "blocked", dependsOn: ["payments"], blockedReason: "Unlocks when payments are connected" },
  { id: "accountant", label: "Invite your accountant", status: "skipped" },
];

const PLAIN: SetupTask[] = [
  { id: "company", label: "Add company details", status: "done" },
  { id: "payments", label: "Connect payments", status: "done" },
  { id: "tax", label: "Add tax info", description: "VAT number and default rate · 2 min", status: "current" },
  { id: "invoice", label: "Send your first invoice", status: "todo" },
  { id: "accountant", label: "Invite your accountant", status: "skipped" },
];

const DONE: SetupTask[] = PLAIN.map((task) => ({ ...task, status: "done" }));

const noop = () => {};
const TITLE = "Set up billing";
const DESCRIPTION = "Northwind can send its first invoice once payments are connected.";

type State = "first-run" | "no-tiles" | "complete";

export function SetupGuideDoc() {
  const [state, setState] = useState<State>("first-run");
  const [tasks, setTasks] = useState<SetupTask[]>(FIRST_RUN);
  const [connecting, setConnecting] = useState<string | undefined>();
  const pick = (next: State) => {
    setState(next);
    setConnecting(undefined);
    setTasks(next === "first-run" ? FIRST_RUN : next === "no-tiles" ? PLAIN : DONE);
  };
  const advance = (id: string) =>
    setTasks((current) => {
      const index = current.findIndex((task) => task.id === id);
      const nextOpen = current.findIndex((task, i) => i > index && task.status === "todo");
      return current.map((task, i) =>
        i === index ? { ...task, status: "done" } : i === nextOpen ? { ...task, status: "current" } : task.status === "current" ? { ...task, status: "todo" } : task,
      );
    });
  // Connecting a provider marks its task Done, which unlocks the tasks that wait for it.
  const connect = (integrationId: string, taskId: string) => {
    setConnecting(integrationId);
    window.setTimeout(() => {
      setConnecting(undefined);
      advance(taskId);
    }, 900);
  };
  const undo = (id: string) => setTasks((current) => current.map((task) => (task.id === id ? { ...task, status: "todo" } : task)));
  return (
    <AgentDocFrame
      id="setupguide"
      name="SetupGuide"
      lede="A first-run checklist with overall progress, a status word on every task and one action per task."
      summary="Connect a provider under Connect payments: the tile shows Connecting…, the task turns Done and Send your first invoice unlocks. Undo skip brings a skipped task back."
      preview={
        <SetupGuide
          title={TITLE}
          description={DESCRIPTION}
          tasks={tasks}
          connectingId={connecting}
          onTaskAction={advance}
          onIntegrationConnect={connect}
          onUndoSkip={undo}
          onComplete={noop}
          onDismiss={noop}
        />
      }
      controls={<RadioControl label="State" options={["first-run", "no-tiles", "complete"] as const} value={state} onChange={pick} />}
      usage="Use SetupGuide for onboarding tasks people can do in any order. Every row has an icon and a word: Done, Current, To do, Blocked or Skipped. The current task's action is the one solid primary; give the task integrations and its suggested provider's Connect takes that role instead. A blocked task has no button and says what unlocks it. Use ProgressSteps for a linear wizard."
      code={`<SetupGuide
  title="Set up billing"
  tasks={tasks}            // { status: "blocked", dependsOn: ["payments"] }, { integrations: providers }
  connectingId={connecting}
  onTaskAction={openTask}
  onIntegrationConnect={(providerId, taskId) => connect(providerId)}
  onUndoSkip={undoSkip}
  onComplete={goToDashboard}
  onDismiss={dismiss}
/>`}
      variants={[
        {
          title: "First run with provider tiles",
          about: "Connect payments is current and shows its providers in place. Stripe's Connect is the one solid primary. The invoice task is Blocked with its reason, and the skipped task has Undo skip.",
          code: `<SetupGuide title="Set up billing" tasks={tasks} onTaskAction={openTask} onIntegrationConnect={connect} onUndoSkip={undoSkip} />`,
          render: <SetupGuide title={TITLE} description={DESCRIPTION} tasks={FIRST_RUN} onTaskAction={noop} onIntegrationConnect={noop} onUndoSkip={noop} onDismiss={noop} />,
        },
        {
          title: "Connecting",
          about: "The tile being connected reads Connecting… with no button; the other provider stays outline.",
          code: `<SetupGuide … connectingId="stripe" />`,
          render: <SetupGuide title={TITLE} tasks={FIRST_RUN} connectingId="stripe" onTaskAction={noop} onIntegrationConnect={noop} onUndoSkip={noop} />,
        },
        {
          title: "Current task without tiles",
          about: "Continue on the current task is the solid primary; To do tasks get an outline Start.",
          code: `<SetupGuide title="Set up billing" tasks={tasks} onTaskAction={openTask} onUndoSkip={undoSkip} />`,
          render: <SetupGuide title={TITLE} tasks={PLAIN} onTaskAction={noop} onUndoSkip={noop} onDismiss={noop} />,
        },
        {
          title: "Narrow (390)",
          about: "Rows with a button put the status word under the task name; provider tiles stack one per row.",
          code: `<SetupGuide title="Set up billing" tasks={tasks} … />`,
          render: (
            // The card is an inline-size container, so it has no width of its own: give the wrapper one,
            // or the centered example canvas shrinks it to its padding.
            <div style={{ width: "100%", maxWidth: "calc(var(--space-16) * 5.5)" }}>
              <SetupGuide title={TITLE} tasks={FIRST_RUN} onTaskAction={noop} onIntegrationConnect={noop} onUndoSkip={noop} onDismiss={noop} />
            </div>
          ),
        },
        {
          title: "All done",
          about: "A Complete badge, a full bar and Go to dashboard as the solid primary.",
          code: `<SetupGuide title="Set up billing" tasks={doneTasks} onComplete={goToDashboard} />`,
          render: <SetupGuide title={TITLE} tasks={DONE} onComplete={noop} />,
        },
        {
          title: "Empty — no tasks for this plan",
          about: "A kit Empty with an outline action.",
          code: `<SetupGuide title="Set up billing" tasks={[]} emptyDescription="…" emptyActionLabel="Open settings" onEmptyAction={openSettings} />`,
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
          code: `<SetupGuide title="Set up billing" tasks={[]} loading />`,
          render: <SetupGuide title={TITLE} tasks={[]} loading />,
        },
        {
          title: "Error",
          about: "A load error with Retry.",
          code: `<SetupGuide title="Set up billing" tasks={[]} error="Couldn't load setup tasks." onRetry={retry} />`,
          render: <SetupGuide title={TITLE} tasks={[]} error="Couldn’t load setup tasks." onRetry={noop} />,
        },
      ]}
    />
  );
}

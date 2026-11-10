"use client";

import { useState } from "react";
import { ExperimentCard, type ExperimentStatus, type ExperimentVariant } from "agentic-ds-kit";
import { AgentDocFrame, DocOptions } from "./AgentDocFrame";
import agentDoc from "./AgentDoc.module.css";

const RUNNING: ExperimentVariant[] = [
  { id: "a", label: "Checkout v1", traffic: 50, value: "4.1%" },
  { id: "b", label: "Checkout v2", traffic: 50, value: "4.6%", isLeading: true },
];
const WON: ExperimentVariant[] = [
  { id: "a", label: "Checkout v1", traffic: 50, value: "4.1%" },
  { id: "b", label: "Checkout v2", traffic: 50, value: "4.9%", isWinner: true },
];
const TIED: ExperimentVariant[] = [
  { id: "a", label: "Checkout v1", traffic: 50, value: "4.3%" },
  { id: "b", label: "Checkout v2", traffic: 50, value: "4.4%" },
];
const STOPPED: ExperimentVariant[] = [
  { id: "a", label: "Checkout v1", traffic: 50, value: "4.0%" },
  { id: "b", label: "Checkout v2", traffic: 50, value: "3.2%" },
];
const DRAFT: ExperimentVariant[] = [
  { id: "a", label: "Checkout v1", traffic: 34 },
  { id: "b", label: "Checkout v2", traffic: 33 },
  { id: "c", label: "Checkout v3", traffic: 33 },
];
const BASE = { name: "Checkout button copy", metricLabel: "Conversion rate" };
const noop = () => {};

export function ExperimentCardDoc() {
  const [status, setStatus] = useState<ExperimentStatus>("running");
  const props =
    status === "running"
      ? { variants: RUNNING, dates: "Started 02 Nov · ends 16 Nov", confidenceNote: "84% confidence · needs ~4 more days for 95%." }
      : status === "concluded"
        ? { variants: WON, dates: "Ran 02 – 16 Nov", confidenceNote: "B wins: +0.8 pts, 97% confidence." }
        : status === "stopped"
          ? { variants: STOPPED, dates: "Ran 02 – 05 Nov", confidenceNote: "Stopped early on 05 Nov by Priya · example." }
          : { variants: DRAFT, dates: "Not started" };
  return (
    <AgentDocFrame
      id="experimentcard"
      name="ExperimentCard"
      lede="An A/B or A/B/n experiment: status, traffic split, metric per variant and one decision."
      summary="Switch status. Stop and Ship winner open a kit AlertDialog; Cancel returns focus to the button."
      preview={
        <ExperimentCard
          {...BASE}
          {...props}
          status={status}
          onView={noop}
          onStop={() => setStatus("stopped")}
          onShip={noop}
          onStart={() => setStatus("running")}
          onEdit={noop}
        />
      }
      controls={<DocOptions label="Status" options={["draft", "running", "concluded", "stopped"] as const} value={status} onChange={setStatus} />}
      usage="Status, Winner and Leading are words in a Badge. Ship winner is the one solid primary and only appears on a concluded experiment with a winner; a concluded experiment with no winner reads Inconclusive and offers Extend."
      code={`<ExperimentCard
  name="Checkout button copy"
  metricLabel="Conversion rate"
  status="running"
  dates="Started 02 Nov · ends 16 Nov"
  variants={variants}
  confidenceNote="84% confidence · needs ~4 more days for 95%."
  onStop={stop}
  onView={view}
/>`}
      variants={[
        {
          title: "Running",
          about: "Leading is an outline badge; Stop (danger outline) and View.",
          code: `<ExperimentCard … status="running" onStop={stop} onView={view} />`,
          render: <ExperimentCard {...BASE} status="running" variants={RUNNING} dates="Started 02 Nov · ends 16 Nov" confidenceNote="84% confidence · needs ~4 more days for 95%." onStop={noop} onView={noop} />,
        },
        {
          title: "Concluded — winner",
          about: "The winning row is highlighted and says Winner; Ship winner confirms with an AlertDialog.",
          code: `<ExperimentCard … status="concluded" variants={[…, { id: "b", …, isWinner: true }]} onShip={ship} onView={view} />`,
          render: <ExperimentCard {...BASE} status="concluded" variants={WON} dates="Ran 02 – 16 Nov" confidenceNote="B wins: +0.8 pts, 97% confidence." onShip={noop} onView={noop} />,
        },
        {
          title: "Inconclusive",
          about: "Concluded with no winner: a warning badge and Extend 7 days.",
          code: `<ExperimentCard … status="concluded" variants={variants} onExtend={extend} onView={view} />`,
          render: <ExperimentCard {...BASE} status="concluded" variants={TIED} dates="Ran 02 – 16 Nov" confidenceNote="No clear winner at 95%. Difference is within noise." onExtend={noop} onView={noop} />,
        },
        {
          title: "Stopped",
          about: "A neutral badge and View.",
          code: `<ExperimentCard … status="stopped" onView={view} />`,
          render: <ExperimentCard {...BASE} status="stopped" variants={STOPPED} dates="Ran 02 – 05 Nov" confidenceNote="Stopped early on 05 Nov by Priya · example." onView={noop} />,
        },
        {
          title: "Draft — A/B/n",
          about: "Three variants with no values yet; Edit and Start.",
          code: `<ExperimentCard … status="draft" dates="Not started" onEdit={edit} onStart={start} />`,
          render: <ExperimentCard {...BASE} status="draft" variants={DRAFT} dates="Not started" onEdit={noop} onStart={noop} />,
        },
        {
          title: "Loading and error",
          about: "Skeletons while loading; a load error with Retry.",
          code: `<ExperimentCard … loading />
<ExperimentCard … error="Couldn't load results." onRetry={retry} />`,
          render: (
            <div className={agentDoc.stack}>
              <ExperimentCard {...BASE} status="running" variants={[]} loading />
              <ExperimentCard {...BASE} status="running" variants={[]} error="Couldn’t load results." onRetry={noop} />
            </div>
          ),
        },
      ]}
    />
  );
}

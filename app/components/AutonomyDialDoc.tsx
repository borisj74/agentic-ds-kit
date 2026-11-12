"use client";

import { useState } from "react";
import { AutonomyDial, Switch } from "agentic-ds-kit";
import { AgentDocFrame } from "./AgentDocFrame";
import agentDoc from "./AgentDoc.module.css";
import styles from "./ComponentDoc.module.css";

const APPLIES = "Research agent · acme/ledger";

export function AutonomyDialDoc() {
  const [value, setValue] = useState("risk");
  const [saving, setSaving] = useState(false);
  const [locked, setLocked] = useState(false);

  function change(next: string) {
    setValue(next);
    setSaving(true);
    window.setTimeout(() => setSaving(false), 900);
  }

  return (
    <AgentDocFrame
      id="autonomydial"
      name="AutonomyDial"
      lede="How far an agent may go without asking. Not Slider. Not Switch."
      summary="Pick a stop with the arrow keys or a click. It saves on change; the panel explains the stop."
      preview={
        <AutonomyDial
          className={agentDoc.trail}
          value={value}
          onValueChange={change}
          saving={saving}
          appliesTo={APPLIES}
          disabled={locked}
          disabledReason="Set by workspace policy"
        />
      }
      controls={
        <div className={styles.panelGroup}>
          <span className={styles.panelLabel}>State</span>
          <Switch size="sm" label="Locked by policy" checked={locked} onChange={setLocked} />
        </div>
      }
      usage="AutonomyDial sets how much an agent does before asking. It saves on change, so the view keeps its one primary Button for something else. Built on SegmentedControl."
      code={`<AutonomyDial
  value={level}
  onValueChange={setLevel}
  appliesTo="${APPLIES}"
  saving={saving}
/>`}
      variants={[
        {
          title: "Stop 1 — Ask always",
          about: "The most oversight: every tool call waits for an OK.",
          code: `<AutonomyDial value="ask" appliesTo="…" />`,
          render: <AutonomyDial className={agentDoc.trail} value="ask" appliesTo={APPLIES} />,
        },
        {
          title: "Stop 2 — Ask on high risk (default)",
          about: "defaultValue marks the default stop with a badge.",
          code: `<AutonomyDial value="risk" appliesTo="…" />`,
          render: <AutonomyDial className={agentDoc.trail} value="risk" appliesTo={APPLIES} />,
        },
        {
          title: "Stop 3 — Act and tell me",
          about: "Acts, then reports what it did after each step.",
          code: `<AutonomyDial value="tell" appliesTo="…" />`,
          render: <AutonomyDial className={agentDoc.trail} value="tell" appliesTo={APPLIES} />,
        },
        {
          title: "Stop 4 — Act until I stop",
          about: "The most autonomy: the run goes to the end unless stopped.",
          code: `<AutonomyDial value="run" appliesTo="…" />`,
          render: <AutonomyDial className={agentDoc.trail} value="run" appliesTo={APPLIES} />,
        },
        {
          title: "Disabled — locked by policy",
          about: "disabled with disabledReason shows a lock and why.",
          code: `<AutonomyDial value="risk" disabled disabledReason="Set by workspace policy" />`,
          render: <AutonomyDial className={agentDoc.trail} value="risk" appliesTo={APPLIES} disabled disabledReason="Set by workspace policy" />,
        },
        {
          title: "Loading — saving a new stop",
          about: "saving spins the stop's icon and shows Saving… in the panel.",
          code: `<AutonomyDial value="tell" saving />`,
          render: <AutonomyDial className={agentDoc.trail} value="tell" appliesTo={APPLIES} saving />,
        },
      ]}
    />
  );
}

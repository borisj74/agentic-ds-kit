"use client";

import { useState } from "react";
import { Button } from "agentic-ds-kit";
import { Modal } from "agentic-ds-kit";
import { Tabs } from "agentic-ds-kit";
import { Tooltip } from "agentic-ds-kit";

export interface InteractiveDemosProps {
  mode?: "all" | "tooltip" | "tabs" | "modal";
}

export function InteractiveDemos({ mode = "all" }: InteractiveDemosProps) {
  const [open, setOpen] = useState(false);

  if (mode === "tooltip") {
    return (
      <Tooltip content="Exports all projects as CSV">
        <Button variant="secondary" size="sm">
          Hover me
        </Button>
      </Tooltip>
    );
  }

  if (mode === "tabs") {
    return (
      <Tabs
        items={[
          { id: "general", label: "General", content: "General settings panel content." },
          { id: "billing", label: "Billing", content: "Billing settings panel content." },
        ]}
      />
    );
  }

  if (mode === "modal") {
    return (
      <>
        <Button variant="tertiary" size="sm" onClick={() => setOpen(true)}>
          Open modal
        </Button>
        <Modal open={open} title="Confirm export" onClose={() => setOpen(false)}>
          Your report will be emailed within a few minutes.
        </Modal>
      </>
    );
  }

  return (
    <>
      <Tooltip content="Exports all projects as CSV">
        <Button variant="secondary" size="sm">
          Hover me
        </Button>
      </Tooltip>
      <Tabs
        items={[
          { id: "general", label: "General", content: "General settings panel content." },
          { id: "billing", label: "Billing", content: "Billing settings panel content." },
        ]}
      />
      <Button variant="tertiary" size="sm" onClick={() => setOpen(true)}>
        Open modal
      </Button>
      <Modal open={open} title="Confirm export" onClose={() => setOpen(false)}>
        Your report will be emailed within a few minutes.
      </Modal>
    </>
  );
}

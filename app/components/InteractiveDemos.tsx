"use client";

import { useState } from "react";
import { Button } from "@/ui/Button";
import { Modal } from "@/ui/Modal";
import { Tabs } from "@/ui/Tabs";
import { Tooltip } from "@/ui/Tooltip";

export function InteractiveDemos() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div>
        <Tooltip content="Exports all projects as CSV">
          <Button variant="secondary" size="sm">
            Hover me
          </Button>
        </Tooltip>
      </div>
      <Tabs
        items={[
          { id: "general", label: "General", content: "General settings panel content." },
          { id: "billing", label: "Billing", content: "Billing settings panel content." },
        ]}
      />
      <div>
        <Button variant="tertiary" size="sm" onClick={() => setOpen(true)}>
          Open modal
        </Button>
        <Modal open={open} title="Confirm export" onClose={() => setOpen(false)}>
          Your report will be emailed within a few minutes.
        </Modal>
      </div>
    </>
  );
}

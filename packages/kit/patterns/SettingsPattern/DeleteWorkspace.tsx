"use client";

import { useRef, useState } from "react";
import { AlertDialog } from "../../ui/AlertDialog";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { DELETE_COPY, WORKSPACE_NAME } from "./settings-data";

export interface DeleteWorkspaceProps {
  /** Runs after the AlertDialog confirm. */
  onDeleteWorkspace?: () => void;
}

/** Delete workspace: a danger action in its own Card, confirmed in a kit AlertDialog where you type the name. Cancel returns focus to it. */
export function DeleteWorkspace({ onDeleteWorkspace }: DeleteWorkspaceProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteRef = useRef<HTMLDivElement>(null);

  function closeConfirm() {
    setConfirmOpen(false);
    requestAnimationFrame(() => deleteRef.current?.querySelector("button")?.focus());
  }

  return (
    <div ref={deleteRef}>
      <Card>
        <div className="settings-pattern__row settings-pattern__row--center">
          <span className="settings-pattern__two-line">
            <span className="settings-pattern__title">{DELETE_COPY.title}</span>
            <span className="settings-pattern__muted">{DELETE_COPY.description}</span>
          </span>
          <Button appearance="outline" mode="danger" iconStart="Trash2" onClick={() => setConfirmOpen(true)}>
            Delete workspace
          </Button>
        </div>
      </Card>
      <AlertDialog
        open={confirmOpen}
        title={`Delete ${WORKSPACE_NAME}?`}
        description="This removes every invoice, customer and agent in the workspace. It can’t be undone."
        confirmText={WORKSPACE_NAME}
        cancelLabel="Cancel"
        actionLabel="Delete workspace"
        actionVariant="danger"
        onCancel={closeConfirm}
        onAction={() => {
          setConfirmOpen(false);
          onDeleteWorkspace?.();
        }}
      />
    </div>
  );
}

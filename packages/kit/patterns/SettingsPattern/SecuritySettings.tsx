"use client";

import { useId, useRef, useState } from "react";
import { Alert } from "../../ui/Alert";
import { AlertDialog } from "../../ui/AlertDialog";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Field } from "../../ui/Field";
import { Input } from "../../ui/Input";
import { ListView } from "../../ui/ListView";
import { Switch } from "../../ui/Switch";
import { PASSWORD_CHANGED, SESSIONS, TWO_FACTOR_ADDED, TWO_FACTOR_POLICY, WORKSPACE_NAME } from "./settings-data";

export interface SecuritySettingsProps {
  /** Two-factor on, or off with the workspace-policy notice and Set up. */
  twoFactor?: boolean;
  onUpdatePassword?: () => void;
  onSetUpTwoFactor?: () => void;
  onSignOut?: (sessionId: string) => void;
  onSignOutOthers?: () => void;
  onDeleteWorkspace?: () => void;
}

/**
 * Security page: password, two-factor (Switch plus an On/Off Badge), sessions in a kit ListView,
 * and Delete workspace as a danger action behind a kit AlertDialog. No solid primary: every action
 * here is secondary or destructive.
 */
export function SecuritySettings({
  twoFactor = true,
  onUpdatePassword,
  onSetUpTwoFactor,
  onSignOut,
  onSignOutOthers,
  onDeleteWorkspace,
}: SecuritySettingsProps) {
  const uid = useId();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteRef = useRef<HTMLDivElement>(null);

  function closeConfirm() {
    setConfirmOpen(false);
    // Cancel returns focus to Delete workspace.
    requestAnimationFrame(() => deleteRef.current?.querySelector("button")?.focus());
  }

  return (
    <div className="layout-content">
      <div className="layout-split">
        <div className="settings-pattern__stack">
          <Card
            title="Password"
            description={PASSWORD_CHANGED}
            headerAction={{ label: "Update password", appearance: "outline", mode: "neutral", onClick: onUpdatePassword }}
          >
            <div className="layout-split">
              <Field label="Current password" htmlFor={`${uid}-current`}>
                <Input id={`${uid}-current`} type="password" name="current-password" defaultValue="example-pass" />
              </Field>
              <Field label="New password" htmlFor={`${uid}-new`}>
                <Input id={`${uid}-new`} type="password" name="new-password" placeholder="At least 12 characters" />
              </Field>
            </div>
          </Card>

          <Card>
            <div className="settings-pattern__fields">
              <div className="settings-pattern__row settings-pattern__row--center">
                <span className="settings-pattern__two-line">
                  <span className="settings-pattern__line">
                    <span className="settings-pattern__strong" id={`${uid}-2fa`}>
                      Two-factor authentication
                    </span>
                    <Badge tone={twoFactor ? "success" : "warning"} size="sm">
                      {twoFactor ? "On" : "Off"}
                    </Badge>
                  </span>
                  <span className="settings-pattern__caption">
                    {twoFactor ? TWO_FACTOR_ADDED : "Add a second step at sign-in to protect billing data."}
                  </span>
                </span>
                <Switch
                  id={`${uid}-2fa-switch`}
                  describedBy={`${uid}-2fa`}
                  ariaLabel="Two-factor authentication"
                  checked={twoFactor}
                  onChange={(on) => (on ? onSetUpTwoFactor?.() : undefined)}
                />
              </div>
              {twoFactor ? null : (
                <div className="settings-pattern__notice">
                  <Alert variant="warning">{TWO_FACTOR_POLICY}</Alert>
                  <Button appearance="outline" mode="neutral" size="sm" onClick={onSetUpTwoFactor}>
                    Set up
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="settings-pattern__stack">
          <Card
            title="Sessions"
            description="Devices signed in to your account"
            headerAction={{ label: "Sign out all other sessions", appearance: "ghost", mode: "neutral", onClick: onSignOutOthers }}
          >
            <ListView
              label="Sessions"
              size="sm"
              items={SESSIONS.map((session) => ({
                ...session,
                actions: session.id === "this" ? undefined : [{ id: "sign-out", label: "Sign out" }],
              }))}
              onAction={(id) => onSignOut?.(id)}
            />
          </Card>

          <Card title="Delete workspace" description="Removes all invoices, customers and agents. You confirm before anything is deleted.">
            <div ref={deleteRef}>
              <Button appearance="outline" mode="danger" iconStart="Trash2" onClick={() => setConfirmOpen(true)}>
                Delete workspace
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <AlertDialog
        open={confirmOpen}
        title={`Delete ${WORKSPACE_NAME}?`}
        description="This removes every invoice, customer and agent in the workspace. It can’t be undone."
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

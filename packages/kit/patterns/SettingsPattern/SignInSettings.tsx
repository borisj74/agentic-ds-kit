"use client";

import { useId } from "react";
import { Alert } from "../../ui/Alert";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Field } from "../../ui/Field";
import { Input } from "../../ui/Input";
import { Switch } from "../../ui/Switch";
import { PASSWORD_CHANGED, TWO_FACTOR_ADDED, TWO_FACTOR_POLICY } from "./settings-data";

export interface SignInSettingsProps {
  /** Two-factor on, or off with the workspace-policy notice and Set up. */
  twoFactor?: boolean;
  onUpdatePassword?: () => void;
  onSetUpTwoFactor?: () => void;
}

/**
 * Sign-in page (personal): your password and your two-factor Switch with an On/Off Badge.
 * No solid primary: every action here acts on its own card. Workspace sign-in rules live on Security.
 */
export function SignInSettings({ twoFactor = true, onUpdatePassword, onSetUpTwoFactor }: SignInSettingsProps) {
  const uid = useId();

  return (
    <div className="layout-content">
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
    </div>
  );
}

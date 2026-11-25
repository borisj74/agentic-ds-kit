"use client";

import { useId, useState } from "react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { FieldSet } from "../../ui/FieldSet";
import { ListView } from "../../ui/ListView";
import { Section } from "../../ui/Section";
import { Switch } from "../../ui/Switch";
import { DeleteWorkspace } from "./DeleteWorkspace";
import {
  SESSIONS,
  SIGN_IN_RULE_LABELS,
  SIGN_IN_RULES_DRAFT,
  SIGN_IN_RULES_SAVED,
  SSO,
  TWO_STEP_SETUP,
  WORKSPACE_NAME,
} from "./settings-data";

type Rule = keyof typeof SIGN_IN_RULES_SAVED;
const RULES = Object.keys(SIGN_IN_RULE_LABELS) as Rule[];

export interface SecuritySettingsProps {
  /** Below --grid-breakpoint-md: rows stack and copy gets shorter. */
  narrow?: boolean;
  /** Save sign-in rules, the page's one solid primary. */
  onSave?: () => void;
  onCancel?: () => void;
  onEditSso?: () => void;
  onSignOut?: (sessionId: string) => void;
  onSignOutOthers?: () => void;
  /** Delete workspace, after the AlertDialog confirm (you type the name). */
  onDeleteWorkspace?: () => void;
}

/**
 * Security page (workspace): sign-in rules in one FieldSet (the SSO connection, Require SSO, two-step
 * for members) that end in their own save row with the one solid primary, then your sessions, then a Danger
 * zone Section with Delete workspace after every card that saves.
 */
export function SecuritySettings({
  narrow = false,
  onSave,
  onCancel,
  onEditSso,
  onSignOut,
  onSignOutOthers,
  onDeleteWorkspace,
}: SecuritySettingsProps) {
  const uid = useId();
  const [saved, setSaved] = useState(SIGN_IN_RULES_SAVED);
  const [rules, setRules] = useState(SIGN_IN_RULES_DRAFT);
  const changes = RULES.filter((rule) => rules[rule] !== saved[rule]).map((rule) => SIGN_IN_RULE_LABELS[rule]);
  const id = (part: string) => `${uid}-${part}`;

  function rule(key: Rule, label: string, hint: string, state: string) {
    return (
      <div className="settings-pattern__rule">
        <span className="settings-pattern__two-line">
          <span className="settings-pattern__strong" id={id(`${key}-label`)}>
            {label}
          </span>
          <span className="settings-pattern__caption" id={id(`${key}-hint`)}>
            {hint}
          </span>
        </span>
        <span className="settings-pattern__line settings-pattern__rule-control">
          <Switch
            id={id(key)}
            ariaLabel={label}
            describedBy={`${id(`${key}-hint`)}${narrow ? "" : ` ${id(`${key}-state`)}`}`}
            checked={rules[key]}
            onChange={(on) => setRules((current) => ({ ...current, [key]: on }))}
          />
          {/* Narrow keeps the rule's name and hint only, as on the 390 board. */}
          {narrow ? null : (
            <span className="settings-pattern__muted" id={id(`${key}-state`)}>
              {state}
            </span>
          )}
        </span>
      </div>
    );
  }

  // Narrow: the provider's short name and domain only, as on the 390 board.
  const sso = (
    <ListView
      label="Single sign-on"
      size="sm"
      items={[
        {
          id: "okta",
          primary: narrow ? SSO.short : SSO.provider,
          secondary: narrow ? SSO.domain : SSO.detail,
          badge: "Connected",
          badgeTone: "success",
          actions: narrow ? undefined : [{ id: "edit", label: "Edit", actionLabel: "Edit single sign-on" }],
        },
      ]}
      onAction={() => onEditSso?.()}
    />
  );

  return (
    <div className="layout-content settings-pattern__stack">
      <Card flush>
        <div className="settings-pattern__inset">
          <FieldSet legend="Sign-in rules" description={`How people get into ${WORKSPACE_NAME}`}>
            {narrow ? (
              sso
            ) : (
              <div className="settings-pattern__rule">
                <span className="settings-pattern__two-line">
                  <span className="settings-pattern__strong">Single sign-on</span>
                  <span className="settings-pattern__caption">SAML 2.0</span>
                </span>
                <div className="settings-pattern__rule-control">{sso}</div>
              </div>
            )}
            {rule(
              "requireSso",
              SIGN_IN_RULE_LABELS.requireSso,
              "Owners can still use a password",
              rules.requireSso ? "On for everyone except owners" : "Off · password or SSO",
            )}
            {rule(
              "twoStep",
              narrow ? "Two-step for all members" : SIGN_IN_RULE_LABELS.twoStep,
              narrow ? TWO_STEP_SETUP.short : "Authenticator app or security key",
              rules.twoStep ? (narrow ? "Required" : `Required for all members. ${TWO_STEP_SETUP.long}`) : "Optional",
            )}
          </FieldSet>
        </div>
        {/* The card's own save row: the page's one solid primary. */}
        <div className="settings-pattern__row settings-pattern__row--center settings-pattern__inset settings-pattern__ruled">
          {narrow ? null : (
            <span className="settings-pattern__muted" role="status">
              {changes.length === 0 ? "All changes saved" : `${changes.length} unsaved change${changes.length > 1 ? "s" : ""}`}
            </span>
          )}
          <span className={narrow ? "settings-pattern__actions settings-pattern__actions--fill" : "settings-pattern__actions"}>
            <Button
              appearance="ghost"
              mode="neutral"
              size={narrow ? "lg" : "md"}
              disabled={changes.length === 0}
              onClick={() => {
                setRules(saved);
                onCancel?.();
              }}
            >
              Cancel
            </Button>
            <Button
              size={narrow ? "lg" : "md"}
              disabled={changes.length === 0}
              onClick={() => {
                setSaved(rules);
                onSave?.();
              }}
            >
              Save sign-in rules
            </Button>
          </span>
        </div>
      </Card>

      <Card
        title={narrow ? `Your sessions · ${SESSIONS.length}` : "Your sessions"}
        description={narrow ? undefined : `Signed in on ${SESSIONS.length} devices`}
        flush
        headerAction={{
          label: narrow ? "Sign out others" : "Sign out other sessions",
          appearance: "outline",
          mode: "neutral",
          onClick: onSignOutOthers,
        }}
      >
        <ListView
          label="Your sessions"
          size="sm"
          flush
          items={SESSIONS.map((session) => ({
            ...session,
            actions: session.id === "this" ? undefined : [{ id: "sign-out", label: "Sign out", actionLabel: `Sign out ${session.primary}` }],
          }))}
          onAction={(sessionId) => onSignOut?.(sessionId)}
        />
      </Card>

      {/* Danger actions sit in their own group, after every card that saves. */}
      <Section title="Danger zone" size="sm" divider>
        <DeleteWorkspace onDeleteWorkspace={onDeleteWorkspace} />
      </Section>
    </div>
  );
}

"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "../../ui/Button";
import { Checkbox } from "../../ui/Checkbox";
import { Field } from "../../ui/Field";
import { Input } from "../../ui/Input";
import { PageHeader } from "../../ui/PageHeader";
import type { PageHeaderProps } from "../../ui/PageHeader";
import { Section } from "../../ui/Section";
import { Select } from "../../ui/Select";
import { Toast } from "../../ui/Toast";
import { PROFILE, TIMEZONE_OPTIONS } from "./settings-form-data";
import formStyles from "./SettingsFormPattern.module.css";

export interface SettingsFormPatternProps {
  breadcrumbs?: PageHeaderProps["breadcrumbs"];
  onCancel?: () => void;
  onSave?: () => void;
}

export function SettingsFormPattern({ breadcrumbs, onCancel, onSave }: SettingsFormPatternProps) {
  const uid = useId();
  const [toastOpen, setToastOpen] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave?.();
    setToastOpen(true);
  }

  return (
    <div className="layout-canvas layout-canvas--sticky-header">
      <div className="layout-header">
        <PageHeader
          title="Settings"
          subtitle="Manage workspace profile and notification preferences."
          breadcrumbs={breadcrumbs}
          eyebrow={breadcrumbs ? undefined : "Account"}
        />
      </div>
      <form className="layout-content" onSubmit={handleSubmit}>
        <Section title="Profile" description="Basic information visible to collaborators" size="sm">
          <div className={formStyles.form}>
            <Field label="Display name" htmlFor={`${uid}-display-name`} hint="Shown on shared projects">
              <Input id={`${uid}-display-name`} defaultValue={PROFILE.displayName} />
            </Field>
            <Field label="Email" htmlFor={`${uid}-email`}>
              <Input id={`${uid}-email`} type="email" defaultValue={PROFILE.email} />
            </Field>
            <Field label="Timezone" htmlFor={`${uid}-timezone`}>
              <Select
                id={`${uid}-timezone`}
                options={TIMEZONE_OPTIONS}
                defaultValue={PROFILE.timezone}
              />
            </Field>
          </div>
        </Section>
        <Section title="Notifications" size="sm">
          <div className={formStyles.form}>
            <Checkbox id={`${uid}-email-updates`} label="Email me weekly summaries" defaultChecked={PROFILE.weeklySummaries} />
            <Checkbox id={`${uid}-product-news`} label="Product news and tips" defaultChecked={PROFILE.productNews} />
          </div>
        </Section>
        <div className={formStyles.actions}>
          <Button variant="primary" size="md" type="submit">
            Save changes
          </Button>
          <Button variant="secondary" size="md" type="button" onClick={onCancel}>
            Cancel
          </Button>
        </div>
        <Toast
          open={toastOpen}
          title="Settings saved"
          description="Workspace profile and preferences are up to date."
          status="success"
          duration={3000}
          onClose={() => setToastOpen(false)}
        />
      </form>
    </div>
  );
}

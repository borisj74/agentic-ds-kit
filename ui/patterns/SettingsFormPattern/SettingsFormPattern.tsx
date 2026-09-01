"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/ui/Button";
import { Checkbox } from "@/ui/Checkbox";
import { Field } from "@/ui/Field";
import { Input } from "@/ui/Input";
import { PageHeader } from "@/ui/PageHeader";
import type { PageHeaderProps } from "@/ui/PageHeader";
import { Section } from "@/ui/Section";
import { Select } from "@/ui/Select";
import { Toast } from "@/ui/Toast";
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
        <Section title="Profile" description="Basic information visible to collaborators">
          <div className={formStyles.form}>
            <Field label="Display name" htmlFor={`${uid}-display-name`} hint="Shown on shared projects">
              <Input id={`${uid}-display-name`} defaultValue="Maya Chen" />
            </Field>
            <Field label="Email" htmlFor={`${uid}-email`}>
              <Input id={`${uid}-email`} type="email" defaultValue="maya@agentix.dev" />
            </Field>
            <Field label="Timezone" htmlFor={`${uid}-timezone`}>
              <Select
                id={`${uid}-timezone`}
                options={[
                  { value: "utc", label: "UTC" },
                  { value: "cet", label: "Central European Time" },
                  { value: "est", label: "Eastern Time" },
                ]}
                defaultValue="cet"
              />
            </Field>
          </div>
        </Section>
        <Section title="Notifications">
          <div className={formStyles.form}>
            <Checkbox id={`${uid}-email-updates`} label="Email me weekly summaries" defaultChecked />
            <Checkbox id={`${uid}-product-news`} label="Product news and tips" />
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
          onOpenChange={setToastOpen}
        />
      </form>
    </div>
  );
}

"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { AlertDialog } from "../../ui/AlertDialog";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Field } from "../../ui/Field";
import { FieldSet } from "../../ui/FieldSet";
import { Input } from "../../ui/Input";
import { SaveBar } from "../../ui/SaveBar";
import { Select } from "../../ui/Select";
import { saveShortcut } from "./ProfileSettings";
import {
  CURRENCY_OPTIONS,
  DELETE_COPY,
  GENERAL_DRAFT,
  GENERAL_LABELS,
  GENERAL_SAVED,
  NEXT_INVOICE_NUMBER,
  TIMEZONE_OPTIONS,
  URL_BASE,
  WORKSPACE_NAME,
} from "./settings-data";

type GeneralField = keyof typeof GENERAL_SAVED;
const FIELD_ORDER = Object.keys(GENERAL_LABELS) as GeneralField[];

export interface GeneralSettingsProps {
  /** Below --grid-breakpoint-md: labels stack over lg 40 controls. */
  narrow?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  onDeleteWorkspace?: () => void;
}

/**
 * General: the workspace's name, URL, currency, invoice prefix and time zone in one FieldSet (legend
 * left when wide) in a Card, the settings-form composition; Delete workspace in its own Card below, and the one SaveBar. Copy it in and replace the
 * fields and the save call.
 */
export function GeneralSettings({ narrow = false, onSave, onCancel, onDeleteWorkspace }: GeneralSettingsProps) {
  const uid = useId();
  const [saved, setSaved] = useState(GENERAL_SAVED);
  const [values, setValues] = useState(GENERAL_DRAFT);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteRef = useRef<HTMLDivElement>(null);

  const changes = FIELD_ORDER.filter((field) => values[field] !== saved[field]).map((field) => GENERAL_LABELS[field]);
  const size = narrow ? "lg" : "md";
  // Short values get short controls when wide: two to a row, a lone one takes the left half.
  const pair = narrow ? "settings-pattern__fields" : "settings-pattern__pair";
  const id = (field: GeneralField) => `${uid}-${field}`;

  function update(field: GeneralField, next: string) {
    setValues((current) => ({ ...current, [field]: next }));
  }

  function save() {
    if (changes.length === 0) return;
    setSaved(values);
    onSave?.();
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    save();
  }

  function closeConfirm() {
    setConfirmOpen(false);
    // Cancel returns focus to Delete workspace.
    requestAnimationFrame(() => deleteRef.current?.querySelector("button")?.focus());
  }

  const prefix = values.prefix.trim() || GENERAL_SAVED.prefix;

  const fields = (
    <FieldSet legend="Workspace" description={`How ${WORKSPACE_NAME} shows on invoices and links`} layout="side">
      <Field label={GENERAL_LABELS.name} htmlFor={id("name")} hint="Printed on every invoice">
        <Input id={id("name")} size={size} value={values.name} onChange={(next) => update("name", next)} autoComplete="organization" />
      </Field>
      <Field label={GENERAL_LABELS.slug} htmlFor={id("slug")} hint="Old links redirect for 30 days">
        <Input id={id("slug")} size={size} start={URL_BASE} value={values.slug} onChange={(next) => update("slug", next)} />
      </Field>
      <div className={pair}>
        <Field label={GENERAL_LABELS.currency} htmlFor={id("currency")} hint="New invoices and plans">
          <Select
            id={id("currency")}
            size={size}
            options={CURRENCY_OPTIONS}
            value={values.currency}
            onChange={(next) => update("currency", String(next))}
          />
        </Field>
        <Field
          label={GENERAL_LABELS.prefix}
          htmlFor={id("prefix")}
          hint={`Changing it keeps the numbering. Next invoice ${prefix}${NEXT_INVOICE_NUMBER}`}
        >
          <Input id={id("prefix")} size={size} value={values.prefix} onChange={(next) => update("prefix", next)} />
        </Field>
      </div>
      <div className={pair}>
        <Field label={GENERAL_LABELS.timezone} htmlFor={id("timezone")} hint="Due dates and reminder times">
          <Select
            id={id("timezone")}
            size={size}
            options={TIMEZONE_OPTIONS}
            value={values.timezone}
            onChange={(next) => update("timezone", String(next))}
          />
        </Field>
      </div>
    </FieldSet>
  );

  return (
    <>
      <form className="layout-content settings-pattern__body" onSubmit={submit} onKeyDown={saveShortcut} noValidate>
        {/* Narrow: the group loses its Card frame, as in settings-form. */}
        {narrow ? fields : <Card size="md">{fields}</Card>}

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
        </div>
      </form>

      <SaveBar
        state={changes.length > 0 ? "dirty" : "saved"}
        changes={changes}
        discardLabel="Cancel"
        onDiscard={() => {
          setValues(saved);
          onCancel?.();
        }}
        onSave={save}
      />

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
    </>
  );
}

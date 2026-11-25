"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Alert } from "../../ui/Alert";
import { AlertDialog } from "../../ui/AlertDialog";
import { Card } from "../../ui/Card";
import { Divider } from "../../ui/Divider";
import { Field } from "../../ui/Field";
import { FieldSet } from "../../ui/FieldSet";
import { Input } from "../../ui/Input";
import { PageHeader } from "../../ui/PageHeader";
import type { PageHeaderProps } from "../../ui/PageHeader";
import { SaveBar } from "../../ui/SaveBar";
import type { SaveBarState } from "../../ui/SaveBar";
import { Select } from "../../ui/Select";
import {
  CHECKED_FIELDS,
  COUNTRY_OPTIONS,
  CURRENCY_OPTIONS,
  DRAFT,
  LABELS,
  LAST_SAVED,
  SAVED,
  hintFor,
  validate,
  type BillingDetails,
  type BillingField,
} from "./settings-form-data";
import "./SettingsFormPattern.css";

export interface SettingsFormPatternProps {
  breadcrumbs?: PageHeaderProps["breadcrumbs"];
  /**
   * false drops the PageHeader (and the breadcrumbs), for use as the body of a page that has its
   * own header, such as a settings section. Default true.
   */
  header?: boolean;
  /** Called after the user confirms Discard in the save bar's AlertDialog. The form is back to its saved values. */
  onCancel?: () => void;
  /** Called after a Save that passes the checks. */
  onSave?: () => void;
}

const FIELD_ORDER = Object.keys(LABELS) as BillingField[];

/*
 * Narrow = below --grid-breakpoint-sm, read at runtime. The groups lose their Card and controls go to lg 40.
 * (The FieldSet legend column stacks on its own, by the FieldSet's width.) 40rem is the fallback.
 */
function narrowQuery(): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue("--grid-breakpoint-sm").trim();
  return `(width < ${value || "40rem"})`;
}

function subscribe(onChange: () => void) {
  const query = window.matchMedia(narrowQuery());
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useNarrow(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(narrowQuery()).matches, () => false);
}

/** "Legal name and Invoice currency", "Legal name, City and Invoice currency". */
function listInWords(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function plural(count: number, one: string, many: string): string {
  return `${count === 1 ? "1" : count} ${count === 1 ? one : many}`;
}

function timeNow(): string {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Company billing details: three FieldSets (Company, Billing address, Currency and invoices) in one Card,
 * legend left when wide, then a sticky SaveBar. Changed fields say Edited with the old value in the hint.
 * Save with errors shows a danger Alert summary that takes focus, one Button per field. Discard and leaving
 * through the page's breadcrumb with changes ask first in an AlertDialog; closing the tab gets the browser's
 * own prompt. Copy it in and replace the fields, the checks and the save call.
 */
export function SettingsFormPattern({ breadcrumbs, header = true, onCancel, onSave }: SettingsFormPatternProps) {
  const uid = useId();
  const narrow = useNarrow();
  const size = narrow ? "lg" : "md";

  const [saved, setSaved] = useState<BillingDetails>(SAVED);
  const [values, setValues] = useState<BillingDetails>(DRAFT);
  const [savedAt, setSavedAt] = useState(LAST_SAVED);
  const [justSaved, setJustSaved] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<BillingField, string>>>({});
  const [summaryFocus, setSummaryFocus] = useState(0);
  const [confirm, setConfirm] = useState<"discard" | "leave" | null>(null);

  const summaryRef = useRef<HTMLDivElement>(null);
  const leaveTarget = useRef<HTMLElement | null>(null);
  const allowLeave = useRef(false);

  const changed = FIELD_ORDER.filter((field) => values[field] !== saved[field]);
  const changeNames = changed.map((field) => LABELS[field]);
  const errorFields = CHECKED_FIELDS.filter((field) => errors[field]);
  const dirty = changed.length > 0;
  const state: SaveBarState = errorFields.length > 0 ? "error" : dirty ? "dirty" : "saved";

  const id = (field: BillingField) => `${uid}-${field}`;

  // The summary Alert takes focus once per failed Save, after it renders.
  useEffect(() => {
    if (summaryFocus > 0) summaryRef.current?.focus();
  }, [summaryFocus]);

  // Closing or reloading the tab with changes: browsers only allow their own prompt.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function update(field: BillingField, next: string) {
    setValues((current) => ({ ...current, [field]: next }));
    setJustSaved(false);
    // Editing a field that failed clears its error; the summary follows.
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function save() {
    const found: Partial<Record<BillingField, string>> = {};
    for (const field of CHECKED_FIELDS) {
      const message = validate(field, values[field]);
      if (message) found[field] = message;
    }
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setSummaryFocus((count) => count + 1);
      return;
    }
    setSaved(values);
    setSavedAt(timeNow());
    setJustSaved(true);
    onSave?.();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (dirty) save();
  }

  function discard() {
    setValues(saved);
    setErrors({});
  }

  function focusField(field: BillingField) {
    document.getElementById(id(field))?.focus();
  }

  // Leaving through a link or button in the page header (the breadcrumb, its narrow Back) with changes asks first.
  function guardLeave(event: MouseEvent<HTMLDivElement>) {
    if (!dirty || allowLeave.current) return;
    const target = (event.target as HTMLElement).closest<HTMLElement>("a[href], button");
    if (!target || !event.currentTarget.contains(target)) return;
    event.preventDefault();
    event.stopPropagation();
    leaveTarget.current = target;
    setConfirm("leave");
  }

  function confirmLeave() {
    const target = leaveTarget.current;
    leaveTarget.current = null;
    discard();
    setConfirm(null);
    if (!target) return;
    // Let the click through once, after the dialog has closed.
    allowLeave.current = true;
    requestAnimationFrame(() => {
      target.click();
      allowLeave.current = false;
    });
  }

  function control(field: BillingField, kind: "text" | "email" = "text", autoComplete?: string) {
    return (
      <Input
        id={id(field)}
        type={kind}
        size={size}
        value={values[field]}
        onChange={(next) => update(field, next)}
        error={Boolean(errors[field])}
        autoComplete={autoComplete}
      />
    );
  }

  function select(field: "country" | "currency", options: { value: string; label: string }[]) {
    return (
      <Select
        id={id(field)}
        size={size}
        options={options}
        value={values[field]}
        onChange={(next) => update(field, String(next))}
      />
    );
  }

  function field(name: BillingField, children: ReactNode, extra?: { optional?: boolean }) {
    const isChanged = values[name] !== saved[name];
    return (
      <Field
        label={LABELS[name]}
        htmlFor={id(name)}
        optional={extra?.optional}
        changed={isChanged}
        // On a phone a changed field drops "Was …" (Edited carries the change and the SaveBar lists it).
        // With an error it keeps its plain hint, since the hint stays under an error.
        hint={!narrow || !isChanged ? hintFor(name, saved, isChanged) : errors[name] ? hintFor(name, saved, false) : undefined}
        error={errors[name]}
      >
        {children}
      </Field>
    );
  }

  const summaryTitle = `Not saved. Fix ${plural(errorFields.length, "field", "fields")} first`;
  const [firstError, secondError] = errorFields;

  const groups = (
    <div className="settings-form-pattern__groups">
      <FieldSet legend="Company" description="The legal entity your customers pay" layout="side">
        {field("legalName", control("legalName", "text", "organization"))}
        {narrow ? (
          // One column on a phone: VAT number moves up under Legal name, the fields most likely to need a fix.
          <>
            {field("vatNumber", control("vatNumber"))}
            {field("tradingName", control("tradingName"), { optional: true })}
            {field("companyNumber", control("companyNumber"))}
          </>
        ) : (
          <>
            <div className="settings-form-pattern__pair">
              {field("tradingName", control("tradingName"), { optional: true })}
              {field("companyNumber", control("companyNumber"))}
            </div>
            <div className="settings-form-pattern__pair">{field("vatNumber", control("vatNumber"))}</div>
          </>
        )}
      </FieldSet>
      <Divider />
      <FieldSet legend="Billing address" description="Shown under the company name on invoices and receipts" layout="side">
        {field("street", control("street", "text", "address-line1"))}
        {field("line2", control("line2", "text", "address-line2"), { optional: true })}
        <div className="settings-form-pattern__pair settings-form-pattern__pair--wide-first">
          {field("city", control("city", "text", "address-level2"))}
          {field("postcode", control("postcode", "text", "postal-code"))}
        </div>
        <div className="settings-form-pattern__pair">{field("country", select("country", COUNTRY_OPTIONS))}</div>
      </FieldSet>
      <Divider />
      <FieldSet legend="Currency and invoices" description="How new invoices are priced and where copies go" layout="side">
        <div className="settings-form-pattern__pair">{field("currency", select("currency", CURRENCY_OPTIONS))}</div>
        {field("billingEmail", control("billingEmail", "email", "email"))}
      </FieldSet>
    </div>
  );

  return (
    <div
      className={`layout-canvas layout-canvas--sticky-header settings-form-pattern${narrow ? " settings-form-pattern--narrow" : ""}${header ? "" : " settings-form-pattern--headerless"}`}
    >
      {header ? (
        <div className="layout-header" onClickCapture={guardLeave}>
          <PageHeader
            title="Billing details"
            // A phone keeps the title only, so the form starts higher.
            subtitle={narrow ? undefined : "Printed on every invoice Northwind sends. Changes apply from INV-1843, the next invoice."}
            breadcrumbs={breadcrumbs}
            eyebrow={breadcrumbs ? undefined : "Settings"}
          />
        </div>
      ) : null}
      <form className="layout-content" id={`${uid}-form`} onSubmit={handleSubmit} noValidate>
        {/* The action is outline so Save stays the page's only solid primary. */}
        {firstError ? (
          <Alert
            ref={summaryRef}
            tabIndex={-1}
            variant="danger"
            title={summaryTitle}
            className="settings-form-pattern__summary"
            action={{ label: `Go to ${LABELS[firstError]}`, onClick: () => focusField(firstError), appearance: "outline" }}
            secondaryAction={
              secondError ? { label: `Go to ${LABELS[secondError]}`, onClick: () => focusField(secondError) } : undefined
            }
          />
        ) : null}
        {narrow ? groups : <Card size="md">{groups}</Card>}
      </form>
      <SaveBar
        state={state}
        // In the error state the bar says only what to fix; the summary Alert above the form names the field.
        changes={state === "error" ? [] : changeNames}
        savedAt={state === "error" ? undefined : justSaved || !dirty ? savedAt.split(" by ")[0] : savedAt}
        message={state === "error" ? `Not saved · ${plural(errorFields.length, "field", "fields")} to fix` : undefined}
        onDiscard={() => setConfirm("discard")}
        onSave={save}
      />
      <AlertDialog
        open={confirm === "discard"}
        tone="neutral"
        size="sm"
        title={`Discard ${plural(changed.length, "change", "changes")}?`}
        description={`${listInWords(changeNames)} go back to their saved values.`}
        cancelLabel="Keep editing"
        actionLabel="Discard changes"
        actionVariant="danger"
        onCancel={() => setConfirm(null)}
        onAction={() => {
          discard();
          setConfirm(null);
          onCancel?.();
        }}
      />
      <AlertDialog
        open={confirm === "leave"}
        tone="neutral"
        size="sm"
        title="Leave without saving?"
        description={`${plural(changed.length, "change", "changes")} will be lost: ${listInWords(changeNames)}.`}
        cancelLabel="Keep editing"
        actionLabel="Discard and leave"
        actionVariant="danger"
        onCancel={() => {
          leaveTarget.current = null;
          setConfirm(null);
        }}
        onAction={confirmLeave}
      />
    </div>
  );
}

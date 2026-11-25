"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { AppHeader } from "../../ui/AppHeader";
import { BlurCrossfade } from "../../ui/BlurCrossfade";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Field } from "../../ui/Field";
import { Input } from "../../ui/Input";
import { ListView } from "../../ui/ListView";
import type { ListViewItem } from "../../ui/ListView";
import { PageHeader } from "../../ui/PageHeader";
import { ProgressSteps } from "../../ui/ProgressSteps";
import type { ProgressStepsItem } from "../../ui/ProgressSteps";
import { Select } from "../../ui/Select";
import { SideNavBrand, SideNavHeader, SideNavRoot, SideNavSlot } from "../../ui/SideNav";
import { TileGroup } from "../../ui/TileGroup";
import {
  COUNTRY_OPTIONS,
  CURRENCY_OPTIONS,
  DEFAULT_VALUES,
  FIRST_INVOICE,
  PLANS,
  PRODUCT,
  STEPS,
  TERMS_OPTIONS,
  type BillingValues,
  type BusinessValues,
  type OnboardingStep,
  type OnboardingValues,
} from "./onboarding-data";
import "./OnboardingPattern.css";

export type { BillingValues, BusinessValues, OnboardingStep, OnboardingValues };

/** Review step: ready to confirm, showing a validation error, or creating the account. */
export type ConfirmState = "idle" | "error" | "submitting";

/*
 * Narrow = below --grid-breakpoint-md, read at runtime like the app-shell example. The Stage
 * layout needs a side column, so below it a reduced AppHeader carries the steps. 64rem is the fallback.
 */
function narrowQuery(): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue("--grid-breakpoint-md").trim();
  return `(width < ${value || "64rem"})`;
}

function subscribe(onChange: () => void) {
  const query = window.matchMedia(narrowQuery());
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useNarrow(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(narrowQuery()).matches, () => false);
}

export interface OnboardingPatternProps {
  /** Current step (controlled). Pair it with onStepChange, or route it from your URL. */
  step?: OnboardingStep;
  defaultStep?: OnboardingStep;
  onStepChange?: (step: OnboardingStep) => void;
  /**
   * Force the Review step's state (docs, tests). "error" clears the business name so Review has a step to fix. Left out,
   * the pattern validates each step itself and shows "submitting" while onConfirm's promise is pending.
   */
  confirmState?: ConfirmState;
  /** Create the account from every step's values. Return a promise to keep the submitting state until it settles. */
  onConfirm?: (values: OnboardingValues) => void | Promise<void>;
  onSaveAndExit?: () => void;
  /** Called after onConfirm succeeds, e.g. to go to the dashboard. */
  onFinish?: () => void;
  /** Fill the viewport height (layout-shell--viewport). Default true; turn it off inside a framed preview. */
  viewport?: boolean;
}

const ORDER: OnboardingStep[] = STEPS.map((step) => step.id);
const FORM_STEPS: Exclude<OnboardingStep, "review">[] = ["business", "plan", "billing"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<Record<string, string>>;

function businessErrors(business: BusinessValues): Errors {
  return business.name.trim() ? {} : { name: "Enter a business name." };
}

function planErrors(plan: string): Errors {
  return PLANS.some((item) => item.value === plan) ? {} : { plan: "Choose a plan." };
}

function billingErrors(billing: BillingValues): Errors {
  const errors: Errors = {};
  if (!EMAIL.test(billing.email.trim())) errors.email = "Enter a billing email, like finance@company.com.";
  if (!billing.prefix.trim()) errors.prefix = "Enter an invoice number prefix.";
  return errors;
}

function errorsFor(step: OnboardingStep, values: OnboardingValues): Errors {
  if (step === "business") return businessErrors(values.business);
  if (step === "plan") return planErrors(values.plan);
  if (step === "billing") return billingErrors(values.billing);
  return {};
}

const labelOf = (options: { value: string; label: string }[], value: string) =>
  options.find((option) => option.value === value)?.label ?? value;

/**
 * Guided account setup after sign-in: Business, Plan (kit TileGroup), Billing, then Review and
 * Confirm, in the Stage look: vertical ProgressSteps in a column on the canvas and the step on a
 * layout-shell--inset panel; below md a reduced AppHeader carries the steps, which compact on their
 * own. The footer holds Save and exit (desktop), Back (ghost) and the one solid primary.
 */
export function OnboardingPattern({
  step: stepProp,
  defaultStep = "business",
  onStepChange,
  confirmState,
  onConfirm,
  onSaveAndExit,
  onFinish,
  viewport = true,
}: OnboardingPatternProps) {
  // Stage (the site's look). Below md there is no room for the steps column: a reduced AppHeader carries them.
  const stage = !useNarrow();
  const uid = useId();
  const formId = `${uid}-step`;
  const [ownStep, setOwnStep] = useState(defaultStep);
  const step = stepProp ?? ownStep;
  const index = ORDER.indexOf(step);
  const meta = STEPS[index];

  const [own, setValues] = useState<OnboardingValues>(DEFAULT_VALUES);
  // Steps whose errors show: tried to continue on them.
  const [checked, setChecked] = useState<Set<OnboardingStep>>(() => new Set());
  const [pending, setPending] = useState(false);
  // Once Review has been shown, every invalid step keeps showing its errors (after Edit too).
  const [reviewed, setReviewed] = useState(step === "review" || confirmState === "error");
  if ((step === "review" || confirmState === "error") && !reviewed) setReviewed(true);

  // confirmState="error" (docs, tests) clears the business name once, so Review shows a step to fix.
  const [forced, setForced] = useState<ConfirmState | undefined>(undefined);
  if (confirmState !== forced) {
    setForced(confirmState);
    if (confirmState === "error") setValues((current) => ({ ...current, business: { ...current.business, name: "" } }));
  }
  const values = own;
  const submitting = confirmState === "submitting" || (confirmState === undefined && pending);
  const invalid: OnboardingStep[] = FORM_STEPS.filter((id) => Object.keys(errorsFor(id, values)).length > 0);
  const shown = (id: OnboardingStep) => checked.has(id) || reviewed;
  const errors = shown(step) ? errorsFor(step, values) : {};

  // A new step replaces the content under focus: move focus to the step (not on first render).
  const mainRef = useRef<HTMLElement>(null);
  const shownStep = useRef(step);
  useEffect(() => {
    if (shownStep.current === step) return;
    shownStep.current = step;
    mainRef.current?.focus();
  }, [step]);

  function go(next: OnboardingStep) {
    setOwnStep(next);
    onStepChange?.(next);
  }

  function setBusiness(patch: Partial<BusinessValues>) {
    setValues((current) => ({ ...current, business: { ...current.business, ...patch } }));
  }

  function setBilling(patch: Partial<BillingValues>) {
    setValues((current) => ({ ...current, billing: { ...current.billing, ...patch } }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    if (step !== "review") {
      const stepErrors = errorsFor(step, values);
      const first = Object.keys(stepErrors)[0];
      if (first) {
        setChecked((current) => new Set([...current, step]));
        document.getElementById(`${uid}-${first}`)?.focus();
        return;
      }
      return go(ORDER[index + 1]);
    }
    if (invalid.length > 0) return;
    setPending(true);
    try {
      await onConfirm?.(values);
      onFinish?.();
    } finally {
      setPending(false);
    }
  }

  const plan = PLANS.find((item) => item.value === values.plan);
  const country = COUNTRY_OPTIONS.find((option) => option.value === values.business.country);
  const currency = CURRENCY_OPTIONS.find((option) => option.value === values.business.currency);
  const terms = labelOf(TERMS_OPTIONS, values.billing.terms);

  const done: Record<OnboardingStep, string | undefined> = {
    business: [country?.short, currency?.code].filter(Boolean).join(", "),
    plan: plan?.title,
    billing: terms,
    review: undefined,
  };
  const progressSteps: ProgressStepsItem[] = STEPS.map(({ id, label }, at) => ({
    id,
    label,
    description: at < index && !invalid.includes(id) ? done[id] : undefined,
    status: invalid.includes(id) && shown(id) && id !== step ? "error" : undefined,
  }));
  const stepClick = (at: number) => {
    if (!submitting) go(ORDER[at]);
  };

  const fix = (id: OnboardingStep) => (invalid.includes(id) ? { badge: "Fix", badgeTone: "danger" as const } : {});
  const edit = (name: string) => [{ id: "edit", label: "Edit", actionLabel: `Edit ${name}`, disabled: submitting }];
  const reviewItems: ListViewItem[] = [
    {
      id: "business",
      group: "business",
      primary: values.business.name.trim() || "No business name",
      secondary: [country?.label, currency?.code, values.business.vat?.trim() && `VAT ${values.business.vat.trim()}`]
        .filter(Boolean)
        .join(" · "),
      actions: edit("business"),
      ...fix("business"),
    },
    {
      id: "plan",
      group: "plan",
      primary: plan?.title ?? "No plan chosen",
      secondary: plan ? `${plan.price} a month · ${plan.seats}` : undefined,
      actions: edit("plan"),
      ...fix("plan"),
    },
    {
      id: "billing",
      group: "billing",
      primary: values.billing.email.trim() || "No billing email",
      secondary: `${terms} · prefix ${values.billing.prefix.trim() || "not set"}`,
      actions: edit("billing"),
      ...fix("billing"),
    },
    {
      id: "invoice",
      group: "invoice",
      primary: `${values.billing.prefix.trim()}${FIRST_INVOICE.number}`,
      secondary: `${FIRST_INVOICE.date}, then monthly`,
      value: plan?.price,
    },
  ];

  const saveAndExit = (
    <Button appearance="ghost" mode="neutral" size={stage ? "md" : "sm"} disabled={submitting} onClick={onSaveAndExit}>
      Save and exit
    </Button>
  );

  // Desktop: Save and exit at the start, Back beside the primary. Narrow: Back at the start.
  const back =
    index > 0 ? (
      <Button appearance="ghost" mode="neutral" disabled={submitting} onClick={() => go(ORDER[index - 1])}>
        Back
      </Button>
    ) : null;

  return (
    <div
      className={["layout-shell onboarding-pattern", viewport ? "layout-shell--viewport" : "", stage ? "layout-shell--inset" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      {stage ? null : (
        <AppHeader
          title={PRODUCT.name}
          mark={PRODUCT.mark}
          radius="none"
          search={false}
          center={<ProgressSteps size="sm" ariaLabel="Setup steps" current={index} steps={progressSteps} />}
          actions={saveAndExit}
        />
      )}

      <div className={stage ? "layout-app" : "onboarding-pattern__single"}>
        {stage ? (
          <div className="onboarding-pattern__rail">
            <SideNavRoot aria-label={`${PRODUCT.name} setup`} radius="none" open>
              <SideNavHeader>
                <SideNavBrand title={PRODUCT.name} mark={PRODUCT.mark} />
              </SideNavHeader>
              <SideNavSlot>
                <ProgressSteps
                  size="sm"
                  orientation="vertical"
                  ariaLabel="Setup steps"
                  current={index}
                  steps={progressSteps}
                  onStepClick={stepClick}
                />
              </SideNavSlot>
            </SideNavRoot>
          </div>
        ) : null}

        <main
          ref={mainRef}
          tabIndex={-1}
          className={stage ? "onboarding-pattern__main onboarding-pattern__main--stage" : "onboarding-pattern__main"}
          aria-label={`Setup, step ${index + 1} of ${STEPS.length}: ${meta.label}`}
        >
          <form id={formId} className="layout-content onboarding-pattern__content" onSubmit={submit} noValidate>
            <div className="layout-container-sm onboarding-pattern__column">
              <BlurCrossfade contentKey={step} label={`Step ${index + 1} of ${STEPS.length}: ${meta.label}`}>
                <PageHeader
                  eyebrow={stage ? `Step ${index + 1} of ${STEPS.length}` : undefined}
                  title={meta.title}
                  subtitle={meta.subtitle}
                />
              </BlurCrossfade>

              {step === "business" ? (
                <div className="onboarding-pattern__fields">
                  <Field label="Business name" htmlFor={`${uid}-name`} error={errors.name} hint="Your registered or trading name" required>
                    <Input
                      id={`${uid}-name`}
                      name="businessName"
                      value={values.business.name}
                      error={Boolean(errors.name)}
                      onChange={(name) => setBusiness({ name })}
                    />
                  </Field>
                  <div className="layout-split">
                    <Field label="Country" htmlFor={`${uid}-country`}>
                      <Select
                        id={`${uid}-country`}
                        name="country"
                        options={COUNTRY_OPTIONS}
                        value={values.business.country}
                        onChange={(next) => setBusiness({ country: String(next) })}
                      />
                    </Field>
                    <Field label="Currency" htmlFor={`${uid}-currency`}>
                      <Select
                        id={`${uid}-currency`}
                        name="currency"
                        options={CURRENCY_OPTIONS}
                        value={values.business.currency}
                        onChange={(next) => setBusiness({ currency: String(next) })}
                      />
                    </Field>
                  </div>
                  <Field label="VAT number" htmlFor={`${uid}-vat`} hint="Printed on invoices when set" optional>
                    <Input
                      id={`${uid}-vat`}
                      name="vat"
                      value={values.business.vat ?? ""}
                      onChange={(vat) => setBusiness({ vat })}
                    />
                  </Field>
                </div>
              ) : step === "plan" ? (
                <TileGroup
                  id={`${uid}-plan`}
                  ariaLabel="Plan"
                  items={PLANS.map(({ value, title, description, meta: price }) => ({ value, title, description, meta: price }))}
                  value={values.plan}
                  onChange={(next) => setValues((current) => ({ ...current, plan: next }))}
                />
              ) : step === "billing" ? (
                <div className="onboarding-pattern__fields">
                  <Field label="Billing email" htmlFor={`${uid}-email`} error={errors.email} hint="Replies to invoices go here" required>
                    <Input
                      id={`${uid}-email`}
                      type="email"
                      name="billingEmail"
                      value={values.billing.email}
                      error={Boolean(errors.email)}
                      onChange={(email) => setBilling({ email })}
                    />
                  </Field>
                  <div className="layout-split">
                    <Field label="Payment terms" htmlFor={`${uid}-terms`}>
                      <Select
                        id={`${uid}-terms`}
                        name="terms"
                        options={TERMS_OPTIONS}
                        value={values.billing.terms}
                        onChange={(next) => setBilling({ terms: String(next) })}
                      />
                    </Field>
                    <Field label="Invoice prefix" htmlFor={`${uid}-prefix`} error={errors.prefix} hint={`First invoice ${values.billing.prefix.trim() || "…"}${FIRST_INVOICE.number}`} required>
                      <Input
                        id={`${uid}-prefix`}
                        name="prefix"
                        value={values.billing.prefix}
                        error={Boolean(errors.prefix)}
                        onChange={(prefix) => setBilling({ prefix })}
                      />
                    </Field>
                  </div>
                </div>
              ) : (
                <Card flush aria-busy={submitting || undefined}>
                  <ListView
                    label="Summary"
                    size="sm"
                    items={reviewItems}
                    groups={[
                      { id: "business", label: "Business" },
                      { id: "plan", label: "Plan" },
                      { id: "billing", label: "Billing" },
                      { id: "invoice", label: "First invoice" },
                    ]}
                    onAction={(id) => go(id as OnboardingStep)}
                  />
                </Card>
              )}
            </div>
          </form>

          <div className="onboarding-pattern__footer">
            {stage ? saveAndExit : back}
            <div className="onboarding-pattern__footer-end">
              {stage ? back : null}
              <Button
                type="submit"
                form={formId}
                loading={submitting}
                disabled={step === "review" && invalid.length > 0}
                iconStart={step === "review" && !submitting ? "Check" : undefined}
                shortcut={step === "review" || submitting ? undefined : "⏎"}
                aria-keyshortcuts={step === "review" ? undefined : "Enter"}
              >
                {submitting ? "Creating account…" : step === "review" ? "Confirm" : "Continue"}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

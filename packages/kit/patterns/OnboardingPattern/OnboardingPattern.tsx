"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { AppHeader } from "../../ui/AppHeader";
import { Badge } from "../../ui/Badge";
import { BlurCrossfade } from "../../ui/BlurCrossfade";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Empty } from "../../ui/Empty";
import { Field } from "../../ui/Field";
import { Input } from "../../ui/Input";
import { ListView } from "../../ui/ListView";
import { PageHeader } from "../../ui/PageHeader";
import { ProgressSteps } from "../../ui/ProgressSteps";
import { Select } from "../../ui/Select";
import { SetupGuide } from "../../ui/SetupGuide";
import { SideNavBrand, SideNavFooter, SideNavHeader, SideNavRoot, SideNavSlot } from "../../ui/SideNav";
import type { SetupTask } from "../../ui/SetupGuide";
import { Spinner } from "../../ui/Spinner";
import {
  COUNTRY_OPTIONS,
  CURRENCY_OPTIONS,
  PRODUCT,
  SETUP_TASKS,
  STEPS,
  TEAM_SIZE_OPTIONS,
  WELCOME_ITEMS,
  WORKSPACE_DEFAULTS,
  type OnboardingStep,
  type WorkspaceValues,
} from "./onboarding-data";
import "./OnboardingPattern.css";

export type { OnboardingStep, WorkspaceValues };

/** Workspace step: ready to fill, showing the validation error, or creating the workspace. */
export type WorkspaceState = "idle" | "error" | "submitting";

/*
 * Narrow = below --grid-breakpoint-md, read at runtime like the app-shell example. The Stage
 * layout needs a side column, so below it the header layout takes over. 64rem is the fallback.
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
  /**
   * "stage" (default, the Nistha site's look): the steps in a side column on the canvas with
   * vertical ProgressSteps, the step on an inset panel (layout-shell--inset). "header": a reduced
   * AppHeader with horizontal ProgressSteps. Below --grid-breakpoint-md Stage uses the header layout.
   */
  layout?: "stage" | "header";
  /** Current step (controlled). Pair it with onStepChange, or route it from your URL. */
  step?: OnboardingStep;
  defaultStep?: OnboardingStep;
  onStepChange?: (step: OnboardingStep) => void;
  /**
   * Force the workspace step's state (docs, tests). Left out, the pattern validates the name
   * itself and shows "submitting" while onCreateWorkspace's promise is pending.
   */
  workspaceState?: WorkspaceState;
  /** Create the workspace. Return a promise to keep the submitting state until it settles. */
  onCreateWorkspace?: (values: WorkspaceValues) => void | Promise<void>;
  /** Setup Guide task action (Connect, Import…) on the Connect step. */
  onTaskAction?: (taskId: string) => void;
  onSaveAndExit?: () => void;
  /** Go to dashboard, on the Done step. */
  onFinish?: () => void;
  /** Fill the viewport height (layout-shell--viewport). Default true; turn it off inside a framed preview. */
  viewport?: boolean;
}

const ORDER: OnboardingStep[] = STEPS.map((step) => step.id);

/**
 * Guided setup after sign-in: Welcome, Workspace, Connect or choose (with the kit SetupGuide),
 * Done. A reduced AppHeader carries ProgressSteps and Save and exit; Back (ghost) and the one
 * solid primary sit in a footer bar. Not sign-in and not empty-first-run.
 */
export function OnboardingPattern({
  step: stepProp,
  defaultStep = "welcome",
  onStepChange,
  workspaceState,
  onCreateWorkspace,
  onTaskAction,
  onSaveAndExit,
  onFinish,
  viewport = true,
  layout = "stage",
}: OnboardingPatternProps) {
  const narrow = useNarrow();
  const stage = layout === "stage" && !narrow;
  const uid = useId();
  const formId = `${uid}-step`;
  const [ownStep, setOwnStep] = useState(defaultStep);
  const step = stepProp ?? ownStep;
  const index = ORDER.indexOf(step);
  const meta = STEPS[index];

  const [values, setValues] = useState<WorkspaceValues>(WORKSPACE_DEFAULTS);
  const [nameError, setNameError] = useState(false);
  const [pending, setPending] = useState(false);
  const [tasks, setTasks] = useState<SetupTask[]>(SETUP_TASKS);

  const showError = workspaceState === "error" || (workspaceState === undefined && nameError);
  const submitting = workspaceState === "submitting" || (workspaceState === undefined && pending);
  const name = workspaceState === "error" ? "" : values.name;
  const tasksLeft = tasks.filter((task) => task.status !== "done").length;

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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === "welcome") return go("workspace");
    if (step === "connect") return go("done");
    if (step === "done") return onFinish?.();
    if (submitting) return;
    if (!values.name.trim()) {
      setNameError(true);
      document.getElementById(`${uid}-name`)?.focus();
      return;
    }
    setPending(true);
    try {
      await onCreateWorkspace?.(values);
      go("connect");
    } finally {
      setPending(false);
    }
  }

  function taskAction(id: string) {
    setTasks((rows) => rows.map((task) => (task.id === id ? { ...task, status: "done" } : task)));
    onTaskAction?.(id);
  }

  const primaryLabel =
    step === "welcome" ? "Get started" : step === "done" ? "Go to dashboard" : "Continue";

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
          center={
            <ProgressSteps
              size="sm"
              ariaLabel="Setup steps"
              current={index}
              steps={STEPS.map(({ id, label }) => ({ id, label }))}
            />
          }
          actions={
            step === "done" ? undefined : (
              <Button appearance="ghost" mode="neutral" size="sm" onClick={onSaveAndExit}>
                Save and exit
              </Button>
            )
          }
        />
      )}

      <div className={stage ? "layout-app" : "onboarding-pattern__single"}>
        {stage ? (
          <SideNavRoot aria-label={`${PRODUCT.name} setup`} radius="none" open>
            <SideNavHeader>
              <SideNavBrand title={PRODUCT.name.toLowerCase()} mark={PRODUCT.mark.toLowerCase()} />
            </SideNavHeader>
            <SideNavSlot>
              <p className="onboarding-pattern__overline">{`Set up · ${STEPS.length} steps`}</p>
              <ProgressSteps
                size="sm"
                orientation="vertical"
                ariaLabel="Setup steps"
                current={index}
                steps={STEPS.map(({ id, label }) => ({ id, label }))}
              />
            </SideNavSlot>
            {step === "done" ? null : (
              <SideNavFooter className="onboarding-pattern__exit">
                <Button appearance="ghost" mode="neutral" size="sm" onClick={onSaveAndExit}>
                  Save and exit
                </Button>
              </SideNavFooter>
            )}
          </SideNavRoot>
        ) : null}

        <main
          ref={mainRef}
          tabIndex={-1}
          className={stage ? "onboarding-pattern__main onboarding-pattern__main--stage" : "onboarding-pattern__main"}
          aria-label={`Setup, step ${index + 1} of ${STEPS.length}: ${meta.label}`}
        >
          {stage ? <p className="onboarding-pattern__count">{`Step ${index + 1} of ${STEPS.length}`}</p> : null}
          <form id={formId} className="layout-content onboarding-pattern__content" onSubmit={submit} noValidate>
            <div className="layout-container-sm onboarding-pattern__column">
              {step === "done" ? (
                <Empty
                  icon="Check"
                  title={`${values.name || WORKSPACE_DEFAULTS.name} ${meta.title}`}
                  description={`${tasksLeft === 1 ? "One setup task is" : `${tasksLeft} setup tasks are`} left in your Setup Guide. ${meta.subtitle}`}
                  actions={
                    <span className="onboarding-pattern__badges">
                      <Badge tone="success" size="sm">
                        Workspace created
                      </Badge>
                      <Badge tone="neutral" appearance="outline" size="sm">
                        {`${tasksLeft} tasks left`}
                      </Badge>
                    </span>
                  }
                />
              ) : (
                <BlurCrossfade contentKey={step} label={`Step ${index + 1} of ${STEPS.length}: ${meta.label}`}>
                  <PageHeader title={meta.title} subtitle={meta.subtitle} />
                </BlurCrossfade>
              )}

              {step === "welcome" ? (
                <ListView label="What you'll set up" items={WELCOME_ITEMS} />
              ) : step === "workspace" ? (
                <Card>
                  <div className="onboarding-pattern__fields" aria-busy={submitting || undefined}>
                    <Field
                      label="Workspace name"
                      htmlFor={`${uid}-name`}
                      hint={showError ? undefined : "Shown on invoices and in emails"}
                      error={showError ? "Enter a workspace name." : undefined}
                    >
                      <Input
                        id={`${uid}-name`}
                        name="workspaceName"
                        placeholder="Workspace name"
                        value={name}
                        error={showError}
                        disabled={submitting}
                        onChange={(next) => {
                          setValues((current) => ({ ...current, name: next }));
                          if (next.trim()) setNameError(false);
                        }}
                      />
                    </Field>
                    <div className="layout-split">
                      <Field label="Country" htmlFor={`${uid}-country`}>
                        <Select
                          id={`${uid}-country`}
                          name="country"
                          options={COUNTRY_OPTIONS}
                          value={values.country}
                          disabled={submitting}
                          onChange={(country) => setValues((current) => ({ ...current, country: String(country) }))}
                        />
                      </Field>
                      <Field label="Currency" htmlFor={`${uid}-currency`}>
                        <Select
                          id={`${uid}-currency`}
                          name="currency"
                          options={CURRENCY_OPTIONS}
                          value={values.currency}
                          disabled={submitting}
                          onChange={(currency) => setValues((current) => ({ ...current, currency: String(currency) }))}
                        />
                      </Field>
                    </div>
                    <Field label="Team size" htmlFor={`${uid}-team`}>
                      <Select
                        id={`${uid}-team`}
                        name="teamSize"
                        options={TEAM_SIZE_OPTIONS}
                        value={values.teamSize}
                        disabled={submitting}
                        onChange={(teamSize) => setValues((current) => ({ ...current, teamSize: String(teamSize) }))}
                      />
                    </Field>
                  </div>
                </Card>
              ) : step === "connect" ? (
                <SetupGuide
                  title="Setup guide"
                  tasks={tasks}
                  onTaskAction={taskAction}
                  onUndoSkip={(id) => setTasks((rows) => rows.map((task) => (task.id === id ? { ...task, status: "todo" } : task)))}
                />
              ) : null}
            </div>
          </form>

          <div className={step === "done" ? "onboarding-pattern__footer onboarding-pattern__footer--center" : "onboarding-pattern__footer"}>
            {step === "welcome" || step === "done" ? null : (
              <Button appearance="ghost" mode="neutral" disabled={submitting} onClick={() => go(ORDER[index - 1])}>
                Back
              </Button>
            )}
            <div className="onboarding-pattern__footer-end">
              {/* Busy state: a kit Spinner with a visible label beside the disabled primary (no Button loading prop). */}
              {submitting ? <Spinner size="sm" label="Creating workspace…" /> : null}
              {step === "connect" ? (
                <Button appearance="ghost" mode="neutral" onClick={() => go("done")}>
                  Skip for now
                </Button>
              ) : null}
              <Button
                type="submit"
                form={formId}
                disabled={submitting}
                iconStart={step === "welcome" || step === "done" ? "ArrowRight" : undefined}
                shortcut={step === "workspace" || step === "connect" ? (submitting ? undefined : "⏎") : undefined}
                aria-keyshortcuts={step === "workspace" || step === "connect" ? "Enter" : undefined}
              >
                {primaryLabel}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

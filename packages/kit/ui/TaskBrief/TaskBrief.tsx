"use client";

import { useId, useState } from "react";
import { CirclePlay } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Alert } from "../Alert";
import { AutonomyDial, AUTONOMY_STOPS } from "../AutonomyDial";
import { Button } from "../Button";
import { Card } from "../Card";
import { CurrencyInput } from "../CurrencyInput";
import { Field } from "../Field";
import { FieldSet } from "../FieldSet";
import { Input } from "../Input";
import { ModelPicker } from "../ModelPicker";
import { MultiSelect } from "../MultiSelect";
import { NumberInput } from "../NumberInput";
import { Textarea } from "../Textarea";
import { cx } from "../shared/cx";
import { mergeRefs } from "../shared/mergeRefs";
import { useResolvedFocus } from "../shared/useResolvedFocus";
import { nisthaAttr } from "../shared/inspect";
import {
  MAX_CRITERIA,
  addCriterion,
  canStart,
  filledCriteria,
  foldSummary,
  removeCriterion,
  startBlocker,
} from "./taskBrief.logic";
import type { TaskBriefProps, TaskBriefValue } from "./TaskBrief.types";
import styles from "./TaskBrief.module.css";

export type { TaskBriefProps, TaskBriefStatus, TaskBriefValue } from "./TaskBrief.types";

/**
 * The brief a person hands an agent before it plans: goal, "done when" checks, limits, tools,
 * model and check-in level. PlanReview reviews the plan that comes after.
 */
export function TaskBrief({
  title = "New task",
  value,
  onChange,
  tools = [],
  models,
  autonomyOptions = AUTONOMY_STOPS,
  currency = "USD",
  locale = "en",
  onStart,
  onSaveDraft,
  status = "draft",
  errorMessage = "Couldn't start the task.",
  className,
  ref,
  ...rest
}: TaskBriefProps) {
  const base = useId();
  const ids = {
    goal: `${base}-goal`,
    spend: `${base}-spend`,
    minutes: `${base}-minutes`,
    steps: `${base}-steps`,
    tools: `${base}-tools`,
    blocker: `${base}-blocker`,
  };
  const [touched, setTouched] = useState({ goal: false, criteria: false });
  const focus = useResolvedFocus(status === "started");
  const busy = status === "starting";
  const criteria = value.criteria.length > 0 ? value.criteria : [""];
  const ready = canStart(value);
  const blocker = startBlocker(value);

  function patch(next: Partial<TaskBriefValue>) {
    onChange?.({ ...value, ...next });
  }

  if (status === "started") {
    const goal = value.goal.trim();
    return (
      <section
        {...rest}
        {...nisthaAttr("taskbrief", rest)}
        ref={mergeRefs(focus.rowRef, ref)}
        tabIndex={-1}
        className={cx(styles.started, className)}
        aria-label={`Started: ${goal}`}
      >
        <CirclePlay size={16} strokeWidth={ICON_STROKE} className={styles.startedIcon} aria-hidden="true" />
        <span className={styles.startedLabel}>Started</span>
        <span className={styles.startedGoal}>{goal}</span>
        <span className={styles.startedMeta}>{foldSummary(value, currency, locale)}</span>
      </section>
    );
  }

  const goalError = touched.goal && !value.goal.trim() ? "Add a goal so the agent knows what to do." : undefined;
  const criteriaError =
    touched.criteria && filledCriteria(criteria).length === 0 ? "Add at least one check the result must pass." : undefined;

  return (
    <Card
      {...rest}
      {...nisthaAttr("taskbrief", rest)}
      ref={ref}
      title={title}
      className={cx(styles.root, busy && styles.busy, className)}
      aria-busy={busy || undefined}
      onFocusCapture={focus.onFocusCapture}
      onBlurCapture={focus.onBlurCapture}
    >
      <div className={styles.form}>
        <Field label="Goal" htmlFor={ids.goal} hint="What should be true when the agent is done?" error={goalError}>
          <Textarea
            id={ids.goal}
            rows={3}
            required
            aria-required="true"
            disabled={busy}
            value={value.goal}
            placeholder="Update the EU price list for the spring catalogue"
            onChange={(goal) => patch({ goal })}
            onBlur={() => setTouched((t) => ({ ...t, goal: true }))}
          />
        </Field>

        <FieldSet legend="Done when" description={`One line per check, up to ${MAX_CRITERIA}. The agent is done when every check passes.`}>
          <ol className={styles.criteria}>
            {criteria.map((line, index) => (
              <li key={index} className={styles.criterion}>
                <span className={styles.criterionIndex} aria-hidden="true">
                  {index + 1}
                </span>
                <Input
                  id={`${base}-check-${index}`}
                  ariaLabel={`Check ${index + 1}`}
                  size="md"
                  disabled={busy}
                  value={line}
                  error={Boolean(criteriaError)}
                  describedBy={criteriaError ? `${base}-criteria-error` : undefined}
                  placeholder={index === 0 ? "Every SKU in the EU list has a 2027 price" : "Another check"}
                  onChange={(text) => patch({ criteria: criteria.map((c, i) => (i === index ? text : c)) })}
                  onBlur={() => setTouched((t) => ({ ...t, criteria: true }))}
                />
                <Button
                  appearance="ghost"
                  mode="neutral"
                  size="sm"
                  iconStart="X"
                  ariaLabel={`Remove check ${index + 1}`}
                  disabled={busy || (criteria.length === 1 && !line)}
                  onClick={() => patch({ criteria: removeCriterion(criteria, index) })}
                />
              </li>
            ))}
          </ol>
          {criteriaError ? (
            <p id={`${base}-criteria-error`} className={styles.error} role="alert">
              {criteriaError}
            </p>
          ) : null}
          <div>
            <Button
              appearance="ghost"
              mode="neutral"
              size="sm"
              iconStart="Plus"
              disabled={busy || criteria.length >= MAX_CRITERIA}
              onClick={() => patch({ criteria: addCriterion(criteria) })}
            >
              Add check
            </Button>
          </div>
        </FieldSet>

        <FieldSet legend="Limits" description="Optional. The agent stops when it reaches one.">
          <div className={styles.limits}>
            <Field label="Spend cap" htmlFor={ids.spend}>
              <CurrencyInput
                id={ids.spend}
                currency={currency}
                locale={locale}
                min={0}
                disabled={busy}
                placeholder="No cap"
                value={value.spendCap ?? null}
                onChange={(spendCap) => patch({ spendCap })}
              />
            </Field>
            <Field label="Minutes" htmlFor={ids.minutes}>
              <NumberInput
                id={ids.minutes}
                min={1}
                locale={locale}
                disabled={busy}
                placeholder="No limit"
                value={value.minutes ?? null}
                onChange={(minutes) => patch({ minutes })}
              />
            </Field>
            <Field label="Max steps" htmlFor={ids.steps}>
              <NumberInput
                id={ids.steps}
                min={1}
                locale={locale}
                disabled={busy}
                placeholder="No limit"
                value={value.maxSteps ?? null}
                onChange={(maxSteps) => patch({ maxSteps })}
              />
            </Field>
          </div>
        </FieldSet>

        {tools.length > 0 ? (
          <Field label="Tools" htmlFor={ids.tools} hint="The agent can use only these.">
            <MultiSelect
              id={ids.tools}
              options={tools}
              disabled={busy}
              placeholder="Choose tools"
              value={value.tools ?? []}
              onChange={(next) => patch({ tools: next })}
            />
          </Field>
        ) : null}

        {models && models.length > 0 ? (
          <ModelPicker label="Model" models={models} value={value.model} onValueChange={(model) => patch({ model })} />
        ) : null}

        <AutonomyDial
          label="Check-in level"
          size="sm"
          options={autonomyOptions}
          value={value.autonomy ?? autonomyOptions[0]?.id}
          disabled={busy}
          onValueChange={(autonomy) => patch({ autonomy })}
        />

        {status === "error" ? <Alert variant="danger">{errorMessage}</Alert> : null}

        <footer className={styles.footer}>
          {!ready ? (
            <span id={ids.blocker} className={styles.blocker}>
              {blocker}
            </span>
          ) : (
            <span />
          )}
          <span className={styles.actions}>
            {onSaveDraft ? (
              <Button appearance="outline" mode="neutral" disabled={busy} onClick={() => onSaveDraft(value)}>
                Save draft
              </Button>
            ) : null}
            <Button
              appearance="solid"
              mode="primary"
              disabled={!ready && !busy}
              aria-describedby={!ready ? ids.blocker : undefined}
              iconStart={busy ? "LoaderCircle" : undefined}
              className={busy ? styles.starting : undefined}
              onClick={busy || !ready ? undefined : () => onStart?.(value)}
            >
              {busy ? "Starting…" : "Start"}
            </Button>
          </span>
        </footer>
        <span className={styles.srOnly} role="status">
          {busy ? "Starting the task" : ""}
        </span>
      </div>
    </Card>
  );
}

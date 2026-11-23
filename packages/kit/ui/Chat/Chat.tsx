"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, CircleDashed, Database, TriangleAlert } from "lucide-react";
import { Button } from "../Button";
import { DropdownMenu } from "../DropdownMenu";
import { Input } from "../Input";
import { LineChart } from "../LineChart";
import { LinkList } from "../LinkList";
import { ListView } from "../ListView";
import { Scorecard } from "../Scorecard";
import { Skeleton } from "../Skeleton";
import { Spinner } from "../Spinner";
import { Table } from "../Table";
import { Tag } from "../Tag";
import { ThinkingAnimation } from "../ThinkingAnimation";
import type { ChatError, ChatPart, ChatProps, ChatStep, ChatSuggestion } from "./Chat.types";
import { cx } from "../shared/cx";
import styles from "./Chat.module.css";
import { useKitLabels } from "../shared/labels";
import { nisthaAttr } from "../shared/inspect";
import { ICON_STROKE } from "../../lib/icon";

export type {
  ChatContext,
  ChatError,
  ChatMessage,
  ChatMessageRole,
  ChatMessageStatus,
  ChatMenuItem,
  ChatMetric,
  ChatPart,
  ChatProps,
  ChatRadius,
  ChatRecent,
  ChatStep,
  ChatStepStatus,
  ChatSuggestion,
} from "./Chat.types";

/** "0.8s" from milliseconds; undefined when there is no time. */
export function formatStepDuration(ms: number | undefined): string | undefined {
  if (ms === undefined || !Number.isFinite(ms) || ms < 0) return undefined;
  return `${(ms / 1000).toFixed(1)}s`;
}

/** Sum of the step times, or undefined when no step has one. */
export function totalStepDuration(steps: ChatStep[]): string | undefined {
  const timed = steps.filter((step) => step.durationMs !== undefined && Number.isFinite(step.durationMs));
  if (timed.length === 0) return undefined;
  return formatStepDuration(timed.reduce((sum, step) => sum + (step.durationMs ?? 0), 0));
}

function StepList({ steps }: { steps: ChatStep[] }) {
  return (
    <ol className={styles.steps}>
      {steps.map((step, index) => (
        <li
          key={`${step.label}-${index}`}
          className={cx(styles.step, step.status === "active" && styles.stepActive, step.status === "pending" && styles.stepPending)}
          aria-current={step.status === "active" ? "step" : undefined}
        >
          <span className={styles.stepIcon}>
            {step.status === "done" ? (
              <span className={styles.stepDone}>
                <Check size={12} strokeWidth={ICON_STROKE} aria-hidden="true" />
              </span>
            ) : step.status === "active" ? (
              <span aria-hidden="true" className={styles.stepSpinner}>
                <Spinner size="sm" />
              </span>
            ) : (
              <CircleDashed size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
            )}
          </span>
          <span className={styles.stepLabel}>
            {step.label}
            {/* Status in words too, not only the icon. */}
            <span className={styles.visuallyHidden}>{` (${step.status === "done" ? "done" : step.status === "active" ? "in progress" : "waiting"})`}</span>
          </span>
          {formatStepDuration(step.durationMs) ? (
            <span className={styles.stepTime}>{formatStepDuration(step.durationMs)}</span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function StepSummary({ steps }: { steps: ChatStep[] }) {
  const labels = useKitLabels();
  const [open, setOpen] = useState(false);
  const listId = useId();
  return (
    <div className={styles.stepSummary}>
      <Button
        type="button"
        appearance="ghost"
        mode="neutral"
        size="sm"
        iconStart="Check"
        iconEnd={open ? "ChevronDown" : "ChevronRight"}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
      >
        {labels.chatSteps(steps.length, totalStepDuration(steps))}
      </Button>
      <div id={listId} hidden={!open} className={styles.stepPanel}>
        {open ? <StepList steps={steps} /> : null}
      </div>
    </div>
  );
}

function ErrorPart({ error }: { error: ChatError }) {
  const labels = useKitLabels();
  return (
    <div className={styles.error} role="alert">
      <div className={styles.errorHead}>
        <TriangleAlert size={16} strokeWidth={ICON_STROKE} className={styles.errorIcon} aria-hidden="true" />
        <span className={styles.errorTitle}>{error.title}</span>
      </div>
      {error.description ? <p className={styles.errorText}>{error.description}</p> : null}
      {error.onRetry || error.onCopyDetails ? (
        <div className={styles.errorActions}>
          {error.onRetry ? (
            <Button type="button" appearance="soft" mode="primary" size="sm" iconStart="RotateCcw" onClick={error.onRetry}>
              {labels.retry}
            </Button>
          ) : null}
          {error.onCopyDetails ? (
            <Button type="button" appearance="outline" mode="neutral" size="sm" iconStart="Copy" onClick={error.onCopyDetails}>
              {labels.chatCopyDetails}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Part({ part, disabled, onFollowup }: { part: ChatPart; disabled: boolean; onFollowup: (text: string) => void }) {
  switch (part.type) {
    case "metrics":
      return (
        <div className={styles.metrics}>
          {part.items.map((item, index) => (
            <Scorecard
              key={`${item.label}-${index}`}
              size="sm"
              label={item.label}
              value={item.value}
              delta={item.delta}
              trend={item.trend}
            />
          ))}
        </div>
      );
    case "table":
      return (
        <Table
          className={styles.table}
          size="sm"
          columns={part.columns}
          rows={part.rows}
          footer={part.footer}
          caption={part.caption}
        />
      );
    case "chart":
      return (
        <LineChart
          className={styles.chart}
          variant="area"
          title={part.label}
          description={part.range}
          data={part.data}
          height={112}
          showGrid={false}
        />
      );
    case "sources":
      return (
        <p className={styles.sources}>
          <Database size={12} strokeWidth={ICON_STROKE} className={styles.sourcesIcon} aria-hidden="true" />
          {part.label}
        </p>
      );
    case "followups":
      return (
        <div className={styles.followups}>
          {part.items.map((item) => (
            <Button
              key={item}
              type="button"
              appearance="outline"
              mode="neutral"
              size="sm"
              shape="pill"
              iconStart="Sparkles"
              disabled={disabled}
              onClick={() => onFollowup(item)}
            >
              {item}
            </Button>
          ))}
        </div>
      );
    default:
      return null;
  }
}

function isRich(suggestion: string | ChatSuggestion): suggestion is ChatSuggestion {
  return typeof suggestion !== "string";
}

export function Chat({
  title = "Assistant",
  status,
  messages = [],
  suggestions = [],
  context,
  placeholder = "How can we help you?",
  emptyState = "Start a conversation.",
  greeting,
  intro,
  recent,
  recentEmptyLabel,
  isThinking = false,
  thinkingSteps,
  onStop,
  disabled = false,
  value,
  defaultValue = "",
  onValueChange,
  onSend,
  sendAppearance = "solid",
  onClose,
  closeLabel = "Close",
  menuItems = [],
  menuLabel = "More",
  radius = "lg",
  embedded = false,
  className,
  ref,
  ...rest
}: ChatProps) {
  const labels = useKitLabels();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const threadRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const contextId = useId();
  const draft = value ?? internalValue;
  const showStop = isThinking && Boolean(onStop);
  // A streaming answer already shows the work; no second thinking row under it.
  const streamingLast = messages.length > 0 && messages[messages.length - 1].status === "streaming";

  const richSuggestions = suggestions.filter(isRich);
  const plainSuggestions = suggestions.filter((item): item is string => !isRich(item));
  const isEmpty = messages.length === 0 && !isThinking;
  const guided = isEmpty && Boolean(greeting || intro || recent || richSuggestions.length > 0);

  useEffect(() => {
    const thread = threadRef.current;
    if (!thread) return;
    thread.scrollTop = thread.scrollHeight;
  }, [isThinking, messages.length, thinkingSteps?.length]);

  function updateDraft(nextValue: string) {
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  }

  function sendMessage(message = draft) {
    const nextMessage = message.trim();
    if (!nextMessage || disabled) return;
    onSend?.(nextMessage);
    updateDraft("");
  }

  const contextBlock = context ? (
    <div className={cx(styles.context, guided && styles.contextGuided)}>
      <span id={contextId} className={styles.visuallyHidden}>
        {labels.chatContext(context.label)}
      </span>
      <Tag size="sm" removable={Boolean(context.onRemove)} onRemove={() => context.onRemove?.()}>
        {context.label}
      </Tag>
    </div>
  ) : null;

  return (
    <section
      {...rest} {...nisthaAttr("chat", rest)}
      ref={ref}
      className={cx(styles.panel, radius === "none" && styles.radiusNone, embedded && styles.embedded, className)}
      aria-label={title}
    >
      {embedded ? null : (
        <header className={styles.header}>
          <span className={styles.identity}>
            <span className={styles.title}>{title}</span>
            {status ? (
              <span className={styles.status}>
                <span className={styles.statusDot} aria-hidden="true" />
                {status}
              </span>
            ) : null}
          </span>
          <div className={styles.headerActions}>
            {menuItems.length > 0 ? (
              <DropdownMenu
                ariaLabel={menuLabel}
                iconStart="MoreHorizontal"
                appearance="ghost" mode="neutral"
                size="sm"
                align="end"
                groups={[
                  {
                    items: menuItems.map((item, index) => ({
                      id: item.id ?? `${item.label}-${index}`,
                      label: item.label,
                      danger: item.tone === "danger",
                    })),
                  },
                ]}
                onSelect={(id) => {
                  const item = menuItems.find((entry, index) => (entry.id ?? `${entry.label}-${index}`) === id);
                  item?.onSelect?.();
                }}
              />
            ) : null}
            {onClose ? (
              <Button type="button" appearance="ghost" mode="neutral" size="sm" iconStart="X" ariaLabel={closeLabel} onClick={onClose} />
            ) : null}
          </div>
        </header>
      )}

      <div
        ref={threadRef}
        className={cx(styles.thread, guided && styles.threadGuided)}
        role="log"
        aria-label={labels.conversation}
        aria-live="polite"
        aria-busy={isThinking || messages.some((message) => message.status === "streaming")}
      >
        {isEmpty && !guided ? <p className={styles.empty}>{emptyState}</p> : null}
        {guided ? (
          <div className={styles.guided}>
            {greeting || intro ? (
              <div className={styles.greetingBlock}>
                {greeting ? <p className={styles.greeting}>{greeting}</p> : null}
                {intro ? <p className={styles.intro}>{intro}</p> : null}
              </div>
            ) : null}
            {contextBlock}
            {richSuggestions.length > 0 ? (
              <div className={styles.group}>
                <p className={styles.groupLabel} aria-hidden="true">{labels.chatSuggested}</p>
                <LinkList
                  label={labels.suggestedPrompts}
                  items={richSuggestions.map((suggestion, index) => ({
                    id: `${suggestion.label}-${index}`,
                    label: suggestion.label,
                    description: suggestion.hint,
                    icon: suggestion.icon,
                    onClick: () => sendMessage(suggestion.label),
                  }))}
                />
              </div>
            ) : null}
            {recent ? (
              <div className={cx(styles.group, styles.recent)}>
                <p className={styles.groupLabel} aria-hidden="true">{labels.chatRecent}</p>
                {recent.length > 0 ? (
                  <ListView
                    label={labels.chatRecent}
                    size="sm"
                    interaction="drill"
                    truncate="both"
                    items={recent.map((item, index) => ({
                      id: item.id ?? `${item.label}-${index}`,
                      primary: item.label,
                      meta: item.meta,
                      icon: "Clock",
                    }))}
                    onOpen={(id) => {
                      const item = recent.find((entry, index) => (entry.id ?? `${entry.label}-${index}`) === id);
                      item?.onSelect?.();
                    }}
                  />
                ) : recentEmptyLabel ? (
                  <p className={styles.intro}>{recentEmptyLabel}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
        {messages.map((message, index) => {
          const isUser = message.role === "user";
          const streaming = message.status === "streaming";
          return (
            <article
              key={message.id ?? index}
              className={`${styles.message} ${isUser ? styles.messageUser : styles.messageAssistant}`}
              aria-busy={streaming || undefined}
            >
              {isUser ? null : <span className={styles.mark} aria-hidden="true" />}
              <div className={cx(styles.body, !isUser && styles.bodyAssistant)}>
                {!isUser && message.steps && message.steps.length > 0 ? <StepSummary steps={message.steps} /> : null}
                {message.content ? (
                  <p className={cx(styles.copy, isUser && styles.bubble)}>
                    {message.content}
                    {streaming ? <span className={styles.caret} aria-hidden="true" /> : null}
                  </p>
                ) : null}
                {!isUser && message.parts
                  ? message.parts.map((part, partIndex) => (
                      <Part key={`${part.type}-${partIndex}`} part={part} disabled={disabled || isThinking} onFollowup={sendMessage} />
                    ))
                  : null}
                {streaming ? <Skeleton shape="rect" height={80} label="" /> : null}
                {!isUser && message.status === "error" && message.error ? <ErrorPart error={message.error} /> : null}
                {message.timestamp ? <span className={styles.timestamp}>{message.timestamp}</span> : null}
              </div>
            </article>
          );
        })}
        {isThinking && !streamingLast ? (
          <div className={`${styles.message} ${styles.messageAssistant}`}>
            <span className={styles.mark} aria-hidden="true" />
            {thinkingSteps && thinkingSteps.length > 0 ? (
              <div className={cx(styles.body, styles.bodyAssistant)}>
                <div className={styles.stepCard}>
                  <StepList steps={thinkingSteps} />
                </div>
              </div>
            ) : (
              <ThinkingAnimation label="Thinking" size="md" />
            )}
          </div>
        ) : null}
      </div>

      {plainSuggestions.length > 0 ? (
        <div className={styles.suggestions} aria-label={labels.suggestedPrompts}>
          {plainSuggestions.map((suggestion) => (
            <Button
              key={suggestion}
              type="button"
              appearance="ghost" mode="neutral"
              size="sm"
              disabled={disabled}
              onClick={() => sendMessage(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      ) : null}

      {guided ? null : contextBlock}

      <form
        className={styles.composer}
        onSubmit={(event) => {
          event.preventDefault();
          if (showStop) return;
          sendMessage();
        }}
      >
        <Input
          id={inputId}
          value={draft}
          placeholder={showStop ? labels.chatWorking : placeholder}
          ariaLabel={placeholder}
          describedBy={context ? contextId : undefined}
          disabled={disabled || showStop}
          onChange={updateDraft}
        />
        {showStop ? (
          <Button type="button" appearance="outline" mode="neutral" size="md" iconStart="Square" onClick={onStop}>
            {labels.chatStop}
          </Button>
        ) : (
          <Button
            type="submit"
            appearance={sendAppearance}
            mode="primary"
            size="md"
            ariaLabel={labels.send}
            disabled={disabled || !draft.trim()}
            iconStart="Send"
          />
        )}
      </form>
    </section>
  );
}

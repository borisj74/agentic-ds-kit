"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { ShieldAlert } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Alert } from "../Alert";
import { AlertDialog } from "../AlertDialog";
import { Avatar } from "../Avatar";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { CodeSnippet } from "../CodeSnippet";
import { Drawer } from "../Drawer";
import { Empty } from "../Empty";
import { Field } from "../Field";
import { FilterBar } from "../FilterBar";
import { Link } from "../Link";
import { RadioGroup } from "../RadioGroup";
import { Textarea } from "../Textarea";
import { cx } from "../shared/cx";
import { nisthaAttr } from "../shared/inspect";
import { VERDICTS, VERDICT_LABEL, agentNames, filterEvents, ruleNames, summaryLine } from "./guardrailLog.logic";
import type { GuardrailEvent, GuardrailFilters, GuardrailLogProps, GuardrailVerdict } from "./GuardrailLog.types";
import styles from "./GuardrailLog.module.css";

export type {
  GuardrailLogProps,
  GuardrailEvent,
  GuardrailRule,
  GuardrailAgent,
  GuardrailFilters,
  GuardrailVerdict,
  GuardrailOverrideStatus,
} from "./GuardrailLog.types";

const VERDICT_TONE: Record<GuardrailVerdict, "danger" | "warning" | "info"> = { blocked: "danger", rewritten: "warning", flagged: "info" };
const DEFAULT_TIMES = ["Today", "This week", "This month"];
const ANY = "__any";

type FilterKey = keyof GuardrailFilters;

/**
 * Every time a policy rule stepped in on an agent by itself: blocked, rewritten or flagged, what
 * the agent tried, and a way to ask the rule's owner for an override.
 */
export function GuardrailLog({
  events,
  title = "Guardrails",
  filters: filtersProp,
  onFiltersChange,
  timeOptions = DEFAULT_TIMES,
  selectedId: selectedProp,
  onSelect,
  onRequestOverride,
  overrideStatus = "idle",
  compact = false,
  className,
  ref,
  ...rest
}: GuardrailLogProps) {
  const base = useId();
  const titleId = `${base}-title`;
  const [innerFilters, setInnerFilters] = useState<GuardrailFilters>({});
  const [innerSelected, setInnerSelected] = useState<string | null>(null);
  const [openFilter, setOpenFilter] = useState<FilterKey | undefined>();
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);
  const rowRefs = useRef(new Map<string, HTMLButtonElement | null>());
  const filters = filtersProp ?? innerFilters;
  const selectedId = selectedProp === undefined ? innerSelected : selectedProp;
  const selected = events.find((e) => e.id === selectedId) ?? null;
  const shown = filterEvents(events, filters);

  // A new event in the Drawer starts with an empty reason.
  const [shownId, setShownId] = useState(selectedId);
  if (shownId !== selectedId) {
    setShownId(selectedId);
    setReason("");
    setConfirming(false);
  }

  if (compact) {
    const latest = events[0];
    return (
      <section {...rest} {...nisthaAttr("guardraillog", rest)} ref={ref} className={cx(styles.compact, className)} aria-label={title}>
        <ShieldAlert size={16} strokeWidth={ICON_STROKE} className={styles.compactIcon} aria-hidden="true" />
        <span className={styles.compactSummary}>{summaryLine(events, filters.time)}</span>
        {latest ? (
          <span className={styles.compactLatest}>
            <Badge tone={VERDICT_TONE[latest.verdict]} appearance="soft" size="sm">
              {VERDICT_LABEL[latest.verdict]}
            </Badge>
            <span className={styles.compactText}>
              {latest.rule.name} · {latest.agent.name} · {latest.at}
            </span>
          </span>
        ) : null}
      </section>
    );
  }

  function setFilters(next: GuardrailFilters) {
    if (filtersProp === undefined) setInnerFilters(next);
    onFiltersChange?.(next);
  }

  function select(id: string | null) {
    if (selectedProp === undefined) setInnerSelected(id);
    onSelect?.(id);
  }

  function closeDrawer() {
    const id = selectedId;
    select(null);
    if (id && typeof window !== "undefined") window.setTimeout(() => rowRefs.current.get(id)?.focus(), 0);
  }

  function handleRowKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const next = shown[index + (event.key === "ArrowDown" ? 1 : -1)];
    if (next) rowRefs.current.get(next.id)?.focus();
  }

  const options: Record<FilterKey, { label: string; values: { value: string; label: string }[] }> = {
    verdict: { label: "Verdict", values: VERDICTS.map((v) => ({ value: v, label: VERDICT_LABEL[v] })) },
    rule: { label: "Rule", values: ruleNames(events).map((r) => ({ value: r, label: r })) },
    agent: { label: "Agent", values: agentNames(events).map((a) => ({ value: a, label: a })) },
    time: { label: "Time", values: timeOptions.map((t) => ({ value: t, label: t })) },
  };
  const filterKeys: FilterKey[] = ["verdict", "rule", "agent", "time"];
  const valueLabel = (key: FilterKey) =>
    key === "verdict" && filters.verdict ? VERDICT_LABEL[filters.verdict] : (filters[key] as string | undefined);

  return (
    <section
      {...rest}
      {...nisthaAttr("guardraillog", rest)}
      ref={ref}
      className={cx(styles.root, className)}
      aria-labelledby={titleId}
    >
      <header className={styles.header}>
        <ShieldAlert size={16} strokeWidth={ICON_STROKE} className={styles.titleIcon} aria-hidden="true" />
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <span className={styles.summary}>{summaryLine(shown, filters.time)}</span>
      </header>

      <FilterBar
        size="sm"
        ariaLabel="Filter rule events"
        filters={filterKeys.map((key) => ({ id: key, label: options[key].label, value: valueLabel(key) }))}
        openId={openFilter}
        onFilterClick={(id) => setOpenFilter((current) => (current === id ? undefined : (id as FilterKey)))}
        onClear={() => {
          setFilters({});
          setOpenFilter(undefined);
        }}
      />
      {openFilter ? (
        <RadioGroup
          className={styles.picker}
          name={`${base}-${openFilter}`}
          legend={options[openFilter].label}
          size="sm"
          orientation="horizontal"
          options={[{ value: ANY, label: "Any" }, ...options[openFilter].values]}
          value={(filters[openFilter] as string | undefined) ?? ANY}
          onChange={(value) => {
            setFilters({ ...filters, [openFilter]: value === ANY ? undefined : value });
            setOpenFilter(undefined);
          }}
        />
      ) : null}

      {shown.length === 0 ? (
        <Empty icon={ShieldAlert} title="No rule has fired in this window" description="Try another time window or clear the filters." />
      ) : (
        <ul className={styles.list} aria-label="Rule events, newest first">
          {shown.map((event, index) => (
            <li key={event.id}>
              <button
                type="button"
                ref={(node) => {
                  rowRefs.current.set(event.id, node);
                }}
                className={cx(styles.row, event.id === selectedId && styles.selected)}
                aria-current={event.id === selectedId ? "true" : undefined}
                aria-haspopup="dialog"
                onClick={() => select(event.id)}
                onKeyDown={(e) => handleRowKey(e, index)}
              >
                <Badge tone={VERDICT_TONE[event.verdict]} appearance="soft" size="sm" className={styles.verdict}>
                  {VERDICT_LABEL[event.verdict]}
                </Badge>
                <span className={styles.rowMain}>
                  <span className={styles.rule}>{event.rule.name}</span>
                  <span className={styles.attempt}>{event.attempted}</span>
                </span>
                <span className={styles.who}>
                  <Avatar name={event.agent.name} src={event.agent.src} size="sm" />
                  <span className={styles.agent}>{event.agent.name}</span>
                </span>
                <span className={styles.at}>{event.at}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Drawer
        open={Boolean(selected)}
        title={selected?.rule.name ?? "Rule event"}
        description={selected ? `${VERDICT_LABEL[selected.verdict]} · ${selected.agent.name} · ${selected.at}` : undefined}
        size="md"
        onClose={closeDrawer}
        footer={
          selected && onRequestOverride && overrideStatus !== "sent" ? (
            <Button
              appearance="solid"
              mode="primary"
              disabled={!reason.trim() || overrideStatus === "sending"}
              iconStart={overrideStatus === "sending" ? "LoaderCircle" : undefined}
              className={overrideStatus === "sending" ? styles.sending : undefined}
              onClick={() => setConfirming(true)}
            >
              {overrideStatus === "sending" ? "Sending…" : "Submit request"}
            </Button>
          ) : undefined
        }
      >
        {selected ? <EventDetail event={selected} /> : null}
        {selected && onRequestOverride ? (
          <section className={styles.override} aria-labelledby={`${base}-override`}>
            <h3 id={`${base}-override`} className={styles.sectionTitle}>
              Request override
            </h3>
            {overrideStatus === "sent" ? (
              <Alert variant="success">{`Request sent to ${selected.rule.owner}. You'll hear back in the run.`}</Alert>
            ) : (
              <>
                <Field
                  label="Why should this run anyway?"
                  htmlFor={`${base}-reason`}
                  hint={`${selected.rule.owner} reviews the request.`}
                >
                  <Textarea
                    id={`${base}-reason`}
                    rows={3}
                    value={reason}
                    disabled={overrideStatus === "sending"}
                    onChange={setReason}
                    placeholder="Customer has a signed exception for this refund."
                  />
                </Field>
                {overrideStatus === "error" ? <Alert variant="danger">{"Couldn't send the request. Your reason is kept; try again."}</Alert> : null}
              </>
            )}
          </section>
        ) : null}
      </Drawer>

      <AlertDialog
        open={confirming && Boolean(selected)}
        title="Send override request?"
        description={
          selected
            ? `${selected.rule.owner} will be asked to let "${selected.rule.name}" allow this ${selected.verdict === "flagged" ? "action" : "run"} once.`
            : ""
        }
        actionLabel="Send request"
        onCancel={() => setConfirming(false)}
        onAction={() => {
          setConfirming(false);
          if (selected) onRequestOverride?.(selected.id, reason.trim());
        }}
      />
    </section>
  );
}

function EventDetail({ event }: { event: GuardrailEvent }) {
  return (
    <div className={styles.detail}>
      <section className={styles.detailSection}>
        <h3 className={styles.sectionTitle}>What the agent tried</h3>
        <CodeSnippet code={event.attempted} title={event.agent.name} wrap />
      </section>
      {event.verdict === "rewritten" && event.sentInstead ? (
        <section className={styles.detailSection}>
          <h3 className={styles.sectionTitle}>What ran instead</h3>
          <CodeSnippet code={event.sentInstead} title="After the rule" wrap />
        </section>
      ) : null}
      <section className={styles.detailSection}>
        <h3 className={styles.sectionTitle}>The rule</h3>
        <p className={styles.ruleText}>{event.rule.text}</p>
        <p className={styles.owner}>Owner: {event.rule.owner}</p>
      </section>
      {event.runHref ? (
        <Link href={event.runHref} variant="standalone">
          Open the run
        </Link>
      ) : null}
    </div>
  );
}

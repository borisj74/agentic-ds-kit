"use client";

import { Fragment, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { ActivityFeed, type ActivityAgentEvent } from "../../ui/ActivityFeed";
import { Alert } from "../../ui/Alert";
import { AppHeader } from "../../ui/AppHeader";
import { Avatar } from "../../ui/Avatar";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Checkbox } from "../../ui/Checkbox";
import { Drawer } from "../../ui/Drawer";
import { Empty } from "../../ui/Empty";
import { FilterBar } from "../../ui/FilterBar";
import { IconButton } from "../../ui/IconButton";
import { PageHeader } from "../../ui/PageHeader";
import { SideNav } from "../../ui/SideNav";
import { Toast } from "../../ui/Toast";
import { AGENTS, ALLOWED_BY, APPS, ERROR, NAV_GROUPS, NOW, PAGE, STEPS, TIME_ZONE, UNDONE, type Step } from "./agent-activity-data";
import "./AgentActivityPattern.css";

export type AgentActivityView = "default" | "empty" | "error" | "undone";

export interface AgentActivityPatternProps {
  /** Which demo state to start in. Default "default". */
  view?: AgentActivityView;
  onAsk?: () => void;
  /** Fill the viewport height (layout-shell--viewport). Default true; turn it off inside a framed preview. */
  viewport?: boolean;
}

/*
 * Narrow = below --grid-breakpoint-sm (640), read at runtime. Below it the AppHeader's end slot holds a
 * Menu IconButton that opens the app's nav in a Drawer, and the feed folds its time column and end
 * column into the copy. 40rem is the fallback.
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

const noop = () => {};

type FilterId = "agent" | "allowed" | "app";
interface Filters {
  agent: string[];
  allowed: string[];
  app: string[];
}

const START: Record<AgentActivityView, Filters> = {
  default: { agent: ["collections", "invoicing"], allowed: [], app: [] },
  undone: { agent: ["collections", "invoicing"], allowed: [], app: [] },
  error: { agent: ["collections", "invoicing"], allowed: [], app: [] },
  empty: { agent: ["reconciliation"], allowed: [], app: [] },
};

const NONE: Filters = { agent: [], allowed: [], app: [] };

const OPTIONS: Record<FilterId, { label: string; options: { id: string; label: string }[] }> = {
  agent: { label: "Agent", options: AGENTS.map((agent) => ({ id: agent.id, label: agent.name })) },
  allowed: { label: "Allowed by", options: ALLOWED_BY.map((word) => ({ id: word, label: word })) },
  app: { label: "App", options: APPS.map((app) => ({ id: app, label: app })) },
};

const agentOf = (id: string) => AGENTS.find((agent) => agent.id === id);

function matches(step: Step, filters: Filters): boolean {
  if (filters.agent.length && !filters.agent.includes(step.agent)) return false;
  if (filters.allowed.length && !filters.allowed.includes(step.allowedBy)) return false;
  if (filters.app.length && !filters.app.includes(step.app)) return false;
  return true;
}

const dayOf = (time: number) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(time);

/** Invoice numbers read in Geist Mono inside the sentence. */
function withIds(text: string): ReactNode {
  return text.split(/(INV-\d+)/).map((part, index) =>
    index % 2 ? (
      <span key={index} className="agent-activity-pattern__id">
        {part}
      </span>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

/**
 * Agent activity page: AppHeader, a PageHeader with Ask, a FilterBar (Agent, Allowed by, App) with the
 * step count, then one Card holding the kit ActivityFeed (variant="agent"): day groups on the rail, Undo
 * with its deadline, Undone and Final steps, and Load earlier days. Undo strikes the step and a Toast
 * confirms it.
 */
export function AgentActivityPattern({ view = "default", onAsk = noop, viewport = true }: AgentActivityPatternProps) {
  const narrow = useNarrow();
  const [filters, setFilters] = useState<Filters>(START[view]);
  const [openId, setOpenId] = useState<string | undefined>();
  const [undone, setUndone] = useState<Set<string>>(() => new Set(view === "undone" ? ["s1"] : []));
  const [toast, setToast] = useState(view === "undone");
  const [allDays, setAllDays] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [failed, setFailed] = useState(view === "error");

  const matching = useMemo(() => STEPS.filter((step) => matches(step, filters)), [filters]);
  // The first page is the two newest days with a matching step; Load earlier days brings the rest.
  const firstDays = useMemo(() => [...new Set(matching.map((step) => dayOf(step.at)))].slice(0, 2), [matching]);
  const loaded = allDays ? matching : matching.filter((step) => firstDays.includes(dayOf(step.at)));

  const events: ActivityAgentEvent[] = loaded.map((step) => {
    const agent = agentOf(step.agent);
    const wasUndone = undone.has(step.id);
    const state = wasUndone ? "undone" : step.state;
    const note = wasUndone ? UNDONE.note : step.note;
    const noteShort = wasUndone ? UNDONE.noteShort : step.noteShort;
    const meta = [agent?.name, step.app, narrow && step.shortMeta ? null : step.task, step.allowedBy].filter(Boolean).join(" · ");
    return {
      id: step.id,
      at: step.at,
      actor: { id: step.agent, name: agent?.name ?? step.agent, initials: agent?.initials },
      sentence: withIds(step.sentence),
      meta,
      reason: wasUndone ? undefined : step.reason,
      state,
      note: narrow ? (noteShort ?? note) : note,
      undo:
        step.undoUntil && !wasUndone
          ? {
              until: step.undoUntil,
              onUndo: () => {
                setUndone((current) => new Set(current).add(step.id));
                setToast(true);
              },
            }
          : undefined,
    };
  });

  const undoable = STEPS.filter((step) => step.undoUntil && step.undoUntil > NOW && !undone.has(step.id)).length;
  const subtitle = undoable
    ? `${undoable === 1 ? "1 step" : `${undoable} steps`} can still be undone`
    : "Nothing left to undo";

  function toggle(id: FilterId, value: string) {
    setFilters((current) => {
      const list = current[id];
      return { ...current, [id]: list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value] };
    });
    setAllDays(false);
  }

  function clear() {
    setFilters(NONE);
    setAllDays(false);
  }

  const chips = (Object.keys(OPTIONS) as FilterId[]).map((id) => {
    const picked = filters[id];
    const names = picked.map((value) => (id === "agent" ? (agentOf(value)?.short ?? value) : value));
    // Wide, the chip names what's picked; narrow, more than one pick shows as a count.
    const many = picked.length > 1 && narrow;
    return { id, label: OPTIONS[id].label, value: picked.length && !many ? names.join(", ") : undefined, count: many ? picked.length : undefined };
  });

  const ask = (
    <Button size="sm" appearance="outline" mode="neutral" iconStart="MessageCircle" onClick={onAsk}>
      Ask
    </Button>
  );

  const onlyAgent = filters.agent.length === 1 ? agentOf(filters.agent[0]) : undefined;

  let content: ReactNode;
  if (failed) {
    content = (
      <Alert variant="danger" title={ERROR.title} action={{ label: "Retry", appearance: "outline", onClick: () => setFailed(false) }}>
        {ERROR.body}
      </Alert>
    );
  } else if (!matching.length) {
    content = (
      <Empty
        outlined
        icon="Filter"
        title={onlyAgent ? `No ${onlyAgent.short} steps this week` : "No steps match these filters"}
        description={onlyAgent?.lastStep}
        actions={
          <Button size="sm" appearance="outline" mode="neutral" onClick={clear}>
            Clear filters
          </Button>
        }
      />
    );
  } else {
    content = (
      <Card className="agent-activity-pattern__card">
        <ActivityFeed
          variant="agent"
          title={PAGE.title}
          description={`${matching.length} of ${STEPS.length} steps`}
          events={events}
          now={NOW}
          timeZone={TIME_ZONE}
          hasMore={!allDays && loaded.length < matching.length}
          onLoadMore={() => setAllDays(true)}
        />
      </Card>
    );
  }

  return (
    <div className={["layout-shell agent-activity-pattern", viewport ? "layout-shell--viewport" : ""].filter(Boolean).join(" ")}>
      <AppHeader
        title={PAGE.product}
        radius="none"
        search={false}
        actions={narrow ? undefined : <Avatar name={PAGE.account.name} initials={PAGE.account.initials} size="sm" />}
        end={
          narrow ? (
            <IconButton icon="Menu" ariaLabel="Open navigation" size="md" appearance="ghost" mode="neutral" onClick={() => setNavOpen(true)} />
          ) : undefined
        }
      />
      {narrow ? (
        <Drawer open={navOpen} side="left" title={PAGE.product} onClose={() => setNavOpen(false)}>
          <SideNav title={PAGE.product} showHeader={false} radius="md" groups={NAV_GROUPS.map((group) => ({ ...group, items: [...group.items] }))} />
        </Drawer>
      ) : null}
      <main className="layout-content agent-activity-pattern__content">
        <PageHeader title={PAGE.title} subtitle={narrow ? subtitle : `Newest first. ${subtitle}.`} actions={ask} />
        <div className="agent-activity-pattern__filters">
          <FilterBar
            ariaLabel="Filter steps"
            filters={chips}
            maxVisible={narrow ? 2 : undefined}
            openId={openId}
            onFilterClick={(id) => setOpenId((current) => (current === id ? undefined : id))}
            renderOptions={(id) => (
              <div className="agent-activity-pattern__options" role="group" aria-label={OPTIONS[id as FilterId].label}>
                {OPTIONS[id as FilterId].options.map((option) => (
                  <Checkbox
                    key={option.id}
                    id={`agent-activity-${id}-${option.id}`}
                    size="sm"
                    label={option.label}
                    checked={filters[id as FilterId].includes(option.id)}
                    onChange={() => toggle(id as FilterId, option.id)}
                  />
                ))}
              </div>
            )}
            onClear={narrow ? undefined : clear}
          />
          {narrow || failed ? null : (
            <p className="agent-activity-pattern__count" role="status">
              {matching.length} of {STEPS.length} steps
            </p>
          )}
        </div>
        {content}
      </main>
      <Toast open={toast} onClose={() => setToast(false)} status="success" size="sm" title={UNDONE.toast} />
    </div>
  );
}

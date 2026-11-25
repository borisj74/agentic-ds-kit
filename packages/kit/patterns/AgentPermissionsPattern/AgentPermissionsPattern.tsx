"use client";

import { useId, useState, useSyncExternalStore } from "react";
import { Hand, Lock, Play, type LucideIcon } from "lucide-react";
import { AppHeader } from "../../ui/AppHeader";
import { AutonomyDial } from "../../ui/AutonomyDial";
import { Avatar } from "../../ui/Avatar";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { CurrencyInput } from "../../ui/CurrencyInput";
import { Drawer } from "../../ui/Drawer";
import { Field } from "../../ui/Field";
import { IconButton } from "../../ui/IconButton";
import { ListView } from "../../ui/ListView";
import { PageHeader } from "../../ui/PageHeader";
import { PermissionRequest } from "../../ui/PermissionRequest";
import { RadioGroup } from "../../ui/RadioGroup";
import { SideNav } from "../../ui/SideNav";
import { Switch } from "../../ui/Switch";
import { Table } from "../../ui/Table";
import type { TableColumn } from "../../ui/Table";
import {
  ACTIONS,
  DEFAULT_COPY,
  DEFAULT_LEVELS,
  EDIT_COPY,
  PERMISSIONS_NAV,
  PERMISSIONS_PAGE,
  REQUEST,
  SWITCH_COPY,
  editOptions,
  levelWord,
  type AgentAction,
  type AgentActionLevel,
  type AgentPermissionsRequestState,
} from "./agent-permissions-data";
import "./AgentPermissionsPattern.css";

export interface AgentPermissionsPatternProps {
  /** Where the pending request starts. Default "pending". */
  request?: AgentPermissionsRequestState;
  /** Open the Edit Drawer for this action id on first render (a demo view). */
  defaultEditing?: string;
  onAsk?: () => void;
  /** Grant the request. Return a promise that rejects to show the error row. Default: grants at once. */
  onGrant?: () => void | Promise<void>;
  onDeny?: () => void;
  /** A new level was saved for an action. */
  onSaveLevel?: (actionId: string, level: AgentActionLevel, limit?: number) => void;
  /** Fill the viewport height (layout-shell--viewport). Default true; turn it off inside a framed preview. */
  viewport?: boolean;
}

/*
 * Narrow = below --grid-breakpoint-sm (640), read at runtime. Below it AppHeader's end slot holds the
 * Menu button (nav in a Drawer), the Table becomes a ListView and Edit opens from the bottom. 40rem is the fallback.
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
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(narrowQuery()).matches,
    () => false,
  );
}

const noop = () => {};

const LEVEL_ICON: Record<AgentActionLevel, LucideIcon> = {
  run: Play,
  limit: Play,
  ask: Hand,
  never: Lock,
};

/** The level as an icon and a word, so it never rests on the icon alone. */
function LevelCell({ action, requested }: { action: AgentAction; requested?: string }) {
  const Icon = LEVEL_ICON[action.level];
  return (
    <span className="agent-permissions-pattern__level">
      <Icon className="agent-permissions-pattern__level-icon" size={16} aria-hidden="true" />
      <span className="agent-permissions-pattern__two-line">
        <span>{levelWord(action)}</span>
        {requested ? <span className="agent-permissions-pattern__requested">{requested}</span> : null}
      </span>
    </span>
  );
}

const COLUMNS: TableColumn[] = [
  { key: "action", header: "Action" },
  { key: "level", header: "Level" },
  { key: "lastUsed", header: "Last used" },
  { key: "edit", header: "", align: "end" },
];

/**
 * Agent permissions page: AppHeader, a PageHeader with Ask, the pending PermissionRequest first, then
 * "What agents may do" (a Table, a ListView below 640), a Switch that stops every agent acting on
 * its own, and an AutonomyDial for the default level of new actions. Edit opens a Drawer with the
 * level as a RadioGroup and a CurrencyInput for an amount.
 */
export function AgentPermissionsPattern({
  request: initialRequest = "pending",
  defaultEditing,
  onAsk = noop,
  onGrant,
  onDeny = noop,
  onSaveLevel = noop,
  viewport = true,
}: AgentPermissionsPatternProps) {
  const narrow = useNarrow();
  const uid = useId();
  const [request, setRequest] = useState<AgentPermissionsRequestState | "granting">(initialRequest);
  const [actions, setActions] = useState<AgentAction[]>(() =>
    initialRequest === "granted"
      ? ACTIONS.map((action) => (action.id === REQUEST.actionId ? { ...action, limit: REQUEST.limit } : action))
      : ACTIONS,
  );
  const [navOpen, setNavOpen] = useState(false);
  const [autonomy, setAutonomy] = useState(true);
  const [defaultLevel, setDefaultLevel] = useState("ask");
  const [editingId, setEditingId] = useState<string | null>(defaultEditing ?? null);
  const [draftLevel, setDraftLevel] = useState<string>(() => ACTIONS.find((a) => a.id === defaultEditing)?.level ?? "ask");
  const [draftLimit, setDraftLimit] = useState<number | null>(() => ACTIONS.find((a) => a.id === defaultEditing)?.limit ?? null);

  const editing = actions.find((action) => action.id === editingId) ?? null;
  const waiting = request === "pending" || request === "error" || request === "granting";
  const requestedFor = (action: AgentAction) => (waiting && action.id === REQUEST.actionId ? action : null);

  function grantLimit() {
    setActions((list) =>
      list.map((action) => (action.id === REQUEST.actionId ? { ...action, level: "limit", limit: REQUEST.limit } : action)),
    );
  }

  async function grant() {
    setRequest("granting");
    try {
      await onGrant?.();
      grantLimit();
      setRequest("granted");
    } catch {
      setRequest("error");
    }
  }

  function deny() {
    onDeny();
    setRequest("denied");
  }

  function openEdit(id: string) {
    const action = actions.find((item) => item.id === id);
    if (!action || action.locked) return;
    setDraftLevel(action.level);
    setDraftLimit(action.limit ?? null);
    setEditingId(id);
  }

  function save() {
    if (!editing) return;
    const level = draftLevel as AgentActionLevel;
    const limit = level === "limit" ? (draftLimit ?? editing.limit ?? 0) : editing.limit;
    setActions((list) => list.map((action) => (action.id === editing.id ? { ...action, level, limit } : action)));
    onSaveLevel(editing.id, level, level === "limit" ? limit : undefined);
    setEditingId(null);
  }

  const listItem = (action: AgentAction) => ({
    id: action.id,
    primary: action.name,
    secondary: action.locked ? PERMISSIONS_PAGE.lockedShort : requestedFor(action) ? REQUEST.requestedSecondary : action.agent,
    note: requestedFor(action) ? REQUEST.requestedNote : undefined,
    noteTone: "warning" as const,
    value: levelWord(action),
    valueIcon: LEVEL_ICON[action.level],
  });

  const ask = (
    <Button size="sm" appearance="outline" mode="neutral" iconStart="MessageCircle" onClick={onAsk}>
      Ask
    </Button>
  );

  const subtitle = narrow
    ? waiting
      ? PERMISSIONS_PAGE.waiting
      : PERMISSIONS_PAGE.noneWaiting
    : `${PERMISSIONS_PAGE.purpose} · ${waiting ? PERMISSIONS_PAGE.waiting : PERMISSIONS_PAGE.noneWaiting}`;

  const agents = new Set(actions.map((action) => action.agent)).size;
  const count = `${actions.length} actions · ${agents} agents`;
  const switchTitleId = `${uid}-switch`;
  const tableTitleId = `${uid}-table`;

  return (
    <div className={["layout-shell agent-permissions-pattern", viewport ? "layout-shell--viewport" : ""].filter(Boolean).join(" ")}>
      <AppHeader
        className="agent-permissions-pattern__header"
        title={PERMISSIONS_PAGE.product}
        radius="none"
        search={false}
        actions={<Avatar name={PERMISSIONS_PAGE.account.name} initials={PERMISSIONS_PAGE.account.initials} size="sm" />}
        end={
          narrow ? (
            <IconButton
              icon="Menu"
              ariaLabel="Open navigation"
              size="md"
              appearance="ghost"
              mode="neutral"
              onClick={() => setNavOpen(true)}
            />
          ) : undefined
        }
      />
      {narrow ? (
        <Drawer open={navOpen} onClose={() => setNavOpen(false)} side="left" title={PERMISSIONS_PAGE.product}>
          <SideNav title={PERMISSIONS_PAGE.product} showHeader={false} radius="md" groups={PERMISSIONS_NAV} />
        </Drawer>
      ) : null}
      <main className="layout-content agent-permissions-pattern__content">
        <PageHeader title={PERMISSIONS_PAGE.title} subtitle={subtitle} actions={ask} />

        <PermissionRequest
          title={REQUEST.title}
          description={REQUEST.description}
          scopes={REQUEST.scopes}
          warning={REQUEST.warning}
          badge={REQUEST.badge}
          summary={narrow ? REQUEST.summaryShort : REQUEST.summary}
          requestedAt={narrow ? REQUEST.requestedAtShort : REQUEST.requestedAt}
          status={request}
          errorMessage={REQUEST.errorMessage}
          resolvedNote={request === "granted" || request === "denied" ? REQUEST.resolvedAt : undefined}
          onGrant={grant}
          onDeny={deny}
          onRetry={grant}
        />

        {narrow ? (
          <Card title={PERMISSIONS_PAGE.tableTitle} size="sm" flush headingLevel={2}>
            <div className="agent-permissions-pattern__lists">
              <ListView
                label={PERMISSIONS_PAGE.tableTitle}
                size="lg"
                flush
                interaction="drill"
                onOpen={openEdit}
                items={actions.filter((action) => !action.locked).map(listItem)}
              />
              {/* Set by workspace policy: the same row without a chevron, since it can't be opened. */}
              {actions.some((action) => action.locked) ? (
                <ListView
                  label={PERMISSIONS_PAGE.lockedShort}
                  size="lg"
                  flush
                  items={actions.filter((action) => action.locked).map(listItem)}
                />
              ) : null}
            </div>
          </Card>
        ) : (
          <Card size="sm" flush>
            {/* Card's meta sits on a row above its title; the board has the count on the title row. */}
            <div className="agent-permissions-pattern__table-head">
              <h2 id={tableTitleId} className="agent-permissions-pattern__strong">
                {PERMISSIONS_PAGE.tableTitle}
              </h2>
              <span className="agent-permissions-pattern__caption">{count}</span>
            </div>
            <Table
              aria-label={PERMISSIONS_PAGE.tableTitle}
              columns={COLUMNS}
              rows={actions.map((action) => ({
                id: action.id,
                action: (
                  <span className="agent-permissions-pattern__two-line agent-permissions-pattern__cell">
                    <span id={`${uid}-${action.id}-name`} className="agent-permissions-pattern__strong">
                      {action.name}
                    </span>
                    <span className="agent-permissions-pattern__caption">
                      {action.agent} · {action.condition}
                    </span>
                  </span>
                ),
                level: <LevelCell action={action} requested={requestedFor(action) ? REQUEST.requested : undefined} />,
                lastUsed: action.lastUsed,
                edit: action.locked ? null : (
                  <Button
                    size="sm"
                    appearance="ghost"
                    mode="neutral"
                    aria-describedby={`${uid}-${action.id}-name`}
                    onClick={() => openEdit(action.id)}
                  >
                    Edit
                  </Button>
                ),
              }))}
            />
          </Card>
        )}

        {/* Below 640 the switch stands alone; the default for new actions is a wide-screen setting. */}
        <div className={narrow ? "agent-permissions-pattern__controls" : "layout-split--secondary agent-permissions-pattern__controls"}>
          <Card size="sm">
            <div className="agent-permissions-pattern__switch-row">
              <h2 id={switchTitleId} className="agent-permissions-pattern__strong">
                {SWITCH_COPY.title}
              </h2>
              <span className="agent-permissions-pattern__switch">
                <span className="agent-permissions-pattern__caption" aria-hidden="true">
                  {autonomy ? SWITCH_COPY.on : SWITCH_COPY.off}
                </span>
                <Switch ariaLabel={SWITCH_COPY.title} checked={autonomy} onChange={setAutonomy} />
              </span>
            </div>
            <p className="agent-permissions-pattern__hint">{narrow ? SWITCH_COPY.hintShort : SWITCH_COPY.hint}</p>
          </Card>
          {narrow ? null : (
            <AutonomyDial
              label={DEFAULT_COPY.label}
              appliesTo={DEFAULT_COPY.appliesTo}
              options={DEFAULT_LEVELS}
              value={defaultLevel}
              defaultValue="ask"
              onValueChange={setDefaultLevel}
            />
          )}
        </div>
      </main>

      <Drawer
        open={editing !== null}
        onClose={() => setEditingId(null)}
        side={narrow ? "bottom" : "right"}
        title={editing?.name ?? ""}
        description={editing?.agent}
        footer={
          <>
            <Button
              appearance="outline"
              mode="neutral"
              size={narrow ? "lg" : "sm"}
              shape={narrow ? "pill" : undefined}
              block={narrow || undefined}
              onClick={() => setEditingId(null)}
            >
              {EDIT_COPY.cancel}
            </Button>
            <Button
              appearance="solid"
              mode="primary"
              size={narrow ? "lg" : "sm"}
              shape={narrow ? "pill" : undefined}
              block={narrow || undefined}
              onClick={save}
            >
              {EDIT_COPY.save}
            </Button>
          </>
        }
      >
        {editing ? (
          <div className="agent-permissions-pattern__edit">
            <RadioGroup
              name={`${uid}-level`}
              legend={EDIT_COPY.legend}
              layout="card"
              options={editOptions(editing)}
              value={draftLevel}
              onChange={setDraftLevel}
            />
            {draftLevel === "limit" ? (
              <Field label={EDIT_COPY.amountLabel} htmlFor={`${uid}-limit`}>
                <CurrencyInput id={`${uid}-limit`} value={draftLimit} onChange={setDraftLimit} min={0} steppers={false} />
              </Field>
            ) : null}
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

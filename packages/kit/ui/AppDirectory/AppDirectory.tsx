"use client";

import { useId, useState } from "react";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Drawer } from "../Drawer";
import { Empty } from "../Empty";
import { FilterButton } from "../FilterButton";
import { IntegrationPicker } from "../IntegrationPicker";
import { LucideByName } from "../Button/lucideName";
import { cx } from "../shared/cx";
import { connectedSummary, directoryHandlers, drawerState, visibleApps } from "./appDirectory.logic";
import type { AppDirectoryProps } from "./AppDirectory.types";
import styles from "./AppDirectory.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { AppDirectoryProps, AppDirectoryApp } from "./AppDirectory.types";

/**
 * Block: browse, search and connect apps. A Connected chip and the IntegrationPicker catalogue
 * (search, categories, one tile per app); a tile's Connect or Manage opens a Drawer with the app's
 * detail, what it can access, and Connect or Disconnect.
 */
export function AppDirectory(props: AppDirectoryProps) {
  const {
    apps,
    title = "Apps",
    note,
    categories,
    category,
    onCategoryChange,
    connectedOnly: connectedOnlyProp,
    defaultConnectedOnly = false,
    onConnectedOnlyChange,
    selectedId: selectedProp,
    defaultSelectedId = null,
    onSelectedChange,
    onConnect,
    onDisconnect,
    connectingId,
    onRequest,
    loading,
    error,
    onRetry,
    className,
    ref,
    ...rest
  } = props;
  const titleId = useId();
  const leadId = useId();
  const [innerConnectedOnly, setInnerConnectedOnly] = useState(defaultConnectedOnly);
  const [innerSelected, setInnerSelected] = useState<string | null>(defaultSelectedId);
  const connectedOnly = connectedOnlyProp ?? innerConnectedOnly;
  const selectedId = selectedProp === undefined ? innerSelected : selectedProp;

  function setConnectedOnly(next: boolean) {
    if (connectedOnlyProp === undefined) setInnerConnectedOnly(next);
    onConnectedOnlyChange?.(next);
  }
  function select(id: string | null) {
    if (selectedProp === undefined) setInnerSelected(id);
    onSelectedChange?.(id);
  }

  const handlers = directoryHandlers({ select, onConnect, onDisconnect });
  const shown = visibleApps(apps, connectedOnly);
  const selected = selectedId ? apps.find((app) => app.id === selectedId) : undefined;
  const state = selected ? drawerState(selected, connectingId) : undefined;

  return (
    <section {...rest} {...nisthaAttr("appdirectory", rest)} ref={ref} className={cx(styles.root, className)} aria-labelledby={titleId}>
      <header className={styles.head}>
        <div className={styles.heading}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <p id={leadId} className={styles.lead}>
            {connectedSummary(apps)}
          </p>
        </div>
        {apps.length ? (
          <FilterButton
            size="sm"
            hasDropdown={false}
            toggle={connectedOnly ? "on" : undefined}
            onToggle={() => setConnectedOnly(!connectedOnly)}
            aria-describedby={leadId}
          >
            Connected
          </FilterButton>
        ) : null}
      </header>

      {!apps.length && !loading && !error ? (
        <Empty
          outlined
          icon="Blocks"
          title="No apps yet"
          description="Apps your workspace can connect to show here."
          actions={
            onRequest ? (
              <Button size="md" appearance="outline" mode="neutral" onClick={onRequest}>
                Request an integration
              </Button>
            ) : undefined
          }
        />
      ) : connectedOnly && !shown.length && !loading && !error ? (
        <Empty
          outlined
          icon="Unplug"
          title="Nothing connected yet"
          description="Connect an app and it shows here."
          actions={
            <Button size="md" appearance="outline" mode="neutral" onClick={() => setConnectedOnly(false)}>
              Show all apps
            </Button>
          }
        />
      ) : (
        <IntegrationPicker
          title={connectedOnly ? "Connected apps" : "All apps"}
          note={note}
          items={shown}
          categories={categories}
          category={category}
          onCategoryChange={onCategoryChange}
          onConnect={handlers.onTileConnect}
          onManage={handlers.onTileManage}
          // The open drawer owns the Connecting… state, so the view keeps one solid primary.
          connectingId={selected ? undefined : connectingId}
          onRequest={onRequest}
          loading={loading}
          error={error}
          onRetry={onRetry}
        />
      )}

      <Drawer
        open={Boolean(selected)}
        title={selected?.name ?? title}
        description={selected ? [selected.category, selected.publisher].filter(Boolean).join(" · ") || undefined : undefined}
        onClose={handlers.onDrawerClose}
        footer={
          selected && state ? (
            <>
              {state.action === "disconnect" ? (
                <Button appearance="outline" mode="danger" onClick={() => handlers.onDrawerDisconnect(selected.id)}>
                  Disconnect
                </Button>
              ) : state.action === "connect" || state.action === "connecting" ? (
                <Button
                  appearance="solid"
                  mode="primary"
                  disabled={state.action === "connecting"}
                  iconStart={state.action === "connecting" ? "LoaderCircle" : undefined}
                  onClick={() => handlers.onDrawerConnect(selected.id)}
                >
                  {state.action === "connecting" ? "Connecting…" : `Connect ${selected.name}`}
                </Button>
              ) : null}
              <Button appearance="outline" mode="neutral" onClick={handlers.onDrawerClose}>
                Close
              </Button>
            </>
          ) : undefined
        }
      >
        {selected && state ? (
          <div className={styles.detail}>
            <div className={styles.identity}>
              <span className={styles.logo} aria-hidden="true">
                <LucideByName name={selected.icon ?? "Plug"} size={20} />
              </span>
              <Badge tone={state.tone} size="sm" appearance="soft">
                {state.label}
              </Badge>
            </div>
            <p className={styles.about}>{selected.about ?? selected.description}</p>
            {selected.connectedNote && selected.status === "connected" ? (
              <p className={styles.meta}>{selected.connectedNote}</p>
            ) : null}
            {selected.permissions?.length ? (
              <div className={styles.permissions}>
                <h3 className={styles.subtitle}>
                  {selected.status === "connected" ? "It can" : "Once connected, it can"}
                </h3>
                <ul className={styles.list}>
                  {selected.permissions.map((permission) => (
                    <li key={permission}>{permission}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p role="status" className={styles.srOnly}>
              {state.action === "connecting" ? `Connecting ${selected.name}` : ""}
            </p>
          </div>
        ) : (
          <span />
        )}
      </Drawer>
    </section>
  );
}

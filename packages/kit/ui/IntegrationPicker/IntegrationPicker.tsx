"use client";

import { useId, useState } from "react";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { LucideByName } from "../Button/lucideName";
import { Drawer } from "../Drawer";
import { Empty } from "../Empty";
import { Input } from "../Input";
import { SegmentedControl } from "../SegmentedControl";
import { Skeleton } from "../Skeleton";
import { LoadError } from "../LoadError";
import { cx } from "../shared/cx";
import { CONNECTED_CATEGORY, connectedCount, drawerState, filterItems, tileState } from "./integrationPicker.logic";
import { IntegrationTile } from "./IntegrationTile";
import type { IntegrationPickerProps } from "./IntegrationPicker.types";
import styles from "./IntegrationPicker.module.css";
import { nisthaAttr } from "../shared/inspect";

export type {
  IntegrationPickerProps,
  IntegrationItem,
  IntegrationStatus,
  IntegrationConnectFlow,
  IntegrationTileSize,
} from "./IntegrationPicker.types";

/**
 * A filterable catalogue of integrations: search, a category filter (with an optional Connected segment)
 * and one tile per provider. Every tile ends in a status word and at most one action: Connect or Manage.
 * connectFlow "detail" opens a Drawer with the item's detail, what it can access, and Connect or Disconnect.
 * Built on kit Input, SegmentedControl, Button, Badge, Drawer and Empty.
 */
export function IntegrationPicker({
  items,
  title = "Integrations",
  note,
  query: queryProp,
  onQueryChange,
  category: categoryProp,
  onCategoryChange,
  categories,
  showConnected = false,
  connectFlow = "direct",
  tileSize = "default",
  onConnect,
  onManage,
  onDisconnect,
  selectedId: selectedProp,
  defaultSelectedId = null,
  onSelectedChange,
  connectingId,
  onRequest,
  loading = false,
  error,
  onRetry,
  className,
  ref,
  ...rest
}: IntegrationPickerProps) {
  const titleId = useId();
  const searchId = useId();
  const [ownQuery, setOwnQuery] = useState("");
  const [ownCategory, setOwnCategory] = useState("all");
  const [ownSelected, setOwnSelected] = useState<string | null>(defaultSelectedId);
  const query = queryProp ?? ownQuery;
  const category = categoryProp ?? ownCategory;
  const selectedId = selectedProp === undefined ? ownSelected : selectedProp;
  const setQuery = (next: string) => {
    if (queryProp === undefined) setOwnQuery(next);
    onQueryChange?.(next);
  };
  const setCategory = (next: string) => {
    if (categoryProp === undefined) setOwnCategory(next);
    onCategoryChange?.(next);
  };
  const select = (id: string | null) => {
    if (selectedProp === undefined) setOwnSelected(id);
    onSelectedChange?.(id);
  };

  const detail = connectFlow === "detail";
  const allCategories =
    categories ?? items.reduce<string[]>((list, item) => (item.category && !list.includes(item.category) ? [...list, item.category] : list), []);
  const connected = connectedCount(items);
  const segments = [
    { value: "all", label: "All" },
    ...(showConnected ? [{ value: CONNECTED_CATEGORY, label: `Connected ${connected}` }] : []),
    ...allCategories.map((name) => ({ value: name, label: name })),
  ];
  const shown = filterItems(items, category, query);
  const needle = query.trim();
  const selected = detail && selectedId ? items.find((item) => item.id === selectedId) : undefined;
  const drawer = selected ? drawerState(selected, connectingId) : undefined;
  const lead = [connected ? `${connected} connected` : null, note].filter(Boolean).join(" · ");

  return (
    <section {...rest} {...nisthaAttr("integrationpicker", rest)} ref={ref} className={cx(styles.card, className)} aria-labelledby={titleId} aria-busy={loading || undefined}>
      <header className={styles.header}>
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>
        {lead ? <span className={styles.note}>{lead}</span> : null}
      </header>

      <div className={styles.controls}>
        <Input
          id={searchId}
          className={styles.search}
          type="search"
          size="sm"
          iconStart="Search"
          placeholder={`Search ${title.toLowerCase()}`}
          ariaLabel={`Search ${title.toLowerCase()}`}
          value={query}
          onChange={setQuery}
        />
        {segments.length > 1 ? (
          // One row of categories; on a narrow card the row scrolls instead of wrapping.
          <div className={styles.categories}>
            <SegmentedControl className={styles.segments} size="sm" ariaLabel="Category" value={category} onChange={setCategory} items={segments} />
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className={styles.grid}>
          {[0, 1, 2].map((tile) => (
            <Skeleton key={tile} shape="rect" width="100%" height="calc(var(--space-16) * 2)" />
          ))}
        </div>
      ) : error ? (
        <LoadError message={error} onRetry={onRetry} />
      ) : shown.length === 0 ? (
        <Empty
          className={styles.empty}
          title={
            needle
              ? `No integrations match “${needle}”`
              : category === CONNECTED_CATEGORY
                ? "Nothing connected yet"
                : "No integrations in this category"
          }
          description={category === CONNECTED_CATEGORY && !needle ? "Connect one and it shows here." : "Try a category, or request one and we’ll let you know when it’s ready."}
          icon={category === CONNECTED_CATEGORY && !needle ? "Unplug" : "Search"}
          actions={
            onRequest ? (
              <Button size="md" appearance="outline" mode="neutral" onClick={onRequest}>
                Request an integration
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul key={`${category}|${needle}`} className={cx(styles.grid, tileSize === "compact" && styles.gridCompact)} aria-label={`${title}: ${shown.length} shown`}>
          {shown.map((item) => (
            <IntegrationTile
              key={item.id}
              item={item}
              // The open drawer owns Connecting…, so the tile behind it keeps its plain state.
              state={tileState(item, selected?.id === item.id ? undefined : connectingId)}
              size={tileSize}
              onConnect={detail ? select : onConnect}
              onManage={detail ? select : onManage}
            />
          ))}
        </ul>
      )}

      {detail ? (
        <Drawer
          open={Boolean(selected)}
          title={selected?.name ?? title}
          description={selected ? [selected.category, selected.publisher].filter(Boolean).join(" · ") || undefined : undefined}
          onClose={() => select(null)}
          footer={
            selected && drawer ? (
              <>
                {drawer.action === "disconnect" && onDisconnect ? (
                  <Button appearance="outline" mode="danger" onClick={() => onDisconnect(selected.id)}>
                    Disconnect
                  </Button>
                ) : drawer.action === "connect" || drawer.action === "connecting" ? (
                  <Button
                    appearance="solid"
                    mode="primary"
                    disabled={drawer.action === "connecting"}
                    iconStart={drawer.action === "connecting" ? "LoaderCircle" : undefined}
                    onClick={() => onConnect(selected.id)}
                  >
                    {drawer.action === "connecting" ? "Connecting…" : `Connect ${selected.name}`}
                  </Button>
                ) : null}
                <Button appearance="outline" mode="neutral" onClick={() => select(null)}>
                  Close
                </Button>
              </>
            ) : undefined
          }
        >
          {selected && drawer ? (
            <div className={styles.detail}>
              <div className={styles.identity}>
                <span className={styles.detailLogo} aria-hidden="true">
                  <LucideByName name={selected.icon ?? "Plug"} size={20} />
                </span>
                <Badge tone={drawer.tone} size="sm" appearance="soft">
                  {drawer.label}
                </Badge>
              </div>
              <p className={styles.about}>{selected.about ?? selected.description}</p>
              {selected.connectedNote && selected.status === "connected" ? <p className={styles.meta}>{selected.connectedNote}</p> : null}
              {selected.permissions?.length ? (
                <div className={styles.permissions}>
                  <h4 className={styles.subtitle}>{selected.status === "connected" ? "It can" : "Once connected, it can"}</h4>
                  <ul className={styles.permissionList}>
                    {selected.permissions.map((permission) => (
                      <li key={permission}>{permission}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <p role="status" className={styles.srOnly}>
                {drawer.action === "connecting" ? `Connecting ${selected.name}` : ""}
              </p>
            </div>
          ) : (
            <span />
          )}
        </Drawer>
      ) : null}
    </section>
  );
}

"use client";

import { useId, useState } from "react";
import { CircleCheck, Plug } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { LucideByName } from "../Button/lucideName";
import { Empty } from "../Empty";
import { Input } from "../Input";
import { SegmentedControl } from "../SegmentedControl";
import { Skeleton } from "../Skeleton";
import { LoadError } from "../shared/LoadError";
import { cx } from "../shared/cx";
import type { IntegrationItem, IntegrationPickerProps } from "./IntegrationPicker.types";
import styles from "./IntegrationPicker.module.css";

export type { IntegrationPickerProps, IntegrationItem, IntegrationStatus } from "./IntegrationPicker.types";

/**
 * A filterable catalogue of integrations: search, a category filter and one tile per provider with one
 * action (Connect, Manage, or a disabled Connect for coming soon). Built on kit Input, SegmentedControl,
 * Button, Badge and Empty.
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
  onConnect,
  onManage,
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
  const query = queryProp ?? ownQuery;
  const category = categoryProp ?? ownCategory;
  const setQuery = (next: string) => {
    if (queryProp === undefined) setOwnQuery(next);
    onQueryChange?.(next);
  };
  const setCategory = (next: string) => {
    if (categoryProp === undefined) setOwnCategory(next);
    onCategoryChange?.(next);
  };

  const allCategories =
    categories ?? items.reduce<string[]>((list, item) => (item.category && !list.includes(item.category) ? [...list, item.category] : list), []);
  const needle = query.trim().toLowerCase();
  const shown = items.filter(
    (item) =>
      (category === "all" || item.category === category) &&
      (!needle || `${item.name} ${item.description} ${item.category ?? ""}`.toLowerCase().includes(needle)),
  );

  return (
    <section {...rest} ref={ref} className={cx(styles.card, className)} aria-labelledby={titleId} aria-busy={loading || undefined}>
      <header className={styles.header}>
        <Plug size={16} strokeWidth={ICON_STROKE} aria-hidden="true" className={styles.headerIcon} />
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>
        {note ? <span className={styles.note}>· {note}</span> : null}
      </header>

      <div className={styles.controls}>
        <Input
          id={searchId}
          className={styles.search}
          type="search"
          size="sm"
          iconStart="Search"
          placeholder="Search integrations"
          ariaLabel={`Search ${title.toLowerCase()}`}
          value={query}
          onChange={setQuery}
        />
        {allCategories.length ? (
          <SegmentedControl
            size="sm"
            ariaLabel="Category"
            value={category}
            onChange={setCategory}
            items={[{ value: "all", label: "All" }, ...allCategories.map((name) => ({ value: name, label: name }))]}
          />
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
          title={needle ? `No integrations match “${query.trim()}”` : "No integrations in this category"}
          description="Try a category, or request one and we’ll let you know when it’s ready."
          icon="Search"
          actions={
            onRequest ? (
              <Button size="md" appearance="outline" mode="neutral" onClick={onRequest}>
                Request an integration
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul key={`${category}|${needle}`} className={styles.grid} aria-label={`${title}: ${shown.length} shown`}>
          {shown.map((item) => (
            <Tile key={item.id} item={item} connecting={connectingId === item.id} onConnect={onConnect} onManage={onManage} />
          ))}
        </ul>
      )}
    </section>
  );
}

function Tile({
  item,
  connecting,
  onConnect,
  onManage,
}: {
  item: IntegrationItem;
  connecting: boolean;
  onConnect: (id: string) => void;
  onManage?: (id: string) => void;
}) {
  const nameId = useId();
  const soon = item.status === "comingSoon";
  return (
    <li className={cx(styles.tile, soon && styles.tileSoon)}>
      <div className={styles.tileHead}>
        <span className={styles.logo} aria-hidden="true">
          <LucideByName name={item.icon ?? "Plug"} size={16} />
        </span>
        <span className={styles.tileTitle}>
          <span id={nameId} className={styles.name}>
            {item.name}
          </span>
          {item.category ? <span className={styles.category}>{item.category}</span> : null}
        </span>
      </div>
      <p className={styles.description}>{item.description}</p>
      <div className={styles.tileFoot}>
        {item.status === "connected" ? (
          <>
            <span className={styles.connected}>
              <CircleCheck size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
              Connected
            </span>
            {onManage ? (
              <Button size="sm" appearance="ghost" mode="neutral" aria-describedby={nameId} onClick={() => onManage(item.id)}>
                Manage
              </Button>
            ) : null}
          </>
        ) : soon ? (
          <>
            <Badge tone="neutral" size="sm" appearance="outline">
              Coming soon
            </Badge>
            <Button size="sm" appearance="outline" mode="neutral" disabled aria-describedby={nameId}>
              Connect
            </Button>
          </>
        ) : connecting ? (
          <>
            <span />
            <Button size="sm" iconStart="LoaderCircle" className={styles.connecting} aria-describedby={nameId}>
              Connecting…
            </Button>
            <span className={styles.srOnly} role="status">
              Connecting {item.name}
            </span>
          </>
        ) : (
          <>
            <span />
            <Button size="sm" appearance="outline" mode="neutral" aria-describedby={nameId} onClick={() => onConnect(item.id)}>
              Connect
            </Button>
          </>
        )}
      </div>
    </li>
  );
}

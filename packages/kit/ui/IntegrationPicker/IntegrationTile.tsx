"use client";

import { useId } from "react";
import { CircleCheck, Clock, LoaderCircle } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { Button } from "../Button";
import { LucideByName } from "../Button/lucideName";
import { cx } from "../shared/cx";
import { statusWord, type IntegrationTileState } from "./integrationPicker.logic";
import type { IntegrationItem, IntegrationTileSize } from "./IntegrationPicker.types";
import styles from "./IntegrationPicker.module.css";

/**
 * Internal: one integration tile, shared by IntegrationPicker and SetupGuide (not exported from the kit).
 * Every tile ends in a status word and at most one action: Connect (available) or Manage (connected).
 * Connecting and Coming soon are words with no button.
 */
export function IntegrationTile({
  item,
  state,
  size = "default",
  primary = false,
  onConnect,
  onManage,
}: {
  item: IntegrationItem;
  state: IntegrationTileState;
  size?: IntegrationTileSize;
  /** The view's one solid primary (SetupGuide's suggested provider). Default outline. */
  primary?: boolean;
  onConnect?: (id: string) => void;
  onManage?: (id: string) => void;
}) {
  const nameId = useId();
  const compact = size === "compact";
  const action =
    state === "available" && onConnect ? (
      <Button
        size="sm"
        appearance={primary ? "solid" : "outline"}
        mode={primary ? "primary" : "neutral"}
        aria-describedby={nameId}
        onClick={() => onConnect(item.id)}
      >
        Connect
      </Button>
    ) : state === "connected" && onManage ? (
      <Button size="sm" appearance="outline" mode="neutral" aria-describedby={nameId} onClick={() => onManage(item.id)}>
        Manage
      </Button>
    ) : null;
  // Compact tiles skip "Not connected": the Connect button says it.
  const word = compact && state === "available" && action ? null : <StatusWord state={state} />;
  return (
    <li className={cx(styles.tile, compact && styles.tileCompact, state === "comingSoon" && styles.tileSoon)}>
      <div className={styles.tileHead}>
        <span className={styles.logo} aria-hidden="true">
          <LucideByName name={item.icon ?? "Plug"} size={16} />
        </span>
        <span className={styles.tileTitle}>
          <span id={nameId} className={styles.name}>
            {item.name}
          </span>
          {compact ? (
            <span className={styles.category}>{item.description}</span>
          ) : item.category ? (
            <span className={styles.category}>{item.category}</span>
          ) : null}
        </span>
      </div>
      {compact ? null : <p className={styles.description}>{item.description}</p>}
      <div className={styles.tileFoot}>
        {word}
        {action}
      </div>
      {state === "connecting" ? (
        <span className={styles.srOnly} role="status">
          Connecting {item.name}
        </span>
      ) : null}
    </li>
  );
}

function StatusWord({ state }: { state: IntegrationTileState }) {
  const Icon = state === "connected" ? CircleCheck : state === "connecting" ? LoaderCircle : state === "comingSoon" ? Clock : null;
  return (
    <span className={cx(styles.status, state === "connected" && styles.statusConnected, state === "connecting" && styles.statusConnecting)}>
      {Icon ? <Icon size={16} strokeWidth={ICON_STROKE} aria-hidden="true" /> : null}
      {statusWord(state)}
    </span>
  );
}

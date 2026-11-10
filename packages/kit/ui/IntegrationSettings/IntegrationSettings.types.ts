import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import type { KitIcon } from "../Button/lucideName";

export type IntegrationConnectionStatus = "connected" | "syncing" | "error" | "needsReauth" | "disconnected";

export interface IntegrationSetting {
  id: string;
  label: string;
  description?: string;
  /** The kit control: Select, Switch, Input… Give it `id={controlId}` so the label names it. */
  control: ReactNode;
  controlId?: string;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type IntegrationSettingsOwnedKeys = "children" | "title" | "aria-labelledby";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface IntegrationSettingsProps extends Omit<ComponentPropsWithoutRef<"section">, IntegrationSettingsOwnedKeys> {
  /** Provider name, e.g. "Northwind Ledger". */
  name: string;
  status: IntegrationConnectionStatus;
  /** Lucide name or element for the provider tile. Default "Plug". */
  icon?: KitIcon;
  /** Under the name, e.g. "Last sync 4 min ago · example provider". */
  lastSync?: string;
  /** Overrides the status banner text (syncing, error, needs reauth). */
  statusMessage?: string;
  settings: IntegrationSetting[];
  /** Granted scopes, shown as chips. */
  scopes?: string[];
  /** Save changes: the one solid primary; ⌘/Ctrl+S saves too. */
  onSave: () => void;
  onCancel?: () => void;
  saving?: boolean;
  onSyncNow?: () => void;
  /** Error banner action. */
  onViewErrors?: () => void;
  /** Needs reauth: Reconnect (solid primary; Save steps down to outline). */
  onReconnect?: () => void;
  /** Disconnect after a danger kit AlertDialog. */
  onDisconnect: () => void;
  /** Disconnected: Connect. */
  onConnect?: () => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  ref?: Ref<HTMLElement>;
}

import type { ComponentPropsWithoutRef, Ref } from "react";
import type { IntegrationItem } from "../IntegrationPicker/IntegrationPicker.types";

/** One app in the directory: an IntegrationPicker item plus what its detail drawer shows. */
export interface AppDirectoryApp extends IntegrationItem {
  /** Who makes it, e.g. "Example Inc." Shown under the name in the drawer. */
  publisher?: string;
  /** Longer copy for the drawer. Default: `description`. */
  about?: string;
  /** What the app can see or do once connected, e.g. "Read invoices". */
  permissions?: string[];
  /** For a connected app, e.g. "Connected by Maya Chen · 3 Nov". */
  connectedNote?: string;
}

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type AppDirectoryOwnedKeys = "children" | "title";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface AppDirectoryProps extends Omit<ComponentPropsWithoutRef<"section">, AppDirectoryOwnedKeys> {
  apps: AppDirectoryApp[];
  /** Block heading. Default "Apps". */
  title?: string;
  /** Muted note on the catalogue, e.g. "example providers". */
  note?: string;
  /** Category order for the filter. Default: in order of appearance. */
  categories?: string[];
  /** Controlled category ("all" or a name). */
  category?: string;
  onCategoryChange?: (category: string) => void;
  /** Controlled "Connected" filter chip. */
  connectedOnly?: boolean;
  /** Uncontrolled starting value of the chip. Default false. */
  defaultConnectedOnly?: boolean;
  onConnectedOnlyChange?: (connectedOnly: boolean) => void;
  /** Controlled: the app whose drawer is open, or null. */
  selectedId?: string | null;
  /** Uncontrolled starting drawer. Default none. */
  defaultSelectedId?: string | null;
  onSelectedChange?: (id: string | null) => void;
  /** Connect from the drawer. */
  onConnect: (id: string) => void;
  /** Disconnect from a connected app's drawer. */
  onDisconnect: (id: string) => void;
  /** The app whose connection is in progress: its Connect reads Connecting… */
  connectingId?: string;
  /** Search found nothing: Request an integration. */
  onRequest?: () => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  ref?: Ref<HTMLElement>;
}

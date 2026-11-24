import type { ComponentPropsWithoutRef, Ref } from "react";
import type { KitIcon } from "../Button/lucideName";

export type IntegrationStatus = "available" | "connected" | "comingSoon";

export interface IntegrationItem {
  id: string;
  /** Provider name; label example providers as such. */
  name: string;
  description: string;
  /** e.g. "Accounting". Drives the category filter. */
  category?: string;
  status: IntegrationStatus;
  /** Lucide name or element for the tile, e.g. "Landmark". Default "Plug". */
  icon?: KitIcon;
  /** connectFlow "detail": who makes it, e.g. "Example Inc." Shown under the name in the drawer. */
  publisher?: string;
  /** connectFlow "detail": longer copy for the drawer. Default: `description`. */
  about?: string;
  /** connectFlow "detail": what it can see or do once connected, e.g. "Read invoices". */
  permissions?: string[];
  /** connectFlow "detail": for a connected item, e.g. "Connected by Maya Chen · 3 Nov". */
  connectedNote?: string;
}

/** "direct": the tile's Connect calls onConnect. "detail": Connect and Manage open a Drawer that connects or disconnects. */
export type IntegrationConnectFlow = "direct" | "detail";

export type IntegrationTileSize = "default" | "compact";

/** Native section attributes the kit sets itself (or replaces with its own prop). */
type IntegrationPickerOwnedKeys = "children" | "title" | "aria-labelledby";

/** `ref`, `className` and other native attributes land on the root `<section>`. */
export interface IntegrationPickerProps extends Omit<ComponentPropsWithoutRef<"section">, IntegrationPickerOwnedKeys> {
  items: IntegrationItem[];
  /** Default "Integrations". */
  title?: string;
  /** Muted note after the title, e.g. "example providers". */
  note?: string;
  /** Search text (controlled when set). */
  query?: string;
  onQueryChange?: (query: string) => void;
  /** Category filter: "all", "connected" (with showConnected) or a category name. Controlled when set. */
  category?: string;
  onCategoryChange?: (category: string) => void;
  /** Category order for the filter. Default: in order of appearance. */
  categories?: string[];
  /** Adds a "Connected n" segment after All. Its value is "connected". Default false. */
  showConnected?: boolean;
  /** Default "direct". "detail" opens a Drawer with the item's detail, what it can access, and Connect or Disconnect. */
  connectFlow?: IntegrationConnectFlow;
  /** "compact" puts name, description and action on one row. Default "default". */
  tileSize?: IntegrationTileSize;
  /** Direct: the tile's Connect. Detail: the drawer's Connect. */
  onConnect: (id: string) => void;
  /** Direct: the tile's Manage on a connected item. Detail: Manage opens the drawer instead. */
  onManage?: (id: string) => void;
  /** Detail: Disconnect in a connected item's drawer. */
  onDisconnect?: (id: string) => void;
  /** Detail, controlled: the item whose drawer is open, or null. */
  selectedId?: string | null;
  /** Detail, uncontrolled: the drawer open at first. Default none. */
  defaultSelectedId?: string | null;
  onSelectedChange?: (id: string | null) => void;
  /** The item whose connection is in progress: its tile reads Connecting…, with no button. */
  connectingId?: string;
  /** Search found nothing: "Request an integration". */
  onRequest?: () => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  ref?: Ref<HTMLElement>;
}

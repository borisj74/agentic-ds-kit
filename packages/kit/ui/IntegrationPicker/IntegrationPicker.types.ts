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
}

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
  /** Category filter; "all" or a category name. Controlled when set. */
  category?: string;
  onCategoryChange?: (category: string) => void;
  /** Category order for the filter. Default: in order of appearance. */
  categories?: string[];
  onConnect: (id: string) => void;
  onManage?: (id: string) => void;
  /** The tile whose connection is in progress. */
  connectingId?: string;
  /** Search found nothing: "Request an integration". */
  onRequest?: () => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  ref?: Ref<HTMLElement>;
}

import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

export type TileGroupSelection = "single" | "multiple";

export interface TileGroupItem {
  value: string;
  title: string;
  description?: string;
  /** Price or other short meta, rendered at the end of the title row. */
  meta?: ReactNode;
  disabled?: boolean;
}

/** Native div attributes the kit sets itself (or replaces with its own prop). */
type TileGroupOwnedKeys =
  | "children"
  | "onChange"
  | "defaultValue"
  | "role"
  | "aria-label"
  | "aria-disabled";

interface TileGroupBase extends Omit<ComponentPropsWithoutRef<"div">, TileGroupOwnedKeys> {
  items: TileGroupItem[];
  /** Names the group for assistive tech. */
  ariaLabel: string;
  /** Locks every tile. */
  disabled?: boolean;
  ref?: Ref<HTMLDivElement>;
}

/** One tile at a time. `role="radiogroup"`, arrows move the checked tile. */
export interface TileGroupSingleProps extends TileGroupBase {
  selection?: "single";
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

/** Any number of tiles. `role="group"` of checkboxes. Arrows move focus; Space toggles. */
export interface TileGroupMultipleProps extends TileGroupBase {
  selection: "multiple";
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
}

export type TileGroupProps = TileGroupSingleProps | TileGroupMultipleProps;

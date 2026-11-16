import type { ComponentPropsWithoutRef, Ref } from "react";
import type { AutonomyStop } from "../AutonomyDial";
import type { MultiSelectOption } from "../MultiSelect";
import type { PickerModel } from "../ModelPicker";

export type TaskBriefStatus = "draft" | "starting" | "started" | "error";

/** What the person hands the agent. Limits are optional; null or undefined means no limit. */
export interface TaskBriefValue {
  goal: string;
  /** "Done when" checks, one line each. 1–8; blank rows do not count. */
  criteria: string[];
  /** Spend cap in `currency`. */
  spendCap?: number | null;
  /** Time limit in minutes. */
  minutes?: number | null;
  maxSteps?: number | null;
  /** Allowed tool ids (MultiSelect values). */
  tools?: string[];
  /** ModelPicker id. */
  model?: string;
  /** AutonomyDial stop id (check-in level). */
  autonomy?: string;
}

/** Native article attributes (the root is a kit Card) the kit sets itself (or replaces with its own prop). */
type TaskBriefOwnedKeys = "children" | "onChange" | "aria-labelledby" | "aria-busy";

export interface TaskBriefProps extends Omit<ComponentPropsWithoutRef<"article">, TaskBriefOwnedKeys> {
  /** Card title. Default "New task". */
  title?: string;
  value: TaskBriefValue;
  onChange?: (next: TaskBriefValue) => void;
  /** Tools the agent may be allowed, for the MultiSelect. */
  tools?: MultiSelectOption[];
  /** Models for the ModelPicker. Omit to hide the picker. */
  models?: PickerModel[];
  /** Check-in stops for the AutonomyDial. Default AUTONOMY_STOPS. */
  autonomyOptions?: AutonomyStop[];
  /** ISO currency for the spend cap. Default "USD". */
  currency?: string;
  /** Number and currency locale. Default "en". */
  locale?: string;
  onStart?: (value: TaskBriefValue) => void;
  onSaveDraft?: (value: TaskBriefValue) => void;
  status?: TaskBriefStatus;
  /** Shown in a kit Alert when status is "error". */
  errorMessage?: string;
  ref?: Ref<HTMLElement>;
}

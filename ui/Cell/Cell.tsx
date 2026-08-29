"use client";

import { useId, type ReactNode } from "react";
import { Avatar } from "@/ui/Avatar";
import { AvatarGroup } from "@/ui/AvatarGroup";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { DropdownMenu } from "@/ui/DropdownMenu";
import { ButtonGroup } from "@/ui/ButtonGroup";
import { Checkbox } from "@/ui/Checkbox";
import { Select } from "@/ui/Select";
import { LucideByName } from "@/ui/Button/lucideName";
import type { CellProps, CellType } from "./Cell.types";
import styles from "./Cell.module.css";

export type {
  CellProps,
  CellValue,
  CellType,
  CellSize,
  CellPerson,
  CellBadgeItem,
  CellOption,
  CellAction,
} from "./Cell.types";

const ICON_PX = { sm: 14, md: 16 } as const;
const STAR_COUNT = 5;
const NO_SIDE_LABEL = new Set<CellType>([
  "badge",
  "badges",
  "select",
  "rating",
  "actions",
  "actionIcons",
  "actionMenu",
]);

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function toPercent(value?: string | number): number {
  if (value === undefined || value === "") return 0;
  const n = typeof value === "number" ? value : parseFloat(String(value).replace("%", ""));
  if (Number.isNaN(n)) return 0;
  return clamp(n, 0, 100);
}

function toRating(value?: string | number): number {
  if (value === undefined || value === "") return 0;
  const n = typeof value === "number" ? value : parseFloat(String(value));
  if (Number.isNaN(n)) return 0;
  return clamp(Math.round(n), 0, STAR_COUNT);
}

function sideLabelText(
  type: CellType,
  label?: string,
  name?: string,
  value?: string | number,
): string {
  if (NO_SIDE_LABEL.has(type)) return "";
  if (type === "progress") {
    if (label) return label;
    return `${Math.round(toPercent(value))}%`;
  }
  if (type === "trendPositive" || type === "trendNegative") {
    if (label) return label;
    if (value !== undefined) return String(value);
    return "";
  }
  if (label) return label;
  if (type === "avatar" || type === "avatarGroup") return name ?? "";
  return "";
}

function trendAria(direction: "Up" | "Down", value?: string | number): string {
  if (value === undefined || value === "") return direction;
  return `${direction} ${value}`;
}

export function Cell({
  type = "text",
  size = "md",
  text = true,
  checkbox = false,
  label,
  name,
  src,
  initials,
  people,
  icon,
  tone = "neutral",
  badges,
  value,
  options,
  actions,
  checked,
  defaultChecked,
  onCheckedChange,
  id,
}: CellProps) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;
  const selectId = `${generatedId}-select`;
  const iconPx = ICON_PX[size];
  const personName = name || label || "";
  const shown = sideLabelText(type, label, name, value);
  const selectName = label || name || "row";
  const buttonSize = size === "sm" ? "sm" : "sm";

  let rootAria: string | undefined;
  if (!text) {
    if (type === "file" || type === "payment") {
      rootAria = label || name;
    } else if (type === "trendPositive") {
      rootAria = trendAria("Up", value);
    } else if (type === "trendNegative") {
      rootAria = trendAria("Down", value);
    } else if (type === "progress") {
      rootAria = `${Math.round(toPercent(value))}%`;
    } else if (type === "rating") {
      rootAria = `${toRating(value)} of ${STAR_COUNT}`;
    }
  }

  let visual: ReactNode = null;
  if (type === "avatar") {
    visual = <Avatar name={personName} src={src} initials={initials} size={size} />;
  } else if (type === "avatarGroup" && people && people.length > 0) {
    visual = <AvatarGroup items={people} size={size} max={3} ariaLabel={label} />;
  } else if (type === "file") {
    visual = <LucideByName name={icon || "File"} size={iconPx} className={styles.icon} />;
  } else if (type === "payment") {
    visual = <LucideByName name={icon || "CreditCard"} size={iconPx} className={styles.icon} />;
  } else if (type === "badge") {
    visual = (
      <Badge tone={tone} size={size}>
        {label || ""}
      </Badge>
    );
  } else if (type === "badges") {
    visual = (
      <span className={styles.badges}>
        {(badges ?? []).slice(0, 3).map((item, index) => (
          <Badge key={`${item.label}-${index}`} tone={item.tone ?? "neutral"} size={size}>
            {item.label}
          </Badge>
        ))}
      </span>
    );
  } else if (type === "trendPositive" || type === "trendNegative") {
    const positive = type === "trendPositive";
    visual = (
      <span className={`${styles.trend} ${positive ? styles.trendPositive : styles.trendNegative}`}>
        <LucideByName name={positive ? "ChevronUp" : "ChevronDown"} size={iconPx} />
        {text && shown ? <span className={styles.label}>{shown}</span> : null}
      </span>
    );
  } else if (type === "select" && options && options.length > 0) {
    const selected = value !== undefined && value !== "" ? String(value) : options[0].value;
    visual = (
      <span className={styles.selectWrap}>
        <Select
          id={selectId}
          size="sm"
          options={options}
          defaultValue={selected}
          ariaLabel={label || "Select"}
        />
      </span>
    );
  } else if (type === "progress") {
    const percent = toPercent(value);
    visual = (
      <span
        className={styles.progress}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        aria-label={label || `${Math.round(percent)}%`}
      >
        <span className={styles.progressFill} style={{ width: `${percent}%` }} />
      </span>
    );
  } else if (type === "rating") {
    const score = toRating(value);
    visual = (
      <span className={styles.rating} role="img" aria-label={label || `${score} of ${STAR_COUNT}`}>
        {Array.from({ length: STAR_COUNT }, (_, index) => (
          <LucideByName
            key={index}
            name="Star"
            size={iconPx}
            className={index < score ? styles.starOn : styles.starOff}
          />
        ))}
      </span>
    );
  } else if (type === "actions") {
    const items = (actions ?? []).slice(0, 3);
    if (items.length > 0) {
      visual = (
        <ButtonGroup ariaLabel={label || "Row actions"}>
          {items.map((item, index) => (
            <Button
              key={`${item.label || item.icon || "action"}-${index}`}
              size={buttonSize}
              variant={item.variant ?? (index === 0 ? "secondary" : "tertiary")}
              iconStart={item.icon}
              ariaLabel={item.ariaLabel}
              onClick={item.onClick}
            >
              {item.label}
            </Button>
          ))}
        </ButtonGroup>
      );
    }
  } else if (type === "actionIcons") {
    const items = (actions ?? []).slice(0, 3);
    if (items.length > 0) {
      visual = (
        <span className={styles.actionIcons} role="group" aria-label={label || "Row actions"}>
          {items.map((item, index) => (
            <Button
              key={`${item.icon || item.label || "icon"}-${index}`}
              size={buttonSize}
              variant={item.variant ?? "tertiary"}
              iconStart={item.icon}
              ariaLabel={item.ariaLabel || item.label || "Action"}
              onClick={item.onClick}
            />
          ))}
        </span>
      );
    }
  } else if (type === "actionMenu") {
    const menuItems = (actions ?? []).map((item, index) => ({
      id: item.label || item.ariaLabel || item.icon || `action-${index}`,
      label: item.label || item.ariaLabel || "Action",
      icon: item.icon,
      danger: item.variant === "danger",
    }));
    visual = (
      <DropdownMenu
        iconStart={icon || "Ellipsis"}
        ariaLabel={label || "Row actions"}
        variant="tertiary"
        size={buttonSize}
        align="end"
        groups={[{ items: menuItems }]}
        onSelect={(id) => {
          const hit = (actions ?? []).find(
            (item, index) => (item.label || item.ariaLabel || item.icon || `action-${index}`) === id,
          );
          hit?.onClick?.();
        }}
      />
    );
  }

  const showSideLabel =
    text && shown && type !== "trendPositive" && type !== "trendNegative";
  const empty = !checkbox && !visual && !showSideLabel;

  return (
    <span className={`${styles.cell} ${styles[size]}`} aria-label={rootAria}>
      {checkbox ? (
        <Checkbox
          id={checkboxId}
          size="sm"
          ariaLabel={`Select ${selectName}`}
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={onCheckedChange}
        />
      ) : null}
      {visual ? <span className={styles.visual}>{visual}</span> : null}
      {showSideLabel ? <span className={styles.label}>{shown}</span> : null}
      {empty ? "\u00a0" : null}
    </span>
  );
}

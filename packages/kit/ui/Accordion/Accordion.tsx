"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { ChevronRight } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import type { AccordionProps } from "./Accordion.types";
import { Count } from "../Count";
import { cx } from "../shared/cx";
import styles from "./Accordion.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { AccordionProps, AccordionItem, AccordionType } from "./Accordion.types";

function initialOpen(defaultOpen: AccordionProps["defaultOpen"], type: AccordionProps["type"]): string[] {
  if (defaultOpen === undefined) return [];
  const ids = Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen];
  return type === "multiple" ? ids : ids.slice(0, 1);
}

export function Accordion({ items, type = "single", defaultOpen, className, ref, ...rest }: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>(() => initialOpen(defaultOpen, type));
  const uid = useId();
  const buttons = useRef(new Map<string, HTMLButtonElement>());

  function setOpen(id: string, next: boolean) {
    setOpenIds((current) => {
      if (!next) return current.filter((openId) => openId !== id);
      if (current.includes(id)) return current;
      return type === "multiple" ? [...current, id] : [id];
    });
  }

  function focusSibling(fromId: string, step: 1 | -1 | "first" | "last") {
    const enabled = items.filter((item) => !item.disabled);
    if (enabled.length === 0) return;
    let target = enabled[0];
    if (step === "last") target = enabled[enabled.length - 1];
    else if (step !== "first") {
      const index = enabled.findIndex((item) => item.id === fromId);
      target = enabled[(index + step + enabled.length) % enabled.length];
    }
    buttons.current.get(target.id)?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, id: string, open: boolean) {
    switch (event.key) {
      case "ArrowDown":
        focusSibling(id, 1);
        break;
      case "ArrowUp":
        focusSibling(id, -1);
        break;
      case "Home":
        focusSibling(id, "first");
        break;
      case "End":
        focusSibling(id, "last");
        break;
      case "ArrowRight":
        if (!open) setOpen(id, true);
        break;
      case "ArrowLeft":
        if (open) setOpen(id, false);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  return (
    <div {...rest} {...nisthaAttr("accordion", rest)} ref={ref} className={cx(styles.root, className)}>
      {items.map((item) => {
        const open = openIds.includes(item.id);
        const panelId = `${uid}-panel-${item.id}`;
        const buttonId = `${uid}-button-${item.id}`;
        const disabled = Boolean(item.disabled);
        return (
          <div key={item.id} className={styles.item}>
            <button
              type="button"
              id={buttonId}
              ref={(node) => {
                if (node) buttons.current.set(item.id, node);
                else buttons.current.delete(item.id);
              }}
              className={cx(styles.trigger, disabled && styles.triggerDisabled)}
              aria-expanded={open}
              aria-controls={panelId}
              aria-disabled={disabled || undefined}
              tabIndex={disabled ? -1 : undefined}
              onClick={() => {
                if (!disabled) setOpen(item.id, !open);
              }}
              onKeyDown={disabled ? undefined : (event) => onKeyDown(event, item.id, open)}
            >
              <ChevronRight
                className={cx(styles.chevron, open && styles.chevronOpen)}
                size={16}
                strokeWidth={ICON_STROKE}
                aria-hidden
              />
              <span className={styles.title}>{item.title}</span>
              {typeof item.count === "number" || item.meta ? (
                <span className={styles.end}>
                  {typeof item.count === "number" ? (
                    <Count count={item.count} intent="neutral" subtle size="sm" disabled={disabled} />
                  ) : null}
                  {item.meta ? <span className={styles.meta}>{item.meta}</span> : null}
                </span>
              ) : null}
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cx(styles.panel, open && styles.panelOpen)}
            >
              <div className={styles.panelInner}>
                <div className={styles.body}>{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

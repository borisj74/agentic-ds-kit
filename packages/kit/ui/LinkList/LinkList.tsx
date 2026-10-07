"use client";

import { LucideByName } from "../Button/lucideName";
import type { LinkListProps } from "./LinkList.types";
import styles from "./LinkList.module.css";

export type { LinkListItem, LinkListProps } from "./LinkList.types";

const ICON_SIZE = 16;

export function LinkList({ items, label = "Links" }: LinkListProps) {
  return (
    <ul className={styles.list} aria-label={label}>
      {items.map((item) => {
        const body = (
          <>
            {item.icon ? <LucideByName name={item.icon} size={ICON_SIZE} className={styles.lead} /> : null}
            <span className={styles.text}>
              <span className={styles.label}>{item.label}</span>
              {item.description ? <span className={styles.description}>{item.description}</span> : null}
            </span>
            <LucideByName
              name={item.external ? "ExternalLink" : "ChevronRight"}
              size={ICON_SIZE}
              className={styles.end}
            />
            {item.external ? <span className={styles.srOnly}> (opens in a new tab)</span> : null}
          </>
        );

        return (
          <li key={item.id} className={styles.item}>
            {item.href ? (
              <a
                className={styles.row}
                href={item.href}
                onClick={item.onClick}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
              >
                {body}
              </a>
            ) : (
              <button type="button" className={`${styles.row} ${styles.button}`} onClick={item.onClick}>
                {body}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

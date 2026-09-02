"use client";

import { useState } from "react";
import { Button } from "../Button";
import { LucideByName } from "../Button/lucideName";
import type { PaginationProps } from "./Pagination.types";
import styles from "./Pagination.module.css";

export type { PaginationProps, PaginationSize } from "./Pagination.types";

const ICON_SIZE = { sm: 14, md: 16 } as const;

function clampCount(value: number): number {
  if (!Number.isFinite(value) || value < 1) return 1;
  return Math.floor(value);
}

function clampPage(value: number, count: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(count, Math.max(1, Math.round(value)));
}

type WindowNode = { kind: "page"; page: number } | { kind: "ellipsis"; id: string };

function pageWindow(current: number, count: number): WindowNode[] {
  if (count <= 7) {
    return Array.from({ length: count }, (_, i) => ({ kind: "page" as const, page: i + 1 }));
  }

  const pages = new Set<number>([1, count, current]);
  if (current - 1 >= 1) pages.add(current - 1);
  if (current + 1 <= count) pages.add(current + 1);

  const sorted = [...pages].sort((a, b) => a - b);
  const nodes: WindowNode[] = [];
  for (let i = 0; i < sorted.length; i += 1) {
    const page = sorted[i];
    if (i > 0 && page - sorted[i - 1] > 1) {
      nodes.push({ kind: "ellipsis", id: `gap-${sorted[i - 1]}-${page}` });
    }
    nodes.push({ kind: "page", page });
  }
  return nodes;
}

export function Pagination({
  page,
  defaultPage = 1,
  pageCount,
  onPageChange,
  showPages = true,
  showLabels = true,
  showPreviousNext = true,
  size = "md",
}: PaginationProps) {
  const count = clampCount(pageCount);
  const isControlled = typeof page === "number";
  const [uncontrolled, setUncontrolled] = useState(() => clampPage(defaultPage, count));
  const current = clampPage(isControlled ? page : uncontrolled, count);
  const iconPx = ICON_SIZE[size];

  function go(next: number) {
    const nextPage = clampPage(next, count);
    if (nextPage === current) return;
    if (!isControlled) setUncontrolled(nextPage);
    onPageChange?.(nextPage);
  }

  return (
    <nav aria-label="Pagination" className={styles.nav}>
      {showPreviousNext ? (
        showLabels ? (
          <Button
            size={size}
            variant="tertiary"
            iconStart="ChevronLeft"
            disabled={current <= 1}
            onClick={() => go(current - 1)}
          >
            Previous
          </Button>
        ) : (
          <Button
            size={size}
            variant="tertiary"
            iconStart="ChevronLeft"
            ariaLabel="Previous"
            disabled={current <= 1}
            onClick={() => go(current - 1)}
          />
        )
      ) : null}

      {showPages
        ? pageWindow(current, count).map((node) => {
            if (node.kind === "ellipsis") {
              return (
                <span key={node.id} className={styles.ellipsis} aria-hidden>
                  <LucideByName name="Ellipsis" size={iconPx} />
                </span>
              );
            }

            const isCurrent = node.page === current;
            return (
              <span
                key={node.page}
                className={styles.page}
                aria-current={isCurrent ? "page" : undefined}
              >
                <Button
                  size={size}
                  variant={isCurrent ? "secondary" : "tertiary"}
                  onClick={() => go(node.page)}
                >
                  {String(node.page)}
                </Button>
              </span>
            );
          })
        : null}

      {showPreviousNext ? (
        showLabels ? (
          <Button
            size={size}
            variant="tertiary"
            iconEnd="ChevronRight"
            disabled={current >= count}
            onClick={() => go(current + 1)}
          >
            Next
          </Button>
        ) : (
          <Button
            size={size}
            variant="tertiary"
            iconStart="ChevronRight"
            ariaLabel="Next"
            disabled={current >= count}
            onClick={() => go(current + 1)}
          />
        )
      ) : null}
    </nav>
  );
}

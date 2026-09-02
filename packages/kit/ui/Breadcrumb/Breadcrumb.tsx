import { LucideByName } from "../Button/lucideName";
import type { BreadcrumbItem, BreadcrumbProps } from "./Breadcrumb.types";
import styles from "./Breadcrumb.module.css";

export type { BreadcrumbItem, BreadcrumbProps, BreadcrumbSeparator } from "./Breadcrumb.types";

type VisibleNode =
  | { kind: "ellipsis" }
  | { kind: "item"; item: BreadcrumbItem; index: number };

function visibleNodes(items: BreadcrumbItem[], maxItems?: number): VisibleNode[] {
  if (
    maxItems == null ||
    !Number.isFinite(maxItems) ||
    maxItems < 1 ||
    items.length <= maxItems
  ) {
    return items.map((item, index) => ({ kind: "item", item, index }));
  }

  const tailCount = Math.max(maxItems - 1, 0);
  const tail = items.slice(-tailCount);
  const tailStart = items.length - tail.length;
  const nodes: VisibleNode[] = [{ kind: "item", item: items[0], index: 0 }, { kind: "ellipsis" }];

  tail.forEach((item, offset) => {
    nodes.push({ kind: "item", item, index: tailStart + offset });
  });

  return nodes;
}

export function Breadcrumb({ items, separator = "chevron", maxItems }: BreadcrumbProps) {
  const nodes = visibleNodes(items, maxItems);
  const lastIndex = items.length - 1;

  return (
    <nav aria-label="Breadcrumb">
      <ol className={styles.list}>
        {nodes.map((node, position) => {
          const key = node.kind === "ellipsis" ? "ellipsis" : `crumb-${node.index}`;
          const after =
            position < nodes.length - 1 ? (
              <li key={`sep-${position}`} className={styles.separator} aria-hidden="true">
                {separator === "slash" ? (
                  <span className={styles.slash}>/</span>
                ) : (
                  <LucideByName name="ChevronRight" size={14} />
                )}
              </li>
            ) : null;

          if (node.kind === "ellipsis") {
            return [
              <li key={key} className={styles.ellipsis} aria-hidden="true">
                <LucideByName name="Ellipsis" size={14} />
              </li>,
              after,
            ];
          }

          const isCurrent = node.index === lastIndex;
          const content = isCurrent ? (
            <span className={styles.current} aria-current="page">
              {node.item.label}
            </span>
          ) : node.item.onClick ? (
            <button type="button" className={styles.link} onClick={node.item.onClick}>
              {node.item.label}
            </button>
          ) : node.item.href ? (
            <a className={styles.link} href={node.item.href}>
              {node.item.label}
            </a>
          ) : (
            <span className={styles.crumb}>{node.item.label}</span>
          );

          return [
            <li key={key} className={styles.item}>
              {content}
            </li>,
            after,
          ];
        })}
      </ol>
    </nav>
  );
}

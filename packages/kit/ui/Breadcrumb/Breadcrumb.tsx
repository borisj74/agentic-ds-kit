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

/** Crumb content: optional icon, then the label (visually hidden when iconOnly). */
function CrumbBody({ item }: { item: BreadcrumbItem }) {
  const iconOnly = Boolean(item.iconOnly && item.icon);
  return (
    <>
      {item.icon ? (
        <span className={styles.icon} aria-hidden="true">
          <LucideByName name={item.icon} size={16} />
        </span>
      ) : null}
      <span className={iconOnly ? styles.srOnly : undefined}>{item.label}</span>
    </>
  );
}

export function Breadcrumb({ items, separator = "chevron", maxItems, className, ref, ...rest }: BreadcrumbProps) {
  const nodes = visibleNodes(items, maxItems);
  const lastIndex = items.length - 1;

  return (
    <nav {...rest} ref={ref} className={className} aria-label="Breadcrumb">
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
          const body = <CrumbBody item={node.item} />;
          const title = node.item.iconOnly && node.item.icon ? node.item.label : undefined;
          const content = isCurrent ? (
            <span className={styles.current} aria-current="page" title={title}>
              {body}
            </span>
          ) : node.item.onClick ? (
            <button type="button" className={styles.link} onClick={node.item.onClick} title={title}>
              {body}
            </button>
          ) : node.item.href ? (
            <a className={styles.link} href={node.item.href} title={title}>
              {body}
            </a>
          ) : (
            <span className={styles.crumb} title={title}>
              {body}
            </span>
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

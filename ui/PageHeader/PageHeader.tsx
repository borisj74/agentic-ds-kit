import { Breadcrumb } from "@/ui/Breadcrumb";
import type { PageHeaderProps } from "./PageHeader.types";
import styles from "./PageHeader.module.css";

export type { PageHeaderProps } from "./PageHeader.types";

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  breadcrumbs,
  breadcrumbSeparator,
  breadcrumbMaxItems,
}: PageHeaderProps) {
  const trail = breadcrumbs && breadcrumbs.length >= 2 ? breadcrumbs : undefined;

  return (
    <header className={styles.header}>
      {trail ? (
        <div className={styles.trail}>
          <Breadcrumb
            items={trail}
            separator={breadcrumbSeparator}
            maxItems={breadcrumbMaxItems}
          />
        </div>
      ) : null}
      <div className={styles.row}>
        <div className={styles.content}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h1 className={styles.title}>{title}</h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
    </header>
  );
}

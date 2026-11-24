"use client";

import { Breadcrumb } from "../Breadcrumb";
import { Button } from "../Button";
import { DropdownMenu } from "../DropdownMenu";
import { Link } from "../Link";
import { LucideByName } from "../Button/lucideName";
import type { PageHeaderProps } from "./PageHeader.types";
import { cx } from "../shared/cx";
import { useKitLabels } from "../shared/labels";
import styles from "./PageHeader.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { PageHeaderProps, PageHeaderOverflowAction } from "./PageHeader.types";

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  overflowActions,
  tabs,
  breadcrumbs,
  breadcrumbSeparator,
  breadcrumbMaxItems,
  className,
  ref,
  ...rest
}: PageHeaderProps) {
  const labels = useKitLabels();
  const trail = breadcrumbs && breadcrumbs.length >= 2 ? breadcrumbs : undefined;
  // On narrow screens the trail shrinks to one back step: the crumb before the current page.
  const parent = trail ? trail[trail.length - 2] : undefined;
  const overflow = overflowActions && overflowActions.length > 0 ? overflowActions : undefined;

  return (
    <header {...rest} {...nisthaAttr("pageheader", rest)} ref={ref} className={cx(styles.header, className)}>
      {trail ? (
        <div className={styles.trail}>
          <div className={styles.trailFull}>
            <Breadcrumb
              items={trail}
              separator={breadcrumbSeparator}
              maxItems={breadcrumbMaxItems}
            />
          </div>
          {parent && (parent.href || parent.onClick) ? (
            <nav aria-label="Breadcrumb" className={styles.trailBack}>
              {parent.href ? (
                <Link href={parent.href} variant="standalone" onClick={parent.onClick}>
                  <span className={styles.backLabel}>
                    <LucideByName name="ChevronLeft" size={16} className={styles.backIcon} />
                    {parent.label}
                  </span>
                </Link>
              ) : (
                <Button appearance="ghost" mode="neutral" size="sm" iconStart="ChevronLeft" onClick={parent.onClick}>
                  {parent.label}
                </Button>
              )}
            </nav>
          ) : null}
        </div>
      ) : null}
      <div className={styles.row}>
        <div className={styles.content}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h1 className={styles.title}>{title}</h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
        {actions || overflow ? (
          <div className={styles.actions}>
            {overflow
              ? overflow.map((action) => (
                  <Button
                    key={action.id}
                    className={styles.overflowInline}
                    appearance="outline"
                    mode="neutral"
                    iconStart={action.icon}
                    disabled={action.disabled}
                    onClick={action.onSelect}
                  >
                    {action.label}
                  </Button>
                ))
              : null}
            {actions}
            {overflow ? (
              <div className={styles.overflowMenu}>
                <DropdownMenu
                  iconStart="Ellipsis"
                  ariaLabel={labels.moreActions}
                  appearance="outline"
                  mode="neutral"
                  align="end"
                  groups={[
                    {
                      items: overflow.map((action) => ({
                        id: action.id,
                        label: action.label,
                        icon: action.icon,
                        disabled: action.disabled,
                      })),
                    },
                  ]}
                  onSelect={(id) => overflow.find((action) => action.id === id)?.onSelect()}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {tabs ? <div className={styles.tabs}>{tabs}</div> : null}
    </header>
  );
}

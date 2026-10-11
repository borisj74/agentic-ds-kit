import { Avatar } from "../Avatar";
import type { AvatarGroupProps } from "./AvatarGroup.types";
import { cx } from "../shared/cx";
import styles from "./AvatarGroup.module.css";

export type { AvatarGroupItem, AvatarGroupProps, AvatarGroupSize } from "./AvatarGroup.types";

export function AvatarGroup({ items, size = "md", max = 3, ariaLabel, className, ref, ...rest }: AvatarGroupProps) {
  const visible = items.slice(0, max);
  const leftover = items.length - max;

  return (
    <div {...rest} ref={ref} className={cx(styles.group, className)} role="group" aria-label={ariaLabel}>
      {visible.map((item, index) => (
        <span key={`${item.name}-${index}`} className={styles.item} style={{ zIndex: index + 1 }}>
          <Avatar name={item.name} src={item.src} initials={item.initials} size={size} />
        </span>
      ))}
      {leftover > 0 ? (
        <span
          className={`${styles.item} ${styles.count} ${styles[size]}`}
          style={{ zIndex: visible.length + 1 }}
          aria-label={`${leftover} more`}
        >
          +{leftover}
        </span>
      ) : null}
    </div>
  );
}

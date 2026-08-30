import { LucideByName } from "../Button/lucideName";
import type { EmptyProps } from "./Empty.types";
import styles from "./Empty.module.css";

export type { EmptyProps } from "./Empty.types";

const ICON_SIZE = 20;

export function Empty({
  title,
  description,
  icon,
  media,
  actions,
  outlined = false,
}: EmptyProps) {
  const showIcon = Boolean(icon) && !media;
  const showMedia = Boolean(media);

  return (
    <div className={`${styles.root}${outlined ? ` ${styles.outlined}` : ""}`}>
      {showIcon ? (
        <div className={styles.mediaWell} aria-hidden>
          <LucideByName name={icon} size={ICON_SIZE} />
        </div>
      ) : null}
      {showMedia ? <div className={styles.mediaSlot}>{media}</div> : null}
      <div className={styles.copy}>
        <h3 className={styles.title}>{title}</h3>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  );
}

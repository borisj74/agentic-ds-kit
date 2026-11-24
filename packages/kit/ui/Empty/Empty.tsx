import { ChartLine, Lock, Plug, SearchX, type LucideIcon } from "lucide-react";
import { ICON_STROKE } from "../../lib/icon";
import { LucideByName } from "../Button/lucideName";
import type { EmptyKind, EmptyProps, EmptySize } from "./Empty.types";
import { cx } from "../shared/cx";
import styles from "./Empty.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { EmptyProps, EmptyKind, EmptySize } from "./Empty.types";

const KIND_ICON: Record<EmptyKind, LucideIcon> = {
  "no-data": ChartLine,
  "no-results": SearchX,
  "first-use": Plug,
  permission: Lock,
};

const ICON_SIZE: Record<EmptySize, number> = { sm: 16, md: 16, lg: 20 };

export function Empty({
  title,
  description,
  icon,
  media,
  actions,
  outlined = false,
  kind,
  size = "md",
  className,
  ref,
  ...rest
}: EmptyProps) {
  const KindIcon = kind ? KIND_ICON[kind] : undefined;
  const showMedia = Boolean(media);
  const showIcon = !showMedia && (Boolean(icon) || Boolean(KindIcon));
  const iconSize = ICON_SIZE[size];
  /* first-use is a call to act, not news: it gets no live role. The other kinds are read once. */
  const role = kind && kind !== "first-use" ? "status" : undefined;

  return (
    <div
      role={role}
      {...rest}
      {...nisthaAttr("empty", rest)}
      ref={ref}
      data-size={size}
      data-kind={kind}
      className={cx(styles.root, styles[size], outlined && styles.outlined, className)}
    >
      {showIcon ? (
        <div className={cx(styles.mediaWell, kind === "first-use" && styles.brandWell)} aria-hidden>
          {icon ? (
            <LucideByName name={icon} size={iconSize} />
          ) : KindIcon ? (
            <KindIcon size={iconSize} strokeWidth={ICON_STROKE} aria-hidden />
          ) : null}
        </div>
      ) : null}
      {showMedia ? <div className={styles.mediaSlot}>{media}</div> : null}
      <div className={styles.copy}>
        {size === "sm" ? <p className={styles.sentence}>{title}</p> : <h3 className={styles.title}>{title}</h3>}
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  );
}

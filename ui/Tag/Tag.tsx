import type { TagProps } from "./Tag.types";
import styles from "./Tag.module.css";

export type { TagProps, TagVariant, TagSize } from "./Tag.types";

export function Tag({ children, variant = "neutral", size = "md" }: TagProps) {
  return <span className={`${styles.tag} ${styles[variant]} ${styles[size]}`}>{children}</span>;
}

import type { GradientTextProps } from "./GradientText.types";
import { cx } from "../shared/cx";
import styles from "./GradientText.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { GradientTextProps, GradientTextTone, GradientTextElement } from "./GradientText.types";

/**
 * A restrained gradient fill for one rare heading (a docs hero, an empty-state title). Real text,
 * never an image; stops are semantic tokens; solid text.fg under forced colours or without
 * background-clip. No motion.
 */
export function GradientText({
  children,
  as: Tag = "h2",
  tone = "ink",
  inverse = false,
  className,
  ref,
  ...rest
}: GradientTextProps) {
  return (
    <Tag {...rest} {...nisthaAttr("gradienttext", rest)} ref={ref} className={cx(styles.root, styles[tone], inverse && styles.inverse, className)}>
      {children}
    </Tag>
  );
}

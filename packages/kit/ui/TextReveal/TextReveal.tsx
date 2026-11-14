import { Fragment, type CSSProperties } from "react";
import type { TextRevealProps } from "./TextReveal.types";
import { cx } from "../shared/cx";
import styles from "./TextReveal.module.css";
import { nisthaAttr } from "../shared/inspect";

export type { TextRevealProps, TextRevealBy, TextRevealElement } from "./TextReveal.types";

/**
 * A short heading that rises in by word or by line. The full string is always in the DOM for
 * screen readers and copy; the animated units are aria-hidden. Pure CSS, so it ends on the final
 * text even without JS, and shows the final text at once under reduced motion.
 */
export function TextReveal({
  children,
  by = "word",
  as: Tag = "h2",
  replayKey,
  label,
  className,
  ref,
  ...rest
}: TextRevealProps) {
  const lines = by === "line" ? children.split("\n").filter((line) => line.trim() !== "") : [children];
  const units = by === "line" ? lines : children.split(/\s+/).filter(Boolean);
  const spoken = label ?? (by === "line" ? lines.join(" ") : children);

  return (
    <Tag {...rest} {...nisthaAttr("textreveal", rest)} ref={ref} className={cx(styles.root, styles[by], className)}>
      <span className={styles.srOnly}>{spoken}</span>
      <span key={replayKey} className={styles.units} aria-hidden="true">
        {units.map((unit, index) => (
          <Fragment key={`${index}-${unit}`}>
            {/* A real space between words, so wrapping and word spacing follow the font. */}
            {by === "word" && index > 0 ? " " : null}
            <span className={styles.unit} style={{ "--text-reveal-index": index } as CSSProperties}>
              {unit}
            </span>
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}

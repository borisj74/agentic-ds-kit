"use client";

import { useId } from "react";
import { Conveyor } from "../Conveyor";
import { cx } from "../shared/cx";
import { listLabel, stripLogos } from "./logoStrip.logic";
import type { LogoStripLogo, LogoStripProps } from "./LogoStrip.types";
import styles from "./LogoStrip.module.css";

export type { LogoStripProps, LogoStripLogo } from "./LogoStrip.types";

function Mark({ logo, kind }: { logo: LogoStripLogo; kind: "node" | "image" | "text" }) {
  // The kit is framework-agnostic: a plain img, not next/image.
  // eslint-disable-next-line @next/next/no-img-element
  if (kind === "image") return <img className={styles.image} src={logo.src} alt={logo.name} loading="lazy" decoding="async" />;
  if (kind === "node")
    return (
      <span className={styles.node} role="img" aria-label={logo.name}>
        {logo.logo}
      </span>
    );
  return <span className={styles.text}>{logo.name}</span>;
}

/**
 * Block: a "trusted by" row. A heading over a kit Conveyor of named logos. The row moves only
 * when the person moves it (arrows, arrow keys, swipe); smooth scrolling is off under reduced motion.
 */
export function LogoStrip(props: LogoStripProps) {
  const {
    logos,
    title = "Trusted by teams at",
    description,
    label = "Customer logos",
    align = "center",
    className,
    ref,
    ...rest
  } = props;
  const titleId = useId();
  const items = stripLogos(logos);

  return (
    <section {...rest} ref={ref} className={cx(styles.root, align === "start" && styles.start, className)} aria-labelledby={titleId}>
      <header className={styles.heading}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {description ? <p className={styles.lead}>{description}</p> : null}
      </header>
      <Conveyor label={label}>
        <ul className={styles.list} aria-label={listLabel(label, items.length)}>
          {items.map(({ key, kind, ...logo }) => (
            <li key={key} className={styles.item}>
              {logo.href ? (
                <a className={styles.link} href={logo.href}>
                  <Mark logo={logo} kind={kind} />
                </a>
              ) : (
                <Mark logo={logo} kind={kind} />
              )}
            </li>
          ))}
        </ul>
      </Conveyor>
    </section>
  );
}

"use client";

import { useId, useState, type CSSProperties } from "react";
import { Button } from "../Button";
import { cx } from "../shared/cx";
import { listLabel, rowDirection, rowDuration, stripLogos, stripRows } from "./logoStrip.logic";
import type { LogoStripLogo, LogoStripProps } from "./LogoStrip.types";
import styles from "./LogoStrip.module.css";

export type { LogoStripProps, LogoStripLogo } from "./LogoStrip.types";

type Item = ReturnType<typeof stripLogos>[number];

function Mark({ logo, kind }: { logo: LogoStripLogo; kind: Item["kind"] }) {
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

function Logos({ items, copy }: { items: Item[]; copy?: boolean }) {
  return (
    <ul className={styles.list} aria-hidden={copy || undefined} inert={copy || undefined}>
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
  );
}

/**
 * Block: a "trusted by" wall. A heading over rows of named logos that drift sideways, each row the
 * other way from the one above, with soft faded edges. Pause / Play stops them (and hover or
 * keyboard focus holds them); under reduced motion the rows stand still and wrap.
 */
export function LogoStrip(props: LogoStripProps) {
  const {
    logos,
    title = "Trusted by teams at",
    description,
    label = "Customer logos",
    rows = 3,
    paused: pausedProp,
    defaultPaused = false,
    onPausedChange,
    align = "center",
    className,
    ref,
    ...rest
  } = props;
  const titleId = useId();
  const [innerPaused, setInnerPaused] = useState(defaultPaused);
  const paused = pausedProp ?? innerPaused;
  const items = stripLogos(logos);
  const lines = stripRows(items, rows);

  function toggle() {
    if (pausedProp === undefined) setInnerPaused(!paused);
    onPausedChange?.(!paused);
  }

  return (
    <section
      {...rest}
      ref={ref}
      className={cx(styles.root, align === "start" && styles.start, paused && styles.paused, className)}
      aria-labelledby={titleId}
    >
      <header className={styles.heading}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {description ? <p className={styles.lead}>{description}</p> : null}
      </header>
      <div className={styles.wall} role="group" aria-label={listLabel(label, items.length)}>
        {lines.map((line, index) => (
          <div
            key={index}
            className={cx(styles.row, rowDirection(index) === "right" && styles.right)}
            style={{ "--logostrip-duration": `${rowDuration(line.length)}s` } as CSSProperties}
          >
            <div className={styles.track}>
              <Logos items={line} />
              <Logos items={line} copy />
            </div>
          </div>
        ))}
      </div>
      <div className={styles.controls}>
        <Button
          size="sm"
          appearance="ghost"
          mode="neutral"
          iconStart={paused ? "Play" : "Pause"}
          aria-pressed={paused}
          onClick={toggle}
        >
          {paused ? "Play logos" : "Pause logos"}
        </Button>
      </div>
    </section>
  );
}

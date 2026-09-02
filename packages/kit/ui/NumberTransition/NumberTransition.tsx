"use client";

import { useLayoutEffect, useState } from "react";
import type { NumberTransitionProps } from "./NumberTransition.types";
import styles from "./NumberTransition.module.css";

export type { NumberTransitionProps, NumberTransitionSize } from "./NumberTransition.types";

function visibleCharacter(character: string): string {
  return character === " " ? "\u00a0" : character;
}

export function NumberTransition({
  value,
  format,
  size = "md",
  label,
  className = "",
}: NumberTransitionProps) {
  const formattedValue = String(format ? format(value) : value);
  const numericValue = Number(value);
  const [frame, setFrame] = useState(() => ({
    previous: formattedValue,
    current: formattedValue,
    currentValue: numericValue,
    direction: "up" as "up" | "down",
    id: 0,
  }));

  useLayoutEffect(() => {
    setFrame((current) => {
      if (current.current === formattedValue) return current;
      return {
        previous: current.current,
        current: formattedValue,
        currentValue: numericValue,
        direction:
          Number.isFinite(numericValue) &&
          Number.isFinite(current.currentValue) &&
          numericValue < current.currentValue
            ? "down"
            : "up",
        id: current.id + 1,
      };
    });
  }, [formattedValue, numericValue]);

  const length = Math.max(frame.previous.length, frame.current.length);
  const previousCharacters = frame.previous.padStart(length, " ").split("");
  const currentCharacters = frame.current.padStart(length, " ").split("");

  return (
    <span
      className={`${styles.root} ${styles[size]} ${className}`.trim()}
      aria-label={label ?? formattedValue}
      aria-live="polite"
    >
      <span className={styles.content} aria-hidden="true">
        {currentCharacters.map((character, index) => {
          const previousCharacter = previousCharacters[index];
          const changed = previousCharacter !== character;
          return (
            <span
              className={`${styles.cell}${changed ? ` ${styles.changing}` : ""}`}
              data-direction={frame.direction}
              key={`${frame.id}-${index}`}
            >
              {changed ? (
                <span className={styles.old}>{visibleCharacter(previousCharacter)}</span>
              ) : null}
              <span className={styles.new}>{visibleCharacter(character)}</span>
            </span>
          );
        })}
      </span>
    </span>
  );
}

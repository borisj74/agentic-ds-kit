import type { ComponentPropsWithoutRef, Ref } from "react";

export type TextRevealBy = "word" | "line";
export type TextRevealElement = "h1" | "h2" | "h3" | "p" | "span";

/** Root attributes the kit sets itself. */
type TextRevealOwnedKeys = "children";

/** `ref`, `className` and other attributes land on the root element (`as`). */
export interface TextRevealProps extends Omit<ComponentPropsWithoutRef<"h2">, TextRevealOwnedKeys> {
  /** Plain text. With `by="line"`, put each line on its own line (`\n`). */
  children: string;
  by?: TextRevealBy;
  as?: TextRevealElement;
  /** Change it to play the reveal again (e.g. a Replay button in a docs hero). */
  replayKey?: string | number;
  /** Accessible text when it should differ from `children`. */
  label?: string;
  className?: string;
  ref?: Ref<HTMLHeadingElement>;
}

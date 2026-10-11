import type { ComponentPropsWithoutRef, Ref } from "react";

export interface CodeSnippetTab {
  label: string;
  code: string;
  /** Shown as a label in the header. No highlighting. */
  language?: string;
}

/** Native div attributes the kit sets itself (or replaces with its own prop). */
type CodeSnippetOwnedKeys = "children" | "title";

/** `ref`, `className` and other native attributes land on the root `<div>`. */
export interface CodeSnippetProps extends Omit<ComponentPropsWithoutRef<"div">, CodeSnippetOwnedKeys> {
  /** The code. Ignored when `tabs` is set. */
  code?: string;
  /** Several snippets behind kit Tabs (line, sm) in the header. */
  tabs?: CodeSnippetTab[];
  /** Language label in the header (label only, no highlighting). A tab's own language wins. */
  language?: string;
  /** Filename or caption in the header. With tabs, it names the code region only. */
  title?: string;
  /** Decorative line numbers (aria-hidden, never copied). */
  showLineNumbers?: boolean;
  /** Copy button. */
  copyable?: boolean;
  /** Wrap long lines. Default scrolls horizontally. */
  wrap?: boolean;
  /** Scroll inside past this height (CSS length or px number). */
  maxHeight?: string | number;
  ref?: Ref<HTMLDivElement>;
}

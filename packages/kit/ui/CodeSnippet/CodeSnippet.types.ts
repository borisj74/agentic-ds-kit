export interface CodeSnippetTab {
  label: string;
  code: string;
  /** Shown as a label in the header. No highlighting. */
  language?: string;
}

export interface CodeSnippetProps {
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
}

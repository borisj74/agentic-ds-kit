"use client";

import { CodeSnippet } from "agentic-ds-kit";

/**
 * Docs code sample. Renders kit CodeSnippet (no header, floating Copy). Give `label` when a page
 * shows more than one, so each code region has its own name.
 */
export function CodeBlock({ code, label }: { code: string; label?: string }) {
  return <CodeSnippet code={code} ariaLabel={label} />;
}

"use client";

import { CodeSnippet } from "agentic-ds-kit";

/** Docs code sample. Renders kit CodeSnippet (no header, floating Copy). */
export function CodeBlock({ code }: { code: string }) {
  return <CodeSnippet code={code} />;
}

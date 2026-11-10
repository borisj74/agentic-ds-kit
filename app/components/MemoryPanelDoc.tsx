"use client";

import { useState } from "react";
import { MemoryPanel } from "agentic-ds-kit";
import type { MemoryItem } from "agentic-ds-kit";
import { AgentDocFrame } from "./AgentDocFrame";
import agentDoc from "./AgentDoc.module.css";

const ITEMS: MemoryItem[] = [
  { id: "1", content: "Prefers sentence case for headings", source: "from chat · 12 Oct", age: "3w", pinned: true, usedHere: true },
  { id: "2", content: "Billing code lives in src/billing; tests in invoice.test.ts", source: "from repo scan", age: "5d", pinned: true },
  { id: "3", content: "Deploys need an approval on Fridays", source: "from you", age: "2d", usedHere: true },
  { id: "4", content: "Uses pnpm, not npm", source: "from repo scan", age: "1d" },
];
const noop = () => {};

export function MemoryPanelDoc() {
  const [items, setItems] = useState(ITEMS);
  const [query, setQuery] = useState("");
  return (
    <AgentDocFrame
      id="memorypanel"
      name="MemoryPanel"
      lede="What an agent remembers. Not ListView. Not ContextWindow."
      summary="Search, add, pin, edit in place, or forget (confirmed in an AlertDialog)."
      preview={
        <MemoryPanel
          items={items}
          query={query}
          onQueryChange={setQuery}
          onAdd={(content) => setItems((list) => [{ id: String(Date.now()), content, source: "from you", age: "now" }, ...list])}
          onEdit={(id, content) => setItems((list) => list.map((item) => (item.id === id ? { ...item, content } : item)))}
          onPin={(id, pinned) => setItems((list) => list.map((item) => (item.id === id ? { ...item, pinned } : item)))}
          onDelete={(id) => setItems((list) => list.filter((item) => item.id !== id))}
        />
      }
      usage="MemoryPanel manages long-term facts. Forget always confirms in a kit AlertDialog, and the privacy note is always visible."
      code={`<MemoryPanel
  items={memories}
  query={query}
  onQueryChange={setQuery}
  onAdd={add}
  onEdit={edit}
  onPin={pin}
  onDelete={forget}
/>`}
      variants={[
        {
          title: "Populated — pinned and others",
          about: "Pinned memories group first. Used here marks what this thread used. Row actions show on hover or focus.",
          code: `<MemoryPanel items={memories} onQueryChange={setQuery} onAdd={add} onEdit={edit} onPin={pin} onDelete={forget} />`,
          render: <MemoryPanel items={ITEMS} onQueryChange={noop} onAdd={noop} onEdit={noop} onPin={noop} onDelete={noop} />,
        },
        {
          title: "Filtered to none",
          about: "A search with no match says so and suggests adding it.",
          code: `<MemoryPanel items={memories} query="stripe" onQueryChange={setQuery} />`,
          render: <MemoryPanel items={ITEMS} query="stripe" onQueryChange={noop} onAdd={noop} />,
        },
        {
          title: "Empty, loading and error",
          about: "Nothing remembered yet; skeleton rows; a load error with Retry.",
          code: `<MemoryPanel items={[]} onAdd={add} />
<MemoryPanel items={[]} loading />
<MemoryPanel items={[]} error="Couldn't load memories." onRetry={reload} />`,
          render: (
            <div className={agentDoc.row}>
              <MemoryPanel items={[]} onQueryChange={noop} onAdd={noop} />
              <MemoryPanel items={[]} loading onQueryChange={noop} onAdd={noop} />
              <MemoryPanel items={[]} error="Couldn't load memories." onRetry={noop} onQueryChange={noop} onAdd={noop} />
            </div>
          ),
        },
      ]}
    />
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Chat } from "agentic-ds-kit";
import type { ChatMessage, ChatRecent, ChatStep, ChatSuggestion } from "agentic-ds-kit";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import doc from "./ChatDoc.module.css";
import { DocTabList } from "./DocTabList";
import { DocNotes } from "./DocNotes";

const MRR_QUESTION = "What drove MRR this period?";
const CHURN_QUESTION = "Which accounts caused most of the churn?";

const MRR_WEEKS = [
  "Aug 28", "Sep 4", "Sep 11", "Sep 18", "Sep 25", "Oct 2", "Oct 9",
  "Oct 16", "Oct 23", "Oct 30", "Nov 6", "Nov 13", "Nov 20",
];

const MRR_ANSWER: ChatMessage = {
  id: "mrr-answer",
  role: "assistant",
  content: "MRR grew to $412.6k (+10.9%). Growth beat churn by $40.7k.",
  steps: [
    { label: "Reading MRR movements", status: "done", durationMs: 800 },
    { label: "Comparing to previous period", status: "done", durationMs: 1200 },
    { label: "Writing answer", status: "done", durationMs: 400 },
  ],
  parts: [
    {
      type: "metrics",
      items: [
        { label: "MRR", value: "$412.6k", delta: "+10.9%", trend: "up" },
        { label: "Net new MRR", value: "$40.7k", delta: "+20.8%", trend: "up" },
      ],
    },
    {
      type: "table",
      columns: [
        { key: "movement", header: "Movement" },
        { key: "amount", header: "Amount", align: "end", numeric: true },
      ],
      rows: [
        { movement: "New", amount: "$79.8k" },
        { movement: "Expansion", amount: "$26.4k" },
        { movement: "Contraction", amount: "−$13.4k" },
        { movement: "Churn", amount: "−$52.1k" },
      ],
      footer: { label: "Net new MRR", value: "$40.7k" },
    },
    {
      type: "chart",
      label: "MRR · weekly",
      range: "Aug 28 – Nov 20",
      data: [372, 375, 378, 384, 388, 389, 395, 398, 401, 405, 408, 410, 412.6].map((value, index) => ({
        label: MRR_WEEKS[index],
        value,
      })),
    },
    { type: "sources", label: "Sources: MRR movements · Last 3 months" },
    { type: "followups", items: ["Churn by plan", "vs last quarter"] },
  ],
};

const CHURN_ANSWER: ChatMessage = {
  id: "churn-answer",
  role: "assistant",
  content: "Four accounts make up 51% of churned MRR. Most were on the Enterprise plan.",
  parts: [
    {
      type: "metrics",
      items: [
        { label: "Churned MRR", value: "$52.1k", delta: "−9.4%", trend: "down" },
        { label: "Accounts lost", value: "38", delta: "−6", trend: "down" },
      ],
    },
    {
      type: "table",
      columns: [
        { key: "account", header: "Account" },
        { key: "mrr", header: "Churned MRR", align: "end", numeric: true },
      ],
      rows: [
        { account: "Northwind", mrr: "$9.8k" },
        { account: "Acme Retail", mrr: "$7.2k" },
        { account: "Globex", mrr: "$5.6k" },
        { account: "Initech", mrr: "$4.1k" },
      ],
      footer: { label: "Top 4 · 51%", value: "$26.7k" },
    },
    {
      type: "chart",
      label: "Churn rate · weekly",
      range: "2.6% → 2.1%",
      data: [2.6, 2.6, 2.6, 2.5, 2.4, 2.5, 2.4, 2.2, 2.3, 2.3, 2.2, 2.1, 2.1].map((value, index) => ({
        label: MRR_WEEKS[index],
        value,
      })),
    },
    { type: "sources", label: "Sources: Churn by account · Last 3 months" },
    { type: "followups", items: ["Why Northwind left", "Win-back email"] },
  ],
};

const PAGE_SUGGESTIONS: ChatSuggestion[] = [
  { label: MRR_QUESTION, hint: "Looks at MRR movements · 3 months", icon: "TrendingUp" },
  { label: CHURN_QUESTION, hint: "Looks at churn by account", icon: "Users" },
  { label: "Are we on track for the $450k target?", hint: "Looks at MRR vs target", icon: "Activity" },
];

const GENERAL_SUGGESTIONS: ChatSuggestion[] = [
  { label: "Summarise this week", hint: "Looks at activity across workspaces", icon: "FileText" },
  { label: "Find overdue invoices", hint: "Looks at Invoices · 12 open", icon: "Clock" },
  { label: "Draft a status update", hint: "Uses your last 5 updates", icon: "Sparkles" },
];

const RECENT: ChatRecent[] = [
  { label: "Compare ARPA by plan", meta: "Yesterday" },
  { label: "Draft a note for the board pack", meta: "Nov 18" },
];

const STEP_LABELS = ["Reading MRR movements", "Comparing to previous period", "Writing answer"];
const STEP_TIMES = [800, 1600, 600];

function stepsAt(active: number): ChatStep[] {
  return STEP_LABELS.map((label, index) => ({
    label,
    status: index < active ? "done" : index === active ? "active" : "pending",
    durationMs: index < active ? STEP_TIMES[index] : undefined,
  }));
}

const THINKING_STEPS: ChatStep[] = [
  { label: "Reading MRR movements", status: "done", durationMs: 800 },
  { label: "Comparing to previous period", status: "active", durationMs: 1600 },
  { label: "Writing answer", status: "pending" },
];

const STREAMING: ChatMessage[] = [
  { role: "user", content: MRR_QUESTION, timestamp: "09:42" },
  {
    role: "assistant",
    status: "streaming",
    content: "MRR grew to $412.6k (+10.9%). New business brought $79.8k and expansion $26.4k, while churn took",
    steps: MRR_ANSWER.steps,
    parts: [MRR_ANSWER.parts![0]],
  },
];

const ERROR: ChatMessage[] = [
  { role: "user", content: MRR_QUESTION, timestamp: "09:42" },
  {
    role: "assistant",
    status: "error",
    content: "",
    timestamp: "09:42",
    steps: [{ label: "Reading MRR movements", status: "done", durationMs: 10000 }],
    error: {
      title: "Couldn’t read MRR movements",
      description: "The data source timed out after 10s. Nothing was changed.",
      onRetry: () => {},
      onCopyDetails: () => {},
    },
  },
];

const CONTEXT = { label: "Revenue overview · Last 3 months" };

const MASTER_CODE = `<Chat
  title="Assistant"
  greeting="Good morning, Ada"
  intro="Ask about this dashboard. I answer from the data on screen."
  context={{ label: "Revenue overview · Last 3 months", onRemove: clearContext }}
  suggestions={[{ label: "What drove MRR this period?", hint: "Looks at MRR movements · 3 months", icon: "TrendingUp" }]}
  recent={recent}
  messages={messages}
  isThinking={busy}
  thinkingSteps={steps}
  onStop={stop}
  onSend={handleSend}
  onClose={close}
/>`;

const ANSWER_CODE = `const answer: ChatMessage = {
  role: "assistant",
  content: "MRR grew to $412.6k (+10.9%). Growth beat churn by $40.7k.",
  steps,
  parts: [
    { type: "metrics", items: [{ label: "MRR", value: "$412.6k", delta: "+10.9%", trend: "up" }] },
    { type: "table", columns, rows, footer: { label: "Net new MRR", value: "$40.7k" } },
    { type: "chart", label: "MRR · weekly", range: "Aug 28 – Nov 20", data },
    { type: "sources", label: "Sources: MRR movements · Last 3 months" },
    { type: "followups", items: ["Churn by plan", "vs last quarter"] },
  ],
};`;

export function ChatDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const [steps, setSteps] = useState<ChatStep[]>([]);
  const [hasContext, setHasContext] = useState(true);
  const timersRef = useRef<number[]>([]);

  function clearTimers() {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }

  useEffect(() => clearTimers, []);

  function handleSend(message: string) {
    clearTimers();
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setMessages((current) => [...current, { role: "user", content: message, timestamp: time }]);
    setThinking(true);
    setSteps(stepsAt(0));
    let elapsed = 0;
    STEP_TIMES.forEach((ms, index) => {
      elapsed += ms;
      timersRef.current.push(window.setTimeout(() => setSteps(stepsAt(index + 1)), elapsed));
    });
    timersRef.current.push(
      window.setTimeout(() => {
        const answer = /churn|account/i.test(message) ? CHURN_ANSWER : MRR_ANSWER;
        setMessages((current) => [
          ...current,
          { ...answer, id: `${answer.id}-${current.length}`, steps: stepsAt(STEP_LABELS.length), timestamp: time },
        ]);
        setThinking(false);
        timersRef.current = [];
      }, elapsed + 200),
    );
  }

  function handleStop() {
    clearTimers();
    setThinking(false);
  }

  return (
    <div>
      <header className={styles.hero}>
        <h2 className={styles.heroTitle}>Chat</h2>
        <p className={styles.lede}>
          Assistant panel with a header, a thread, and a composer. Answers can carry figures, a
          table, a chart, sources and follow-ups. One piece. Not Modal.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="chat-master">
        <div className={styles.masterHeader}>
          <h2 id="chat-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Live panel. Pick a suggestion: the steps run, then the answer lands with figures, a
            table and a chart.
          </p>
          <DocTabList value={tab} onChange={(id) => setTab(id as "preview" | "variants")} />
        </div>

        {tab === "preview" ? (
          <div role="tabpanel" aria-label="Preview">
            <div className={styles.layout}>
              <div className={`${styles.canvas} ${doc.canvas}`}>
                <div className={doc.frame}>
                  <Chat
                    title="Assistant"
                    greeting="Good morning, Ada"
                    intro="Ask about this dashboard. I answer from the data on screen."
                    context={hasContext ? { ...CONTEXT, onRemove: () => setHasContext(false) } : undefined}
                    suggestions={PAGE_SUGGESTIONS}
                    recent={RECENT}
                    placeholder="Ask about this dashboard"
                    messages={messages}
                    isThinking={thinking}
                    thinkingSteps={steps}
                    onStop={handleStop}
                    onSend={handleSend}
                    onClose={() => {
                      handleStop();
                      setMessages([]);
                      setHasContext(true);
                    }}
                  />
                </div>
              </div>
            </div>
            <DocNotes>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use Chat for an inline assistant panel. With no messages, greeting, intro,
                  suggestion rows and recents fill the panel. While it works, thinkingSteps shows
                  the steps and onStop turns Send into Stop. Close clears the demo.
                </p>
              </div>
              <CodeBlock code={MASTER_CODE} />
            </DocNotes>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Data answer</h2>
              <div className={`${styles.exampleCanvas} ${doc.pair}`}>
                <div className={doc.exampleFrame}>
                  <Chat
                    title="Assistant"
                    messages={[{ role: "user", content: MRR_QUESTION, timestamp: "09:42" }, MRR_ANSWER]}
                    onClose={() => {}}
                  />
                </div>
                <div className={doc.exampleFrame}>
                  <Chat
                    title="Assistant"
                    messages={[{ role: "user", content: CHURN_QUESTION, timestamp: "09:43" }, CHURN_ANSWER]}
                    onClose={() => {}}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  An answer shows the figures it quotes. parts draw in order under the text:
                  metrics as kit Scorecard sm, a table as kit Table sm, a chart as kit LineChart
                  area, a sources line, then follow-up pills that send their text. steps collapse
                  into one row that opens the list.
                </p>
              </div>
              <CodeBlock code={ANSWER_CODE} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Guided empty</h2>
              <div className={`${styles.exampleCanvas} ${doc.pair}`}>
                <div className={doc.exampleFrame}>
                  <Chat
                    title="Assistant"
                    greeting="Good morning, Ada"
                    intro="Ask about this dashboard. I answer from the data on screen."
                    context={{ ...CONTEXT, onRemove: () => {} }}
                    suggestions={PAGE_SUGGESTIONS}
                    recent={RECENT}
                    placeholder="Ask about this dashboard"
                    messages={[]}
                    onClose={() => {}}
                  />
                </div>
                <div className={doc.exampleFrame}>
                  <Chat
                    title="Assistant"
                    greeting="Hi Ada"
                    intro="Ask for a task, a summary or a draft."
                    suggestions={GENERAL_SUGGESTIONS}
                    recent={[]}
                    recentEmptyLabel="Your recent questions show up here."
                    messages={[]}
                    onClose={() => {}}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  greeting and intro open the empty panel. With context, the Tag sits under the
                  intro. Suggestions with a hint become rows (kit LinkList); recent lists past
                  questions at the foot (kit ListView).
                </p>
              </div>
              <CodeBlock
                code={`<Chat
  greeting="Good morning, Ada"
  intro="Ask about this dashboard. I answer from the data on screen."
  context={{ label: "Revenue overview · Last 3 months", onRemove: clearContext }}
  suggestions={[{ label: "What drove MRR this period?", hint: "Looks at MRR movements · 3 months", icon: "TrendingUp" }]}
  recent={[{ label: "Compare ARPA by plan", meta: "Yesterday", onSelect: reopen }]}
  messages={[]}
  onSend={handleSend}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Working</h2>
              <div className={`${styles.exampleCanvas} ${doc.trio}`}>
                <div className={doc.exampleFrame}>
                  <Chat
                    title="Assistant"
                    messages={[{ role: "user", content: MRR_QUESTION, timestamp: "09:42" }]}
                    isThinking
                    thinkingSteps={THINKING_STEPS}
                    onStop={() => {}}
                    onClose={() => {}}
                  />
                </div>
                <div className={doc.exampleFrame}>
                  <Chat title="Assistant" messages={STREAMING} isThinking onStop={() => {}} onClose={() => {}} />
                </div>
                <div className={doc.exampleFrame}>
                  <Chat title="Assistant" messages={ERROR} onClose={() => {}} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Show the work. thinkingSteps is a live list; onStop swaps Send for Stop while
                  busy. A streaming answer shows a caret and a placeholder for parts still
                  coming. An error keeps the question and offers Retry and Copy details.
                </p>
              </div>
              <CodeBlock
                code={`<Chat messages={messages} isThinking thinkingSteps={steps} onStop={stop} onSend={send} />

{ role: "assistant", status: "streaming", content: partialText, parts }

{ role: "assistant", status: "error", content: "", error: {
  title: "Couldn’t read MRR movements",
  description: "The data source timed out after 10s. Nothing was changed.",
  onRetry: retry,
  onCopyDetails: copyDetails,
} }`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Docked rail</h2>
              <div className={styles.exampleCanvas}>
                <div className={doc.exampleFrame}>
                  <Chat
                    title="Assistant"
                    messages={[{ role: "user", content: CHURN_QUESTION }, CHURN_ANSWER]}
                    radius="none"
                    onClose={() => {}}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  radius none squares the panel and drops the outer block and end borders so Chat
                  can sit flush in a workspace rail. Default lg is the standalone card.
                </p>
              </div>
              <CodeBlock
                code={'<Chat title="Assistant" messages={messages} radius="none" onClose={close} />'}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Context</h2>
              <div className={styles.exampleCanvas}>
                <div className={doc.exampleFrame}>
                  <Chat
                    title="Ask"
                    messages={[]}
                    context={{ label: "Signups · Last 30 days", onRemove: () => {} }}
                    suggestions={["Why did signups dip on Tuesday?", "Which source grew most?"]}
                    onClose={() => {}}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  context names what the next message is about, like the card a user asked from. It
                  shows as a kit Tag above the composer and describes the composer for screen
                  readers. Plain string suggestions stay as Buttons above it.
                </p>
              </div>
              <CodeBlock
                code={`<Chat
  title="Ask"
  messages={[]}
  context={{ label: "Signups · Last 30 days", onRemove: clearContext }}
  suggestions={["Why did signups dip on Tuesday?"]}
  onSend={handleSend}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Embedded</h2>
              <div className={styles.exampleCanvas}>
                <div className={doc.exampleFrame}>
                  <Chat
                    title="Ask about invoices"
                    embedded
                    messages={[]}
                    emptyState="Ask about any invoice on this page."
                    suggestions={["Which invoices are overdue?", "Who pays latest?"]}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  embedded drops the header band, the outer border and Chat&apos;s own side padding,
                  and fills its host. Use it in a work panel tab or a Drawer that already has a title
                  and an edge; the title still names the section for screen readers.
                </p>
              </div>
              <CodeBlock code={'<Chat title="Ask about invoices" embedded messages={messages} suggestions={suggestions} onSend={send} />'} />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}

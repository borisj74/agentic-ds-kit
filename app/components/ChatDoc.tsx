"use client";

import { useEffect, useRef, useState } from "react";
import { Chat } from "@/ui/Chat";
import type { ChatMessage } from "@/ui/Chat";
import { CodeBlock } from "./CodeBlock";
import styles from "./ComponentDoc.module.css";
import doc from "./ChatDoc.module.css";
import { DocTabList } from "./DocTabList";

const STARTER: ChatMessage[] = [
  { role: "assistant", content: "Hi — ask for a task, summary, or draft." },
  { role: "user", content: "Draft a short status update." },
];

const MASTER_CODE = `<Chat
  title="Assistant"
  messages={messages}
  placeholder="How can we help you?"
  isThinking={busy}
  onSend={handleSend}
  onClose={close}
/>`;

export function ChatDoc() {
  const [tab, setTab] = useState<"preview" | "variants">("preview");
  const [messages, setMessages] = useState<ChatMessage[]>(STARTER);
  const [thinking, setThinking] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  function handleSend(message: string) {
    setMessages((current) => [...current, { role: "user", content: message }]);
    setThinking(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: `Got it — “${message}”. Here is a short placeholder reply.` },
      ]);
      setThinking(false);
      timerRef.current = null;
    }, 1200);
  }

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Chat</h1>
        <p className={styles.lede}>
          Assistant panel with a header, a thread, and a composer. One piece. Not Modal.
        </p>
      </header>

      <section className={styles.master} aria-labelledby="chat-master">
        <div className={styles.masterHeader}>
          <h2 id="chat-master" className={styles.masterTitle}>
            Master
          </h2>
          <p className={styles.masterSummary}>
            Live panel. Send appends a placeholder assistant reply.
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
                    messages={messages}
                    isThinking={thinking}
                    disabled={thinking}
                    onSend={handleSend}
                    onClose={() => {}}
                  />
                </div>
              </div>
            </div>
            <div className={styles.docs}>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Use Chat for an inline assistant panel. Header, thread, and composer stay one
                  piece. Not Modal.
                </p>
              </div>
              <CodeBlock code={MASTER_CODE} />
            </div>
          </div>
        ) : (
          <div className={styles.variants} role="tabpanel" aria-label="Variants">
            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Empty</h2>
              <div className={styles.exampleCanvas}>
                <div className={doc.exampleFrame}>
                  <Chat title="Assistant" messages={[]} onClose={() => {}} />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Empty thread shows emptyState. Composer stays available.
                </p>
              </div>
              <CodeBlock code={'<Chat title="Assistant" messages={[]} onClose={() => {}} />'} />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Thinking</h2>
              <div className={styles.exampleCanvas}>
                <div className={doc.exampleFrame}>
                  <Chat
                    title="Assistant"
                    messages={[{ role: "user", content: "Summarize yesterday." }]}
                    isThinking
                    disabled
                    onClose={() => {}}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  isThinking shows kit ThinkingAnimation in the thread. Hide it when the reply lands.
                </p>
              </div>
              <CodeBlock
                code={`<Chat
  title="Assistant"
  messages={[{ role: "user", content: "Summarize yesterday." }]}
  isThinking
  disabled
  onClose={() => {}}
/>`}
              />
            </section>

            <section className={styles.example}>
              <h2 className={styles.exampleTitle}>Suggestions</h2>
              <div className={styles.exampleCanvas}>
                <div className={doc.exampleFrame}>
                  <Chat
                    title="Assistant"
                    messages={[]}
                    suggestions={["Create a task", "Draft an update"]}
                    onClose={() => {}}
                  />
                </div>
              </div>
              <div>
                <h3 className={styles.usageTitle}>Usage</h3>
                <p className={styles.usageBody}>
                  Pass suggestion strings. They render as kit Button sm tertiary chips above the
                  composer.
                </p>
              </div>
              <CodeBlock
                code={`<Chat
  title="Assistant"
  messages={[]}
  suggestions={["Create a task", "Draft an update"]}
  onClose={() => {}}
/>`}
              />
            </section>
          </div>
        )}
      </section>
    </div>
  );
}

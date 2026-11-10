"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { Button, TextReveal, type TextRevealBy } from "agentic-ds-kit";
import { AgentDocFrame, DocOptions } from "./AgentDocFrame";
import motion from "./MotionDoc.module.css";

const WORDS = "Agents that ask before they act";
const LINES = "Design system for\nAI agents.";

function Still({ at, label, children }: { at: string; label: string; children: ReactNode }) {
  return (
    <div className={motion.frame}>
      <p className={motion.frameLabel}>{label}</p>
      <div className={`${motion.well} ${motion.textWell} ${motion.freeze}`} style={{ "--freeze-at": at } as CSSProperties}>
        {children}
      </div>
    </div>
  );
}

export function TextRevealDoc() {
  const [by, setBy] = useState<TextRevealBy>("word");
  const [replay, setReplay] = useState(0);

  return (
    <AgentDocFrame
      id="textreveal"
      name="TextReveal"
      lede="A short heading that rises in by word or by line, for docs heroes and empty states. Not for body copy."
      summary="Switch word or line and press Replay. The full sentence is always in the DOM; only the visible copy animates."
      preview={
        <div className={motion.stage}>
          <div className={`${motion.well} ${motion.textWell}`}>
            <TextReveal by={by} replayKey={`${by}-${replay}`}>
              {by === "word" ? WORDS : LINES}
            </TextReveal>
          </div>
          <Button appearance="outline" mode="neutral" size="sm" onClick={() => setReplay((count) => count + 1)}>
            Replay
          </Button>
        </div>
      }
      controls={<DocOptions label="By" options={["word", "line"] as const} value={by} onChange={setBy} />}
      usage="One per view, on a hero or empty-state heading. Each word or line fades up over motion.duration300 with ease-out, 40ms apart by word and 80ms by line. No bounce, no scale, no loop. Under reduced motion the final text is there at once. Change replayKey to play it again."
      code={`<TextReveal as="h1">Agents that ask before they act</TextReveal>

<TextReveal by="line">{"Design system for\\nAI agents."}</TextReveal>`}
      variants={[
        {
          title: "By word — frames",
          about: "Paper's stills, paused: just started, mid-reveal, and at rest.",
          code: `<TextReveal>Agents that ask before they act</TextReveal>`,
          render: (
            <div className={motion.stage}>
              <Still at="16ms" label="01 · t ≈ 16ms — first word starting, the rest at opacity 0">
                <TextReveal as="p">{WORDS}</TextReveal>
              </Still>
              <Still at="200ms" label="02 · t ≈ 200ms — revealing, 40ms per word">
                <TextReveal as="p">{WORDS}</TextReveal>
              </Still>
              <Still at="2000ms" label="03 · rest">
                <TextReveal as="p">{WORDS}</TextReveal>
              </Still>
            </div>
          ),
        },
        {
          title: "By line — frames",
          about: "Lines come in 80ms apart and rise a little further (space.3).",
          code: `<TextReveal by="line">{"Design system for\\nAI agents."}</TextReveal>`,
          render: (
            <div className={motion.stage}>
              <Still at="16ms" label="04 · t ≈ 16ms — first line starting">
                <TextReveal as="p" by="line">{LINES}</TextReveal>
              </Still>
              <Still at="100ms" label="05 · t ≈ 100ms — second line still rising">
                <TextReveal as="p" by="line">{LINES}</TextReveal>
              </Still>
              <Still at="2000ms" label="06 · rest">
                <TextReveal as="p" by="line">{LINES}</TextReveal>
              </Still>
            </div>
          ),
        },
        {
          title: "Reduced motion",
          about: "With prefers-reduced-motion the final text is there at once: no stagger, no rise. This is also what screen readers get, always.",
          code: `@media (prefers-reduced-motion: reduce) — handled inside the component`,
          render: (
            <div className={`${motion.well} ${motion.textWell} ${motion.still}`}>
              <TextReveal as="p">{WORDS}</TextReveal>
            </div>
          ),
        },
      ]}
    />
  );
}

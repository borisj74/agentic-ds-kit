"use client";

import { useState } from "react";
import { GradientText, type GradientTextTone } from "agentic-ds-kit";
import { AgentDocFrame, DocOptions } from "./AgentDocFrame";
import motion from "./MotionDoc.module.css";

const COPY = "Ship agents people trust";

export function GradientTextDoc() {
  const [tone, setTone] = useState<GradientTextTone>("ink");
  return (
    <AgentDocFrame
      id="gradienttext"
      name="GradientText"
      lede="A restrained, token-based gradient fill for one rare heading (a docs hero, an empty-state title). Real text, never an image. No motion."
      summary="Switch ink or brand. Both ends of the gradient keep 4.5:1 against the surface."
      preview={
        <div className={motion.bare}>
          <GradientText tone={tone}>{COPY}</GradientText>
        </div>
      }
      controls={<DocOptions label="Tone" options={["ink", "brand"] as const} value={tone} onChange={setTone} />}
      usage="One heading per view, on a hero or empty state. ink runs text.fg to the brand colour; brand runs the brand colour to primary.fg. Use inverse on surface.inverse. Under forced colours, or where background-clip: text is missing, it is solid text.fg. It does not animate."
      code={`<GradientText as="h1">Ship agents people trust</GradientText>`}
      variants={[
        {
          title: "Ink",
          about: "The default: text.fg → text.brand.",
          code: `<GradientText>Ship agents people trust</GradientText>`,
          render: (
            <div className={motion.plain}>
              <GradientText as="span">{COPY}</GradientText>
            </div>
          ),
        },
        {
          title: "Brand",
          about: "text.brand → primary.fg.",
          code: `<GradientText tone="brand">Ship agents people trust</GradientText>`,
          render: (
            <div className={motion.plain}>
              <GradientText as="span" tone="brand">
                {COPY}
              </GradientText>
            </div>
          ),
        },
        {
          title: "On an inverse surface",
          about: "bg.canvas → info line on surface.inverse.",
          code: `<GradientText inverse>Ship agents people trust</GradientText>`,
          render: (
            <div className={motion.inverseWell}>
              <GradientText as="span" inverse>
                {COPY}
              </GradientText>
            </div>
          ),
        },
        {
          title: "Fallback — forced colours",
          about: "Solid text.fg (CanvasText in forced colours). The text reads the same either way.",
          code: `@media (forced-colors: active) — handled inside the component`,
          render: (
            <div className={`${motion.plain} ${motion.solid}`}>
              <GradientText as="span">{COPY}</GradientText>
            </div>
          ),
        },
      ]}
    />
  );
}

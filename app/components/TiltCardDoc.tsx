"use client";

import { useState, type CSSProperties } from "react";
import { Badge, Button, Card, TiltCard } from "agentic-ds-kit";
import { AgentDocFrame, DocOptions } from "./AgentDocFrame";
import motion from "./MotionDoc.module.css";

function Plan({ action = true }: { action?: boolean }) {
  return (
    <div className={motion.planBody}>
      <Badge tone="primary" appearance="soft" size="sm">
        Recommended
      </Badge>
      <p className={motion.price}>
        $29 <span className={motion.priceUnit}>/ mo</span>
      </p>
      <p className={motion.caption}>Example data</p>
      {action ? (
        <Button appearance="outline" mode="neutral" size="sm">
          Choose Pro
        </Button>
      ) : null}
    </div>
  );
}

/** A frozen tilt for the Variants stills: the same CSS variables the pointer handler sets. */
const TILTED = {
  "--tilt-rx": "4deg",
  "--tilt-ry": "-5deg",
  "--tilt-x": "0.75",
  "--tilt-y": "0.2",
} as CSSProperties;

export function TiltCardDoc() {
  const [tilt, setTilt] = useState<"on" | "off">("on");
  return (
    <AgentDocFrame
      id="tiltcard"
      name="TiltCard"
      lede="A kit Card that tilts a few degrees toward the pointer, for rare showcase spots (a pricing highlight, a docs gallery). Never the default Card."
      summary="Move the pointer over the left card; the plain Card beside it is the comparison. Tab to Choose Pro for the keyboard state: a static lift, no tilt."
      preview={
        <div className={motion.cards}>
          <TiltCard className={motion.plan} title="Pro plan" tilt={tilt === "on"}>
            <Plan />
          </TiltCard>
          <Card className={motion.plan} title="Pro plan">
            <Plan />
          </Card>
        </div>
      }
      controls={<DocOptions label="Tilt" options={["on", "off"] as const} value={tilt} onChange={setTilt} />}
      usage="One or two per view, never on tables, forms or agent monitors. Up to 6° toward the pointer with a highlight that follows it; it eases back over motion.duration400 when the pointer leaves. Hover fades in a shadow.md lift. Mouse and pen only. Under reduced motion there is no rotation and no highlight; hover lifts the shadow only."
      code={`<TiltCard title="Pro plan">
  <Badge tone="primary" appearance="soft" size="sm">Recommended</Badge>
  …
</TiltCard>`}
      variants={[
        {
          title: "Rest and tilting",
          about: "At rest it is a Card with shadow.sm. Tilting (a still): rotate ≤ 6°, the highlight under the pointer, shadow.md. The highlight shows on dark surfaces; on a light card it adds nothing, as in Paper.",
          code: `<TiltCard title="Pro plan" maxTilt={6}>…</TiltCard>`,
          render: (
            <div className={motion.cards}>
              <TiltCard className={motion.plan} title="Pro plan">
                <Plan action={false} />
              </TiltCard>
              <TiltCard className={motion.plan} title="Pro plan" style={TILTED} data-tilting="">
                <Plan action={false} />
              </TiltCard>
            </div>
          ),
        },
        {
          title: "Keyboard focus",
          about: "Focus inside the card gives a focus ring and the shadow.md lift, never a tilt. Tab to Choose Pro to see it.",
          code: `<TiltCard title="Pro plan">…<Button>Choose Pro</Button></TiltCard>`,
          render: (
            <div className={motion.cards}>
              <TiltCard className={motion.plan} title="Pro plan">
                <Plan />
              </TiltCard>
            </div>
          ),
        },
        {
          title: "Disabled",
          about: "Muted content, aria-disabled, no tilt and no lift.",
          code: `<TiltCard title="Pro plan" disabled>…</TiltCard>`,
          render: (
            <div className={motion.cards}>
              <TiltCard className={motion.plan} title="Pro plan" disabled>
                <Plan action={false} />
              </TiltCard>
            </div>
          ),
        },
        {
          title: "Reduced motion",
          about: "With prefers-reduced-motion there is no rotation and no highlight; hover may still lift the shadow. tilt={false} gives the same result for everyone.",
          code: `<TiltCard title="Pro plan" tilt={false}>…</TiltCard>`,
          render: (
            <div className={motion.cards}>
              <TiltCard className={motion.plan} title="Pro plan" tilt={false}>
                <Plan action={false} />
              </TiltCard>
            </div>
          ),
        },
      ]}
    />
  );
}

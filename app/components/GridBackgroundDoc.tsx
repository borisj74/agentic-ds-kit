"use client";

import { useState } from "react";
import { Card, GridBackground, type GridBackgroundVariant } from "agentic-ds-kit";
import { AgentDocFrame, DocOptions } from "./AgentDocFrame";
import motion from "./MotionDoc.module.css";

function Foreground() {
  return (
    <Card size="sm" title="Agent Lanes">
      Foreground keeps full contrast
    </Card>
  );
}

function Demo({ variant, inverse = false }: { variant: GridBackgroundVariant; inverse?: boolean }) {
  return (
    <div className={motion.gridWell}>
      <GridBackground variant={variant} inverse={inverse}>
        <Foreground />
      </GridBackground>
    </div>
  );
}

export function GridBackgroundDoc() {
  const [variant, setVariant] = useState<GridBackgroundVariant>("lines");
  const [surface, setSurface] = useState<"default" | "inverse">("default");
  return (
    <AgentDocFrame
      id="gridbackground"
      name="GridBackground"
      lede="A quiet line or dot grid behind a demo or hero, fading out toward the edges. Decorative only; the foreground keeps its full contrast."
      summary="Switch lines, dots or none, and the inverse surface. The grid is aria-hidden and sits behind the content."
      preview={<Demo variant={variant} inverse={surface === "inverse"} />}
      controls={
        <>
          <DocOptions label="Variant" options={["lines", "dots", "none"] as const} value={variant} onChange={setVariant} />
          <DocOptions label="Surface" options={["default", "inverse"] as const} value={surface} onChange={setSurface} />
        </>
      }
      usage="Behind a demo, hero or empty state, never behind dense data or long text. Lines sit every space.6 (24px) in border.faint, dots every space.4 (16px) in border.strong, and a radial mask fades them out from the centre, so it works on any surface. It is static: Paper's optional slow drift is not built."
      code={`<GridBackground variant="lines">
  <Card title="Agent Lanes" description="Foreground keeps full contrast" />
</GridBackground>`}
      variants={[
        {
          title: "Lines",
          about: "space.6 cells in border.faint, full at the centre, gone by 80% of the way to the corners.",
          code: `<GridBackground variant="lines">…</GridBackground>`,
          render: <Demo variant="lines" />,
        },
        {
          title: "Dots",
          about: "space.4 pitch in border.strong, with the same fade.",
          code: `<GridBackground variant="dots">…</GridBackground>`,
          render: <Demo variant="dots" />,
        },
        {
          title: "Off",
          about: "variant=\"none\" keeps the wrapper and drops the grid.",
          code: `<GridBackground variant="none">…</GridBackground>`,
          render: <Demo variant="none" />,
        },
        {
          title: "On an inverse surface",
          about: "surface.inverse with the grid at opacity.100 of line.inverse, edge to edge; no fade needed. It follows the theme, so in dark mode the inverse surface is light.",
          code: `<GridBackground variant="lines" inverse>…</GridBackground>`,
          render: <Demo variant="lines" inverse />,
        },
        {
          title: "Reduced motion",
          about: "Nothing moves, with or without reduced motion: the grid is static.",
          code: `<GridBackground variant="dots">…</GridBackground>`,
          render: <Demo variant="dots" />,
        },
      ]}
    />
  );
}

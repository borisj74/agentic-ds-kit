import { ImageResponse } from "next/og";
import tokens from "../packages/kit/tokens/tokens.json";

export const alt = "Nistha — a code-only design system for coding agents and product UI.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Kit primitives (the OG renderer cannot read CSS variables): brand blue on slate.
const color = tokens.primitive.color;

/** Share card for every page: the Nistha name, the tagline and the npm package. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: color.slate["50"],
          color: color.slate["900"],
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: color.brand["500"] }} />
          <div style={{ fontSize: 44, fontWeight: 700 }}>Nistha</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1 }}>
            A code-only design system for coding agents and product UI.
          </div>
          <div style={{ fontSize: 30, color: color.slate["600"] }}>
            JSON contracts, tokens and React components · npm i agentic-ds-kit
          </div>
        </div>
      </div>
    ),
    size,
  );
}

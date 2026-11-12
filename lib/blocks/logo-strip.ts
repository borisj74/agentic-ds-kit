import contract from "../../packages/kit/contracts/logostrip.json";
import type { BlockDoc } from "./types";

export const logoStripDoc: BlockDoc = {
  slug: "logo-strip",
  label: "Logo strip",
  name: "LogoStrip",
  contract,
  lead:
    "A trusted-by wall. A short heading over rows of customer logos that drift sideways, each row the other way from the one above, fading out softly at both edges. Pause stops them, and hovering or tabbing to a logo holds them still. With reduced motion on, the rows stand still and wrap.",
  usage: `import { LogoStrip } from "agentic-ds-kit";

export function Customers() {
  return (
    <main className="layout-content">
      <LogoStrip
        title="Trusted by teams at"
        rows={3}                // dealt round-robin; rows alternate direction
        logos={[
          { name: "Northpeak", src: "/logos/northpeak.svg" },  // image: alt is the name
          { name: "Fieldstone", logo: <FieldstoneMark /> },    // node: named with role=img
          { name: "Quarry", src: "/logos/quarry.svg", href: "/customers/quarry" },
        ]}
      />
    </main>
  );
}`,
};

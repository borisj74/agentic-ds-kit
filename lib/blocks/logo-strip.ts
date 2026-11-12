import contract from "../../packages/kit/contracts/logostrip.json";
import type { BlockDoc } from "./types";

export const logoStripDoc: BlockDoc = {
  slug: "logo-strip",
  label: "Logo strip",
  name: "LogoStrip",
  contract,
  lead:
    "A trusted-by row. A short heading over customer logos, each named for screen readers. When the logos run past the edge, people move the row with its arrows, the arrow keys or a swipe; it never moves on its own.",
  usage: `import { LogoStrip } from "agentic-ds-kit";

export function Customers() {
  return (
    <main className="layout-content">
      <LogoStrip
        title="Trusted by teams at"
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

import contract from "../../packages/kit/contracts/appdirectory.json";
import type { BlockDoc } from "./types";

export const appDirectoryDoc: BlockDoc = {
  slug: "app-directory",
  label: "App directory",
  name: "AppDirectory",
  contract,
  lead:
    "Deprecated: use IntegrationPicker with connectFlow=\"detail\" and showConnected, which this block now renders. Where people find the apps your product works with. Search and filter the catalogue, see what is connected, and open an app to read what it can access before you connect or disconnect it.",
  usage: `import { IntegrationPicker } from "agentic-ds-kit";

// AppDirectory is deprecated; this is what it renders now.
export function Integrations({ apps, connecting }) {
  return (
    <main className="layout-content">
      <IntegrationPicker
        title="Apps"
        items={apps}                // with publisher?, about?, permissions?, connectedNote?
        note="example providers"
        showConnected               // a "Connected n" segment
        connectFlow="detail"        // Connect and Manage open the detail Drawer
        connectingId={connecting}   // that app reads Connecting…
        onConnect={(id) => connect(id)}
        onDisconnect={(id) => disconnect(id)}
        onRequest={() => requestIntegration()}
      />
    </main>
  );
}`,
};

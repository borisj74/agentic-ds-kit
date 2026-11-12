import contract from "../../packages/kit/contracts/appdirectory.json";
import type { BlockDoc } from "./types";

export const appDirectoryDoc: BlockDoc = {
  slug: "app-directory",
  label: "App directory",
  name: "AppDirectory",
  contract,
  lead:
    "Where people find the apps your product works with. Search and filter the catalogue, see what is connected, and open an app to read what it can access before you connect or disconnect it.",
  usage: `import { AppDirectory } from "agentic-ds-kit";

export function Integrations({ apps, connecting }) {
  return (
    <main className="layout-content">
      <AppDirectory
        apps={apps}                 // IntegrationPicker items + publisher?, about?, permissions?, connectedNote?
        note="example providers"
        connectingId={connecting}   // that app's Connect reads Connecting…
        onConnect={(id) => connect(id)}
        onDisconnect={(id) => disconnect(id)}
        onRequest={() => requestIntegration()}
      />
    </main>
  );
}`,
};

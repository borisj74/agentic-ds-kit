import { Section } from "agentic-ds-kit";
import { CodeBlock } from "../components/CodeBlock";
import playground from "../playground.module.css";

const INSTALL = `npm install agentic-ds-kit`;

const SMOKE = `import { Button } from "agentic-ds-kit";

export default function Page() {
  return <Button variant="primary">Save</Button>;
}`;

const USAGE = `import { Button, Scoreboard, ActivityPattern } from "agentic-ds-kit";`;

const TOKENS = `import "agentic-ds-kit/tokens.css";`;

const NEW_APP = `mkdir my-app
cd my-app
npx create-next-app@latest . --yes
npm install agentic-ds-kit`;

const AGENT_FILES = `cp node_modules/agentic-ds-kit/AGENTS.md ./AGENTS.md
cp node_modules/agentic-ds-kit/CLAUDE.md ./CLAUDE.md
mkdir -p .cursor/skills/prototype-from-kit .claude/skills/prototype-from-kit
cp node_modules/agentic-ds-kit/skills/prototype-from-kit/SKILL.md .cursor/skills/prototype-from-kit/
cp node_modules/agentic-ds-kit/skills/prototype-from-kit/SKILL.md .claude/skills/prototype-from-kit/`;

const UPGRADE = `npm install agentic-ds-kit@latest`;

export default function InstallationPage() {
  return (
    <div className={playground.page}>
      <div className={playground.shell}>
        <h1 className={playground.pageTitle}>Installation</h1>
        <p className={playground.pageLead}>
          Add the kit to a Next.js app on React 19. You do not clone this repo. You do not need
          transpilePackages. Copy AGENTS.md so the agent follows the contract.
        </p>

        <Section
          title="Existing app"
          description="From the Next app root — the folder that already has package.json."
        >
          <div className={playground.stack}>
            <p className={playground.body}>Install, then smoke-test a primary Button.</p>
            <CodeBlock code={INSTALL} />
            <CodeBlock code={SMOKE} />
            <p className={playground.body}>
              The button should look like the kit primary, not a default browser control. Importing
              from the package loads tokens. Do not add transpilePackages for agentic-ds-kit.
            </p>
          </div>
        </Section>

        <Section
          title="Components and patterns"
          description="Read contracts/index.json in the package, then import the matching piece."
        >
          <CodeBlock code={USAGE} />
        </Section>

        <Section
          title="Tokens in your CSS"
          description="Only if your own stylesheets use kit variables before any kit component is imported."
        >
          <div className={playground.stack}>
            <CodeBlock code={TOKENS} />
            <p className={playground.body}>
              Skip this when every screen already imports a kit component. Importing tokens twice is
              harmless. AppNav uses next/link — Next is an optional peer for that component only.
              Dark mode and brand color are on the Theming page.
            </p>
          </div>
        </Section>

        <Section
          title="New folder"
          description="The kit is not an app. Scaffold Next first."
        >
          <CodeBlock code={NEW_APP} />
        </Section>

        <Section
          title="Agent files"
          description="Optional. Copy these so Cursor and Claude Code follow the kit. The UI works without them."
        >
          <div className={playground.stack}>
            <CodeBlock code={AGENT_FILES} />
            <p className={playground.body}>
              Add .cursor/rules/kit.mdc with the same six lines as AGENTS.md. Claude Code loads
              CLAUDE.md (@AGENTS.md).
            </p>
          </div>
        </Section>

        <Section
          title="Upgrade from 0.1.0"
          description="Update the package only. Do not recreate the Next app. Skip 0.2.0 — it shipped CSS filenames Next re-scopes."
        >
          <div className={playground.stack}>
            <CodeBlock code={UPGRADE} />
            <p className={playground.body}>
              Remove transpilePackages for this kit if you added it. Re-copy agent files from
              node_modules if they changed.
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}

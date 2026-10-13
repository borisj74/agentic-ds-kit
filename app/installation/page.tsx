import { Section } from "agentic-ds-kit";
import kitPackage from "agentic-ds-kit/package.json";
import { CodeBlock } from "../components/CodeBlock";
import playground from "../playground.module.css";

const VERSION = kitPackage.version;

const INSTALL = `npm install agentic-ds-kit@latest`;

const SMOKE = `import { Button } from "agentic-ds-kit";

export default function Page() {
  return <Button variant="primary">Save</Button>;
}`;

const USAGE = `import { AppHeader, Button, Scoreboard, SideNav } from "agentic-ds-kit";`;

const ADD_PATTERN = `npx agentic-ds-kit add --list
npx agentic-ds-kit add dashboard`;

const USE_COPY = `import { DashboardPattern } from "@/components/patterns/dashboard";`;

const TOKENS = `import "agentic-ds-kit/tokens.css";`;

const FONTS = `// app/layout.tsx
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";

const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-ibm-plex-sans" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-ibm-plex-mono" });

// <html className={\`\${plexSans.variable} \${plexMono.variable}\`}>`;

const NEW_APP = `mkdir my-app
cd my-app
npx create-next-app@latest . --yes
npm install agentic-ds-kit@latest`;

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
          Add the kit to a Next.js app on React 19. Current version is {VERSION}. You do not clone
          this repo. You do not need transpilePackages. Copy AGENTS.md so the agent follows the
          contract.
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
              from the package loads tokens and pattern layout classes. Do not add transpilePackages for agentic-ds-kit.
            </p>
          </div>
        </Section>

        <Section
          title="Components"
          description="Read contracts/index.json in the package, then import the matching component."
        >
          <div className={playground.stack}>
            <CodeBlock code={USAGE} />
            <p className={playground.body}>
              The package exports components only. Compose them into any layout: top bar only, side
              nav only, both, or neither. Keep page content in a main landmark and the nav reachable
              on small screens. Patterns are examples you can copy in: see the next section.
            </p>
          </div>
        </Section>

        <Section
          title="Copy a pattern into your app"
          description="Patterns are examples, not package exports. Copy one's source in to start from it, then own its layout, sections, copy, and data."
        >
          <div className={playground.stack}>
            <CodeBlock code={ADD_PATTERN} />
            <p className={playground.body}>
              This writes components/patterns/dashboard/ (src/components/patterns/ when the app
              uses src/): the pattern files, dashboard-data.ts with the demo data to replace, and dashboard.contract.json. Kit imports point at
              agentic-ds-kit, so the copy compiles with no edits. Import it from there:
            </p>
            <CodeBlock code={USE_COPY} />
            <p className={playground.body}>
              Use --dir to pick another folder and --force to overwrite. Keep the contract JSON next
              to the files: agents follow its must lines (kit look and accessibility) and treat its
              defaults as suggestions. If the copy renders unstyled, import
              agentic-ds-kit/tokens.css and agentic-ds-kit/layout.css in the root layout. Upgrading the
              kit does not change copied files.
            </p>
            <p className={playground.body}>
              The same command copies chrome recipes: add app-header and add side-nav write
              ShellHeader and ShellNav (the AppHeader and SideNav presets rebuilt from their building
              blocks) to components/chrome/. They work on their own; add app-shell copies the
              layout that can host them.
            </p>
          </div>
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
          title="Fonts"
          description="The kit sets the body font but ships no font files."
        >
          <div className={playground.stack}>
            <p className={playground.body}>
              A kit import sets body font-family to var(--font-sans), with zero specificity so your
              own body rule wins. Without IBM Plex loaded it falls back to system-ui. Load Plex with
              next/font and the variables the tokens read, or override --font-sans in :root.
            </p>
            <CodeBlock code={FONTS} />
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
          description={`Current version is ${VERSION}. Update the package only. Do not recreate the Next app. Skip 0.2.0 — it shipped CSS filenames Next re-scopes.`}
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

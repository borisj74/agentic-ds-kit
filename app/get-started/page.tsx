import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, CodeSnippet, ICON_STROKE } from "agentic-ds-kit";
import { FileText, MessageSquare } from "lucide-react";
import kitPackage from "agentic-ds-kit/package.json";
import styles from "./get-started.module.css";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  ...canonical("/get-started"),
  title: "Get started",
};

// Every command here is in README.md / docs/getting-started.md.
const INSTALL = "npm install agentic-ds-kit@latest";
const IMPORT = `import { Button, Scoreboard } from "agentic-ds-kit";`;
const RULES = `cp node_modules/agentic-ds-kit/AGENTS.md ./AGENTS.md
cp node_modules/agentic-ds-kit/CLAUDE.md ./CLAUDE.md`;
const CLAUDE_MCP = "claude mcp add agentic-ds-kit -- npx -y agentic-ds-kit mcp";
const MCP_JSON = `{
  "mcpServers": {
    "agentic-ds-kit": {
      "command": "npx",
      "args": ["-y", "agentic-ds-kit", "mcp"]
    }
  }
}`;
// Installation details (merged from the old /installation page).
const VERSION = kitPackage.version;
const SMOKE = `import { Button } from "agentic-ds-kit";

export default function Page() {
  return <Button appearance="solid" mode="primary">Save</Button>;
}`;
const FONTS = `import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

// <html className={\`\${geistSans.variable} \${geistMono.variable}\`}>`;
const TOKENS = `import "agentic-ds-kit/tokens.css";`;
const LABELS = `import { KitLabelsProvider } from "agentic-ds-kit";

<KitLabelsProvider labels={{ close: "Schließen", remove: (name) => \`\${name} entfernen\` }}>
  <App />
</KitLabelsProvider>`;
const ADD_PATTERN = `npx agentic-ds-kit add --list
npx agentic-ds-kit add dashboard`;
const USE_COPY = `import { DashboardPattern } from "@/components/patterns/dashboard";`;
const NEW_APP = `mkdir my-app
cd my-app
npx create-next-app@latest . --yes
npm install agentic-ds-kit@latest`;
const SKILL_FILES = `mkdir -p .cursor/skills/prototype-from-kit .claude/skills/prototype-from-kit
cp node_modules/agentic-ds-kit/skills/prototype-from-kit/SKILL.md .cursor/skills/prototype-from-kit/
cp node_modules/agentic-ds-kit/skills/prototype-from-kit/SKILL.md .claude/skills/prototype-from-kit/`;

const PROMPT =
  "Build a billing settings page with the kit. Use the settings pattern and stop if a part is missing.";

const STEPS = [
  { id: "install", title: "Install the package" },
  { id: "rules", title: "Give your agent the rules" },
  { id: "mcp", title: "Connect the MCP server" },
  { id: "prompt", title: "Ask for a screen" },
] as const;

function Step({ index, id, title, children }: { index: number; id: string; title: string; children: React.ReactNode }) {
  return (
    <li className={styles.step} aria-labelledby={`step-${id}`}>
      <span className={index === 0 ? `${styles.marker} ${styles.markerFirst}` : styles.marker} aria-hidden="true">
        {index + 1}
      </span>
      <div className={styles.stepBody}>
        <h2 id={`step-${id}`} className={styles.stepTitle}>
          <span className={styles.srOnly}>Step {index + 1}: </span>
          {title}
        </h2>
        {children}
      </div>
    </li>
  );
}

export default function GetStartedPage() {
  return (
    <div className={styles.page}>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Get started" }]} />
      <header className={styles.header}>
        <h1 className={styles.title}>Get started</h1>
        <p className={styles.lede}>
          Set up nistha in three steps: install the package, give your agent the rules, connect the MCP server. Then ask
          for a screen. The package is <code className={styles.code}>agentic-ds-kit</code>.
        </p>
      </header>

      <ol className={styles.steps}>
        <Step index={0} {...STEPS[0]}>
          <p className={styles.text}>Components, tokens and contracts ship in one package. Tokens load with the first import.</p>
          <CodeSnippet title="Terminal" language="bash" code={INSTALL} />
          <CodeSnippet title="app/page.tsx" language="tsx" code={IMPORT} />
        </Step>

        <Step index={1} {...STEPS[1]}>
          <p className={styles.text}>
            Copy these two files from the package into your app root. Claude Code and Cursor load them on every run.
          </p>
          <ul className={`layout-split ${styles.files}`}>
            <li className={styles.file}>
              <FileText size={16} strokeWidth={ICON_STROKE} aria-hidden="true" className={styles.fileIcon} />
              <span>
                <span className={styles.fileName}>AGENTS.md</span>
                <span className={styles.fileNote}>Kit rules for any agent</span>
              </span>
            </li>
            <li className={styles.file}>
              <FileText size={16} strokeWidth={ICON_STROKE} aria-hidden="true" className={styles.fileIcon} />
              <span>
                <span className={styles.fileName}>CLAUDE.md</span>
                <span className={styles.fileNote}>Points Claude Code at AGENTS.md</span>
              </span>
            </li>
          </ul>
          <CodeSnippet title="Terminal" language="bash" code={RULES} />
        </Step>

        <Step index={2} {...STEPS[2]}>
          <p className={styles.text}>
            A read-only server that answers from the version you installed: contracts, tokens and patterns.
          </p>
          <p className={styles.text}>
            Clients with Skills over MCP, such as Claude Code, also get the prototype-from-kit skill from the server, so
            you don&apos;t need to copy it.
          </p>
          <CodeSnippet
            title="MCP setup"
            tabs={[
              { label: "Claude Code", language: "bash", code: CLAUDE_MCP },
              { label: "Cursor", language: ".cursor/mcp.json", code: MCP_JSON },
              { label: "Other MCP clients", language: "json", code: MCP_JSON },
            ]}
          />
          <p className={styles.more}>
            Tools and what they return: <Link href="/mcp">MCP server</Link>.
          </p>
        </Step>

        <Step index={3} {...STEPS[3]}>
          <blockquote className={styles.prompt}>
            <MessageSquare size={16} strokeWidth={ICON_STROKE} aria-hidden="true" className={styles.promptIcon} />
            <p>“{PROMPT}”</p>
          </blockquote>
          <p className={styles.more}>
            Next.js setup, fonts, patterns and upgrades: <Link href="#installation">installation details</Link>.
          </p>
        </Step>
      </ol>

      <section className={styles.details} aria-labelledby="installation">
        <div className={styles.stepBody}>
          <h2 id="installation" className={styles.stepTitle}>
            Installation details
          </h2>
          <p className={styles.text}>
            Current version is {VERSION}. The package is ESM-only, needs React 19 and supports Next.js 15 or later. You
            do not clone this repo and you do not need transpilePackages. AppNav uses next/link, so Next is an optional
            peer for that component only.
          </p>
        </div>

        <div className={styles.stepBody}>
          <h3 className={styles.topicTitle}>Check the install</h3>
          <p className={styles.text}>
            Render a primary Button. It should look like the kit primary, not a default browser control. Importing from
            the package loads tokens and pattern layout classes.
          </p>
          <CodeSnippet title="app/page.tsx" language="tsx" code={SMOKE} />
          <p className={styles.text}>
            The package exports components only. Read contracts/index.json in the package, then import the matching
            component. Compose them into any layout: top bar only, side nav only, both, or neither. Keep page content in
            a main landmark and the nav reachable on small screens.
          </p>
        </div>

        <div className={styles.stepBody}>
          <h3 className={styles.topicTitle}>Fonts</h3>
          <p className={styles.text}>
            The kit sets the body font but ships no font files. A kit import sets body font-family to var(--font-sans),
            with zero specificity so your own body rule wins. Without Geist loaded it falls back to system-ui. Load the
            variable Geist (no weight list, so headings get a true 550) with next/font and the variables the tokens
            read, or override --font-sans in :root.
          </p>
          <CodeSnippet title="app/layout.tsx" language="tsx" code={FONTS} />
        </div>

        <div className={styles.stepBody}>
          <h3 className={styles.topicTitle}>Tokens in your CSS</h3>
          <p className={styles.text}>
            Only needed if your own stylesheets use kit variables before any kit component is imported. Importing tokens
            twice is harmless.
          </p>
          <CodeSnippet title="app/layout.tsx" language="tsx" code={TOKENS} />
          <p className={styles.more}>
            Dark mode and brand color: <Link href="/theming">Theming</Link>.
          </p>
        </div>

        <div className={styles.stepBody}>
          <h3 className={styles.topicTitle}>Translate built-in labels</h3>
          <p className={styles.text}>
            Close buttons, pager arrows and picker panels name themselves for screen readers, in English by default.
            Pass only the keys you want to change; the rest stay English.
          </p>
          <CodeSnippet title="app/providers.tsx" language="tsx" code={LABELS} />
          <p className={styles.text}>
            The full list is the KitLabels type and DEFAULT_KIT_LABELS. A component&apos;s own ariaLabel prop still wins.
            Breadcrumb and Field take ariaLabel and helpLabel props instead, so they stay server-rendered.
          </p>
        </div>

        <div className={styles.stepBody}>
          <h3 className={styles.topicTitle}>Copy a pattern into your app</h3>
          <p className={styles.text}>
            Patterns are examples, not package exports. Copy one in to start from it, then own its layout, sections,
            copy and data.
          </p>
          <CodeSnippet title="Terminal" language="bash" code={ADD_PATTERN} />
          <p className={styles.text}>
            This writes components/patterns/dashboard/ (src/components/patterns/ when the app uses src/): the pattern
            files, dashboard-data.ts with the demo data to replace, and dashboard.contract.json. Kit imports point at
            agentic-ds-kit, so the copy compiles with no edits.
          </p>
          <CodeSnippet title="app/page.tsx" language="tsx" code={USE_COPY} />
          <p className={styles.text}>
            Use --dir to pick another folder and --force to overwrite. Keep the contract JSON next to the files: agents
            follow its must lines and treat its defaults as suggestions. If the copy renders unstyled, import
            agentic-ds-kit/tokens.css and agentic-ds-kit/layout.css in the root layout. Upgrading the kit does not
            change copied files. add app-header and add side-nav copy the ShellHeader and ShellNav chrome recipes to
            components/chrome/; add app-shell copies the layout that can host them.
          </p>
        </div>

        <div className={styles.stepBody}>
          <h3 className={styles.topicTitle}>Start from an empty folder</h3>
          <p className={styles.text}>The kit is not an app. Scaffold Next first.</p>
          <CodeSnippet title="Terminal" language="bash" code={NEW_APP} />
        </div>

        <div className={styles.stepBody}>
          <h3 className={styles.topicTitle}>Agent skill</h3>
          <p className={styles.text}>
            Optional. Copy the prototype-from-kit skill next to the rules files. For Cursor rules, add
            .cursor/rules/kit.mdc with the same lines as AGENTS.md.
          </p>
          <CodeSnippet title="Terminal" language="bash" code={SKILL_FILES} />
        </div>

        <div className={styles.stepBody}>
          <h3 className={styles.topicTitle}>Upgrade from 0.1.0</h3>
          <p className={styles.text}>
            Run the install command again. Do not recreate the Next app, and skip 0.2.0 (it shipped CSS filenames Next
            re-scopes). Remove transpilePackages for this kit if you added it, and re-copy the agent files from
            node_modules if they changed.
          </p>
        </div>
      </section>
    </div>
  );
}

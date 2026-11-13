import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, CodeSnippet, ICON_STROKE } from "agentic-ds-kit";
import { FileText, MessageSquare } from "lucide-react";
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
            Next.js setup, fonts, patterns and upgrades: <Link href="/installation">the full install guide</Link>.
          </p>
        </Step>
      </ol>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { CircleCheck } from "lucide-react";
import { Button, CodeSnippet, ICON_STROKE, Tag } from "agentic-ds-kit";
import styles from "./Home.module.css";

const MCP_COMMAND = "claude mcp add agentic-ds-kit -- npx -y agentic-ds-kit mcp";

const INSTALL = "npm install agentic-ds-kit\nnpx agentic-ds-kit init";

/** The three MCP calls the agent makes for the example prompt. */
const CALLS = [
  { tool: "search_components", result: '"approval" → ApprovalCard' },
  { tool: "get_component", result: "ApprovalCard → contract, props, must" },
  { tool: "review_ui", result: "app/deploy/page.tsx → 0 errors" },
];

const TOOLS = [
  { name: "Claude", src: "/brand/tools/claude.svg" },
  { name: "ChatGPT", src: "/brand/tools/chatgpt.svg" },
  { name: "Cursor", src: "/brand/tools/cursor.svg" },
  { name: "v0", src: "/brand/tools/v0.svg" },
];

/**
 * How an agent uses the kit (Paper Home J): one prompt, three MCP calls and the reply on the
 * left; connecting in one line on the right; then installing by hand.
 */
export function HomeAgents() {
  const router = useRouter();

  return (
    <div className={styles.agents}>
      <div className={styles.agentPanels}>
        <div className={styles.agentPanel}>
          <p className={styles.agentPrompt}>Add an approval step before the deploy runs</p>
          <ul className={styles.agentCalls} aria-label="What the agent did">
            {CALLS.map((call) => (
              <li key={call.tool} className={styles.agentCall}>
                <CircleCheck className={styles.agentCheck} size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
                <code className={styles.agentTool}>{call.tool}</code>
                <span className={styles.agentResult}>{call.result}</span>
              </li>
            ))}
          </ul>
          <p className={styles.agentReply}>
            Added an ApprovalCard above the deploy button. It shows the exact command and waits for your yes. Tokens only, no hex,
            and the review came back clean.
          </p>
        </div>
        <div className={styles.agentPanel}>
          <p className={styles.agentTitle}>Connect in one line</p>
          <CodeSnippet code={MCP_COMMAND} wrap ariaLabel="Command to add the MCP server" />
          <p className={styles.agentNote}>
            Any MCP client works. Answers come from the kit version you installed, so they match your code. Prefer files? AGENTS.md
            ships in the package.
          </p>
          <div className={styles.worksWith}>
            <span className={styles.overline}>Works with</span>
            <div className={styles.tagRow}>
              {TOOLS.map((tool) => (
                <Tag key={tool.name} size="lg" avatar={{ name: tool.name, src: tool.src }}>
                  {tool.name}
                </Tag>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.install}>
        <div className={styles.installRow}>
          <span className={styles.installLabel}>Or install it yourself</span>
          <div className={styles.installSnippet}>
            <CodeSnippet code={INSTALL} ariaLabel="Commands to install the kit" />
          </div>
        </div>
        <Button size="lg" appearance="soft" iconEnd="ArrowRight" onClick={() => router.push("/get-started")}>
          Read the getting started guide
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { Button, Card, CodeSnippet, Tag, ToolCallCard } from "agentic-ds-kit";
import styles from "./Home.module.css";

const MCP_COMMAND = "claude mcp add agentic-ds-kit -- npx -y agentic-ds-kit mcp";

const INSTALL = "npm install agentic-ds-kit\nnpx agentic-ds-kit init";

const TOOLS = ["Claude", "ChatGPT", "Cursor", "v0"];

/** How an agent uses the kit: one prompt, three MCP calls, then how to connect or install. */
export function HomeAgents() {
  const router = useRouter();

  return (
    <div className={styles.agents}>
      <div className="layout-split">
        <Card title="Add an approval step before the deploy runs" description="What you ask">
          <div className={styles.agentRun}>
            <ToolCallCard name="search_components" summary={'"approval" → ApprovalCard'} />
            <ToolCallCard name="get_component" summary="ApprovalCard → contract, props, must" />
            <ToolCallCard name="review_ui" summary="app/deploy/page.tsx → 0 errors" />
            <p className={styles.agentReply}>
              Added an ApprovalCard above the deploy button. It shows the exact command and waits for your yes. Tokens only, no hex,
              and the review came back clean.
            </p>
          </div>
        </Card>
        <Card title="Connect in one line">
          <div className={styles.agentRun}>
            <CodeSnippet code={MCP_COMMAND} wrap ariaLabel="Command to add the MCP server" />
            <p className={styles.agentNote}>
              Any MCP client works. Answers come from the kit version you installed, so they match your code. Prefer files? AGENTS.md
              ships in the package.
            </p>
            <div className={styles.worksWith}>
              <span className={styles.overline}>Works with</span>
              <div className={styles.tagRow}>
                {TOOLS.map((tool) => (
                  <Tag key={tool} size="sm">
                    {tool}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
      <div className={styles.install}>
        <span className={styles.installLabel}>Or install it yourself</span>
        <div className={styles.installSnippet}>
          <CodeSnippet code={INSTALL} ariaLabel="Commands to install the kit" />
        </div>
        <Button size="lg" appearance="soft" iconEnd="ArrowRight" onClick={() => router.push("/get-started")}>
          Read the getting started guide
        </Button>
      </div>
    </div>
  );
}

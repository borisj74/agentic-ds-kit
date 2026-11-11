"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Button, Divider, DropdownMenu, Toast, Tooltip } from "agentic-ds-kit";
import { ChatGptMark, ClaudeMark, CursorMark, V0Mark } from "./ToolLogos";
import styles from "./CopyPromptBar.module.css";

type PromptKind = "default" | "cursor";

/** Past this the tool's query string gets unreliable: copy in full, open the tool bare, say to paste. */
const MAX_OPEN_URL = 6000;

interface PromptTool {
  id: string;
  name: string;
  /** Which prompt this tool gets: Cursor takes the @-mention variant. */
  target: PromptKind;
  /** The tool's new-chat URL, and the query param it prefills from. */
  base: string;
  param: string;
  /** The tool's mark, sized for a logo button (20) or a menu row (16). */
  Mark: (props: { size?: number }) => ReactElement;
  /** Row label in the mobile menu. */
  menuLabel: string;
}

const PROMPT_TOOLS: PromptTool[] = [
  { id: "claude", name: "Claude", target: "default", base: "https://claude.ai/new", param: "q", Mark: ClaudeMark, menuLabel: "Claude" },
  {
    id: "chatgpt",
    name: "ChatGPT",
    target: "default",
    base: "https://chatgpt.com/",
    param: "q",
    Mark: ChatGptMark,
    menuLabel: "ChatGPT / Codex",
  },
  {
    id: "cursor",
    name: "Cursor",
    target: "cursor",
    base: "https://cursor.com/link/prompt",
    param: "text",
    Mark: CursorMark,
    menuLabel: "Cursor",
  },
  { id: "v0", name: "v0", target: "default", base: "https://v0.app/chat", param: "q", Mark: V0Mark, menuLabel: "v0" },
];

/** The URL a tool button opens: the prompt in the query, or the bare tool when that would run too long. */
function promptToolUrl(tool: Pick<PromptTool, "base" | "param">, prompt: string): { url: string; prefilled: boolean } {
  const url = `${tool.base}?${tool.param}=${encodeURIComponent(prompt)}`;
  return url.length > MAX_OPEN_URL ? { url: tool.base, prefilled: false } : { url, prefilled: true };
}

interface Notice {
  key: number;
  title: string;
  description?: string;
}

export interface CopyPromptBarProps {
  /** The prompt for Claude, ChatGPT, v0 and the plain Copy button. */
  prompt: string;
  /** Cursor's variant (paths as @-mentions). Defaults to `prompt`. */
  cursorPrompt?: string;
  /** Copy is the view's one solid primary. Pass false when something else on the view holds it. */
  solid?: boolean;
  /** Names the group for assistive tech. */
  ariaLabel?: string;
  className?: string;
}

/**
 * Copy a prompt, or copy it and open Claude, ChatGPT, Cursor or v0 with it prefilled; MCP links
 * to the setup page. Wide: a row of logo buttons, a divider, Copy. Below md: one Copy split button
 * whose chevron menu holds the tools. Used by component pages and pattern pages.
 */
export function CopyPromptBar({
  prompt,
  cursorPrompt,
  solid = true,
  ariaLabel = "Copy prompt",
  className,
}: CopyPromptBarProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  function promptFor(kind: PromptKind): string {
    return kind === "cursor" ? (cursorPrompt ?? prompt) : prompt;
  }

  async function writePrompt(kind: PromptKind): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(promptFor(kind));
      return true;
    } catch {
      return false;
    }
  }

  async function copy() {
    const ok = await writePrompt("default");
    setCopied(ok);
    if (ok) window.setTimeout(() => setCopied(false), 1600);
  }

  function openIn(tool: PromptTool) {
    const { url, prefilled } = promptToolUrl(tool, promptFor(tool.target));
    // Open first, inside the click, so pop-up blockers see a user gesture; the copy follows.
    window.open(url, "_blank", "noopener,noreferrer");
    void writePrompt(tool.target).then((ok) => {
      setNotice({
        key: Date.now(),
        title: ok ? `Prompt copied, opening ${tool.name}…` : `Opening ${tool.name}…`,
        description: !ok
          ? "The clipboard was blocked. Use Copy to try again."
          : prefilled
            ? undefined
            : `The prompt is too long to prefill. Paste it into ${tool.name}.`,
      });
    });
  }

  function onMenuSelect(itemId: string) {
    const tool = PROMPT_TOOLS.find((item) => item.id === itemId);
    if (tool) openIn(tool);
  }

  const appearance = solid ? "solid" : "outline";
  const mode = solid ? "primary" : "neutral";

  return (
    <div className={[styles.copy, className].filter(Boolean).join(" ")} role="group" aria-label={ariaLabel}>
      {/* Wide screens: a row of logo buttons. Below md they move into the Copy split button's menu. */}
      <div className={styles.copyTools}>
        {PROMPT_TOOLS.map((tool) => {
          const label = `Copy prompt and open in ${tool.name}`;
          return (
            <Tooltip key={tool.id} content={label} placement="bottom">
              <Button
                size="md"
                appearance="outline"
                mode="neutral"
                className={styles.copyTool}
                iconStart={<tool.Mark />}
                ariaLabel={label}
                onClick={() => openIn(tool)}
              />
            </Tooltip>
          );
        })}
        <Tooltip content="Connect the Nistha MCP server" placement="bottom">
          <Button
            size="md"
            appearance="outline"
            mode="neutral"
            className={styles.copyToolText}
            ariaLabel="Connect the Nistha MCP server"
            onClick={() => router.push("/mcp")}
          >
            MCP
          </Button>
        </Tooltip>
        <Divider orientation="vertical" className={styles.copyDivider} />
      </div>
      {/* One split control: Copy, and (below md) its menu of tools. Same appearance on both halves. */}
      <div className={styles.copySplit}>
        <Tooltip content="Copy prompt" placement="bottom">
          <Button
            size="md"
            appearance={appearance}
            mode={mode}
            className={styles.copyMain}
            iconStart={copied ? "Check" : "Copy"}
            onClick={() => void copy()}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </Tooltip>
        <DropdownMenu
          className={styles.copyMenu}
          ariaLabel="Copy prompt and open in"
          iconStart="ChevronDown"
          appearance={appearance}
          mode={mode}
          size="md"
          align="end"
          onSelect={onMenuSelect}
          groups={[
            {
              heading: "Copy prompt and open in",
              items: [
                ...PROMPT_TOOLS.map((tool) => ({
                  id: tool.id,
                  label: tool.menuLabel,
                  icon: <tool.Mark size={16} />,
                })),
                {
                  id: "mcp",
                  label: "Connect the MCP server",
                  icon: (
                    <span className={styles.mcpMark} aria-hidden="true">
                      MCP
                    </span>
                  ),
                  href: "/mcp",
                },
              ],
            },
          ]}
        />
      </div>
      <span className={styles.srOnly} role="status">
        {copied ? "Prompt copied to the clipboard" : ""}
      </span>
      {notice ? (
        <Toast
          key={notice.key}
          open
          status="success"
          title={notice.title}
          description={notice.description}
          onClose={() => setNotice(null)}
        />
      ) : null}
    </div>
  );
}


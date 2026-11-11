"use client";

import { useMemo, useState, useSyncExternalStore, type ReactElement, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button, CodeSnippet, Divider, Tabs, Toast, Tooltip } from "agentic-ds-kit";
import {
  componentPrompt,
  contractJson,
  contractSnippet,
  importLine,
  variantProps,
  type PromptTarget,
} from "@/lib/component-contract";
import { readPatternTheme, subscribeTheme } from "@/lib/theme-store";
import { PRESETS, clampRadius, type ThemeState } from "@/lib/theme-playground";
import { PreviewScope } from "../_components/ThemeScope";
import { useCustomizeOpen } from "../_components/useCustomizeOpen";
import { GalleryPreview } from "./GalleryPreview";
import { DocViewProvider } from "./DocView";
import { VariantGrid } from "./VariantGrid";
import { ChatGptMark, ClaudeMark, CursorMark, V0Mark } from "./ToolLogos";
import docStyles from "./ComponentDoc.module.css";
import styles from "./ComponentPage.module.css";

type StageTab = "preview" | "variants" | "code" | "contract";

function themeLabel(theme: ThemeState): string {
  const preset = PRESETS.find((item) => item.id === theme.preset)?.label ?? "Custom";
  const shadow = theme.shadowPreset === "none" || theme.shadowPreset === "flat" ? "Flat" : theme.shadowPreset === "subtle" ? "Soft" : "Raised";
  return `${preset} · r${clampRadius(theme.radius)} · ${shadow}${theme.mode === "dark" ? " · Dark" : ""}`;
}

function StageThemeLabel() {
  const theme = useSyncExternalStore(subscribeTheme, readPatternTheme, () => null);
  if (!theme || theme.preset === "nistha") return null;
  return <p className={styles.themeLabel}>{themeLabel(theme)}</p>;
}

/** Past this the tool's query string gets unreliable: copy in full, open the tool bare, say to paste. */
const MAX_OPEN_URL = 6000;

interface PromptTool {
  id: string;
  name: string;
  /** Which of the site's prompts this tool gets. */
  target: PromptTarget;
  /** The tool's new-chat URL, and the query param it prefills from. */
  base: string;
  param: string;
  mark: ReactElement;
}

const PROMPT_TOOLS: PromptTool[] = [
  { id: "claude", name: "Claude", target: "claude-code", base: "https://claude.ai/new", param: "q", mark: <ClaudeMark /> },
  { id: "chatgpt", name: "ChatGPT", target: "claude-code", base: "https://chatgpt.com/", param: "q", mark: <ChatGptMark /> },
  {
    id: "cursor",
    name: "Cursor",
    target: "cursor",
    base: "https://cursor.com/link/prompt",
    param: "text",
    mark: <CursorMark />,
  },
  { id: "v0", name: "v0", target: "claude-code", base: "https://v0.app/chat", param: "q", mark: <V0Mark /> },
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

function CopyPrompt({ id }: { id: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const customize = useCustomizeOpen(pathname);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  async function writePrompt(target: PromptTarget): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(componentPrompt(id, target));
      return true;
    } catch {
      return false;
    }
  }

  async function copy() {
    const ok = await writePrompt("claude-code");
    setCopied(ok);
    if (ok) window.setTimeout(() => setCopied(false), 1600);
  }

  function openIn(tool: PromptTool) {
    const prompt = componentPrompt(id, tool.target);
    const { url, prefilled } = promptToolUrl(tool, prompt);
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

  // One solid primary per view: while the docked Theme panel shows its own, this one steps back.
  const solid = !customize.docked;

  return (
    <div className={styles.copy} role="group" aria-label="Copy prompt">
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
                iconStart={tool.mark}
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
      </div>
      <Divider orientation="vertical" className={styles.copyDivider} />
      <Tooltip content="Copy prompt" placement="bottom" className={styles.copyMainWrap}>
        <Button
          size="md"
          appearance={solid ? "solid" : "outline"}
          mode={solid ? "primary" : "neutral"}
          className={styles.copyMain}
          iconStart={copied ? "Check" : "Copy"}
          onClick={() => void copy()}
        >
          {copied ? "Copied" : "Copy"}
        </Button>
      </Tooltip>
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

/**
 * Preview / Variants / Code / Contract for one component, plus the Copy prompt row (open in Claude, ChatGPT, Cursor, v0; MCP; Copy).
 * `doc` is the component's own doc: Preview shows its master render, Variants its variant
 * sections (VariantGrid), so both tabs show the component the same way.
 */
export function ComponentStage({ id, doc }: { id: string; doc?: ReactNode }) {
  const [tab, setTab] = useState<StageTab>("preview");
  const propsForChips = useMemo(() => variantProps(id), [id]);
  const snippet = contractSnippet(id);
  const code = snippet ? `${importLine(id)}\n\n${snippet}` : importLine(id);

  return (
    <section className={styles.stageWrap} aria-label="Preview">
      {/* Same tab bar as the rest of the site: kit Tabs, segmented, sm. */}
      <Tabs
        variant="segmented"
        size="sm"
        ariaLabel="Preview, variants, code or contract"
        value={tab}
        onChange={(value) => setTab(value as StageTab)}
        items={[
          {
            id: "preview",
            label: "Preview",
            content: doc ? (
              // The doc's own master render, the same view the Variants tab uses.
              <PreviewScope className={`${docStyles.examplesHost} ${docStyles.previewHost}`}>
                <StageThemeLabel />
                <DocViewProvider mode="preview">{doc}</DocViewProvider>
              </PreviewScope>
            ) : (
              <PreviewScope className={styles.stage}>
                <StageThemeLabel />
                <div className={styles.stageInner}>
                  <GalleryPreview id={id} />
                </div>
              </PreviewScope>
            ),
          },
          ...(doc
            ? [
                {
                  id: "variants",
                  label: "Variants",
                  content: (
                    <PreviewScope className={`${docStyles.examplesHost} ${docStyles.variantsHost} ${styles.variants}`}>
                      <VariantGrid props={propsForChips}>{doc}</VariantGrid>
                    </PreviewScope>
                  ),
                },
              ]
            : []),
          {
            id: "code",
            label: "Code",
            content: <CodeSnippet code={code} language="tsx" title={`${id}.tsx`} wrap />,
          },
          {
            id: "contract",
            label: "Contract",
            content: (
              <CodeSnippet code={contractJson(id)} language="json" title={`contracts/${id}.json`} maxHeight="24rem" />
            ),
          },
        ]}
      />
      <CopyPrompt id={id} />
    </section>
  );
}

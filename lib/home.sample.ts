import type { AccordionItem, LinkListItem } from "agentic-ds-kit";

/**
 * Example data for the docs home page (app/page.tsx). Fake names and numbers, the same story the
 * component docs tell: one agent refactoring a billing service.
 */

export const HOME_FAQ: AccordionItem[] = [
  {
    id: "agent",
    title: "Do I have to use a specific coding agent?",
    content:
      "No. Any agent that can read files or call an MCP server works. The contracts are plain JSON, so the agent reads the same rules you do.",
  },
  {
    id: "contract",
    title: "What is a contract?",
    content:
      "A JSON file per component: its props, the states it must handle, the tokens it uses and when to pick it over a neighbour. Agents read it before they write a line.",
  },
  {
    id: "brand",
    title: "Can I use my own brand colours and type?",
    content:
      "Yes. Every part reads semantic tokens, so you change the tokens, not the components. The Theme panel exports a CSS file you drop into your app.",
  },
  {
    id: "without",
    title: "Does it work without an agent?",
    content:
      "Yes. It is a normal React component library with tokens and layout classes. The contracts double as documentation for people.",
  },
  {
    id: "needs",
    title: "What does it need to run?",
    content: "React 19 and a bundler that handles CSS imports, such as Next.js 15 or later or Vite. Tokens load with the first import.",
  },
  {
    id: "license",
    title: "How is it licensed?",
    content: "MIT. Use it in personal and commercial work.",
  },
];

const GITHUB = "https://github.com/borisj74/agentic-ds-kit";

export const FOOTER_COLUMNS: { label: string; items: LinkListItem[] }[] = [
  {
    label: "Kit",
    items: [
      { id: "components", label: "Components", href: "/components" },
      { id: "blocks", label: "Blocks", href: "/blocks" },
      { id: "patterns", label: "Patterns", href: "/patterns" },
      { id: "tokens", label: "Tokens", href: "/foundations" },
    ],
  },
  {
    label: "For agents",
    items: [
      { id: "mcp", label: "MCP server", href: "/mcp" },
      { id: "agents", label: "AGENTS.md", href: "/get-started" },
      { id: "review", label: "review and inspect", href: "/contract-fit" },
      { id: "questions", label: "Questions list", href: `${GITHUB}/blob/main/docs/questions.md`, external: true },
    ],
  },
  {
    label: "Project",
    items: [
      { id: "start", label: "Getting started", href: "/get-started" },
      { id: "changelog", label: "Changelog", href: `${GITHUB}/blob/main/CHANGELOG.md`, external: true },
      { id: "github", label: "GitHub", href: GITHUB, external: true },
      { id: "npm", label: "npm", href: "https://www.npmjs.com/package/agentic-ds-kit", external: true },
    ],
  },
];

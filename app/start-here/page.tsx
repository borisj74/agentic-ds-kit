import type { Metadata } from "next";
import NextLink from "next/link";
import { Breadcrumb, Card, CodeSnippet, Link, Section } from "agentic-ds-kit";
import { canonical } from "@/lib/site";
import { CodeBlock } from "../components/CodeBlock";
import playground from "../playground.module.css";

export const metadata: Metadata = {
  ...canonical("/start-here"),
  title: "Start here",
  description: "For product managers and designers: start a new app from a working screen and change it by asking Claude or Cursor.",
};

/** Starting screens for `init --template`. Ids match patterns-src/index.json; links go to each pattern's docs page. */
const SCREENS = [
  { id: "dashboard", title: "Dashboard", line: "An overview page with key numbers, a chart and a task table." },
  { id: "list-detail", title: "List detail", line: "A list of items on one side and the details of the picked one." },
  { id: "settings-form", title: "Settings form", line: "A form with grouped fields and Save and Cancel." },
  { id: "empty-first-run", title: "Empty first run", line: "What a new user sees before there is any data." },
  { id: "sign-in", title: "Sign in", line: "A sign-in and sign-up card with email and password." },
  { id: "onboarding", title: "Onboarding", line: "A few guided setup steps after someone signs up." },
  { id: "settings", title: "Settings", line: "Profile, billing, team, notifications and security pages." },
  { id: "app-shell", title: "App shell", line: "A side menu around an empty page, ready for your own screens." },
] as const;

const INIT = "npx agentic-ds-kit init my-app --template dashboard";
const RUN = "cd my-app\nnpm install\nnpm run dev";

const PROMPTS = [
  "Rename the dashboard to “Sales this quarter” and show revenue, new customers and churn as the three numbers at the top.",
  "Add a Customers page with a table of name, plan, status and last login, and link to it from the dashboard.",
  "Make the task table show only overdue tasks, and add a button to mark a task as done.",
];

/** Same order and names as `level` in the kit contracts, biggest first. */
const WORDS = [
  { word: "Template", line: "A whole starting screen, like the dashboard. In the files it is called a pattern." },
  { word: "Block", line: "A large ready-made area of a screen, such as a billing summary." },
  { word: "Organism", line: "A complete part of a page, such as a table, a side menu or a chart." },
  { word: "Molecule", line: "A few small pieces that work together, such as a form field with its label." },
  { word: "Atom", line: "The smallest piece, such as a button, a checkbox or a badge." },
];

const ENGINEER = [
  { title: "Installing", line: "If npm install or npm run dev shows errors you can't fix by asking Claude or Cursor." },
  { title: "Deploying", line: "Putting the app on the internet so other people can open it." },
  { title: "Connecting real data", line: "Replacing the sample numbers with data from your product, sign-in, or payments." },
];

/** For product managers and designers: start a new app from a working screen, then change it in plain words. */
export default function StartHerePage() {
  return (
    <div className={playground.page}>
      <div className={playground.shell}>
        <div className={playground.stack}>
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Start here" }]} />
          <h1 className={playground.pageTitle}>Start here</h1>
        </div>
        <p className={playground.pageLead}>
          Nistha is a set of ready-made screens and parts for building app pages. It also comes with written rules, so
          Claude and Cursor build pages that look and work the same way every time.
        </p>

        <div className={playground.stack}>
          <Section title="1. Pick a starting screen" description="Each one is a working page you can change. Open one to see it first.">
            {/* layout-metrics: as many columns as fit, one column on a phone. */}
            <div className="layout-metrics">
              {SCREENS.map((screen) => (
                <Card key={screen.id} size="sm" title={screen.title} description={screen.line}>
                  <Link href={`/patterns/${screen.id}`} linkAs={NextLink} variant="standalone">
                    {`See ${screen.title.toLowerCase()}`}
                  </Link>
                </Card>
              ))}
            </div>
          </Section>

          <Section
            title="2. Make the app"
            description="In Terminal, run this with the name of your screen after --template (dashboard, sign-in, …). Your computer needs Node.js 20 or later."
          >
            <div className={playground.stack}>
              <CodeBlock code={INIT} label="Make the app" />
              <p className={playground.body}>Then open it on your computer at http://localhost:3000:</p>
              <CodeBlock code={RUN} label="Run the app" />
            </div>
          </Section>

          <Section
            title="3. Ask for changes in your own words"
            description="Open the my-app folder in Claude or Cursor and say what you want. The app already holds the rules they follow."
          >
            <div className={playground.stack}>
              {PROMPTS.map((prompt, index) => (
                <CodeSnippet key={prompt} code={prompt} ariaLabel={`Example request ${index + 1}`} wrap />
              ))}
            </div>
          </Section>

          <Section title="Words we use" description="Pieces from biggest to smallest. Claude and Cursor start from the biggest piece that fits.">
            <div className="layout-metrics">
              {WORDS.map((item) => (
                <Card key={item.word} size="sm" title={item.word}>
                  <p className={playground.body}>{item.line}</p>
                </Card>
              ))}
            </div>
          </Section>

          <Section title="When to ask an engineer" description="You can do the steps above on your own. Get help for these.">
            <div className="layout-metrics">
              {ENGINEER.map((item) => (
                <Card key={item.title} size="sm" title={item.title}>
                  <p className={playground.body}>{item.line}</p>
                </Card>
              ))}
            </div>
          </Section>

          <Link href="/get-started" linkAs={NextLink} variant="standalone">
            Setting up Nistha in an existing app? Read Get started
          </Link>
        </div>
      </div>
    </div>
  );
}

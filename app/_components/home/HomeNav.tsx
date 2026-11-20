"use client";

import { useState } from "react";
import { AppHeader, Button, Drawer, LinkList, NavigationMenu } from "agentic-ds-kit";
import { NisthaLogo } from "../NisthaLogo";
import styles from "./Home.module.css";

const GITHUB_URL = "https://github.com/borisj74/agentic-ds-kit";

/** The landing page's top links, as in Paper. Each opens a docs page with the sidebar. */
const LINKS = [
  { id: "components", label: "Components", href: "/components" },
  { id: "blocks", label: "Blocks", href: "/blocks" },
  { id: "patterns", label: "Patterns", href: "/patterns" },
  { id: "tokens", label: "Tokens", href: "/foundations" },
  { id: "mcp", label: "MCP", href: "/mcp" },
];

/**
 * The landing page's own top bar (Paper Home J): wordmark, site links, version and GitHub. It
 * replaces the docs chrome on / only. On narrow screens the links move into a kit Drawer.
 */
export function HomeNav({ version }: { version: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AppHeader
        className={styles.nav}
        ariaLabel="Nistha"
        start={<NisthaLogo />}
        search={false}
        center={
          <span className={styles.navLinks}>
            <NavigationMenu aria-label="Site" items={LINKS} />
          </span>
        }
        end={
          <span className={styles.navEnd}>
            <span className={styles.navVersion}>{`v${version}`}</span>
            <span className={styles.navGithub}>
              <Button size="sm" appearance="outline" mode="neutral" shape="pill" onClick={() => window.open(GITHUB_URL, "_blank", "noopener")}>
                GitHub
              </Button>
            </span>
            <span className={styles.navMenu}>
              <Button
                size="lg"
                appearance="ghost"
                mode="neutral"
                iconStart="Menu"
                ariaLabel="Open navigation"
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={() => setOpen(true)}
              />
            </span>
          </span>
        }
      />
      <Drawer open={open} title="Navigation" side="left" size="sm" onClose={() => setOpen(false)}>
        {open ? (
          <LinkList
            label="Site"
            items={[...LINKS, { id: "github", label: "GitHub", href: GITHUB_URL, external: true }]}
          />
        ) : null}
      </Drawer>
    </>
  );
}

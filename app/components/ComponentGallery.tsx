"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Breadcrumb, Card, Empty, Input, Tabs } from "agentic-ds-kit";
import { filterGalleryItems, galleryGroups, type GalleryFilter, type GalleryItem } from "@/lib/component-gallery";
import { PreviewScope } from "../_components/ThemeScope";
import { GalleryPreview } from "./GalleryPreview";
import styles from "./ComponentGallery.module.css";

const SCENE_WIDTH = 288;
const SCENE_HEIGHT = 144;
const GROUPS = galleryGroups();
const TOTAL = GROUPS[0].count;

function FitPreview({ children }: { children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const fit = () => {
      if (frame.clientWidth < 8 || frame.clientHeight < 8) return;
      const next = Math.min(1, frame.clientWidth / SCENE_WIDTH, frame.clientHeight / SCENE_HEIGHT);
      setScale((current) => (Math.abs(current - next) < 0.01 ? current : next));
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frameRef} className={styles.previewFrame}>
      <div className={styles.previewScale} style={{ width: SCENE_WIDTH * scale, height: SCENE_HEIGHT * scale }}>
        <div
          className={styles.previewScene}
          style={{ width: SCENE_WIDTH, height: SCENE_HEIGHT, transform: `scale(${scale})` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function GalleryGrid({ items }: { items: GalleryItem[] }) {
  return (
    <ul className={styles.grid}>
      {items.map((item) => (
        <li key={item.id} className={styles.cardLink}>
          <Card title={item.label} description={item.description} size="sm">
            {/* Live preview, decorative here: inert keeps its controls out of the tab order. */}
            <div className={styles.preview} inert>
              <span className={styles.groupTag}>{item.group}</span>
              <PreviewScope className={styles.previewScope}>
                <FitPreview>
                  <GalleryPreview id={item.id} />
                </FitPreview>
              </PreviewScope>
            </div>
          </Card>
          <Link href={item.href} className={styles.cardHit} aria-label={`${item.label}, ${item.group}`} />
        </li>
      ))}
    </ul>
  );
}

function GalleryPanel({ items, query }: { items: GalleryItem[]; query: string }) {
  if (items.length === 0) {
    const searching = query.trim().length > 0;
    return (
      <Empty
        outlined
        icon="Search"
        title="No components found"
        description={searching ? "Nothing matches that search in this group. Try All or another name." : "This group has no components yet."}
      />
    );
  }
  return <GalleryGrid items={items} />;
}

function readGroupParam(): GalleryFilter {
  if (typeof window === "undefined") return "all";
  const group = new URLSearchParams(window.location.search).get("group");
  return GROUPS.some((item) => item.id === group) ? (group as string) : "all";
}

export function ComponentGallery() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<GalleryFilter>("all");
  const trimmed = query.trim();
  const items = filterGalleryItems(filter, trimmed);

  // ?group=Forms (from the side nav or a breadcrumb) opens that tab.
  useEffect(() => {
    const sync = () => setFilter(readGroupParam());
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  function choose(id: string) {
    setFilter(id);
    const url = id === "all" ? window.location.pathname : `${window.location.pathname}?group=${encodeURIComponent(id)}`;
    window.history.replaceState(null, "", url);
  }

  return (
    <div className={styles.page}>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Components" }]} />
      <header className={styles.header}>
        <h1 className={styles.title}>Components</h1>
        <p className={styles.lede}>
          {TOTAL} parts, each with a contract an agent can read. Pick one to see it live, copy its prompt, and check its
          rules.
        </p>
      </header>
      <div className={styles.search} role="search">
        <Input
          id="gallery-search"
          type="search"
          size="sm"
          placeholder="Filter by name or purpose"
          iconStart="Search"
          ariaLabel="Filter components"
          value={query}
          onChange={setQuery}
        />
        {trimmed ? (
          <p className={styles.resultCount} aria-live="polite">
            {items.length === 1 ? "1 component" : `${items.length} components`}
          </p>
        ) : null}
      </div>
      <Tabs
        variant="line"
        value={filter}
        onChange={choose}
        ariaLabel="Component groups"
        items={GROUPS.map((group) => {
          const count = trimmed ? filterGalleryItems(group.id, trimmed).length : group.count;
          return {
            id: group.id,
            label: `${group.label} ${count}`,
            content: group.id === filter ? <GalleryPanel items={items} query={query} /> : null,
          };
        })}
      />
    </div>
  );
}

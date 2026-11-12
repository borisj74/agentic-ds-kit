"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Badge, Breadcrumb, Card, Empty, Input, Tabs } from "agentic-ds-kit";
import { filterGalleryItems, galleryGroups, type GalleryFilter, type GalleryItem } from "@/lib/component-gallery";
import { PreviewScope } from "../_components/ThemeScope";
import { GalleryPreview } from "./GalleryPreview";
import styles from "./ComponentGallery.module.css";

const cx = (...names: Array<string | false | undefined>) => names.filter(Boolean).join(" ");

const SCENE_WIDTH = 288;
const SCENE_HEIGHT = 144;
const GROUPS = galleryGroups();
const TOTAL = GROUPS[0].count;

/** Smallest scale, as a share of the width fit, before a tall preview is cut at the bottom instead. */
const MIN_FIT = 0.45;

function FitPreview({ children }: { children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 1, height: SCENE_HEIGHT, top: false });

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const scene = sceneRef.current;
    if (!frame || !scene) return;

    const measure = () => {
      if (frame.clientWidth < 8 || frame.clientHeight < 8) return;
      // The scene lays out at SCENE_WIDTH and grows to its content; offsetHeight ignores the transform.
      const height = Math.max(SCENE_HEIGHT, scene.offsetHeight);
      const byWidth = Math.min(1, frame.clientWidth / SCENE_WIDTH);
      const scale = Math.max(Math.min(byWidth, frame.clientHeight / height), byWidth * MIN_FIT);
      // Still too tall: pin it to the top so only the bottom is cut.
      const top = height * scale > frame.clientHeight + 1;
      setFit((current) =>
        Math.abs(current.scale - scale) < 0.01 && current.height === height && current.top === top
          ? current
          : { scale, height, top },
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(scene);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frameRef} className={cx(styles.previewFrame, fit.top && styles.previewTop)}>
      <div className={styles.previewScale} style={{ width: SCENE_WIDTH * fit.scale, height: fit.height * fit.scale }}>
        <div
          ref={sceneRef}
          className={styles.previewScene}
          style={{ width: SCENE_WIDTH, minHeight: SCENE_HEIGHT, transform: `scale(${fit.scale})` }}
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
              <Badge className={styles.groupTag} appearance="outline" size="sm">
                {item.group}
              </Badge>
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
        variant="segmented"
        size="sm"
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

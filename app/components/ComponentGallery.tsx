"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Badge, Breadcrumb, Card, Empty, Input, Link as KitLink, Select, Tabs } from "agentic-ds-kit";
import {
  GALLERY_LEVELS,
  filterGalleryItems,
  galleryGroups,
  type GalleryFilter,
  type GalleryItem,
  type GalleryLevel,
} from "@/lib/component-gallery";
import { PreviewScope } from "../_components/ThemeScope";
import { GalleryPreview } from "./GalleryPreview";
import styles from "./ComponentGallery.module.css";

const cx = (...names: Array<string | false | undefined>) => names.filter(Boolean).join(" ");

const SCENE_WIDTH = 352;
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

function GalleryPanel({ items, query, level }: { items: GalleryItem[]; query: string; level: GalleryLevel }) {
  if (items.length === 0 && level === "block") {
    // Blocks have their own gallery, so this one lists none.
    return (
      <div className={styles.search}>
        <Empty
          outlined
          icon="LayoutGrid"
          title="Blocks live in their own gallery"
          description="A block is a larger composition for a whole area of a screen, such as AgentOverview."
        />
        <KitLink href="/blocks" variant="standalone">
          Open the blocks gallery
        </KitLink>
      </div>
    );
  }
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

function readLevelParam(): GalleryLevel {
  if (typeof window === "undefined") return "all";
  const level = new URLSearchParams(window.location.search).get("level");
  return GALLERY_LEVELS.some((item) => item.value === level) ? (level as string) : "all";
}

/** Writes ?group= and ?level= (each left out when "all") without adding a history entry. */
function writeParams(group: GalleryFilter, level: GalleryLevel) {
  const params = new URLSearchParams();
  if (group !== "all") params.set("group", group);
  if (level !== "all") params.set("level", level);
  const search = params.toString();
  window.history.replaceState(null, "", search ? `${window.location.pathname}?${search}` : window.location.pathname);
}

export function ComponentGallery() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<GalleryFilter>("all");
  const [level, setLevel] = useState<GalleryLevel>("all");
  const trimmed = query.trim();
  const items = filterGalleryItems(filter, trimmed, level);

  // ?group=Forms (from the side nav or a breadcrumb) opens that tab; ?level=atom picks a level.
  useEffect(() => {
    const sync = () => {
      setFilter(readGroupParam());
      setLevel(readLevelParam());
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  function choose(id: string) {
    setFilter(id);
    writeParams(id, level);
  }

  function chooseLevel(value: string | string[]) {
    const next = Array.isArray(value) ? (value[0] ?? "all") : value;
    setLevel(next);
    writeParams(filter, next);
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
        <Select
          id="gallery-level"
          size="sm"
          ariaLabel="Filter by level"
          options={GALLERY_LEVELS}
          value={level}
          onChange={chooseLevel}
        />
        {trimmed || level !== "all" ? (
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
          const count = trimmed || level !== "all" ? filterGalleryItems(group.id, trimmed, level).length : group.count;
          return {
            id: group.id,
            label: `${group.label} ${count}`,
            content: group.id === filter ? <GalleryPanel items={items} query={query} level={level} /> : null,
          };
        })}
      />
    </div>
  );
}

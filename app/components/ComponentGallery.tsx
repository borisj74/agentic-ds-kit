"use client";

import { useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { Card, Empty, Field, Input, Tabs } from "agentic-ds-kit";
import { filterGalleryItems, type GalleryFilter, type GalleryItem } from "@/lib/component-gallery";
import { GalleryPreview } from "./GalleryPreview";
import playground from "../playground.module.css";
import styles from "./ComponentGallery.module.css";

const SCENE_WIDTH = 288;
const SCENE_HEIGHT = 192;

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

function openComponent(event: MouseEvent<HTMLAnchorElement>, href: string) {
  const hash = href.split("#")[1];
  if (!hash) return;
  event.preventDefault();
  if (window.location.hash === `#${hash}`) {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    return;
  }
  window.location.hash = hash;
}

function GalleryGrid({ items }: { items: GalleryItem[] }) {
  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <div key={item.id} className={styles.cardLink}>
          <Card title={item.label} description={item.description}>
            <div className={styles.preview}>
              <FitPreview>
                <GalleryPreview id={item.id} />
              </FitPreview>
            </div>
          </Card>
          <Link
            href={item.href}
            className={styles.cardHit}
            aria-label={`Open ${item.label}`}
            onClick={(event) => openComponent(event, item.href)}
          />
        </div>
      ))}
    </div>
  );
}

const GROUPS: { id: GalleryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "agent", label: "Agent UI" },
  { id: "base", label: "Base" },
  { id: "motion", label: "Motion" },
];

function isGalleryFilter(id: string): id is GalleryFilter {
  return GROUPS.some((group) => group.id === id);
}

function GalleryPanel({ items, query, elsewhere }: { items: GalleryItem[]; query: string; elsewhere: string }) {
  if (items.length === 0) {
    const searching = query.trim().length > 0;
    const description = searching
      ? `Nothing matches that search in this group.${elsewhere ? ` ${elsewhere}` : " Try another name."}`
      : "This group has no components yet.";

    return <Empty outlined icon="Search" title="No components found" description={description} />;
  }

  return <GalleryGrid items={items} />;
}

function elsewhereLabel(filter: GalleryFilter, query: string): string {
  const others = GROUPS.filter((group) => group.id !== filter)
    .map((group) => ({ label: group.label, count: filterGalleryItems(group.id, query).length }))
    .filter((group) => group.count > 0);

  if (others.length === 0) return "";
  return `Also in ${others.map((group) => `${group.label} (${group.count})`).join(", ")}.`;
}

export function ComponentGallery() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<GalleryFilter>("all");
  const trimmed = query.trim();
  const items = filterGalleryItems(filter, trimmed);
  const elsewhere = items.length === 0 && trimmed ? elsewhereLabel(filter, trimmed) : "";
  const resultLabel = items.length === 1 ? "1 component" : `${items.length} components`;

  return (
    <div className={styles.gallery}>
      <h1 className={playground.pageTitle}>Components</h1>
      <p className={playground.pageLead}>
        Atoms the patterns already compose. Open a card when you need the contract and variants.
      </p>
      <div className={styles.search} role="search">
        <Field label="Search components" htmlFor="gallery-search" hint="Name or description">
          <Input
            id="gallery-search"
            type="search"
            placeholder="Search components"
            iconStart="Search"
            value={query}
            onChange={setQuery}
          />
        </Field>
        {trimmed ? (
          <p className={styles.resultCount} aria-live="polite">
            {resultLabel}
          </p>
        ) : null}
      </div>
      <Tabs
        variant="line"
        value={filter}
        onChange={(id: string) => {
          if (isGalleryFilter(id)) setFilter(id);
        }}
        ariaLabel="Component groups"
        items={GROUPS.map((group) => {
          const count = trimmed ? filterGalleryItems(group.id, trimmed).length : null;
          return {
            id: group.id,
            label: count === null ? group.label : `${group.label} (${count})`,
            content:
              group.id === filter ? <GalleryPanel items={items} query={query} elsewhere={elsewhere} /> : null,
          };
        })}
      />
    </div>
  );
}

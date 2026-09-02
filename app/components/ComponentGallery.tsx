"use client";

import { useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { Card } from "agentic-ds-kit";
import { Tabs } from "agentic-ds-kit";
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

function panel(filter: GalleryFilter) {
  return <GalleryGrid items={filterGalleryItems(filter)} />;
}

export function ComponentGallery() {
  return (
    <div className={styles.gallery}>
      <h1 className={playground.pageTitle}>Components</h1>
      <p className={playground.pageLead}>
        Gallery of every building block — open any card for full docs and variants.
      </p>
      <Tabs
        variant="line"
        defaultValue="all"
        ariaLabel="Component groups"
        items={[
          { id: "all", label: "All", content: panel("all") },
          { id: "agent", label: "Agent UI", content: panel("agent") },
          { id: "base", label: "Base", content: panel("base") },
          { id: "motion", label: "Motion", content: panel("motion") },
        ]}
      />
    </div>
  );
}

"use client";

import { useEffect, useState, type ReactElement } from "react";
import { ColorFoundations } from "./ColorFoundations";
import { TypographyFoundations } from "./TypographyFoundations";
import { SpacingFoundations } from "./SpacingFoundations";
import { IconsFoundations } from "./IconsFoundations";
import { GridFoundations } from "./GridFoundations";
import { RadiusFoundations } from "./RadiusFoundations";
import { BorderFoundations } from "./BorderFoundations";
import { ShadowFoundations } from "./ShadowFoundations";
import { MotionFoundations } from "./MotionFoundations";
import { OpacityFoundations } from "./OpacityFoundations";
import styles from "./foundations.module.css";

function currentHash(): string {
  if (typeof window === "undefined") return "color";
  return window.location.hash.replace(/^#/, "").toLowerCase() || "color";
}

const TITLES: Record<string, string> = {
  color: "Color",
  typography: "Typography",
  spacing: "Spacing",
  icons: "Icons",
  grid: "Grid systems",
  radius: "Radius",
  border: "Border",
  shadow: "Shadow",
  motion: "Motion",
  opacity: "Opacity",
};

const VIEWS: Record<string, () => ReactElement> = {
  color: ColorFoundations,
  typography: TypographyFoundations,
  spacing: SpacingFoundations,
  icons: IconsFoundations,
  grid: GridFoundations,
  radius: RadiusFoundations,
  border: BorderFoundations,
  shadow: ShadowFoundations,
  motion: MotionFoundations,
  opacity: OpacityFoundations,
};

export function FoundationsView() {
  const [hash, setHash] = useState("color");

  useEffect(() => {
    const sync = () => setHash(currentHash());
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  const title = TITLES[hash] ?? "Color";
  const View = VIEWS[hash] ?? ColorFoundations;

  return (
    <section id={hash in TITLES ? hash : "color"} className={`${styles.section} ${styles.anchor}`}>
      <h2 className={styles.heading}>{title}</h2>
      <View />
    </section>
  );
}

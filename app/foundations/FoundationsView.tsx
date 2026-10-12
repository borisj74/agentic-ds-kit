"use client";

import type { ReactElement } from "react";
import { useLocationHash } from "@/lib/use-location-hash";
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
import playground from "../playground.module.css";
import styles from "./foundations.module.css";

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
  const locationHash = useLocationHash();
  const hash = locationHash?.toLowerCase() || "color";
  // Until the hash is read the section would show Color: hide it, don't swap.
  const pending = locationHash === null ? ` ${playground.pending}` : "";

  const title = TITLES[hash] ?? "Color";
  const View = VIEWS[hash] ?? ColorFoundations;

  return (
    <section id={hash in TITLES ? hash : "color"} className={`${styles.section} ${styles.anchor}${pending}`}>
      <h2 className={styles.heading}>{title}</h2>
      <View />
    </section>
  );
}

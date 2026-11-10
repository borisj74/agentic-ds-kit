"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { variantChips, type VariantProp } from "@/lib/component-contract";
import { DocViewProvider } from "./DocView";
import docStyles from "./ComponentDoc.module.css";
import styles from "./ComponentPage.module.css";

const CHIPS_ATTR = "data-variant-chips";

/**
 * The stage's Variants tab: the component's doc in variants mode (no master, no tab bar), its
 * variant cards in a grid, each card tagged with the props it shows, read from the contract.
 */
export function VariantGrid({ props, children }: { props: VariantProp[]; children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const tag = () => {
      host.querySelectorAll<HTMLElement>(`.${docStyles.example}`).forEach((card) => {
        const title = card.querySelector(`.${docStyles.exampleTitle}`)?.textContent ?? "";
        const chips = variantChips(title, props);
        const key = chips.join("|");
        let row = card.querySelector<HTMLElement>(`:scope > [${CHIPS_ATTR}]`);
        if (row?.dataset.variantChips === key) return;
        row?.remove();
        if (chips.length === 0) return;
        // Plain DOM, outside React's children: the doc files stay untouched.
        row = document.createElement("ul");
        row.setAttribute(CHIPS_ATTR, key);
        row.setAttribute("aria-label", "Props");
        row.className = styles.variantChips;
        for (const chip of chips) {
          const item = document.createElement("li");
          item.className = styles.variantChip;
          item.textContent = chip;
          row.appendChild(item);
        }
        card.appendChild(row);
      });
    };

    tag();
    const observer = new MutationObserver(() => tag());
    observer.observe(host, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [props]);

  return (
    <DocViewProvider mode="variants">
      <div ref={hostRef} className={styles.variantHost}>
        {children}
      </div>
    </DocViewProvider>
  );
}

"use client";

import { Children, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { guidanceFor } from "@/lib/component-guidance";
import { guidanceSegments } from "@/lib/guidance-links";
import styles from "./ComponentDoc.module.css";

function GuidanceText({ text }: { text: string }) {
  return guidanceSegments(text).map((segment, index) =>
    segment.href ? (
      <Link key={`${segment.href}-${index}`} href={segment.href} className={styles.guideLink}>
        {segment.text}
      </Link>
    ) : (
      <span key={`${segment.text}-${index}`}>{segment.text}</span>
    ),
  );
}

function GuideIcon({ kind }: { kind: "do" | "dont" }) {
  const className = `${styles.guideIcon} ${kind === "do" ? styles.guideIconDo : styles.guideIconDont}`;
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
      {kind === "do" ? (
        <path
          d="M3.5 8.5 6.5 11.5 12.5 4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M4.5 4.5 11.5 11.5 M11.5 4.5 4.5 11.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function DocNotes({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const slug = pathname.split("/").filter(Boolean).pop() ?? "";
  const guidance = guidanceFor(slug);
  const items = Children.toArray(children);
  const usage = items[0];
  const rest = items.slice(1);

  return (
    <div className={styles.docs}>
      <div className={guidance ? styles.notesGrid : undefined}>
        {usage}
        {guidance ? (
          <div className={styles.guidance}>
            {guidance.dos.length > 0 ? (
              <div>
                <h3 className={styles.usageTitle}>{"Do's"}</h3>
                <ul className={styles.guideList}>
                  {guidance.dos.map((item) => (
                    <li key={item} className={styles.guideItem}>
                      <GuideIcon kind="do" />
                      <span>
                        <GuidanceText text={item} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {guidance.donts.length > 0 ? (
              <div>
                <h3 className={styles.usageTitle}>{"Don'ts"}</h3>
                <ul className={styles.guideList}>
                  {guidance.donts.map((item) => (
                    <li key={item} className={styles.guideItem}>
                      <GuideIcon kind="dont" />
                      <span>
                        <GuidanceText text={item} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {rest}
    </div>
  );
}

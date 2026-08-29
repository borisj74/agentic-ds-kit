"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AppNav } from "@/ui/AppNav";
import { buildPlaygroundNavGroups } from "@/lib/playground-nav";
import styles from "./PlaygroundShell.module.css";

export function PlaygroundShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const readHash = () => setHash(window.location.hash);
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  const groups = buildPlaygroundNavGroups(pathname, hash);

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <AppNav title="Agentic DS Kit" groups={groups} />
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}

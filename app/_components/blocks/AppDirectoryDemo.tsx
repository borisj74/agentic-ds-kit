"use client";

import { useEffect, useRef, useState } from "react";
import { AppDirectory, type AppDirectoryApp } from "agentic-ds-kit";
import styles from "./BlockDemo.module.css";
import { APP_DIRECTORY_APPS, APP_DIRECTORY_CATEGORIES } from "@/lib/blocks/app-directory.sample";

const CONNECT_MS = 1200;

/**
 * AppDirectory with the sample apps. Connect waits a moment (Connecting…), then the app shows as
 * connected; Disconnect makes it available again. Request is announced.
 */
export function AppDirectoryDemo() {
  const [apps, setApps] = useState<AppDirectoryApp[]>(APP_DIRECTORY_APPS);
  const [connecting, setConnecting] = useState<string | undefined>();
  const [status, setStatus] = useState("");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const nameOf = (id: string) => apps.find((app) => app.id === id)?.name ?? id;

  function setAppStatus(id: string, change: Partial<AppDirectoryApp>) {
    setApps((list) => list.map((app) => (app.id === id ? { ...app, ...change } : app)));
  }

  return (
    <>
      <AppDirectory
        apps={apps}
        note="example providers"
        categories={APP_DIRECTORY_CATEGORIES}
        connectingId={connecting}
        onConnect={(id) => {
          setConnecting(id);
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => {
            setAppStatus(id, { status: "connected", connectedNote: "Connected by you · just now" });
            setConnecting(undefined);
            setStatus(`${nameOf(id)} connected`);
          }, CONNECT_MS);
        }}
        onDisconnect={(id) => {
          setAppStatus(id, { status: "available", connectedNote: undefined });
          setStatus(`${nameOf(id)} disconnected`);
        }}
        onRequest={() => setStatus("Request sent. We'll let you know when it's ready.")}
      />
      <p role="status" className={styles.srOnly}>
        {status}
      </p>
    </>
  );
}

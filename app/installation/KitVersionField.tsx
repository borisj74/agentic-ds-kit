"use client";

import { useEffect, useState } from "react";
import { Field, Select } from "agentic-ds-kit";
import { kitVersionOptions, type KitVersionOption } from "@/lib/kit-install";
import playground from "../playground.module.css";

export interface KitVersionFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function KitVersionField({ value, onChange }: KitVersionFieldProps) {
  const [options, setOptions] = useState<KitVersionOption[]>(() => kitVersionOptions());

  useEffect(() => {
    const controller = new AbortController();

    async function loadPublished() {
      try {
        const response = await fetch("https://registry.npmjs.org/agentic-ds-kit", {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data: unknown = await response.json();
        if (
          typeof data !== "object" ||
          data === null ||
          !("versions" in data) ||
          typeof data.versions !== "object" ||
          data.versions === null
        ) {
          return;
        }
        setOptions(kitVersionOptions(Object.keys(data.versions)));
      } catch {
        /* keep the local latest + current list */
      }
    }

    void loadPublished();
    return () => controller.abort();
  }, []);

  return (
    <div className={playground.versionField}>
      <Field
        label="Version"
        htmlFor="kit-version"
        hint="Latest installs the current published package, not a pinned older release."
      >
        <Select
          id="kit-version"
          size="sm"
          searchable={options.length > 8}
          value={value}
          onChange={(next: string | string[]) => {
            if (typeof next === "string" && next) onChange(next);
          }}
          options={options}
        />
      </Field>
    </div>
  );
}

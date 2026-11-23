"use client";

import { Button } from "../Button";
import { useKitLabels } from "../shared/labels";

/** The Dismiss Button. A client island so Alert itself stays server-safe. */
export function AlertDismiss({ onDismiss }: { onDismiss: () => void }) {
  const labels = useKitLabels();
  return (
    <Button appearance="ghost" mode="neutral" size="sm" iconStart="X" ariaLabel={labels.dismiss} onClick={onDismiss} />
  );
}

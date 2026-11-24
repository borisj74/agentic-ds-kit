"use client";

import { IconButton } from "../IconButton";
import { useKitLabels } from "../shared/labels";

/** Client island for the X, named by KitLabels dismiss, so Card itself stays server-safe. */
export function CardDismiss({ onDismiss }: { onDismiss: () => void }) {
  const labels = useKitLabels();
  return <IconButton icon="X" ariaLabel={labels.dismiss} appearance="ghost" mode="neutral" size="sm" onClick={onDismiss} />;
}

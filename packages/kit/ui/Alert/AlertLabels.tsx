"use client";

import { Button } from "../Button";
import { useKitLabels } from "../shared/labels";
import type { AlertVariant } from "./Alert.types";

/** Client islands for the words that come from KitLabelsProvider, so Alert itself stays server-safe. */

/** The tone word in the header: Info, Success, Warning or Error. */
export function AlertTone({ variant, className }: { variant: AlertVariant; className?: string }) {
  const labels = useKitLabels();
  return <span className={className}>{labels[variant]}</span>;
}

/** The Dismiss Button. */
export function AlertDismiss({ onDismiss }: { onDismiss: () => void }) {
  const labels = useKitLabels();
  return (
    <Button appearance="ghost" mode="neutral" size="sm" iconStart="X" ariaLabel={labels.dismiss} onClick={onDismiss} />
  );
}

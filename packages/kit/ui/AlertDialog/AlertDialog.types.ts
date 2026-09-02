export type AlertDialogSize = "sm" | "md";
export type AlertDialogActionVariant = "primary" | "danger";

export interface AlertDialogProps {
  open: boolean;
  title: string;
  description: string;
  cancelLabel?: string;
  actionLabel: string;
  actionVariant?: AlertDialogActionVariant;
  size?: AlertDialogSize;
  onCancel: () => void;
  onAction: () => void;
}

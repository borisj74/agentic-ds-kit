export type TagVariant = "neutral" | "success" | "warning" | "danger" | "info";
export type TagSize = "sm" | "md";

export interface TagProps {
  children: string;
  variant?: TagVariant;
  size?: TagSize;
}

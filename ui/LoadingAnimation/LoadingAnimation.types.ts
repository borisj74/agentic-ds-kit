export type LoadingAnimationSize = "sm" | "md" | "lg";
export type LoadingAnimationVariant = "grid";

export interface LoadingAnimationProps {
  label?: string;
  size?: LoadingAnimationSize;
  variant?: LoadingAnimationVariant;
  className?: string;
}

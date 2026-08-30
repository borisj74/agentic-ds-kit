export type SliderOrientation = "horizontal" | "vertical";

export interface SliderProps {
  value: number | number[];
  min?: number;
  max?: number;
  step?: number;
  orientation?: SliderOrientation;
  disabled?: boolean;
  onValueChange?: (value: number | number[]) => void;
}

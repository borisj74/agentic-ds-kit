import type { ScorecardProps } from "../Scorecard/Scorecard.types";

export interface ScoreboardProps {
  items: ScorecardProps[];
  scroll?: boolean;
  "aria-label"?: string;
  className?: string;
}

import type { ScorecardProps } from "../Scorecard/Scorecard.types";

export interface ScoreboardProps {
  items: ScorecardProps[];
  "aria-label"?: string;
  className?: string;
}

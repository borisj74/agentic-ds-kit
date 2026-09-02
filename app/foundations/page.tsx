import { FoundationsView } from "./FoundationsView";
import playground from "../playground.module.css";

export default function FoundationsPage() {
  return (
    <div className={playground.page}>
      <div className={playground.wideShell}>
        <h1 className={playground.pageTitle}>Foundations</h1>
        <p className={playground.pageLead}>
          Color, type, space, icons, layout, radius, border, shadow, motion, and opacity. Components
          bind to semantic vars only.
        </p>
        <FoundationsView />
      </div>
    </div>
  );
}

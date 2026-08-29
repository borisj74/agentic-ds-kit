import { ComponentsView } from "./ComponentsView";
import playground from "../playground.module.css";

export default function ComponentsPage() {
  return (
    <div className={playground.page}>
      <div className={playground.wideShell}>
        <ComponentsView />
      </div>
    </div>
  );
}

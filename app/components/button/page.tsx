import type { Metadata } from "next";
import playground from "../../playground.module.css";
import { ButtonDoc } from "../ButtonDoc";
import { DocPageExtras } from "../DocPageExtras";
import { componentLabel } from "@/lib/playground-nav";

export const metadata: Metadata = {
  title: componentLabel("button"),
};

export default function ButtonComponentPage() {
  return (
    <div className={playground.docPage}>
      <div className={playground.docShell}>
        <ButtonDoc />
        <DocPageExtras slug="button" />
      </div>
    </div>
  );
}

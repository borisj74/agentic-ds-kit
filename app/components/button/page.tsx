import type { Metadata } from "next";
import { ButtonDoc } from "../ButtonDoc";
import { ComponentPage } from "../ComponentPage";
import { DocPageExtras } from "../DocPageExtras";
import { componentLabel } from "@/lib/playground-nav";

export const metadata: Metadata = {
  title: componentLabel("button"),
};

export default function ButtonComponentPage() {
  return (
    <ComponentPage id="button" footer={<DocPageExtras slug="button" />}>
      <ButtonDoc />
    </ComponentPage>
  );
}

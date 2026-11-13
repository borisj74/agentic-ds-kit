import type { Metadata } from "next";
import { ButtonDoc } from "../ButtonDoc";
import { ComponentPage } from "../ComponentPage";
import { DocPageExtras } from "../DocPageExtras";
import { componentLabel } from "@/lib/playground-nav";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  ...canonical("/components/button"),
  title: componentLabel("button"),
};

export default function ButtonComponentPage() {
  return (
    <ComponentPage id="button" footer={<DocPageExtras slug="button" />}>
      <ButtonDoc />
    </ComponentPage>
  );
}

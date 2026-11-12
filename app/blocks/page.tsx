import type { Metadata } from "next";
import playground from "../playground.module.css";
import { BlocksIndex } from "./BlocksIndex";

export const metadata: Metadata = { title: "Blocks" };

export default function BlocksIndexPage() {
  return (
    <div className={playground.docPage}>
      <div className={playground.docShell}>
        <BlocksIndex />
      </div>
    </div>
  );
}

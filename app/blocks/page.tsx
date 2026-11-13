import type { Metadata } from "next";
import playground from "../playground.module.css";
import { BlocksIndex } from "./BlocksIndex";
import { canonical } from "@/lib/site";

export const metadata: Metadata = { title: "Blocks", ...canonical("/blocks") };

export default function BlocksIndexPage() {
  return (
    <div className={playground.docPage}>
      <div className={playground.docShell}>
        <BlocksIndex />
      </div>
    </div>
  );
}

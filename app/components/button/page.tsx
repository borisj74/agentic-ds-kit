import playground from "../../playground.module.css";
import { ButtonDoc } from "../ButtonDoc";
import { DocPageExtras } from "../DocPageExtras";

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

import { Section } from "agentic-ds-kit";
import playground from "../../playground.module.css";
import { ButtonDoc } from "../ButtonDoc";
import { DocPageExtras } from "../DocPageExtras";
import { ButtonMatrix } from "../../_components/ButtonMatrix";
import styles from "./button.module.css";

export default function ButtonComponentPage() {
  return (
    <div className={playground.docPage}>
      <div className={playground.docShell}>
        <ButtonDoc />
        <div className={styles.matrix}>
          <Section title="Matrix" description="Appearance × mode, sizes, and disabled." size="sm">
            <ButtonMatrix />
          </Section>
        </div>
        <DocPageExtras slug="button" />
      </div>
    </div>
  );
}

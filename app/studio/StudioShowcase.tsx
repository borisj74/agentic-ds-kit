import { Badge, Checkbox, Field, Input, RadioGroup, Section, Switch } from "agentic-ds-kit";
import type { BadgeAppearance } from "agentic-ds-kit";
import { ButtonMatrix } from "../_components/ButtonMatrix";
import styles from "./studio.module.css";

const BADGE_APPEARANCES: BadgeAppearance[] = ["soft", "tint", "solid", "outline"];

export function StudioShowcase() {
  return (
    <div className={styles.showcase}>
      <Section title="Button" description="Appearance × mode, sizes, and disabled." size="sm">
        <ButtonMatrix />
      </Section>
      <Section title="Badge" description="Appearances on the primary tone." size="sm">
        <div className={styles.row}>
          {BADGE_APPEARANCES.map((appearance) => (
            <Badge key={appearance} appearance={appearance} tone="primary">
              {appearance}
            </Badge>
          ))}
        </div>
      </Section>
      <Section title="Input" description="A resting field and an error." size="sm">
        <div className={styles.fields}>
          <Field label="Name" htmlFor="studio-name">
            <Input id="studio-name" defaultValue="Ada Lovelace" />
          </Field>
          <Field label="Email" htmlFor="studio-email" error="Enter a valid email.">
            <Input id="studio-email" type="email" defaultValue="ada@" />
          </Field>
        </div>
      </Section>
      <Section title="Checkbox" size="sm">
        <Checkbox id="studio-updates" label="Email me product updates" defaultChecked />
      </Section>
      <Section title="Radio" size="sm">
        <RadioGroup
          name="studio-plan"
          legend="Billing period"
          orientation="horizontal"
          defaultValue="yearly"
          options={[
            { value: "monthly", label: "Monthly" },
            { value: "yearly", label: "Yearly" },
          ]}
        />
      </Section>
      <Section title="Switch" size="sm">
        <Switch id="studio-alerts" label="Deployment alerts" defaultChecked />
      </Section>
    </div>
  );
}

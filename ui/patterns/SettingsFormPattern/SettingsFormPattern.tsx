import { Button } from "@/ui/Button";
import { Checkbox } from "@/ui/Checkbox";
import { Field } from "@/ui/Field";
import { Input } from "@/ui/Input";
import { PageHeader } from "@/ui/PageHeader";
import { Section } from "@/ui/Section";
import { Select } from "@/ui/Select";
import styles from "../DashboardPattern/patterns.module.css";
import formStyles from "./SettingsFormPattern.module.css";

export function SettingsFormPattern() {
  return (
    <div className={styles.pattern}>
      <PageHeader
        title="Settings"
        subtitle="Manage your studio profile and preferences."
        eyebrow="Account"
      />
      <Section title="Profile" description="Basic information visible to collaborators">
        <div className={formStyles.form}>
          <Field label="Display name" htmlFor="display-name" hint="Shown on shared projects">
            <Input id="display-name" defaultValue="Boris Jovanovic" />
          </Field>
          <Field label="Email" htmlFor="email">
            <Input id="email" type="email" defaultValue="boris@example.com" />
          </Field>
          <Field label="Timezone" htmlFor="timezone">
            <Select
              id="timezone"
              options={[
                { value: "utc", label: "UTC" },
                { value: "cet", label: "Central European Time" },
                { value: "est", label: "Eastern Time" },
              ]}
              defaultValue="cet"
            />
          </Field>
        </div>
      </Section>
      <Section title="Notifications">
        <div className={formStyles.form}>
          <Checkbox id="email-updates" label="Email me weekly summaries" defaultChecked />
          <Checkbox id="product-news" label="Product news and tips" />
        </div>
      </Section>
      <div className={formStyles.actions}>
        <Button variant="primary" size="md" type="submit">
          Save changes
        </Button>
        <Button variant="secondary" size="md" type="button">
          Cancel
        </Button>
      </div>
    </div>
  );
}

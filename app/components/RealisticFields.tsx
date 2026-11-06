import { Field, Input } from "agentic-ds-kit";
import type { FieldLabelPosition, InputSize } from "agentic-ds-kit";
import styles from "./RealisticFields.module.css";

export interface RealisticFieldsProps {
  idPrefix: string;
  size?: InputSize;
  labelPosition?: FieldLabelPosition;
  disabled?: boolean;
  demo?: "hover" | "focus";
  emailError?: string;
}

const EMAIL_HINT = "We'll send receipts to this address.";
const PASSWORD_ERROR = "Use at least 8 characters.";

export function RealisticFields({
  idPrefix,
  size = "md",
  labelPosition = "top",
  disabled = false,
  demo,
  emailError,
}: RealisticFieldsProps) {
  const emailId = `${idPrefix}-email`;
  const passwordId = `${idPrefix}-password`;
  const searchId = `${idPrefix}-search`;

  return (
    <div className={labelPosition === "start" ? styles.stackStart : styles.stack}>
      <Field
        label="Email"
        htmlFor={emailId}
        labelPosition={labelPosition}
        hint={emailError ? undefined : EMAIL_HINT}
        error={emailError}
      >
        <Input
          id={emailId}
          type="email"
          size={size}
          iconStart="Mail"
          placeholder="ada@example.com"
          disabled={disabled}
          demo={disabled ? undefined : demo}
        />
      </Field>
      <Field
        label="Password"
        htmlFor={passwordId}
        labelPosition={labelPosition}
        error={PASSWORD_ERROR}
      >
        <Input
          id={passwordId}
          type="password"
          size={size}
          defaultValue="short"
          placeholder="Password"
          disabled={disabled}
        />
      </Field>
      <Field label="Search" htmlFor={searchId} labelPosition={labelPosition}>
        <Input
          id={searchId}
          type="search"
          size={size}
          className={styles.shortcut}
          iconStart="Search"
          end="⌘K"
          placeholder="Invoices, customers, tasks"
          disabled={disabled}
        />
      </Field>
    </div>
  );
}

export function realisticFieldsCode(
  size: InputSize,
  labelPosition: FieldLabelPosition,
  disabled: boolean,
  emailError?: string,
) {
  const position = labelPosition === "start" ? ' labelPosition="start"' : "";
  const disabledAttr = disabled ? " disabled" : "";
  const emailMessage = emailError
    ? ` error="${emailError}"`
    : ` hint="${EMAIL_HINT}"`;

  return [
    `<Field label="Email" htmlFor="email"${position}${emailMessage}>`,
    `  <Input id="email" type="email" size="${size}" iconStart="Mail" placeholder="ada@example.com"${disabledAttr} />`,
    `</Field>`,
    "",
    `<Field label="Password" htmlFor="password"${position} error="${PASSWORD_ERROR}">`,
    `  <Input id="password" type="password" size="${size}" defaultValue="short"${disabledAttr} />`,
    `</Field>`,
    "",
    `<Field label="Search" htmlFor="search"${position}>`,
    `  <Input id="search" type="search" size="${size}" iconStart="Search" end="⌘K" placeholder="Invoices, customers, tasks"${disabledAttr} />`,
    `</Field>`,
  ].join("\n");
}

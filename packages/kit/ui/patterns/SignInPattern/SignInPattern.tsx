"use client";

import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";
import { Alert } from "../../Alert";
import { Button } from "../../Button";
import { Card } from "../../Card";
import { Checkbox } from "../../Checkbox";
import { Divider } from "../../Divider";
import { Field } from "../../Field";
import { Input } from "../../Input";
import styles from "./SignInPattern.module.css";

export type SignInMode = "sign-in" | "sign-up";

export interface SignInProvider {
  id: string;
  label: string;
  /** Lucide export name, same as Button iconStart. */
  icon?: string;
}

export interface SignInValues {
  email: string;
  password: string;
  /** sign-up only */
  name?: string;
  /** sign-in only */
  remember?: boolean;
}

export interface SignInPatternProps {
  mode?: SignInMode;
  productName?: string;
  /** App mark above the card. Decorative unless it carries its own alt text. */
  logo?: ReactNode;
  /** SSO buttons under an "or" Divider. Omit for email only. */
  providers?: SignInProvider[];
  onSubmit?: (values: SignInValues) => void;
  onProvider?: (id: string) => void;
  /** Shows "Forgot password?" in sign-in mode. */
  onForgotPassword?: () => void;
  /** Shows the footer switch link. */
  onSwitchMode?: (next: SignInMode) => void;
  /** Server-side failure, shown as a danger Alert above the form. */
  error?: string;
  /** Disables submit and SSO while the app is working. */
  loading?: boolean;
}

type FieldErrors = { name?: string; email?: string; password?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

const COPY = {
  "sign-in": {
    title: "Welcome back",
    description: "Sign in to your account.",
    submit: "Sign in",
    busy: "Signing in…",
    switchPrompt: "Don't have an account?",
    switchLabel: "Sign up",
  },
  "sign-up": {
    title: "Create an account",
    description: "It takes less than a minute.",
    submit: "Create account",
    busy: "Creating account…",
    switchPrompt: "Already have an account?",
    switchLabel: "Sign in",
  },
} as const;

function validate(mode: SignInMode, name: string, email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (mode === "sign-up" && !name.trim()) errors.name = "Enter your name.";
  if (!email.trim()) errors.email = "Enter your email.";
  else if (!EMAIL.test(email.trim())) errors.email = "Enter a valid email, like name@company.com.";
  if (!password) errors.password = "Enter your password.";
  else if (mode === "sign-up" && password.length < MIN_PASSWORD)
    errors.password = `Use at least ${MIN_PASSWORD} characters.`;
  return errors;
}

export function SignInPattern({
  mode = "sign-in",
  productName,
  logo,
  providers,
  onSubmit,
  onProvider,
  onForgotPassword,
  onSwitchMode,
  error,
  loading = false,
}: SignInPatternProps) {
  const uid = useId();
  const ids = {
    name: `${uid}-name`,
    email: `${uid}-email`,
    password: `${uid}-password`,
    remember: `${uid}-remember`,
  };
  const copy = COPY[mode];
  const signUp = mode === "sign-up";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    setErrors({});
  }, [mode]);

  function clear(key: keyof FieldErrors) {
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const next = validate(mode, name, email, password);
    setErrors(next);
    const first = (["name", "email", "password"] as const).find((key) => next[key]);
    if (first) {
      document.getElementById(ids[first])?.focus();
      return;
    }
    onSubmit?.(
      signUp
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password, remember },
    );
  }

  const ssoList = providers ?? [];

  return (
    <div className={styles.page}>
      <div className={styles.stack}>
        {logo || productName ? (
          <div className={styles.brand}>
            {logo}
            {productName ? <p className={styles.productName}>{productName}</p> : null}
          </div>
        ) : null}

        <Card title={copy.title} description={copy.description}>
          {error ? <Alert variant="danger">{error}</Alert> : null}

          <form
            className={styles.form}
            onSubmit={handleSubmit}
            noValidate
            aria-busy={loading || undefined}
          >
            {signUp ? (
              <Field label="Name" htmlFor={ids.name} error={errors.name}>
                <Input
                  id={ids.name}
                  name="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(value) => {
                    setName(value);
                    clear("name");
                  }}
                />
              </Field>
            ) : null}
            <Field label="Email" htmlFor={ids.email} error={errors.email}>
              <Input
                id={ids.email}
                type="email"
                name="email"
                placeholder="name@company.com"
                value={email}
                onChange={(value) => {
                  setEmail(value);
                  clear("email");
                }}
              />
            </Field>
            <Field
              label="Password"
              htmlFor={ids.password}
              hint={signUp ? `At least ${MIN_PASSWORD} characters.` : undefined}
              error={errors.password}
            >
              <Input
                id={ids.password}
                type="password"
                name="password"
                value={password}
                onChange={(value) => {
                  setPassword(value);
                  clear("password");
                }}
              />
            </Field>

            {!signUp ? (
              <div className={styles.row}>
                <Checkbox
                  id={ids.remember}
                  name="remember"
                  label="Remember me"
                  checked={remember}
                  onChange={setRemember}
                />
                {onForgotPassword ? (
                  <Button variant="tertiary" size="sm" onClick={onForgotPassword}>
                    Forgot password?
                  </Button>
                ) : null}
              </div>
            ) : null}

            <Button variant="primary" type="submit" block disabled={loading}>
              {loading ? copy.busy : copy.submit}
            </Button>
          </form>

          {ssoList.length > 0 ? (
            <>
              <Divider label="or" />
              <div className={styles.providers}>
                {ssoList.map((provider) => (
                  <Button
                    key={provider.id}
                    variant="secondary"
                    block
                    iconStart={provider.icon}
                    disabled={loading}
                    onClick={() => onProvider?.(provider.id)}
                  >
                    {provider.label}
                  </Button>
                ))}
              </div>
            </>
          ) : null}
        </Card>

        {onSwitchMode ? (
          <p className={styles.footer}>
            <span>{copy.switchPrompt}</span>
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => onSwitchMode(signUp ? "sign-in" : "sign-up")}
            >
              {copy.switchLabel}
            </Button>
          </p>
        ) : null}
      </div>
    </div>
  );
}

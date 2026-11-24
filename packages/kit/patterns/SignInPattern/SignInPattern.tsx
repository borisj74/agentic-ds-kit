"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from "react";
import { Alert } from "../../ui/Alert";
import { Button, type KitIcon } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Checkbox } from "../../ui/Checkbox";
import { Divider } from "../../ui/Divider";
import { Field } from "../../ui/Field";
import { Input } from "../../ui/Input";
import { InputOTP } from "../../ui/InputOTP";
import "./SignInPattern.css";

export type SignInMode = "sign-in" | "sign-up";

/** credentials: email and password (and SSO). code: the one-time code from the user's app. */
export type SignInStep = "credentials" | "code";

/** What went wrong (title) and what to do next (detail). A plain string still works. */
export type SignInError = string | { title: string; detail?: string };

export interface SignInProvider {
  id: string;
  label: string;
  /** Same as Button iconStart: a Lucide name or component. */
  icon?: KitIcon;
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
  /** Which step shows. The app moves it to "code" when the account needs a one-time code. */
  step?: SignInStep;
  productName?: string;
  /** App mark above the card. Decorative unless it carries its own alt text. */
  logo?: ReactNode;
  /** SSO buttons above the form, over a Divider "or use email". Omit for email only. */
  providers?: SignInProvider[];
  onSubmit?: (values: SignInValues) => void;
  /** Called with the 6-digit code when the code step is submitted. */
  onVerifyCode?: (code: string) => void;
  onProvider?: (id: string) => void;
  /** Shows "Forgot password?" in sign-in mode. */
  onForgotPassword?: () => void;
  /** Shows the footer switch button. Left out, sign-in shows an invite line instead. */
  onSwitchMode?: (next: SignInMode) => void;
  /** Server failure. Credentials step: a danger Alert above the form. Code step: the code Field's error. */
  error?: SignInError;
  /** Disables submit and SSO while the app is working. */
  loading?: boolean;
}

type FieldErrors = { name?: string; email?: string; password?: string; code?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
const CODE_LENGTH = 6;

const COPY = {
  "sign-in": {
    title: "Sign in",
    description: "Use your work account.",
    submit: "Sign in",
    busy: "Signing in…",
    switchPrompt: "No account?",
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

const CODE_COPY = {
  title: "Enter your code",
  description: "From your authenticator app.",
  label: `${CODE_LENGTH}-digit code`,
  hint: "The code changes every 30 seconds.",
  submit: "Verify",
  busy: "Verifying…",
} as const;

const INVITE = "No account? Ask your admin for an invite.";

/*
 * Narrow = below --grid-breakpoint-sm, read at runtime. The card drops to size sm and
 * Forgot password moves under Sign in, so the checkbox row doesn't wrap. 40rem is the fallback.
 */
function narrowQuery(): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue("--grid-breakpoint-sm").trim();
  return `(width < ${value || "40rem"})`;
}

function subscribe(onChange: () => void) {
  const query = window.matchMedia(narrowQuery());
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useNarrow(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(narrowQuery()).matches, () => false);
}

/** One line of text for the error: the string, or title and detail joined. */
export function errorText(error: SignInError | undefined): string {
  if (!error) return "";
  if (typeof error === "string") return error;
  return error.detail ? `${error.title} ${error.detail}` : error.title;
}

function validate(mode: SignInMode, name: string, email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (mode === "sign-up" && !name.trim()) errors.name = "Enter your name.";
  if (!email.trim()) errors.email = "Enter your work email.";
  else if (!EMAIL.test(email.trim())) errors.email = "Enter a valid email, like name@company.com.";
  if (!password) errors.password = "Enter your password.";
  else if (mode === "sign-up" && password.length < MIN_PASSWORD)
    errors.password = `Use at least ${MIN_PASSWORD} characters.`;
  return errors;
}

export function SignInPattern({
  mode = "sign-in",
  step = "credentials",
  productName,
  logo,
  providers,
  onSubmit,
  onVerifyCode,
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
    code: `${uid}-code`,
  };
  const copy = COPY[mode];
  const signUp = mode === "sign-up";
  const codeStep = step === "code";
  const narrow = useNarrow();
  const message = errorText(error);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const [errorsKey, setErrorsKey] = useState(`${mode}:${step}`);
  if (errorsKey !== `${mode}:${step}`) {
    setErrorsKey(`${mode}:${step}`);
    setErrors({});
  }

  // A new server error clears what failed: the password (email stays) or the code.
  const [seenError, setSeenError] = useState(message);
  if (seenError !== message) {
    setSeenError(message);
    if (message) {
      if (codeStep) setCode("");
      else setPassword("");
    }
  }

  // Focus follows the step and each new server error: Password on credentials, the code on step 2.
  const focusKey = `${step}:${message}`;
  const lastFocusKey = useRef(focusKey);
  useEffect(() => {
    if (lastFocusKey.current === focusKey) return;
    lastFocusKey.current = focusKey;
    if (codeStep) document.getElementById(ids.code)?.focus();
    else if (message || !signUp) document.getElementById(ids.password)?.focus();
  }, [focusKey, codeStep, message, signUp, ids.code, ids.password]);

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

  function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    if (code.length !== CODE_LENGTH) {
      setErrors({ code: `Enter the ${CODE_LENGTH}-digit code.` });
      document.getElementById(ids.code)?.focus();
      return;
    }
    onVerifyCode?.(code);
  }

  const ssoList = providers ?? [];
  // Alert needs body text: a title with no detail becomes the body.
  const alertTitle = typeof error === "object" && error.detail ? error.title : undefined;
  const alertBody = typeof error === "object" ? (error.detail ?? error.title) : (error ?? "");

  // One solid primary per step: Sign in (or Create account), then Verify. Each form renders it once.
  const primaryCopy = codeStep ? CODE_COPY : copy;
  const primary = (
    <Button appearance="solid" mode="primary" type="submit" block disabled={loading}>
      {loading ? primaryCopy.busy : primaryCopy.submit}
    </Button>
  );

  const forgot = onForgotPassword ? (
    <Button appearance="ghost" mode="neutral" size="sm" onClick={onForgotPassword}>
      Forgot password?
    </Button>
  ) : null;

  const credentials = (
    <>
      {error ? (
        <Alert variant="danger" title={alertTitle}>
          {alertBody}
        </Alert>
      ) : null}

      {ssoList.length > 0 ? (
        <>
          <div className="sign-in-pattern__providers">
            {ssoList.map((provider) => (
              <Button
                key={provider.id}
                appearance="outline"
                mode="neutral"
                block
                iconStart={provider.icon}
                disabled={loading}
                onClick={() => onProvider?.(provider.id)}
              >
                {provider.label}
              </Button>
            ))}
          </div>
          <Divider label="or use email" />
        </>
      ) : null}

      <form
        className="sign-in-pattern__form"
        onSubmit={handleSubmit}
        noValidate
        aria-busy={loading || undefined}
      >
        {signUp ? (
          <Field label="Name" htmlFor={ids.name} error={errors.name}>
            <Input
              id={ids.name}
              name="name"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(value) => {
                setName(value);
                clear("name");
              }}
            />
          </Field>
        ) : null}
        <Field label="Work email" htmlFor={ids.email} error={errors.email}>
          <Input
            id={ids.email}
            type="email"
            name="email"
            autoComplete="username"
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
            autoComplete={signUp ? "new-password" : "current-password"}
            value={password}
            onChange={(value) => {
              setPassword(value);
              clear("password");
            }}
          />
        </Field>

        {!signUp ? (
          <div className="sign-in-pattern__row">
            <Checkbox
              id={ids.remember}
              name="remember"
              label="Stay signed in 30 days"
              checked={remember}
              onChange={setRemember}
            />
            {narrow ? null : forgot}
          </div>
        ) : null}

        {primary}

        {!signUp && narrow && forgot ? <div className="sign-in-pattern__center">{forgot}</div> : null}
      </form>
    </>
  );

  const codeForm = (
    <form className="sign-in-pattern__form" onSubmit={handleVerify} noValidate aria-busy={loading || undefined}>
      <Field
        label={CODE_COPY.label}
        htmlFor={ids.code}
        hint={CODE_COPY.hint}
        error={errors.code || message || undefined}
      >
        <InputOTP
          id={ids.code}
          name="code"
          length={CODE_LENGTH}
          groups={[3, 3]}
          size="md"
          pattern="digits"
          autoComplete="one-time-code"
          disabled={loading}
          value={code}
          onChange={(value) => {
            setCode(value);
            clear("code");
          }}
        />
      </Field>
      {primary}
    </form>
  );

  const footer = codeStep ? null : onSwitchMode ? (
    <p className="sign-in-pattern__footer">
      <span>{copy.switchPrompt}</span>
      <Button
        appearance="ghost"
        mode="neutral"
        size="sm"
        onClick={() => onSwitchMode(signUp ? "sign-in" : "sign-up")}
      >
        {copy.switchLabel}
      </Button>
    </p>
  ) : signUp ? null : (
    <p className="sign-in-pattern__footer">{INVITE}</p>
  );

  return (
    <div className="sign-in-pattern__page">
      <div className="sign-in-pattern__stack">
        {logo || productName ? (
          <div className="sign-in-pattern__brand">
            {logo}
            {productName ? <p className="sign-in-pattern__product-name">{productName}</p> : null}
          </div>
        ) : null}

        <Card
          headingLevel={1}
          size={narrow ? "sm" : "md"}
          title={codeStep ? CODE_COPY.title : copy.title}
          description={codeStep ? CODE_COPY.description : error ? undefined : copy.description}
        >
          {codeStep ? codeForm : credentials}
        </Card>

        {footer}
      </div>
    </div>
  );
}

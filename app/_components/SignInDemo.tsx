"use client";

import { useState } from "react";
import {
  SignInPattern,
  type SignInError,
  type SignInMode,
  type SignInStep,
} from "../../packages/kit/patterns/SignInPattern";
import styles from "../playground.module.css";

const PROVIDERS = [{ id: "sso", label: "Continue with company SSO", icon: "Lock" }];

const WRONG_PASSWORD: SignInError = {
  title: "Email or password is wrong",
  detail: "4 tries left before a 15-minute lock. Reset your password if you're unsure.",
};

const EXPIRED_CODE: SignInError = {
  title: "That code expired.",
  detail: "Enter the new one from your app.",
};

/**
 * The sign-in pattern as a full screen: no AppHeader, no SideNav. `view` is sign-in, sign-up,
 * error (wrong password) or code (step 2). Demo only: no network. A password of "wrong" shows
 * the wrong-password Alert; any other moves to the code step, where 000000 shows the expired-code error.
 */
export function SignInScreen({ view }: { view?: string }) {
  const [mode, setMode] = useState<SignInMode>(view === "sign-up" ? "sign-up" : "sign-in");
  const [step, setStep] = useState<SignInStep>(view === "code" ? "code" : "credentials");
  const [error, setError] = useState<SignInError | undefined>(view === "error" ? WRONG_PASSWORD : undefined);
  const [loading, setLoading] = useState(false);

  function later(done: () => void) {
    setError(undefined);
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      done();
    }, 800);
  }

  return (
    <div className={styles.screenPage}>
      <SignInPattern
        mode={mode}
        step={step}
        productName="Northwind Billing"
        providers={PROVIDERS}
        loading={loading}
        error={error}
        onSubmit={(values) =>
          later(() => {
            if (values.password === "wrong") {
              setError(WRONG_PASSWORD);
              return;
            }
            setError(undefined);
            setStep("code");
          })
        }
        onVerifyCode={(code) => later(() => setError(code === "000000" ? EXPIRED_CODE : undefined))}
        onProvider={() => {}}
        onForgotPassword={() => {}}
        onSwitchMode={view === "sign-up" ? setMode : undefined}
      />
    </div>
  );
}

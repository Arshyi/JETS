"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signInAction, signUpAction } from "@/lib/supabase/auth-actions";
import type { ActionState } from "@/types/persistence";

const defaultActionState: ActionState = {
  message: "",
  status: "idle"
};

type AuthFormProps = {
  initialState?: ActionState;
  mode: "login" | "signup";
  next?: string;
};

export function AuthForm({
  initialState = defaultActionState,
  mode,
  next = "/account"
}: AuthFormProps) {
  const action = mode === "login" ? signInAction : signUpAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="rounded-lg border border-border bg-panel p-6">
      <input type="hidden" name="next" value={next} />

      <div>
        <h1 className="text-3xl font-bold">
          {mode === "login" ? "Log in" : "Create account"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          {mode === "login"
            ? "Access saved builds, favorites, history, and settings."
            : "Create a Supabase-backed JETS account for persistence features."}
        </p>
      </div>

      <div className="mt-6 grid gap-4">
        {mode === "signup" ? (
          <label className="grid gap-2 text-sm font-medium">
            Display name
            <input
              name="displayName"
              type="text"
              className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
              placeholder="Arsh"
            />
          </label>
        ) : null}

        <label className="grid gap-2 text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            required
            className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
            placeholder="you@example.com"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
            placeholder="At least 6 characters"
          />
        </label>
      </div>

      {state.message ? (
        <p
          className={
            state.status === "error"
              ? "mt-4 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning"
              : "mt-4 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent-strong dark:text-accent"
          }
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending
          ? "Working..."
          : mode === "login"
            ? "Log in"
            : "Create account"}
      </button>

      <p className="mt-5 text-center text-sm text-muted">
        {mode === "login" ? "No account yet?" : "Already have an account?"}{" "}
        <Link
          href={mode === "login" ? "/signup" : "/login"}
          className="font-semibold text-accent-strong hover:underline dark:text-accent"
        >
          {mode === "login" ? "Create one" : "Log in"}
        </Link>
      </p>
    </form>
  );
}

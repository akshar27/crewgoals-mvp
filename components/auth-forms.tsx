"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { loginSchema, signupSchema } from "@/lib/validation";

type SignupValues = z.infer<typeof signupSchema>;
type LoginValues = z.infer<typeof loginSchema>;

async function submitAuth(path: string, values: SignupValues | LoginValues) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values)
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Something went wrong.");
  window.location.href = body.redirectTo;
}

export function SignupForm() {
  const [error, setError] = useState("");
  const form = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        setError("");
        try {
          await submitAuth("/api/auth/signup", values);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unable to sign up.");
        }
      })}
    >
      <Field label="Name" error={form.formState.errors.name?.message}>
        <input autoComplete="name" {...form.register("name")} />
      </Field>
      <Field label="Email" error={form.formState.errors.email?.message}>
        <input autoComplete="email" type="email" {...form.register("email")} />
      </Field>
      <Field label="Password" error={form.formState.errors.password?.message}>
        <input autoComplete="new-password" type="password" {...form.register("password")} />
      </Field>
      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <button className="w-full rounded-md bg-ink px-4 py-2 font-semibold text-white hover:bg-moss" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Creating account..." : "Create account"}
      </button>
      <p className="text-center text-sm text-stone-600">
        Already joined? <Link className="font-semibold text-moss" href="/login">Log in</Link>
      </p>
    </form>
  );
}

export function LoginForm() {
  const [error, setError] = useState("");
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        setError("");
        try {
          await submitAuth("/api/auth/login", values);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unable to log in.");
        }
      })}
    >
      <Field label="Email" error={form.formState.errors.email?.message}>
        <input autoComplete="email" type="email" {...form.register("email")} />
      </Field>
      <Field label="Password" error={form.formState.errors.password?.message}>
        <input autoComplete="current-password" type="password" {...form.register("password")} />
      </Field>
      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <button className="w-full rounded-md bg-ink px-4 py-2 font-semibold text-white hover:bg-moss" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Logging in..." : "Log in"}
      </button>
      <p className="text-center text-sm text-stone-600">
        <Link className="font-semibold text-moss" href="/forgot-password">Forgot password?</Link>
      </p>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label>{label}</label>
      {children}
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}

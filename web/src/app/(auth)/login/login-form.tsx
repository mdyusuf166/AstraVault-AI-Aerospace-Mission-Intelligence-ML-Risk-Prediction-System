"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, LockKeyhole } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false
      });

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      router.push(searchParams.get("callbackUrl") ?? "/dashboard");
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="command-card p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-md border border-aurora/30 bg-aurora/10 p-2 text-aurora">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">Secure console</h1>
          <p className="text-sm text-slate-400">Sign in to continue mission operations.</p>
        </div>
      </div>

      <label className="label" htmlFor="email">
        Email
      </label>
      <input id="email" name="email" type="email" autoComplete="email" required className="field mt-2 w-full" />

      <label className="label mt-4 block" htmlFor="password">
        Password
      </label>
      <input id="password" name="password" type="password" autoComplete="current-password" required className="field mt-2 w-full" />

      {error ? <p className="mt-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-telemetry px-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Enter AstraVault
      </button>
    </form>
  );
}

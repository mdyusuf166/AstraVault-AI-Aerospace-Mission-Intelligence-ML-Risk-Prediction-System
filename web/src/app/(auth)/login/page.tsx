import { Rocket } from "lucide-react";
import { Suspense } from "react";
import { LoginForm } from "@/app/(auth)/login/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-telemetry text-slate-950">
            <Rocket className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-white">AstraVault</p>
            <p className="text-sm text-slate-400">Aerospace mission database</p>
          </div>
        </div>
        <Suspense fallback={<div className="command-card p-6 text-sm text-slate-400">Preparing secure console</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}

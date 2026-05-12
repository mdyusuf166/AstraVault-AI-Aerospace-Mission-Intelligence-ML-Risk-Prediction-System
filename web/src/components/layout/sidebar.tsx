"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BrainCircuit,
  Building2,
  Gauge,
  LockKeyhole,
  LogOut,
  Map,
  Orbit,
  Rocket,
  Satellite,
  Shield,
  UserRound,
  Users
} from "lucide-react";
import type { Session } from "next-auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/missions", label: "Missions", icon: Orbit },
  { href: "/rockets", label: "Rockets", icon: Rocket },
  { href: "/agencies", label: "Agencies", icon: Building2 },
  { href: "/astronauts", label: "Astronauts", icon: UserRound },
  { href: "/payloads", label: "Payloads", icon: Satellite },
  { href: "/launch-sites", label: "Launch Sites", icon: Map },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/ai", label: "AI Intelligence", icon: BrainCircuit },
  { href: "/admin", label: "Admin", icon: Shield, admin: true }
];

export function Sidebar({ user }: { user: Session["user"] }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-20 h-auto border-b border-line bg-void/92 backdrop-blur lg:h-screen lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col p-4">
        <Link href="/dashboard" className="mb-5 flex items-center gap-3 rounded-lg border border-line bg-panel-soft p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-telemetry text-slate-950">
            <Rocket className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold text-white">AstraVault</p>
            <p className="text-xs text-slate-400">Mission Database</p>
          </div>
        </Link>

        <nav className="grid gap-1 sm:grid-cols-2 lg:block">
          {navItems
            .filter((item) => !item.admin || user.role === "ADMIN")
            .map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white",
                    active && "bg-telemetry/12 text-telemetry ring-1 ring-telemetry/30"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
        </nav>

        <div className="mt-5 lg:mt-auto">
          <div className="rounded-lg border border-line bg-white/[0.03] p-3">
            <div className="mb-3 flex items-center gap-2 text-xs text-slate-400">
              <LockKeyhole className="h-4 w-4 text-aurora" />
              Authenticated Session
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-aurora/15 text-aurora">
                <Users className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{user.name ?? "Operator"}</p>
                <p className="truncate text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-line px-3 py-2 text-sm text-slate-300 transition hover:border-danger/50 hover:text-danger"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

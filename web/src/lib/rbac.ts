import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

const roleRank: Record<Role, number> = {
  VIEWER: 1,
  RESEARCHER: 2,
  ADMIN: 3
};

export function canAccess(userRole: Role, minimumRole: Role) {
  return roleRank[userRole] >= roleRank[minimumRole];
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(minimumRole: Role) {
  const user = await requireUser();
  if (!canAccess(user.role as Role, minimumRole)) {
    redirect("/dashboard?denied=1");
  }
  return user;
}

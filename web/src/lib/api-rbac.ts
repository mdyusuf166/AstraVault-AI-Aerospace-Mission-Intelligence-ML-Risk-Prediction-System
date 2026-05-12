import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const roleRank: Record<Role, number> = {
  VIEWER: 1,
  RESEARCHER: 2,
  ADMIN: 3
};

function canAccess(userRole: Role, minimumRole: Role) {
  return roleRank[userRole] >= roleRank[minimumRole];
}

export async function requireApiRole(minimumRole: Role) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    return {
      ok: false as const,
      response: Response.json({ error: "Authentication required" }, { status: 401 })
    };
  }

  if (!canAccess(user.role as Role, minimumRole)) {
    return {
      ok: false as const,
      response: Response.json({ error: "Insufficient permissions" }, { status: 403 })
    };
  }

  return { ok: true as const, user };
}

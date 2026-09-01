import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, response: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  return { session, response: null };
}

export async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, response: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  if (!session.user.isSuperAdmin) {
    return { session: null, response: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }
  return { session, response: null };
}

export async function requireWikiEditor() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, response: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  if (!session.user.isSuperAdmin && !session.user.canManageWiki) {
    return { session: null, response: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }
  return { session, response: null };
}

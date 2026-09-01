import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/requireAdmin";
import { createAdminInputSchema } from "@/lib/validation";

export async function GET() {
  const { response } = await requireSuperAdmin();
  if (response) return response;

  const admins = await prisma.admin.findMany({
    select: { id: true, username: true, isSuperAdmin: true, canManageWiki: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ admins });
}

export async function POST(request: Request) {
  const { response } = await requireSuperAdmin();
  if (response) return response;

  const body = await request.json().catch(() => null);
  const parsed = createAdminInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const existing = await prisma.admin.findFirst({
    where: { username: { equals: parsed.data.username, mode: "insensitive" } },
  });
  if (existing) {
    return NextResponse.json({ error: "username_taken" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const admin = await prisma.admin.create({
    data: { username: parsed.data.username, passwordHash, canManageWiki: parsed.data.canManageWiki },
    select: { id: true, username: true, isSuperAdmin: true, canManageWiki: true, createdAt: true },
  });

  return NextResponse.json({ admin }, { status: 201 });
}

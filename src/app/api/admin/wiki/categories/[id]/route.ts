import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWikiEditor } from "@/lib/requireAdmin";
import { wikiCategoryInputSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireWikiEditor();
  if (response) return response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = wikiCategoryInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const category = await prisma.wikiCategory
    .update({ where: { id }, data: { name: parsed.data.name } })
    .catch(() => null);
  if (!category) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ category });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireWikiEditor();
  if (response) return response;

  const { id } = await params;
  await prisma.wikiCategory.delete({ where: { id } }).catch(() => null);

  return NextResponse.json({ ok: true });
}

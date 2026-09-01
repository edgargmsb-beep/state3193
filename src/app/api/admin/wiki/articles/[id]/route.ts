import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWikiEditor } from "@/lib/requireAdmin";
import { wikiArticleInputSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireWikiEditor();
  if (response) return response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = wikiArticleInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const category = await prisma.wikiCategory.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const article = await prisma.wikiArticle.update({ where: { id }, data: parsed.data }).catch(() => null);
  if (!article) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ article });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireWikiEditor();
  if (response) return response;

  const { id } = await params;
  await prisma.wikiArticle.delete({ where: { id } }).catch(() => null);

  return NextResponse.json({ ok: true });
}

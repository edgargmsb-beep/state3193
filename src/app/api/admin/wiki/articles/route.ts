import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWikiEditor } from "@/lib/requireAdmin";
import { wikiArticleInputSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const { response } = await requireWikiEditor();
  if (response) return response;

  const body = await request.json().catch(() => null);
  const parsed = wikiArticleInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const category = await prisma.wikiCategory.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const article = await prisma.wikiArticle.create({ data: parsed.data });

  return NextResponse.json({ article }, { status: 201 });
}

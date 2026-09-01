import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWikiEditor } from "@/lib/requireAdmin";
import { wikiCategoryInputSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const { response } = await requireWikiEditor();
  if (response) return response;

  const body = await request.json().catch(() => null);
  const parsed = wikiCategoryInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const count = await prisma.wikiCategory.count();
  const category = await prisma.wikiCategory.create({
    data: { name: parsed.data.name, order: count },
    include: { articles: true },
  });

  return NextResponse.json({ category }, { status: 201 });
}

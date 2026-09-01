import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { translateText } from "@/lib/translate";
import { translateArticleInputSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = translateArticleInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const article = await prisma.wikiArticle.findUnique({ where: { id } });
  if (!article) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  try {
    const [title, content] = await Promise.all([
      translateText(article.title, article.language, parsed.data.targetLang),
      translateText(article.content, article.language, parsed.data.targetLang),
    ]);
    return NextResponse.json({ title, content });
  } catch {
    return NextResponse.json({ error: "translation_failed" }, { status: 502 });
  }
}

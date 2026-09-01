import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const article = await prisma.wikiArticle.findUnique({
    where: { id },
    include: { category: { select: { id: true, name: true } } },
  });
  if (!article) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ article });
}

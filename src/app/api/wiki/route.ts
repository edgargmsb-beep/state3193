import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isWikiEnabled } from "@/lib/settings";

export async function GET() {
  if (!(await isWikiEnabled())) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const categories = await prisma.wikiCategory.findMany({
    orderBy: { order: "asc" },
    include: {
      articles: {
        select: { id: true, title: true, content: true, language: true, updatedAt: true },
        orderBy: { title: "asc" },
      },
    },
  });

  return NextResponse.json({ categories });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWikiEditor } from "@/lib/requireAdmin";

export async function GET() {
  const { response } = await requireWikiEditor();
  if (response) return response;

  const categories = await prisma.wikiCategory.findMany({
    orderBy: { order: "asc" },
    include: { articles: { orderBy: { title: "asc" } } },
  });

  return NextResponse.json({ categories });
}

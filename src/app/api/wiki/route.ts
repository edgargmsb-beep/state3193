import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

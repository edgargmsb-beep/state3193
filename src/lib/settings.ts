import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

// Read at request time (not build time) so toggling takes effect immediately.
// Falls back to enabled if the read fails, so a missing table can't take the site down.
export async function isWikiEnabled(): Promise<boolean> {
  await connection();
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    return settings?.wikiEnabled ?? true;
  } catch (error) {
    console.error("Failed to read site settings", error);
    return true;
  }
}

export async function setWikiEnabled(wikiEnabled: boolean) {
  return prisma.siteSettings.upsert({
    where: { id: 1 },
    update: { wikiEnabled },
    create: { id: 1, wikiEnabled },
  });
}

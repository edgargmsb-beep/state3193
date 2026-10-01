import { NextResponse } from "next/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/requireAdmin";
import { isWikiEnabled, setWikiEnabled } from "@/lib/settings";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  return NextResponse.json({ wikiEnabled: await isWikiEnabled() });
}

export async function PATCH(request: Request) {
  const { response } = await requireSuperAdmin();
  if (response) return response;

  const body = await request.json().catch(() => null);
  if (typeof body?.wikiEnabled !== "boolean") {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const settings = await setWikiEnabled(body.wikiEnabled);
  return NextResponse.json({ wikiEnabled: settings.wikiEnabled });
}

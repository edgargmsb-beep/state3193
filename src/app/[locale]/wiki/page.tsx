import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { WikiBrowser } from "@/components/WikiBrowser";
import { isWikiEnabled } from "@/lib/settings";

export default async function WikiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (!(await isWikiEnabled())) redirect(`/${locale}/schedule`);

  return <WikiBrowser />;
}

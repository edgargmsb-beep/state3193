import { setRequestLocale } from "next-intl/server";
import { WikiBrowser } from "@/components/WikiBrowser";

export default async function WikiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <WikiBrowser />;
}

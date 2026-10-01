import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { WikiArticleView } from "@/components/WikiArticleView";
import { isWikiEnabled } from "@/lib/settings";

export default async function WikiArticlePage({
  params,
}: {
  params: Promise<{ locale: string; articleId: string }>;
}) {
  const { locale, articleId } = await params;
  setRequestLocale(locale);
  if (!(await isWikiEnabled())) redirect(`/${locale}/schedule`);

  return <WikiArticleView articleId={articleId} />;
}

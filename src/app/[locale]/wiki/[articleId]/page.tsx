import { setRequestLocale } from "next-intl/server";
import { WikiArticleView } from "@/components/WikiArticleView";

export default async function WikiArticlePage({
  params,
}: {
  params: Promise<{ locale: string; articleId: string }>;
}) {
  const { locale, articleId } = await params;
  setRequestLocale(locale);

  return <WikiArticleView articleId={articleId} />;
}

"use client";

import { ArrowLeft, Copy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/PageHeader";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { AdminLinkButton } from "@/components/AdminLinkButton";
import { MarkdownContent } from "@/components/MarkdownContent";
import type { WikiArticleFull } from "@/lib/types";

export function WikiArticleView({ articleId }: { articleId: string }) {
  const t = useTranslations("wiki");
  const locale = useLocale();
  const [article, setArticle] = useState<WikiArticleFull | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/wiki/articles/${articleId}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { article: WikiArticleFull } | null) => setArticle(json?.article ?? null));
  }, [articleId]);

  function handleCopy() {
    if (!article) return;
    navigator.clipboard.writeText(article.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title={article?.title ?? t("title")}
        subtitle={article?.category.name}
        actions={
          <>
            <LanguageSwitcher />
            <AdminLinkButton />
          </>
        }
      />

      <div className="mx-auto w-full max-w-3xl flex-1 p-4 sm:p-8">
        <Link href="/wiki" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200">
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </Link>

        {article === null && <p className="p-8 text-center text-slate-400">{t("noArticles")}</p>}

        {article && (
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <span className="text-xs text-slate-500">
                {t("updatedAt", {
                  date: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(article.updatedAt)),
                })}
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-blue-600 hover:text-blue-400"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? t("copied") : t("copy")}
              </button>
            </div>
            <MarkdownContent content={article.content} />
          </div>
        )}
      </div>
    </div>
  );
}

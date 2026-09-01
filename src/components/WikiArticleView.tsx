"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/PageHeader";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { AdminLinkButton } from "@/components/AdminLinkButton";
import { WikiArticleCard } from "@/components/WikiArticleCard";
import type { WikiArticleFull } from "@/lib/types";

export function WikiArticleView({ articleId }: { articleId: string }) {
  const t = useTranslations("wiki");
  const [article, setArticle] = useState<WikiArticleFull | null | undefined>(undefined);

  useEffect(() => {
    fetch(`/api/wiki/articles/${articleId}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { article: WikiArticleFull } | null) => setArticle(json?.article ?? null));
  }, [articleId]);

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

        {article && <WikiArticleCard article={article} />}
      </div>
    </div>
  );
}

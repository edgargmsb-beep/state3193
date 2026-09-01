"use client";

import { FileText } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/PageHeader";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { AdminLinkButton } from "@/components/AdminLinkButton";
import type { WikiCategory } from "@/lib/types";

export function WikiBrowser() {
  const t = useTranslations("wiki");
  const locale = useLocale();
  const [categories, setCategories] = useState<WikiCategory[] | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/wiki", { cache: "no-store" })
      .then((res) => res.json())
      .then((json: { categories: WikiCategory[] }) => {
        setCategories(json.categories);
        setActiveCategoryId((current) => current ?? json.categories[0]?.id ?? null);
      });
  }, []);

  const activeCategory = categories?.find((c) => c.id === activeCategoryId) ?? null;

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <>
            <LanguageSwitcher />
            <AdminLinkButton />
          </>
        }
      />

      <div className="mx-auto w-full max-w-3xl flex-1 p-4 sm:p-8">
        {categories && categories.length === 0 && (
          <p className="p-8 text-center text-slate-400">{t("noCategories")}</p>
        )}

        {categories && categories.length > 0 && (
          <>
            <div className="mb-6 flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategoryId(category.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
                    activeCategoryId === category.id
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {activeCategory && activeCategory.articles.length === 0 && (
              <p className="p-8 text-center text-slate-400">{t("noArticles")}</p>
            )}

            {activeCategory && activeCategory.articles.length > 0 && (
              <ul className="space-y-2">
                {activeCategory.articles.map((article) => (
                  <li key={article.id}>
                    <Link
                      href={`/wiki/${article.id}`}
                      className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-4 transition-colors hover:border-blue-600 hover:bg-slate-900"
                    >
                      <FileText className="h-5 w-5 shrink-0 text-blue-500" />
                      <span className="font-medium text-slate-100">{article.title}</span>
                      <span className="ms-auto shrink-0 text-xs text-slate-500">
                        {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(article.updatedAt))}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}

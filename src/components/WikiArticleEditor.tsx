"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { WikiArticleAdmin, WikiCategoryAdmin } from "@/lib/types";

type Props = {
  categories: WikiCategoryAdmin[];
  article: WikiArticleAdmin | null;
  defaultCategoryId: string;
  onCancel: () => void;
  onSaved: () => void;
};

export function WikiArticleEditor({ categories, article, defaultCategoryId, onCancel, onSaved }: Props) {
  const t = useTranslations("wikiAdmin");
  const [categoryId, setCategoryId] = useState(article?.categoryId ?? defaultCategoryId);
  const [title, setTitle] = useState(article?.title ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorKey(null);
    try {
      const url = article ? `/api/admin/wiki/articles/${article.id}` : "/api/admin/wiki/articles";
      const res = await fetch(url, {
        method: article ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, title, content }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setErrorKey(body.error ?? "generic");
        return;
      }
      onSaved();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-slate-100">
          {article ? t("edit") : t("addArticle")}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">{t("selectCategory")}</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">{t("articleTitleLabel")}</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={120}
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">{t("articleContentLabel")}</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={12}
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 font-mono text-sm text-slate-100"
            />
            <p className="mt-1 text-xs text-slate-500">{t("articleContentHint")}</p>
          </div>

          {errorKey && (
            <p className="text-sm text-red-400">
              {t(`errors.${errorKey}` as Parameters<typeof t>[0])}
            </p>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

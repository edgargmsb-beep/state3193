"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { WikiArticleEditor } from "@/components/WikiArticleEditor";
import type { WikiArticleAdmin, WikiCategoryAdmin } from "@/lib/types";

export function WikiAdminPanel() {
  const t = useTranslations("wikiAdmin");
  const locale = useLocale();

  const [categories, setCategories] = useState<WikiCategoryAdmin[] | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingArticle, setEditingArticle] = useState<WikiArticleAdmin | null | undefined>(undefined);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/wiki", { cache: "no-store" });
    if (!res.ok) return;
    const json: { categories: WikiCategoryAdmin[] } = await res.json();
    setCategories(json.categories);
    setActiveCategoryId((current) => current ?? json.categories[0]?.id ?? null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const res = await fetch("/api/admin/wiki/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName }),
    });
    if (res.ok) {
      const body: { category: WikiCategoryAdmin } = await res.json();
      setNewCategoryName("");
      setActiveCategoryId(body.category.id);
    }
    load();
  }

  async function handleRenameCategory(category: WikiCategoryAdmin) {
    const name = prompt(t("categoryNamePlaceholder"), category.name);
    if (!name || !name.trim() || name === category.name) return;
    await fetch(`/api/admin/wiki/categories/${category.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    load();
  }

  async function handleDeleteCategory(category: WikiCategoryAdmin) {
    if (!confirm(t("deleteCategoryConfirm"))) return;
    await fetch(`/api/admin/wiki/categories/${category.id}`, { method: "DELETE" });
    setActiveCategoryId(null);
    load();
  }

  async function handleDeleteArticle(article: WikiArticleAdmin) {
    if (!confirm(t("deleteArticleConfirm"))) return;
    await fetch(`/api/admin/wiki/articles/${article.id}`, { method: "DELETE" });
    load();
  }

  if (!categories) return null;

  const activeCategory = categories.find((c) => c.id === activeCategoryId) ?? null;

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title={t("title")} />

      <div className="mx-auto w-full max-w-4xl flex-1 p-4 sm:p-8">
        <h2 className="mb-2 font-medium text-slate-200">{t("categoriesTitle")}</h2>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategoryId(category.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                activeCategoryId === category.id
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <form onSubmit={handleAddCategory} className="mb-6 flex gap-2">
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder={t("categoryNamePlaceholder")}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-200"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            {t("addCategory")}
          </button>
        </form>

        {activeCategory && (
          <div className="mb-8 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-medium text-slate-200">{t("articlesTitle")}</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleRenameCategory(activeCategory)}
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {t("edit")}
                </button>
                <button
                  onClick={() => handleDeleteCategory(activeCategory)}
                  className="inline-flex items-center gap-1 text-xs text-red-400 hover:underline"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("delete")}
                </button>
                <button
                  onClick={() => setEditingArticle(null)}
                  className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t("addArticle")}
                </button>
              </div>
            </div>

            {activeCategory.articles.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-500">{t("empty")}</p>
            )}

            <ul className="space-y-2">
              {activeCategory.articles.map((article) => (
                <li
                  key={article.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-slate-800 px-4 py-2.5 text-sm"
                >
                  <span className="text-slate-200">{article.title}</span>
                  <span className="ms-auto shrink-0 text-xs text-slate-500">
                    {new Intl.DateTimeFormat(locale, { dateStyle: "short" }).format(new Date(article.updatedAt))}
                  </span>
                  <button
                    onClick={() => setEditingArticle(article)}
                    className="inline-flex shrink-0 items-center gap-1 text-blue-400 hover:underline"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {t("edit")}
                  </button>
                  <button
                    onClick={() => handleDeleteArticle(article)}
                    className="inline-flex shrink-0 items-center gap-1 text-red-400 hover:underline"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t("delete")}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!activeCategory && <p className="p-8 text-center text-slate-400">{t("noCategorySelected")}</p>}
      </div>

      {editingArticle !== undefined && activeCategoryId && (
        <WikiArticleEditor
          categories={categories}
          article={editingArticle}
          defaultCategoryId={activeCategoryId}
          onCancel={() => setEditingArticle(undefined)}
          onSaved={() => {
            setEditingArticle(undefined);
            load();
          }}
        />
      )}
    </div>
  );
}

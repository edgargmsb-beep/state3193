"use client";

import { Copy, Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { MarkdownContent } from "@/components/MarkdownContent";

type Article = {
  id: string;
  title: string;
  content: string;
  language: string;
  updatedAt: string;
};

type Translated = { title: string; content: string };

export function WikiArticleCard({ article }: { article: Article }) {
  const t = useTranslations("wiki");
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const [translated, setTranslated] = useState<Translated | null>(null);
  const [showingTranslation, setShowingTranslation] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState(false);

  const displayTitle = showingTranslation && translated ? translated.title : article.title;
  const displayContent = showingTranslation && translated ? translated.content : article.content;

  function handleCopy() {
    navigator.clipboard.writeText(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleTranslateToggle() {
    if (translated) {
      setShowingTranslation((v) => !v);
      return;
    }
    setTranslating(true);
    setTranslateError(false);
    try {
      const res = await fetch(`/api/wiki/articles/${article.id}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetLang: locale }),
      });
      if (!res.ok) {
        setTranslateError(true);
        return;
      }
      const json: Translated = await res.json();
      setTranslated(json);
      setShowingTranslation(true);
    } catch {
      setTranslateError(true);
    } finally {
      setTranslating(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="font-semibold text-slate-100">{displayTitle}</h2>
          <span className="text-xs text-slate-500">
            {t("updatedAt", {
              date: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(article.updatedAt)),
            })}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {article.language !== locale && (
            <button
              onClick={handleTranslateToggle}
              disabled={translating}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-blue-600 hover:text-blue-400 disabled:opacity-60"
            >
              <Languages className="h-3.5 w-3.5" />
              {translating ? t("translating") : showingTranslation ? t("viewOriginal") : t("translate")}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-blue-600 hover:text-blue-400"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? t("copied") : t("copy")}
          </button>
        </div>
      </div>
      {translateError && <p className="mb-3 text-sm text-red-400">{t("translateError")}</p>}
      <MarkdownContent content={displayContent} />
    </div>
  );
}

"use client";

import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function AdminLinkButton() {
  const t = useTranslations("nav");

  return (
    <Link
      href="/admin/login"
      className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-1.5 text-sm font-medium text-slate-200 hover:border-blue-600 hover:text-blue-400"
    >
      <Lock className="h-4 w-4" />
      {t("adminLink")}
    </Link>
  );
}

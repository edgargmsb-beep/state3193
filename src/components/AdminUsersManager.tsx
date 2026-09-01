"use client";

import { ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

type AdminUser = {
  id: string;
  username: string;
  isSuperAdmin: boolean;
  canManageWiki: boolean;
  createdAt: string;
};

export function AdminUsersManager() {
  const t = useTranslations("admins");

  const [admins, setAdmins] = useState<AdminUser[] | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [canManageWiki, setCanManageWiki] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/admins", { cache: "no-store" });
    if (!res.ok) return;
    const json: { admins: AdminUser[] } = await res.json();
    setAdmins(json.admins);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setErrorKey(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, canManageWiki }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setErrorKey(body.error ?? "generic");
        return;
      }
      setUsername("");
      setPassword("");
      setCanManageWiki(false);
      load();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t("deleteConfirm"))) return;
    const res = await fetch(`/api/admin/admins/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert(t(`errors.${body.error ?? "generic"}` as Parameters<typeof t>[0]));
      return;
    }
    load();
  }

  if (!admins) return null;

  return (
    <div className="mt-10 rounded-lg border border-slate-800 bg-slate-900/40 p-4 sm:p-6">
      <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-slate-100">
        <ShieldCheck className="h-5 w-5 text-blue-500" />
        {t("title")}
      </h2>
      <p className="mb-4 text-sm text-slate-400">{t("subtitle")}</p>

      <ul className="mb-6 divide-y divide-slate-800 rounded-md border border-slate-800">
        {admins.map((admin) => (
          <li key={admin.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
            <span className="flex items-center gap-2 text-slate-200">
              {admin.username}
              {admin.isSuperAdmin && (
                <span className="rounded-full bg-blue-600/20 px-2 py-0.5 text-xs text-blue-400">
                  {t("superAdminBadge")}
                </span>
              )}
              {admin.canManageWiki && (
                <span className="rounded-full bg-emerald-600/20 px-2 py-0.5 text-xs text-emerald-400">
                  {t("wikiEditorBadge")}
                </span>
              )}
            </span>
            <button
              onClick={() => handleDelete(admin.id)}
              className="inline-flex items-center gap-1 text-red-400 hover:underline"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("delete")}
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">{t("usernameLabel")}</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-200 sm:w-auto"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">{t("passwordLabel")}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-200 sm:w-auto"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={canManageWiki}
            onChange={(e) => setCanManageWiki(e.target.checked)}
          />
          {t("wikiEditorLabel")}
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          <UserPlus className="h-4 w-4" />
          {t("addButton")}
        </button>
      </form>
      {errorKey && <p className="mt-2 text-sm text-red-400">{t(`errors.${errorKey}` as Parameters<typeof t>[0])}</p>}
    </div>
  );
}

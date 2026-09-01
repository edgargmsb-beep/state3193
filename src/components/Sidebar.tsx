"use client";

import { BookOpen, CalendarDays, ChevronDown, Home, Info, Menu, Mountain, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const STATE_NUMBER = process.env.NEXT_PUBLIC_STATE_NUMBER;

export function Sidebar() {
  const t = useTranslations("nav");
  const tLang = useTranslations("languages");
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navItems = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/schedule", label: t("schedule"), icon: CalendarDays },
    { href: "/wiki", label: t("wiki"), icon: BookOpen },
    { href: "/how-it-works", label: t("howItWorks"), icon: Info },
  ] as const;

  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#0d1526] px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <Mountain className="h-6 w-6 text-blue-500" />
          <span className="text-sm font-bold text-slate-100">WHITEOUT SURVIVAL</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label={t("openMenu")}
          className="rounded-md p-1.5 text-slate-300 hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 start-0 z-50 flex w-64 shrink-0 -translate-x-full flex-col border-e border-slate-800 bg-[#0d1526] transition-transform duration-200 rtl:translate-x-full md:static md:z-auto md:translate-x-0 ${
          mobileOpen ? "translate-x-0 rtl:translate-x-0" : ""
        }`}
      >
        <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-6">
          <Mountain className="h-8 w-8 shrink-0 text-blue-500" />
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight text-slate-100">WHITEOUT SURVIVAL</p>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">{t("subtitle")}</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label={t("closeMenu")}
            className="ms-auto rounded-md p-1 text-slate-400 hover:bg-slate-800 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {STATE_NUMBER && (
          <div className="border-b border-slate-800 px-5 py-3 text-xs font-medium text-slate-400">
            {t("state", { number: STATE_NUMBER })}
          </div>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}

          <div>
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <span className="flex items-center gap-3">
                <ChevronDown className={`h-4 w-4 transition-transform ${langOpen ? "rotate-180" : ""}`} />
                {t("language")}
              </span>
            </button>
            {langOpen && (
              <div className="mt-1 ms-4 space-y-0.5 border-s border-slate-800 ps-3">
                {routing.locales.map((l) => (
                  <button
                    key={l}
                    onClick={() => router.replace(pathname, { locale: l })}
                    className={`block w-full rounded-md px-2 py-1.5 text-left text-sm ${
                      l === locale ? "text-blue-400" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tLang(l)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="border-t border-slate-800 px-5 py-4 text-[11px] text-slate-500">
          {t("copyright", { year: new Date().getFullYear() })}
        </div>
      </aside>
    </>
  );
}

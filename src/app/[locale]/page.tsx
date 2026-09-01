import { BookOpen, CalendarDays, Info } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/PageHeader";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { AdminLinkButton } from "@/components/AdminLinkButton";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const cards = [
    {
      href: "/schedule" as const,
      icon: CalendarDays,
      title: t("scheduleCardTitle"),
      description: t("scheduleCardDesc"),
    },
    {
      href: "/wiki" as const,
      icon: BookOpen,
      title: t("wikiCardTitle"),
      description: t("wikiCardDesc"),
    },
    {
      href: "/how-it-works" as const,
      icon: Info,
      title: t("howItWorksCardTitle"),
      description: t("howItWorksCardDesc"),
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title={t("welcomeTitle")}
        subtitle={t("welcomeSubtitle")}
        actions={
          <>
            <LanguageSwitcher />
            <AdminLinkButton />
          </>
        }
      />

      <div className="mx-auto grid w-full max-w-4xl flex-1 grid-cols-1 gap-4 p-4 sm:grid-cols-3 sm:p-8">
        {cards.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-6 transition-colors hover:border-blue-600 hover:bg-slate-900"
          >
            <Icon className="h-8 w-8 text-blue-500" />
            <h2 className="font-semibold text-slate-100">{title}</h2>
            <p className="text-sm text-slate-400">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

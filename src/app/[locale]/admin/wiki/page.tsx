import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { WikiAdminPanel } from "@/components/WikiAdminPanel";

export default async function AdminWikiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/admin/login`);
  }
  if (!session.user.isSuperAdmin && !session.user.canManageWiki) {
    redirect(`/${locale}/admin`);
  }
  return <WikiAdminPanel />;
}

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminPanel } from "@/components/AdminPanel";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/admin/login`);
  }
  if (session.user.canManageWiki && !session.user.isSuperAdmin) {
    redirect(`/${locale}/admin/wiki`);
  }
  return <AdminPanel isSuperAdmin={session.user.isSuperAdmin} canManageWiki={session.user.canManageWiki} />;
}

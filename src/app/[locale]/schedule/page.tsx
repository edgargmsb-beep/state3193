import { setRequestLocale } from "next-intl/server";
import { BookingGrid } from "@/components/BookingGrid";

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <BookingGrid />;
}

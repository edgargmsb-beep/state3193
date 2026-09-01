"use client";

import { ClipboardCopy, Copy, LogOut, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { adminLogout } from "@/lib/actions";
import {
  DAYS,
  ENGLISH_DAY_NAMES,
  SLOT_COUNT,
  dateForDay,
  formatShortDate,
  slotToLabel,
  type DayKey,
} from "@/lib/slots";
import type { AdminBooking, AdminEvent } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { AdminUsersManager } from "@/components/AdminUsersManager";
import { AuditLogViewer } from "@/components/AuditLogViewer";
import { EditBookingModal } from "@/components/EditBookingModal";

function todayIso(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function AdminPanel({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const t = useTranslations("admin");
  const tDays = useTranslations("days");
  const locale = useLocale();

  const [events, setEvents] = useState<AdminEvent[] | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedFreeSlotsDay, setCopiedFreeSlotsDay] = useState<DayKey | null>(null);
  const [editingBooking, setEditingBooking] = useState<AdminBooking | null>(null);
  const [newEventDates, setNewEventDates] = useState<Record<DayKey, string>>({
    CONSTRUCTION: todayIso(),
    RESEARCH: todayIso(1),
    TROOPS: todayIso(2),
  });

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/events", { cache: "no-store" });
    if (!res.ok) return;
    const json: { events: AdminEvent[] } = await res.json();
    setEvents(json.events);
    setSelectedEventId((current) => current ?? json.events.find((e) => e.isActive)?.id ?? json.events[0]?.id ?? null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(bookingId: string) {
    if (!confirm(t("deleteConfirm"))) return;
    await fetch(`/api/admin/bookings/${bookingId}`, { method: "DELETE" });
    load();
  }

  async function handleNewEvent() {
    if (!confirm(t("newEventConfirm"))) return;
    await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        constructionDate: newEventDates.CONSTRUCTION,
        researchDate: newEventDates.RESEARCH,
        troopsDate: newEventDates.TROOPS,
      }),
    });
    setSelectedEventId(null);
    load();
  }

  function handleCopy(gameId: string) {
    navigator.clipboard.writeText(gameId);
    setCopiedId(gameId);
    setTimeout(() => setCopiedId(null), 1500);
  }

  function handleCopyFreeSlots(day: DayKey) {
    const taken = new Set((bookingsByDay.get(day) ?? []).map((b) => b.slot));
    const freeTimes: string[] = [];
    for (let slot = 0; slot < SLOT_COUNT; slot++) {
      if (!taken.has(slot)) freeTimes.push(slotToLabel(slot));
    }
    const text = `These are the free times for ${ENGLISH_DAY_NAMES[day]} (UTC):\n${freeTimes.join(" ")}`;
    navigator.clipboard.writeText(text);
    setCopiedFreeSlotsDay(day);
    setTimeout(() => setCopiedFreeSlotsDay(null), 1500);
  }

  async function handleReactivate() {
    if (!selectedEventId) return;
    if (!confirm(t("reactivateConfirm"))) return;
    await fetch(`/api/admin/events/${selectedEventId}/activate`, { method: "POST" });
    load();
  }

  if (!events) return null;

  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? events[0] ?? null;

  const bookingsByDay = new Map<DayKey, (typeof events)[number]["bookings"]>();
  for (const day of DAYS) bookingsByDay.set(day, []);
  for (const booking of selectedEvent?.bookings ?? []) {
    bookingsByDay.get(booking.day)?.push(booking);
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title={t("panelTitle")}
        actions={
          <form action={() => adminLogout(locale)}>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-full border border-slate-700 px-4 py-1.5 text-sm text-slate-300 hover:border-red-600 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              {t("logout")}
            </button>
          </form>
        }
      />

      <div className="mx-auto w-full max-w-4xl flex-1 p-4 sm:p-8">
        <div className="mb-8 flex flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900/40 p-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              {selectedEvent?.isActive ? t("activeEvent") : t("history")}
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedEventId ?? ""}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-200 sm:w-auto"
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.label} · {formatShortDate(dateForDay(event, "CONSTRUCTION"), locale)} {event.isActive ? "★" : ""}
                  </option>
                ))}
              </select>
              {selectedEvent && !selectedEvent.isActive && (
                <button
                  onClick={handleReactivate}
                  title={t("reactivate")}
                  className="flex shrink-0 items-center gap-1.5 rounded-md border border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:border-blue-600 hover:text-blue-400"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {t("reactivate")}
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:ml-auto sm:flex-row sm:items-end sm:flex-wrap">
            {DAYS.map((day) => (
              <div key={day}>
                <label className="mb-1 block text-xs font-medium text-slate-400">{tDays(day)}</label>
                <input
                  type="date"
                  value={newEventDates[day]}
                  onChange={(e) => setNewEventDates((prev) => ({ ...prev, [day]: e.target.value }))}
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-200 sm:w-auto"
                />
              </div>
            ))}
            <button
              onClick={handleNewEvent}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              {t("newEvent")}
            </button>
          </div>
        </div>

        {DAYS.map((day) => (
          <div key={day} className="mb-6">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="font-medium text-slate-200">{tDays(day)}</h2>
              <button
                onClick={() => handleCopyFreeSlots(day)}
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:underline"
              >
                <ClipboardCopy className="h-3.5 w-3.5" />
                {copiedFreeSlotsDay === day ? t("copiedFreeSlots") : t("copyFreeSlots")}
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/70 text-slate-400">
                  <tr>
                    <th className="px-3 py-2">{t("time")}</th>
                    <th className="px-3 py-2">{t("gameId")}</th>
                    <th className="px-3 py-2">{t("playerName")}</th>
                    <th className="px-3 py-2">{t("alliance")}</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {(bookingsByDay.get(day) ?? []).length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
                        {t("empty")}
                      </td>
                    </tr>
                  )}
                  {(bookingsByDay.get(day) ?? [])
                    .sort((a, b) => a.slot - b.slot)
                    .map((booking) => (
                      <tr key={booking.id} className="border-t border-slate-800 text-slate-300">
                        <td className="px-3 py-2 font-mono">{slotToLabel(booking.slot)}</td>
                        <td className="px-3 py-2">{booking.gameId}</td>
                        <td className="px-3 py-2">{booking.playerName}</td>
                        <td className="px-3 py-2">{booking.alliance}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <button
                            onClick={() => handleCopy(booking.gameId)}
                            className="mr-3 inline-flex items-center gap-1 text-blue-400 hover:underline"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            {copiedId === booking.gameId ? t("copied") : t("copyId")}
                          </button>
                          <button
                            onClick={() => setEditingBooking(booking)}
                            className="mr-3 inline-flex items-center gap-1 text-slate-300 hover:underline"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            {t("edit")}
                          </button>
                          <button
                            onClick={() => handleDelete(booking.id)}
                            className="inline-flex items-center gap-1 text-red-400 hover:underline"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {t("delete")}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {isSuperAdmin && <AdminUsersManager />}
        {isSuperAdmin && <AuditLogViewer />}
      </div>

      {editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          onCancel={() => setEditingBooking(null)}
          onSaved={() => {
            setEditingBooking(null);
            load();
          }}
        />
      )}
    </div>
  );
}

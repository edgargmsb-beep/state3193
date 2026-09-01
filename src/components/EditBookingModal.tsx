"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { bookingInputSchema, type BookingInput } from "@/lib/validation";
import { DAYS, SLOT_COUNT, slotToLabel, type DayKey } from "@/lib/slots";
import type { AdminBooking } from "@/lib/types";

type Props = {
  booking: AdminBooking;
  onCancel: () => void;
  onSaved: () => void;
};

export function EditBookingModal({ booking, onCancel, onSaved }: Props) {
  const t = useTranslations("form");
  const tAdmin = useTranslations("admin");
  const tDays = useTranslations("days");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingInputSchema),
    defaultValues: {
      day: booking.day,
      slot: booking.slot,
      gameId: booking.gameId,
      playerName: booking.playerName,
      alliance: booking.alliance,
    },
  });

  const gameIdField = register("gameId");
  const allianceField = register("alliance");

  async function onSubmit(data: BookingInput) {
    setSubmitting(true);
    setErrorKey(null);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setErrorKey(body.error ?? "generic");
        return;
      }
      onSaved();
    } catch {
      setErrorKey("generic");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-slate-100">{tAdmin("editBookingTitle")}</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-slate-300">{t("day")}</label>
              <select
                {...register("day")}
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
              >
                {DAYS.map((day: DayKey) => (
                  <option key={day} value={day}>
                    {tDays(day)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-slate-300">{t("time")}</label>
              <select
                {...register("slot", { valueAsNumber: true })}
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
              >
                {Array.from({ length: SLOT_COUNT }, (_, slot) => (
                  <option key={slot} value={slot}>
                    {slotToLabel(slot)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">{t("gameId")}</label>
            <input
              {...gameIdField}
              inputMode="numeric"
              maxLength={10}
              onChange={(e) => {
                e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
                gameIdField.onChange(e);
              }}
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
            />
            {errors.gameId ? (
              <p className="mt-1 text-xs text-red-400">{t("errors.invalid_input")}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">{t("gameIdHint")}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">{t("playerName")}</label>
            <input
              {...register("playerName")}
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
            />
            {errors.playerName && (
              <p className="mt-1 text-xs text-red-400">{t("errors.invalid_input")}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">{t("alliance")}</label>
            <input
              {...allianceField}
              maxLength={3}
              onChange={(e) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 3);
                allianceField.onChange(e);
              }}
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 uppercase text-slate-100"
            />
            {errors.alliance ? (
              <p className="mt-1 text-xs text-red-400">{t("errors.invalid_input")}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">{t("allianceHint")}</p>
            )}
          </div>

          {errorKey && (
            <p className="text-sm text-red-400">
              {t(`errors.${errorKey}` as Parameters<typeof t>[0])}
            </p>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? t("submitting") : tAdmin("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import type { DayKey, EventDates } from "@/lib/slots";

type EventCore = { id: string; label: string; isActive: boolean; createdAt: string } & EventDates;

export type PublicBooking = {
  day: DayKey;
  slot: number;
  playerName: string;
  alliance: string;
};

export type ActiveEventResponse = {
  event: EventCore | null;
  bookings: PublicBooking[];
};

export type AdminBooking = {
  id: string;
  day: DayKey;
  slot: number;
  gameId: string;
  playerName: string;
  alliance: string;
  createdAt: string;
};

export type AdminEvent = EventCore & {
  bookings: AdminBooking[];
};

export type AuditLogPreviousValues = {
  day: DayKey;
  slot: number;
  gameId: string;
  playerName: string;
  alliance: string;
};

export type AuditLogEntry = {
  id: string;
  action: string;
  adminUsername: string;
  eventLabel: string;
  day: DayKey;
  slot: number;
  gameId: string;
  playerName: string;
  alliance: string;
  previousValues: AuditLogPreviousValues | null;
  createdAt: string;
};

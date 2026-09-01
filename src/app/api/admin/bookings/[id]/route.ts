import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { bookingInputSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = bookingInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const { gameId, playerName, alliance, day, slot } = parsed.data;

  const existing = await prisma.booking.findUnique({
    where: { id },
    include: { event: { select: { label: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const unchanged =
    existing.day === day &&
    existing.slot === slot &&
    existing.gameId === gameId &&
    existing.playerName === playerName &&
    existing.alliance === alliance;
  if (unchanged) {
    return NextResponse.json({ booking: existing });
  }

  try {
    const [, booking] = await prisma.$transaction([
      prisma.auditLog.create({
        data: {
          action: "booking.updated",
          adminId: session.user.id,
          adminUsername: session.user.name ?? "",
          eventLabel: existing.event.label,
          day,
          slot,
          gameId,
          playerName,
          alliance,
          previousValues: {
            day: existing.day,
            slot: existing.slot,
            gameId: existing.gameId,
            playerName: existing.playerName,
            alliance: existing.alliance,
          },
        },
      }),
      prisma.booking.update({
        where: { id },
        data: { day, slot, gameId, playerName, alliance },
      }),
    ]);

    return NextResponse.json({ booking });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const target = (err.meta?.target as string[] | undefined) ?? [];
      if (target.includes("slot")) {
        return NextResponse.json({ error: "slot_taken" }, { status: 409 });
      }
      if (target.includes("gameId")) {
        return NextResponse.json({ error: "id_already_booked_today" }, { status: 409 });
      }
    }
    throw err;
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { event: { select: { label: true } } },
  });
  if (!booking) {
    return NextResponse.json({ ok: true });
  }

  await prisma.$transaction([
    prisma.auditLog.create({
      data: {
        action: "booking.deleted",
        adminId: session.user.id,
        adminUsername: session.user.name ?? "",
        eventLabel: booking.event.label,
        day: booking.day,
        slot: booking.slot,
        gameId: booking.gameId,
        playerName: booking.playerName,
        alliance: booking.alliance,
      },
    }),
    prisma.booking.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}

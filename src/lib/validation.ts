import { z } from "zod";
import { DAYS, SLOT_COUNT } from "@/lib/slots";
import { locales } from "@/i18n/routing";

// IDs de jogador do Whiteout Survival sao numericos, tipicamente com 9 digitos.
// A faixa 6-10 cobre contas antigas (menos digitos) e crescimento futuro, mas
// rejeita entradas obviamente erradas como "2100".
const gameIdSchema = z
  .string()
  .trim()
  .regex(/^\d{6,10}$/, "invalid_input");

const playerNameSchema = z.string().trim().min(1).max(50);

const allianceSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z]{3}$/, "invalid_input")
  .transform((v) => v.toUpperCase());

export const bookingInputSchema = z.object({
  gameId: gameIdSchema,
  playerName: playerNameSchema,
  alliance: allianceSchema,
  day: z.enum(DAYS),
  slot: z.number().int().min(0).max(SLOT_COUNT - 1),
});

export type BookingInput = z.infer<typeof bookingInputSchema>;

export const batchBookingInputSchema = z.object({
  gameId: gameIdSchema,
  playerName: playerNameSchema,
  alliance: allianceSchema,
  days: z.array(z.enum(DAYS)).min(1),
  slot: z.number().int().min(0).max(SLOT_COUNT - 1),
});

export type BatchBookingInput = z.infer<typeof batchBookingInputSchema>;

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const createEventInputSchema = z.object({
  constructionDate: dateStringSchema,
  researchDate: dateStringSchema,
  troopsDate: dateStringSchema,
});

export type CreateEventInput = z.infer<typeof createEventInputSchema>;

export const createAdminInputSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_.-]+$/, "invalid_input"),
  password: z.string().min(8).max(100),
  canManageWiki: z.boolean().optional().default(false),
});

export type CreateAdminInput = z.infer<typeof createAdminInputSchema>;

export const wikiCategoryInputSchema = z.object({
  name: z.string().trim().min(1).max(60),
});

export type WikiCategoryInput = z.infer<typeof wikiCategoryInputSchema>;

export const wikiArticleInputSchema = z.object({
  categoryId: z.string().trim().min(1),
  title: z.string().trim().min(1).max(120),
  content: z.string().trim().min(1).max(20000),
  language: z.enum(locales),
});

export type WikiArticleInput = z.infer<typeof wikiArticleInputSchema>;

export const translateArticleInputSchema = z.object({
  targetLang: z.enum(locales),
});

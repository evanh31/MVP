import { z } from "zod";
import { BOTS } from "./types";

export const ingestEnvelopeSchema = z.object({
  event_id: z.string().min(1),
  ts: z
    .string()
    .min(1)
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "ts must be a parseable ISO-8601 datetime",
    }),
  bot: z.string().min(1),
  run_id: z.string().min(1),
  type: z.string().min(1),
  payload: z.record(z.string(), z.unknown()).default({}),
});

export const ingestBodySchema = z.union([
  ingestEnvelopeSchema,
  z.object({
    events: z.array(ingestEnvelopeSchema).min(1),
  }),
]);

export function isKnownBot(bot: string): boolean {
  return (BOTS as readonly string[]).includes(bot);
}

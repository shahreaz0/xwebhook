import { z } from "zod";
import { IdParamsSchema } from "@/lib/schema-contants";

export const WebhookSchema = z.object({
  id: z.cuid2().openapi({ example: "ckwxyz123456abcdef12345" }),
  eventTypes: z.array(z.cuid2()).openapi({
    example: ["ckwxyz123456abcdef12345", "ckwxyz123456abcdef12345"],
  }),
  url: z.url().openapi({ example: "https://example.com/webhook" }),
  secrets: z.string().openapi({ example: "supersecret" }),
  description: z
    .string()
    .nullish()
    .openapi({ example: "Webhook for notifications" }),
  disabled: z.boolean().default(true).openapi({ example: false }),
  metadata: z.any().nullish().openapi({ example: {} }),
  rateLimit: z.number().nullish().openapi({ example: 10 }),
  // eventId: z.cuid2().openapi({ example: "ckwxyz123456abcdef12345" }),
  appUserId: z.cuid2().openapi({ example: "ckwxyz123456abcdef12345" }),
  createdAt: z.date().openapi({ example: new Date().toISOString() }),
  updatedAt: z.date().openapi({ example: new Date().toISOString() }),
});

export const WebhookCreateSchema = WebhookSchema.omit({
  id: true,
  appUserId: true,
  createdAt: true,
  updatedAt: true,
});

export const WebhookUpdateSchema = WebhookCreateSchema.partial();

export const WebhookParamsSchema = IdParamsSchema.extend({
  webhookId: z.cuid2(),
});

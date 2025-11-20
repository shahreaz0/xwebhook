import { z } from "zod";

export const WebhookSchema = z.object({
  id: z.cuid2().openapi({ example: "ckwxyz123456abcdef12345" }),
  orgId: z.string().openapi({ example: "org_abc123" }),
  eventTypes: z.array(z.any()), // You may want to use a more specific schema for EventType
  url: z.url().openapi({ example: "https://example.com/webhook" }),
  secrets: z.string().openapi({ example: "supersecret" }),
  description: z
    .string()
    .nullable()
    .optional()
    .openapi({ example: "Webhook for notifications" }),
  disabled: z.boolean().openapi({ example: false }),
  metadata: z.any().nullable().optional(),
  rateLimit: z.number().nullable().optional(),
  eventId: z.string().openapi({ example: "evt_abc123" }),
  appUserId: z.string().nullable().optional(),
  createdAt: z.date().openapi({ example: new Date().toISOString() }),
  updatedAt: z.date().openapi({ example: new Date().toISOString() }),
});

export const WebhookCreateSchema = WebhookSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const WebhookUpdateSchema = WebhookCreateSchema.partial();

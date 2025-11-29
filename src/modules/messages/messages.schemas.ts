import { z } from "@hono/zod-openapi";

export const MessageStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "DELIVERED",
  "FAILED",
  "RETRYING",
  "SKIPPED",
  "EXPIRED",
]);

export const MessageSchema = z.object({
  id: z.cuid2().openapi({ example: "cm3..." }),
  appUserId: z.cuid2().nullable().openapi({ example: "cm3..." }),
  eventTypeId: z.cuid2().openapi({ example: "cm3..." }),
  payload: z
    .record(z.string(), z.unknown())
    .openapi({ example: { foo: "bar" } }),
  status: MessageStatusSchema.openapi({ example: "PENDING" }),
  deliverAt: z.string().nullable().openapi({ example: "2024-01-01T00:00:00Z" }),
  createdAt: z.string().openapi({ example: "2024-01-01T00:00:00Z" }),
});

export const MessageCreateSchema = MessageSchema.omit({
  id: true,
  appUserId: true,
  status: true,
  createdAt: true,
  deliverAt: true,
});

export const MessageUpdateSchema = z.object({
  status: MessageStatusSchema.optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
  deliverAt: z.string().nullable().optional(),
});

export const AppUserParamsSchema = z.object({
  appUserId: z
    .cuid2()
    .openapi({ param: { name: "appUserId", in: "path", required: true } }),
});

export const MessageParamsSchema = AppUserParamsSchema.extend({
  messageId: z
    .cuid2()
    .openapi({ param: { name: "messageId", in: "path", required: true } }),
});

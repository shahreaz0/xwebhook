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
  id: z.string().openapi({ example: "cm3..." }),
  appUserId: z.string().nullable().openapi({ example: "cm3..." }),
  eventTypeId: z.string().openapi({ example: "cm3..." }),
  payload: z
    .record(z.string(), z.unknown())
    .openapi({ example: { foo: "bar" } }),
  status: MessageStatusSchema.openapi({ example: "PENDING" }),
  deliverAt: z.string().nullable().openapi({ example: "2024-01-01T00:00:00Z" }),
  createdAt: z.string().openapi({ example: "2024-01-01T00:00:00Z" }),
});

export const MessageCreateSchema = z.object({
  appUserId: z.string().optional(),
  eventTypeId: z.string(),
  payload: z.record(z.string(), z.unknown()),
  deliverAt: z.string().optional(),
});

export const MessageUpdateSchema = z.object({
  status: MessageStatusSchema.optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
  deliverAt: z.string().nullable().optional(),
});

export const MessageParamsSchema = z.object({
  id: z.string().openapi({ param: { name: "id", in: "path" } }),
  messageId: z.string().openapi({ param: { name: "messageId", in: "path" } }),
});

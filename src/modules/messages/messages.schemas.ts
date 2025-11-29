import { z } from "@hono/zod-openapi";
import {
  createSortBySchema,
  PaginationQuerySchema,
  SortOrderSchema,
} from "@/lib/common-schemas";

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

export const MessageListQuerySchema = PaginationQuerySchema.extend({
  // Sorting
  sortBy: createSortBySchema(["createdAt", "deliverAt", "status"], "createdAt"),
  order: SortOrderSchema,
  // Filtering
  status: z
    .array(MessageStatusSchema)
    .or(MessageStatusSchema)
    .optional()
    .openapi({
      param: { name: "status", in: "query" },
      example: ["PENDING", "DELIVERED"],
      description: "Filter by message status (can specify multiple)",
    }),
  eventTypeId: z
    .cuid2()
    .optional()
    .openapi({
      param: { name: "eventTypeId", in: "query" },
      example: "cm3...",
      description: "Filter by event type ID",
    }),
  deliverAtFrom: z.iso
    .datetime()
    .optional()
    .openapi({
      param: { name: "deliverAtFrom", in: "query" },
      example: "2024-01-01T00:00:00Z",
      description: "Filter messages with deliverAt >= this date",
    }),
  deliverAtTo: z.iso
    .datetime()
    .optional()
    .openapi({
      param: { name: "deliverAtTo", in: "query" },
      example: "2024-12-31T23:59:59Z",
      description: "Filter messages with deliverAt <= this date",
    }),
});

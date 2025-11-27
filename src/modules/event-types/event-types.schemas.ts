import { z } from "zod";
import { IdParamsSchema } from "@/lib/schema-contants";

export const EventTypeSchema = z.object({
  id: z.cuid2().openapi({ example: "ckz1234560000abcdef12345" }),
  orgId: z.string().openapi({ example: "org_123456789" }),
  name: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/, {
      message: "Name must follow the format resource.action",
    })
    .openapi({ example: "user.created" }),
  description: z
    .string()
    .openapi({ example: "Triggered when a new user is created" }),
  applicationId: z.cuid2().openapi({ example: "ckz1234560000abcdef67890" }),
  createdAt: z.date().openapi({ example: new Date().toISOString() }),
  updatedAt: z.date().openapi({ example: new Date().toISOString() }),
});

export const EventTypeCreateSchema = EventTypeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  orgId: true, // We will set this in handler from jwtPayload or similar
  applicationId: true,
});

export const EventTypeUpdateSchema = EventTypeCreateSchema.partial();

export const EventTypeParamsSchema = IdParamsSchema.extend({
  eventTypeId: z.cuid2(),
});

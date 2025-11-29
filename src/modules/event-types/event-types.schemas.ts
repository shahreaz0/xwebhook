import { z } from "zod";

export const EventTypeSchema = z.object({
  id: z.cuid2().openapi({ example: "ckz1234560000abcdef12345" }),
  name: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/, {
      message: "Name must follow the format resource.action",
    })
    .openapi({ example: "user.created" }),
  description: z
    .string()
    .nullish()
    .openapi({ example: "Triggered when a new user is created" }),
  applicationId: z.cuid2().openapi({ example: "ckz1234560000abcdef67890" }),

  archived: z.boolean().default(false).openapi({ example: false }),
  deprecated: z.boolean().default(false).openapi({ example: false }),
  groupName: z.string().nullish().openapi({ example: "user" }),

  createdAt: z.date().openapi({ example: new Date().toISOString() }),
  updatedAt: z.date().openapi({ example: new Date().toISOString() }),
});

export const EventTypeCreateSchema = EventTypeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  applicationId: true,
});

export const EventTypeUpdateSchema = EventTypeCreateSchema.extend({
  archived: z.boolean(),
  deprecated: z.boolean(),
}).partial();

export const ApplicationParamsSchema = z.object({
  applicationId: z
    .string()
    .openapi({ param: { name: "applicationId", in: "path", required: true } }),
});

export const EventTypeParamsSchema = ApplicationParamsSchema.extend({
  eventTypeId: z
    .string()
    .openapi({ param: { name: "eventTypeId", in: "path", required: true } }),
});

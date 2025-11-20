import { z } from "zod";

export const ApplicationSchema = z.object({
  id: z.cuid2().openapi({ example: "ckz1234560000abcdef12345" }),
  name: z.string().openapi({ example: "My App" }),
  description: z
    .string()
    .nullable()
    .optional()
    .openapi({ example: "This is a sample application" }),
  userId: z.cuid2().openapi({ example: "ckz1234560000abcdef67890" }),
  createdAt: z.date().openapi({ example: new Date().toISOString() }),
  updatedAt: z.date().openapi({ example: new Date().toISOString() }),
});

export const ApplicationCreateSchema = ApplicationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
});

export const ApplicationUpdateSchema = ApplicationCreateSchema.partial();

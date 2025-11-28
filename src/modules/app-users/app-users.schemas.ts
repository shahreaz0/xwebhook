import { z } from "zod";
import { IdParamsSchema } from "@/lib/schema-contants";

export const AppUserSchema = z.object({
  id: z.cuid2().openapi({ example: "ckz1234560000abcdef12345" }),
  applicationId: z.cuid2().openapi({ example: "ckz1234560000abcdef67890" }),
  userId: z.string().openapi({ example: "ckz1234560000abcdef99999" }),
  email: z.email().openapi({ example: "user@example.com" }),
  metadata: z.any().nullable().optional().openapi({ example: null }),
  createdAt: z.date().openapi({ example: new Date().toISOString() }),
  updatedAt: z.date().openapi({ example: new Date().toISOString() }),
});

export const AppUserCreateSchema = AppUserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  applicationId: true,
});

export const AppUserUpdateSchema = AppUserCreateSchema.partial();

export const AppUserParamsSchema = IdParamsSchema.extend({
  userId: z.cuid2(),
});

import { z } from "zod";

export const AppUserSchema = z.object({
  id: z.cuid2().openapi({ example: "ckz1234560000abcdef12345" }),
  applicationId: z.cuid2().openapi({ example: "ckz1234560000abcdef67890" }),
  userId: z.cuid2().openapi({ example: "ckz1234560000abcdef99999" }),
  email: z.email().openapi({ example: "user@example.com" }),
  metadata: z.any().nullable().optional().openapi({ example: null }),
  createdAt: z.date().openapi({ example: new Date().toISOString() }),
  updatedAt: z.date().openapi({ example: new Date().toISOString() }),
});

export const AppUserCreateSchema = AppUserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const AppUserUpdateSchema = AppUserCreateSchema.partial();

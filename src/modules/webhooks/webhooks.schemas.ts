import { z } from "zod";

export const WebhookSchema = z.object({
  id: z.cuid2(),
  orgId: z.cuid2(),
  event: z.string(),
  url: z.url(),
  token: z.string(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export const WebhookCreateSchema = WebhookSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  orgId: true,
});

export const WebhooksUpdateSchema = WebhookCreateSchema.partial();

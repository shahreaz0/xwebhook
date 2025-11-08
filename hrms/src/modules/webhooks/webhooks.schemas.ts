import { z } from "zod";

export const WebhookEventEnum = z.enum(["employee.created", "employee.deleted"]);

export type WebhookEvent = z.infer<typeof WebhookEventEnum>;

export const WebhookSchema = z.object({
  id: z.cuid2(),
  orgId: z.cuid2(),
  event: WebhookEventEnum,
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

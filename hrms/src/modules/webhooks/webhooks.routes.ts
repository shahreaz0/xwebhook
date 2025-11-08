import { Elysia, status } from "elysia";
import { prisma } from "../../../prisma";
import { WebhookCreateSchema, WebhookSchema } from "./webhooks.schemas";
import { z } from "zod";

export const webhooks = new Elysia({ tags: ["Webhooks"] });

webhooks
  .get(
    "/webhooks",
    async (ctx) => {
      const webhooks = await prisma.webhook.findMany({
        where: {
          orgId: (ctx.store as any).orgId,
        },
      });

      const parsedWebhook = z.array(WebhookSchema).parse(webhooks);

      return {
        status: "success",
        data: parsedWebhook,
      };
    },
    {
      response: {
        200: z.object({
          status: z.string(),
          data: z.array(WebhookSchema),
        }),
      },
    }
  )
  .post(
    "/webhooks",
    async (ctx) => {
      const createdWebhook = await prisma.webhook.create({
        data: {
          ...ctx.body,
          orgId: (ctx.store as any).orgId,
        },
      });

      ctx.set.status = 201;

      return { message: "Webhooks registered", data: createdWebhook };
    },
    {
      body: WebhookCreateSchema,
      response: {
        201: z.object({ message: z.string(), data: WebhookSchema }),
      },
    }
  )
  .delete(
    "/webhooks/:id",
    async (ctx) => {
      const existedWebhook = await prisma.webhook.findUnique({
        where: {
          orgId: (ctx.store as any).orgId,
          id: ctx.params.id,
        },
      });

      if (!existedWebhook) {
        return status(404, {
          message: "Webhook not found with the given ID",
          status: "Not found",
        });
      }

      const deletedWebhook = await prisma.webhook.delete({
        where: {
          orgId: (ctx.store as any).orgId,
          id: ctx.params.id,
        },
      });

      return { message: "Webhooks deleted", data: WebhookSchema.parse(deletedWebhook) };
    },
    {
      params: z.object({ id: z.cuid2() }),
      response: {
        200: z.object({ message: z.string(), data: WebhookSchema }),
        404: z.object({ status: z.string(), message: z.string() }),
      },
    }
  );

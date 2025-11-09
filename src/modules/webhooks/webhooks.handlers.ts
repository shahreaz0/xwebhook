import type { AppBindings, AppRouteHandler } from "@/lib/types";
import type { RouteHandler } from "@hono/zod-openapi";
import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./webhooks.routes";
import { prisma } from "prisma";
import { WebhookSchema } from "./webhooks.schemas";
import { z } from "zod";

import { HTTPException } from "hono/http-exception";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const orgId = c.get("orgId");

  const webhooks = await prisma.webhook.findMany({
    where: {
      orgId,
    },
  });

  const parsedWebhook = z.array(WebhookSchema).parse(webhooks);

  return c.json({
    success: true,
    data: parsedWebhook,
  });
};

export const create: RouteHandler<CreateRoute, AppBindings> = async (c) => {
  const orgId = c.get("orgId");
  const body = c.req.valid("json");

  const createdWebhook = await prisma.webhook.create({
    data: {
      ...body,
      orgId,
    },
  });

  return c.json({ success: true, data: createdWebhook }, 201);
};

export const getOne: RouteHandler<GetOneRoute, AppBindings> = async (c) => {
  const orgId = c.get("orgId");
  const params = c.req.valid("param");

  const webhook = await prisma.webhook.findUnique({
    where: {
      orgId,
      id: params.id,
    },
  });

  if (!webhook) {
    throw new HTTPException(404, { message: "Not found", cause: { success: false } });
  }

  return c.json({ success: true, data: webhook }, 200);
};

export const patch: RouteHandler<PatchRoute, AppBindings> = async (c) => {
  const orgId = c.get("orgId");
  const params = c.req.valid("param");
  const updates = c.req.valid("json");

  const editedWebhook = await prisma.webhook.update({
    where: {
      orgId,
      id: params.id,
    },
    data: updates,
  });

  if (!editedWebhook) {
    throw new HTTPException(404, { message: "Not found", cause: { success: false } });
  }

  return c.json({ success: true, data: editedWebhook }, 200);
};

export const remove: RouteHandler<RemoveRoute, AppBindings> = async (c) => {
  const orgId = c.get("orgId");
  const params = c.req.valid("param");

  const deletedWebhook = await prisma.webhook.findUnique({
    where: {
      orgId: orgId,
      id: params.id,
    },
  });

  if (!deletedWebhook) {
    throw new HTTPException(404, { message: "Not found", cause: { success: false } });
  }

  return c.json({ success: true, data: { id: params.id } }, 200);
};

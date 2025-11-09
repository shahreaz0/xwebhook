import { idParamsSchema, notFoundSchema } from "@/lib/schema-contants";
import { createRoute, z } from "@hono/zod-openapi";
import { createErrorSchema } from "stoker/openapi/schemas";
import {
  WebhookCreateSchema,
  WebhookSchema,
  WebhooksUpdateSchema,
} from "./webhooks.schemas";

const tags = ["Webhooks"];

export const list = createRoute({
  tags,
  method: "get",
  path: "/webhooks",
  summary: "Get webhook list",
  description: "Get all the webhooks of a user",

  responses: {
    200: {
      description: "successful operation",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: z.array(WebhookSchema),
          }),
        },
      },
    },
  },
});

export const create = createRoute({
  tags,
  method: "post",
  path: "/webhooks",
  summary: "Create webhook",
  description: "You can create webhook for a user",
  request: {
    body: {
      description: "The webhook to create",
      content: {
        "application/json": {
          schema: WebhookCreateSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "successful operation",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: WebhookSchema,
          }),
        },
      },
    },
    422: {
      description: "invalid body",
      content: {
        "application/json": {
          schema: createErrorSchema(WebhookCreateSchema),
        },
      },
    },
  },
});

export const getOne = createRoute({
  tags,
  method: "get",
  path: "/webhooks/{id}",
  summary: "Get a webhook",
  description: "Get webhook details",
  request: {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description: "successful operation",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: WebhookSchema,
          }),
        },
      },
    },
    422: {
      description: "invalid path params",
      content: {
        "application/json": {
          schema: createErrorSchema(idParamsSchema),
        },
      },
    },
    404: {
      description: "not found",
      content: {
        "application/json": {
          schema: notFoundSchema,
        },
      },
    },
  },
});

export const patch = createRoute({
  tags,
  method: "patch",
  path: "/webhooks/{id}",
  summary: "Update a webhook",
  description: "Update a webhook",
  request: {
    params: idParamsSchema,
    body: {
      description: "body",
      content: {
        "application/json": {
          schema: WebhooksUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "successful operation",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: WebhookSchema,
          }),
        },
      },
    },
    422: {
      description: "invalid body",
      content: {
        "application/json": {
          schema: z.union([
            createErrorSchema(WebhooksUpdateSchema),
            createErrorSchema(idParamsSchema),
          ]),
        },
      },
    },
    404: {
      description: "not found",
      content: {
        "application/json": {
          schema: notFoundSchema,
        },
      },
    },
  },
});

export const remove = createRoute({
  tags,
  method: "delete",
  path: "/webhooks/{id}",
  summary: "Delete a webhook",
  description: "Delete a webhook of a user",
  request: {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description: "successful",
      content: {
        "application/json": {
          schema: z.object({ success: z.boolean(), data: z.object({ id: z.string() }) }),
        },
      },
    },
    422: {
      description: "invalid path params",
      content: {
        "application/json": {
          schema: createErrorSchema(idParamsSchema),
        },
      },
    },
    404: {
      description: "not found",
      content: {
        "application/json": {
          schema: notFoundSchema,
        },
      },
    },
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;

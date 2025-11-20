import { createRoute, z } from "@hono/zod-openapi";
import { createErrorSchema } from "stoker/openapi/schemas";
import { IdParamsSchema, NotFoundSchema } from "@/lib/schema-contants";
import {
  WebhookCreateSchema,
  WebhookSchema,
  WebhookUpdateSchema,
} from "./webhooks.schemas";

const tags = ["Webhooks"];

// Params for /app-users/:id/webhooks/:webhookId
const webhookParamsSchema = IdParamsSchema.extend({
  webhookId: z.cuid2(),
});

export const list = createRoute({
  tags,
  method: "get",
  path: "/app-users/{id}/webhooks",
  summary: "List webhooks for an app user",
  description: "Retrieve a list of webhooks for the specified app user.",
  request: { params: IdParamsSchema },
  responses: {
    200: {
      description: "OK — list returned successfully.",
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
  path: "/app-users/{id}/webhooks",
  summary: "Create a new webhook for an app user",
  description: "Create a new webhook for the specified app user.",
  request: {
    params: IdParamsSchema,
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
      description: "Created — webhook created successfully.",
      content: {
        "application/json": {
          schema: z.object({ success: z.boolean(), data: WebhookSchema }),
        },
      },
    },
    422: {
      description: "Unprocessable Entity — request body validation failed.",
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
  path: "/app-users/{id}/webhooks/{webhookId}",
  summary: "Retrieve a webhook by ID for an app user",
  description:
    "Retrieve the details of a single webhook identified by webhookId for the specified app user.",
  request: { params: webhookParamsSchema },
  responses: {
    200: {
      description: "OK — webhook returned successfully.",
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
      description: "Unprocessable Entity — invalid path parameter (webhookId).",
      content: {
        "application/json": { schema: createErrorSchema(webhookParamsSchema) },
      },
    },
    404: {
      description: "Not Found — no webhook exists with the provided webhookId.",
      content: { "application/json": { schema: NotFoundSchema } },
    },
  },
});

export const patch = createRoute({
  tags,
  method: "patch",
  path: "/app-users/{id}/webhooks/{webhookId}",
  summary: "Update a webhook for an app user",
  description:
    "Partially update an existing webhook identified by webhookId for the specified app user.",
  request: {
    params: webhookParamsSchema,
    body: {
      description: "Partial fields to update",
      content: { "application/json": { schema: WebhookUpdateSchema } },
    },
  },
  responses: {
    200: {
      description: "OK — webhook updated successfully.",
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
      description: "Unprocessable Entity — validation error.",
      content: {
        "application/json": {
          schema: z.union([
            createErrorSchema(WebhookUpdateSchema),
            createErrorSchema(webhookParamsSchema),
          ]),
        },
      },
    },
    404: {
      description:
        "Not Found — no webhook exists with the provided webhookId to update.",
      content: { "application/json": { schema: NotFoundSchema } },
    },
  },
});

export const remove = createRoute({
  tags,
  method: "delete",
  path: "/app-users/{id}/webhooks/{webhookId}",
  summary: "Delete a webhook for an app user",
  description:
    "Delete the webhook identified by webhookId for the specified app user.",
  request: { params: webhookParamsSchema },
  responses: {
    200: {
      description: "OK — webhook deleted successfully.",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.object({ id: z.string() }),
          }),
        },
      },
    },
    422: {
      description:
        "Unprocessable Entity — invalid path parameters (webhookId).",
      content: {
        "application/json": { schema: createErrorSchema(webhookParamsSchema) },
      },
    },
    404: {
      description:
        "Not Found — no webhook exists with the provided webhookId to delete.",
      content: { "application/json": { schema: NotFoundSchema } },
    },
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;

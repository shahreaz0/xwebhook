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
  summary: "List webhooks",
  description:
    "Retrieve a list of webhooks belonging to the authenticated user. Returns webhook metadata and delivery settings. Supports paging and filtering (if provided by query parameters).",

  responses: {
    200: {
      description:
        "OK — the request succeeded and the response contains the requested data.",
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
  summary: "Create a new webhook",
  description:
    "Create a new webhook for the authenticated user. Provide the delivery URL, subscribed events, and optional secret. Returns the created webhook record.",
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
      description: "Created — webhook successfully created and returned in the response.",
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
      description:
        "Unprocessable Entity — request body validation failed; see `errors` for details.",
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
  summary: "Retrieve a webhook by ID",
  description:
    "Retrieve the details of a single webhook identified by {id}. The returned object includes configuration, subscribed events, delivery status and metadata.",
  request: {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description: "OK — webhook details returned successfully.",
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
      description:
        "Unprocessable Entity — path parameter validation failed (invalid id).",
      content: {
        "application/json": {
          schema: createErrorSchema(idParamsSchema),
        },
      },
    },
    404: {
      description:
        "Not Found — no webhook exists with the provided id for the authenticated user.",
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
  summary: "Update webhook",
  description:
    "Partially update an existing webhook identified by {id}. Only provided fields will be changed (for example: URL, events, enabled). Returns the updated webhook.",
  request: {
    params: idParamsSchema,
    body: {
      description:
        "Partial webhook fields to update (only provided fields will be applied).",
      content: {
        "application/json": {
          schema: WebhooksUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "OK — webhook updated successfully and returned in the response.",
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
      description: "Unprocessable Entity — validation error for body or path parameters.",
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
      description: "Not Found — no webhook exists with the provided id to update.",
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
  summary: "Delete webhook",
  description:
    "Delete the webhook identified by {id} for the authenticated user. This operation permanently removes the webhook and its configuration.",
  request: {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description:
        "OK — webhook deleted successfully. Response includes the id of the removed webhook.",
      content: {
        "application/json": {
          schema: z.object({ success: z.boolean(), data: z.object({ id: z.string() }) }),
        },
      },
    },
    422: {
      description: "Unprocessable Entity — invalid path parameters (invalid id).",
      content: {
        "application/json": {
          schema: createErrorSchema(idParamsSchema),
        },
      },
    },
    404: {
      description: "Not Found — no webhook exists with the provided id to delete.",
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

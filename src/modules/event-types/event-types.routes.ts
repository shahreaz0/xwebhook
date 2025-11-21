import { createRoute, z } from "@hono/zod-openapi";
import { createErrorSchema } from "stoker/openapi/schemas";
import { IdParamsSchema, NotFoundSchema } from "@/lib/schema-contants";
import {
  EventTypeCreateSchema,
  EventTypeSchema,
  EventTypeUpdateSchema,
} from "./event-types.schemas";

const tags = ["Event Types"];

// ----------------------------
// List Event Types
// ----------------------------
export const list = createRoute({
  tags,
  method: "get",
  path: "/event-types",
  summary: "List event types",
  description:
    "Retrieve a list of event types. Supports paging and filtering (if provided by query parameters).",
  responses: {
    200: {
      description:
        "OK — the request succeeded and the response contains the requested data.",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: z.array(EventTypeSchema),
          }),
        },
      },
    },
  },
});

// ----------------------------
// Create Event Type
// ----------------------------
export const create = createRoute({
  tags,
  method: "post",
  path: "/event-types",
  summary: "Create a new event type",
  description:
    "Create a new event type. Provide the name, description and applicationId. Returns the created event type record.",
  request: {
    body: {
      description: "The event type to create",
      content: {
        "application/json": {
          schema: EventTypeCreateSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description:
        "Created — event type successfully created and returned in the response.",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: EventTypeSchema,
          }),
        },
      },
    },
    422: {
      description: "Unprocessable Entity — request body validation failed.",
      content: {
        "application/json": {
          schema: createErrorSchema(EventTypeCreateSchema),
        },
      },
    },
  },
});

// ----------------------------
// Get One Event Type
// ----------------------------
export const getOne = createRoute({
  tags,
  method: "get",
  path: "/event-types/{id}",
  summary: "Retrieve an event type by ID",
  description:
    "Retrieve the details of a single event type identified by {id}.",
  request: {
    params: IdParamsSchema,
  },
  responses: {
    200: {
      description: "OK — event type details returned successfully.",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: EventTypeSchema,
          }),
        },
      },
    },
    422: {
      description: "Unprocessable Entity — invalid path parameter (id).",
      content: {
        "application/json": {
          schema: createErrorSchema(IdParamsSchema),
        },
      },
    },
    404: {
      description: "Not Found — no event type exists with the provided id.",
      content: {
        "application/json": {
          schema: NotFoundSchema,
        },
      },
    },
  },
});

// ----------------------------
// Update Event Type
// ----------------------------
export const patch = createRoute({
  tags,
  method: "patch",
  path: "/event-types/{id}",
  summary: "Update event type",
  description:
    "Partially update an existing event type identified by {id}. Only provided fields will be changed. Returns the updated event type.",
  request: {
    params: IdParamsSchema,
    body: {
      description:
        "Partial event type fields to update (only provided fields will be applied).",
      content: {
        "application/json": {
          schema: EventTypeUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "OK — event type updated successfully.",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: EventTypeSchema,
          }),
        },
      },
    },
    422: {
      description:
        "Unprocessable Entity — validation error for body or path parameters.",
      content: {
        "application/json": {
          schema: z.union([
            createErrorSchema(EventTypeUpdateSchema),
            createErrorSchema(IdParamsSchema),
          ]),
        },
      },
    },
    404: {
      description:
        "Not Found — no event type exists with the provided id to update.",
      content: {
        "application/json": {
          schema: NotFoundSchema,
        },
      },
    },
  },
});

// ----------------------------
// Delete Event Type
// ----------------------------
export const remove = createRoute({
  tags,
  method: "delete",
  path: "/event-types/{id}",
  summary: "Delete event type",
  description:
    "Delete the event type identified by {id}. This operation permanently removes the event type.",
  request: {
    params: IdParamsSchema,
  },
  responses: {
    200: {
      description:
        "OK — event type deleted successfully. Response includes the id of the removed event type.",
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
      description: "Unprocessable Entity — invalid path parameters (id).",
      content: {
        "application/json": {
          schema: createErrorSchema(IdParamsSchema),
        },
      },
    },
    404: {
      description:
        "Not Found — no event type exists with the provided id to delete.",
      content: {
        "application/json": {
          schema: NotFoundSchema,
        },
      },
    },
  },
});

// ----------------------------
// Export Route Types
// ----------------------------
export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;

import { createRoute, z } from "@hono/zod-openapi";
import { idParamsSchema, notFoundSchema } from "@/lib/schema-contants";
import { createErrorSchema } from "stoker/openapi/schemas";
import {
  AppUserSchema,
  AppUserCreateSchema,
  AppUserUpdateSchema,
} from "./appusers.schemas";

const tags = ["AppUsers"];

export const list = createRoute({
  tags,
  method: "get",
  path: "/app-users",
  summary: "List application users",
  description:
    "Retrieve a list of application users for the authenticated user's applications.",
  responses: {
    200: {
      description: "OK — list returned successfully.",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: z.array(AppUserSchema),
          }),
        },
      },
    },
  },
});

export const create = createRoute({
  tags,
  method: "post",
  path: "/app-users",
  summary: "Create a new application user",
  description: "Create a new AppUser for an application owned by the authenticated user.",
  request: {
    body: {
      description: "The app user to create",
      content: {
        "application/json": {
          schema: AppUserCreateSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Created — app user created successfully.",
      content: {
        "application/json": {
          schema: z.object({ success: z.boolean(), data: AppUserSchema }),
        },
      },
    },
    422: {
      description: "Unprocessable Entity — request body validation failed.",
      content: {
        "application/json": {
          schema: createErrorSchema(AppUserCreateSchema),
        },
      },
    },
  },
});

export const getOne = createRoute({
  tags,
  method: "get",
  path: "/app-users/{id}",
  summary: "Retrieve an application user by ID",
  description: "Retrieve the details of a single AppUser identified by {id}.",
  request: {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description: "OK — app user returned successfully.",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: AppUserSchema,
          }),
        },
      },
    },
    422: {
      description: "Unprocessable Entity — invalid path parameter (id).",
      content: { "application/json": { schema: createErrorSchema(idParamsSchema) } },
    },
    404: {
      description: "Not Found — no app user exists with the provided id.",
      content: { "application/json": { schema: notFoundSchema } },
    },
  },
});

export const patch = createRoute({
  tags,
  method: "patch",
  path: "/app-users/{id}",
  summary: "Update an application user",
  description: "Partially update an existing AppUser identified by {id}.",
  request: {
    params: idParamsSchema,
    body: {
      description: "Partial fields to update",
      content: { "application/json": { schema: AppUserUpdateSchema } },
    },
  },
  responses: {
    200: {
      description: "OK — app user updated successfully.",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: AppUserSchema,
          }),
        },
      },
    },
    422: {
      description: "Unprocessable Entity — validation error.",
      content: {
        "application/json": {
          schema: z.union([
            createErrorSchema(AppUserUpdateSchema),
            createErrorSchema(idParamsSchema),
          ]),
        },
      },
    },
    404: {
      description: "Not Found — no app user exists with the provided id to update.",
      content: { "application/json": { schema: notFoundSchema } },
    },
  },
});

export const remove = createRoute({
  tags,
  method: "delete",
  path: "/app-users/{id}",
  summary: "Delete an application user",
  description:
    "Delete the AppUser identified by {id} for an application owned by the authenticated user.",
  request: { params: idParamsSchema },
  responses: {
    200: {
      description: "OK — app user deleted successfully.",
      content: {
        "application/json": {
          schema: z.object({ success: z.boolean(), data: z.object({ id: z.string() }) }),
        },
      },
    },
    422: {
      description: "Unprocessable Entity — invalid path parameters (id).",
      content: { "application/json": { schema: createErrorSchema(idParamsSchema) } },
    },
    404: {
      description: "Not Found — no app user exists with the provided id to delete.",
      content: { "application/json": { schema: notFoundSchema } },
    },
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;

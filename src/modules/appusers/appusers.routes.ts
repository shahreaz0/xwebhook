import { createRoute } from "@hono/zod-openapi";
import { createErrorSchema } from "stoker/openapi/schemas";
import { NotFoundSchema } from "@/lib/schema-contants";
import {
  AppUserCreateSchema,
  AppUserSchema,
  AppUserUpdateSchema,
} from "./appusers.schemas";

const tags = ["AppUsers"];

import { z } from "zod";

// Params for /applications/:id
const appIdParamsSchema = z.object({
  id: z.cuid2(),
});
// Params for /applications/:id/app-users/:userId
const appUserParamsSchema = appIdParamsSchema.extend({
  userId: z.cuid2(),
});

export const list = createRoute({
  tags,
  method: "get",
  path: "/applications/{id}/app-users",
  summary: "List application users for an application",
  description:
    "Retrieve a list of application users for the specified application.",
  request: { params: appIdParamsSchema },
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
  path: "/applications/{id}/app-users",
  summary: "Create a new application user",
  description: "Create a new AppUser for the specified application.",
  request: {
    params: appIdParamsSchema,
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
  path: "/applications/{id}/app-users/{userId}",
  summary: "Retrieve an application user by ID",
  description:
    "Retrieve the details of a single AppUser identified by userId for the specified application.",
  request: { params: appUserParamsSchema },
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
      description: "Unprocessable Entity — invalid path parameter (userId).",
      content: {
        "application/json": { schema: createErrorSchema(appUserParamsSchema) },
      },
    },
    404: {
      description: "Not Found — no app user exists with the provided userId.",
      content: { "application/json": { schema: NotFoundSchema } },
    },
  },
});

export const patch = createRoute({
  tags,
  method: "patch",
  path: "/applications/{id}/app-users/{userId}",
  summary: "Update an application user",
  description:
    "Partially update an existing AppUser identified by userId for the specified application.",
  request: {
    params: appUserParamsSchema,
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
            createErrorSchema(appUserParamsSchema),
          ]),
        },
      },
    },
    404: {
      description:
        "Not Found — no app user exists with the provided userId to update.",
      content: { "application/json": { schema: NotFoundSchema } },
    },
  },
});

export const remove = createRoute({
  tags,
  method: "delete",
  path: "/applications/{id}/app-users/{userId}",
  summary: "Delete an application user",
  description:
    "Delete the AppUser identified by userId for the specified application.",
  request: { params: appUserParamsSchema },
  responses: {
    200: {
      description: "OK — app user deleted successfully.",
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
      description: "Unprocessable Entity — invalid path parameters (userId).",
      content: {
        "application/json": { schema: createErrorSchema(appUserParamsSchema) },
      },
    },
    404: {
      description:
        "Not Found — no app user exists with the provided userId to delete.",
      content: { "application/json": { schema: NotFoundSchema } },
    },
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;

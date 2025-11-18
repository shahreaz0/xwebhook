import { createRoute, z } from "@hono/zod-openapi";
import { createErrorSchema } from "stoker/openapi/schemas";
import { AuthUserSchema, LoginSchema, RegisterSchema } from "./auth.schemas";
import { createHttpErrorSchema } from "@/lib/schema-contants";

const tags = ["Auth"];

export const register = createRoute({
  tags,
  method: "post",
  path: "/auth/register",
  summary: "Register a new user",
  description:
    "Create a new user account with email, password, and optional name. Returns the created user record.",

  request: {
    body: {
      description: "The user registration payload",
      content: {
        "application/json": {
          schema: RegisterSchema,
        },
      },
    },
  },

  responses: {
    201: {
      description: "Created — User registered successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({ example: true }),
            data: AuthUserSchema,
          }),
        },
      },
    },
    409: {
      description: "Conflict — email already exists.",
      content: {
        "application/json": {
          schema: createHttpErrorSchema({
            statusCode: "409",
            example: "User already exists",
          }),
        },
      },
    },
    422: {
      description: "Unprocessable Entity — validation failed; see `errors` for details.",
      content: {
        "application/json": {
          schema: createErrorSchema(RegisterSchema),
        },
      },
    },
  },
});

export const login = createRoute({
  tags,
  method: "post",
  path: "/auth/login",
  summary: "Login a user",
  description:
    "Authenticate user using email and password. Returns user data and authentication token.",

  request: {
    body: {
      description: "Login payload",
      content: {
        "application/json": {
          schema: LoginSchema,
        },
      },
    },
  },

  responses: {
    200: {
      description: "OK — login successful",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
            success: z.boolean().openapi({ example: true }),
            token: z.string().openapi({ example: "jwt-token-here" }),
            data: AuthUserSchema,
          }),
        },
      },
    },
    422: {
      description: "Unprocessable Entity — request body validation failed.",
      content: {
        "application/json": {
          schema: createErrorSchema(LoginSchema),
        },
      },
    },
    401: {
      description: "Unauthorized — credentials invalid.",
      content: {
        "application/json": {
          schema: createHttpErrorSchema({
            statusCode: "401",
            example: "Invalid email or password",
          }),
        },
      },
    },
  },
});

export type RegisterRoute = typeof register;
export type LoginRoute = typeof login;

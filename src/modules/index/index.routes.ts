import packageJSON from "package.json";
import { createRouter } from "@/lib/create-app";
import { createRoute, z } from "@hono/zod-openapi";
import { version } from "bun";

export const index = createRouter().openapi(
  createRoute({
    tags: ["Index"],
    method: "get",
    path: "/",
    summary: "Health Check",
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              name: z.string(),
              status: z.string(),
              version: z.string(),
              timestamp: z.number(),
            }),
          },
        },
        description: "Health Check API",
      },
    },
  }),
  (c) => {
    return c.json({
      name: "webhook service",
      status: "OK",
      version: packageJSON.version,
      timestamp: Date.now(),
    });
  }
);

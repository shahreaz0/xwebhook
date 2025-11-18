import { z } from "zod";

export const idParamsSchema = z.object({
  id: z.string().openapi({ param: { name: "id", in: "path", required: true } }),
});

export const notFoundSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "Not found" }),
});

export function createHttpErrorSchema(params: {
  statusCode: "401" | "404" | "409";
  example?: string;
}) {
  const defaultStatusTexts = {
    "401": "Unauthorized",
    "404": "Not found",
    "409": "Conflict",
  } as const;

  const example = params.example ?? defaultStatusTexts[params.statusCode];

  return z.object({
    success: z.boolean().openapi({ example: false }),
    message: z.string().openapi({ example }),
  });
}

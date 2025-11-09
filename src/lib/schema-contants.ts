import { z } from "zod";

export const idParamsSchema = z.object({
  id: z.string().openapi({ param: { name: "id", in: "path", required: true } }),
});

export const notFoundSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "Not found" }),
});

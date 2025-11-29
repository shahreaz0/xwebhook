import { z } from "@hono/zod-openapi";

/**
 * ID path parameter schema
 */
export const IdParamsSchema = z.object({
  id: z.string().openapi({ param: { name: "id", in: "path", required: true } }),
});

/**
 * Not found error response schema
 */
export const NotFoundSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "Not found" }),
});

/**
 * Helper to create HTTP error response schemas
 */
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

/**
 * Common pagination query parameters
 * Optional: If not provided, no pagination is applied
 * Max limit: 100
 */
export const PaginationQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .openapi({
      param: { name: "limit", in: "query" },
      example: 50,
      description:
        "Maximum number of items to return (1-100). If not provided, all items are returned.",
    }),
  offset: z.coerce
    .number()
    .int()
    .min(0)
    .optional()
    .openapi({
      param: { name: "offset", in: "query" },
      example: 0,
      description:
        "Number of items to skip. If not provided, no offset is applied.",
    }),
});

/**
 * Sort order enum
 */
export const SortOrderSchema = z
  .enum(["asc", "desc"])
  .default("desc")
  .openapi({
    param: { name: "order", in: "query" },
    example: "desc",
    description: "Sort order (ascending or descending)",
  });

/**
 * Helper to create a sortBy schema for a specific set of fields
 */
export function createSortBySchema<T extends readonly [string, ...string[]]>(
  fields: T,
  defaultField: T[number]
) {
  return z
    .enum(fields)
    .default(defaultField)
    .openapi({
      param: { name: "sortBy", in: "query" },
      example: defaultField,
      description: `Field to sort by (${fields.join(", ")})`,
    });
}

/**
 * Helper to build Prisma orderBy from sortBy and order params
 */
export function buildOrderBy(sortBy: string, order: "asc" | "desc") {
  return { [sortBy]: order };
}

/**
 * Helper to build Prisma pagination from limit and offset params
 * Returns empty object if neither limit nor offset are provided
 */
export function buildPagination(
  limit?: number | undefined,
  offset?: number | undefined
) {
  // Only apply pagination if at least one parameter is provided
  if (limit === undefined && offset === undefined) {
    return {};
  }

  const pagination: { skip?: number; take?: number } = {};

  if (offset !== undefined) {
    pagination.skip = offset;
  }

  if (limit !== undefined) {
    pagination.take = limit;
  }

  return pagination;
}

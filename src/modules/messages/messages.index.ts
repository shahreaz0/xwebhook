import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppBindings } from "@/lib/types";
import * as handlers from "./messages.handlers";
import * as routes from "./messages.routes";

export const messages = new OpenAPIHono<AppBindings>();

messages
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.patch, handlers.patch);

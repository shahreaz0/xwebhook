import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { webhooks } from "./modules/webhooks/webhooks.routes";
import { z } from "zod";
import { employees } from "./modules/employees/employees.routes";

const app = new Elysia();

app.use(
  openapi({
    mapJsonSchema: {
      zod: z.toJSONSchema,
    },
    documentation: {
      components: {
        securitySchemes: {
          orgId: {
            type: "apiKey",
            name: "x-org-id",
            in: "header",
          },
        },
      },
    },
  })
);

app.get(
  "/",
  () => ({
    status: "OK",
    service: "hrms",
    timestamp: Date.now(),
  }),
  {
    detail: {
      summary: "health",
    },
  }
);

app
  .derive((ctx) => {
    if (!ctx.request.headers.get("x-org-id")) {
      return ctx.status(401, { status: "Unauthorized" });
    }

    ctx.store = { orgId: ctx.request.headers.get("x-org-id") || "" };
  })
  .use(webhooks)
  .use(employees)
  .listen(8088);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

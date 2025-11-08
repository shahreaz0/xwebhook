import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { z } from "zod";

const app = new Elysia();

app.use(
  openapi({
    mapJsonSchema: {
      zod: z.toJSONSchema,
    },
  })
);

app.get(
  "/",
  () => ({
    status: "OK",
    service: "automator service",
    timestamp: Date.now(),
  }),
  {
    detail: {
      summary: "health",
    },
  }
);

app.post(
  "/webhook",
  (ctx) => {
    const secret = ctx.headers["x-webhook-secret"];

    if (secret !== "aabb") {
      return ctx.status(401, "Unauthorized");
    }

    const body = ctx.body;

    if (body.event === "employee.created") {
      console.log({ message: "email sent to " + body.data.name });
    }
  },
  {
    body: z.object({
      event: z.string(),
      data: z.any(),
    }),
  }
);

app.listen(8099);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

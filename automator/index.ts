import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.json({
    status: "OK",
    service: "automator service",
    timestamp: Date.now(),
  });
});

app.post("/webhook", async (c) => {
  const secret = c.req.header("x-webhook-secret");

  if (secret !== "aabb") {
    return c.json("Unauthorized", 401);
  }

  const body = await c.req.json();

  if (body.event === "employee.created") {
    console.log({ message: "email sent to " + body.data.name });
  }
});

export default {
  port: 8099,
  fetch: app.fetch,
};

console.log(`Server is running at 8099`);

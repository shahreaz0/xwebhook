import { OpenAPIHono } from "@hono/zod-openapi";
import { requestId } from "hono/request-id";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";

import type { AppBindings, AppOpenAPI } from "@/lib/types";
// import { logger } from "@/middlewares/pino-logger"
import { defaultHook } from "stoker/openapi";

import { cors } from "hono/cors";

export function createRouter() {
  return new OpenAPIHono<AppBindings>({ strict: false, defaultHook });
}

export function createApp() {
  const app = createRouter();

  app.use(
    cors({
      origin: ["https://alhira.com", "http://localhost:3000"],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
    })
  );
  app.use(serveEmojiFavicon("🔥"));
  app.use(requestId());
  // app.use(logger())

  app.notFound(notFound);
  app.onError(onError);

  return app;
}

export function createTestApp(router: AppOpenAPI) {
  const testApp = createApp();

  testApp.route("/", router);

  return testApp;
}

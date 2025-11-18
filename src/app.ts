import { configureOpenAPI } from "@/lib/configure-openapi";
import { createApp } from "@/lib/create-app";
import { index } from "./modules/index/index.routes";
import { webhooks } from "./modules/webhooks/webhooks.index";
import { auth } from "./modules/auth/auth.index";

const routes = [index, webhooks, auth];

export const app = createApp();

configureOpenAPI(app);

for (const route of routes) {
  app.route("/", route);
}

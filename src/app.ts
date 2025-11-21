import { configureOpenAPI } from "@/lib/configure-openapi";
import { createApp } from "@/lib/create-app";
import { applications } from "./modules/applications/applications.index";
import { appUsers } from "./modules/appusers/appusers.index";
import { auth } from "./modules/auth/auth.index";
import { eventTypes } from "./modules/event-types/event-types.index";
import { index } from "./modules/index/index.routes";
import { webhooks } from "./modules/webhooks/webhooks.index";

const routes = [index, auth, applications, appUsers, webhooks, eventTypes];

export const app = createApp();

configureOpenAPI(app);

for (const route of routes) {
  app.route("/", route);
}

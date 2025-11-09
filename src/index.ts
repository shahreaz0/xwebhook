import { app } from "@/app";
import { env } from "@/lib/env";
import { checkDbConnection } from "prisma";

export default {
  port: env.PORT,
  fetch: app.fetch,
};

checkDbConnection();

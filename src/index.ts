import { checkDbConnection } from "prisma";
import { app } from "@/app";
import { env } from "@/lib/env";
import { checkRedisConnection } from "./configs/redis";

checkDbConnection();
checkRedisConnection();

export default {
  port: env.PORT,
  fetch: app.fetch,
};

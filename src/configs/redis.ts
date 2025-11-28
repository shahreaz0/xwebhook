import IORedis from "ioredis";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export const redisClient = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export async function checkRedisConnection() {
  try {
    const pong = await redisClient.ping();
    logger.info(`Redis connected!: ${pong}`);
    return true;
  } catch (error) {
    logger.error(`Redis connection failed: ${error}`);
    return false;
  }
}

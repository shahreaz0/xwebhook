import { Queue } from "bullmq";
import { redisClient } from "@/configs/redis";

export const MESSAGE_QUEUE = "messages";

export const messagesQueue = new Queue(MESSAGE_QUEUE, {
  connection: redisClient,
});

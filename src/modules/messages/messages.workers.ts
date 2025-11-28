import { Worker } from "bullmq";
import type { Message } from "generated/prisma/client";
import { prisma } from "prisma";
import { MESSAGE_QUEUE } from "@/configs/bullmq";
import { redisClient } from "@/configs/redis";
import { logger } from "@/lib/logger";
import { deliverMessage, updateMessageStatus } from "./messages.services";
import type { MessageJobData } from "./messages.types";

logger.info("Message worker started");

const worker = new Worker<MessageJobData>(
  MESSAGE_QUEUE,
  async (job) => {
    // Update message status to processing
    await updateMessageStatus(job.data.message.id, "PROCESSING");

    const appUserId = job.data.message.appUserId;
    if (!appUserId) {
      throw new Error("AppUser not found");
    }

    // Find webhooks for app user
    const webhooks = await prisma.webhook.findMany({
      where: {
        appUserId,
        eventTypes: { some: { eventTypeId: job.data.message.eventTypeId } },
        disabled: false,
      },
    });

    if (webhooks.length === 0) {
      await updateMessageStatus(job.data.message.id, "SKIPPED");
      return;
    }

    const promises = [] as Promise<unknown>[];

    for (const wh of webhooks) {
      promises.push(deliverMessage(job.data.message, wh));
    }

    const res = await Promise.allSettled(promises);

    const errors = [] as { error: Error; message: Message }[];
    const success = [] as unknown[];

    for (const r of res) {
      if (r.status === "fulfilled") {
        success.push(r.value);
      } else {
        errors.push({
          error: r.reason,
          message: job.data.message,
        });
      }
    }

    if (success.length > 0) {
      await updateMessageStatus(job.data.message.id, "DELIVERED");
      return success;
    }

    if (errors.length > 0) {
      await updateMessageStatus(job.data.message.id, "FAILED");

      throw new Error("Failed to deliver message", {
        cause: {
          errors,
          message: job.data.message,
        },
      });
    }
  },
  {
    connection: redisClient,
    removeOnFail: { count: 10 },
    removeOnComplete: { count: 10 },
  }
);

worker.on("completed", (job) => {
  logger.info(`${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  logger.error(`${job?.name} has failed with ${err.message}`);
});

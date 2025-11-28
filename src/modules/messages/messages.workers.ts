import { Worker } from "bullmq";
import type { Message, Webhook } from "generated/prisma/client";
import { prisma } from "prisma";
import { MESSAGE_QUEUE } from "@/configs/bullmq";
import { redisClient } from "@/configs/redis";
import { http } from "@/lib/xior";
import { updateMessageStatus } from "./messages.services";

console.log("Message worker started");

type JobData = {
  message: Message & { eventName: string };
  session: { id: string; name: string };
};

async function deliverMessage(
  message: Message & { eventName: string },
  wh: Webhook
) {
  try {
    const response = await http.request({
      method: "post",
      url: wh.url,
      data: {
        event: message.eventName,
        data: message.payload,
      },
      headers: {
        "x-webhook-secret": wh.secrets,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);

    throw new Error("Failed to deliver message", {
      cause: {
        error,
        message,
      },
    });
  }
}

const worker = new Worker<JobData>(
  MESSAGE_QUEUE,
  async (job) => {
    // Update message status to processing
    await updateMessageStatus(job.data.message.id, "PROCESSING");
    console.log("message processing");

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

    for (const r of res) {
      if (r.status === "fulfilled") {
        await updateMessageStatus(job.data.message.id, "DELIVERED");
      } else {
        await updateMessageStatus(job.data.message.id, "FAILED");

        throw new Error("Failed to deliver message", {
          cause: {
            error: r.reason,
            message: job.data.message,
          },
        });
      }
    }

    console.log(res);
  },
  {
    connection: redisClient,
    removeOnFail: { count: 10 },
    removeOnComplete: { count: 10 },
  }
);

worker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  console.log(`${job?.name} has failed with ${err.cause}`);
  console.log(err.cause);
});

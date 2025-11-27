import { Worker } from "bullmq";
import type { Message, Webhook } from "generated/prisma/client";
import { prisma } from "prisma";
import { MESSAGE_QUEUE } from "@/configs/bullmq";
import { redisClient } from "@/configs/redis";
import { http } from "@/lib/xior";

console.log("Message worker started");

type JobData = {
  message: Message;
  session: { id: string; name: string };
};

async function deliverMessage(message: Message, wh: Webhook) {
  try {
    const response = await http.request({
      method: "post",
      url: wh.url,
      data: {
        event: message.eventTypeId,
        data: message.payload,
      },
      headers: {
        "x-webhook-secret": wh.secrets,
      },
    });

    return response.data;
  } catch (error) {
    await prisma.message.update({
      where: { id: message.id },
      data: { status: "FAILED" },
    });

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
    const appUserId = job.data.message.appUserId;

    console.log("inside worker");

    if (!appUserId) {
      throw new Error("AppUser not found");
    }

    const webhooks = await prisma.webhook.findMany({
      where: {
        appUserId,
        eventTypes: { some: { eventTypeId: job.data.message.eventTypeId } },
      },
    });

    if (webhooks.length === 0) {
      await prisma.message.update({
        where: { id: job.data.message.id },
        data: { status: "SKIPPED" },
      });
      return;
    }

    const promises = [] as Promise<unknown>[];

    for (const wh of webhooks) {
      promises.push(deliverMessage(job.data.message, wh));
    }

    const res = await Promise.allSettled(promises);

    for (const r of res) {
      if (r.status === "fulfilled") {
        console.log(r.value);
      } else {
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
  { connection: redisClient }
);

worker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  console.log(`${job?.name} has failed with ${err.cause}`);
  console.log(err.cause);
});

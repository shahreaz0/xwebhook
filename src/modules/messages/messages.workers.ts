import { Worker } from "bullmq";
import { sleep } from "bun";
import type { Message } from "generated/prisma/client";
import { prisma } from "prisma";
import type { XiorResponse } from "xior";
import { MESSAGE_QUEUE } from "@/configs/bullmq";
import { redisClient } from "@/configs/redis";
import { http } from "@/lib/xior";

type JobData = {
  message: Message;
  session: { id: string; name: string };
};

const worker = new Worker<JobData>(
  MESSAGE_QUEUE,
  async (job) => {
    await sleep(500);

    const appUserId = job.data.message.appUserId;

    if (!appUserId) {
      throw new Error("AppUser not found");
    }

    const webhooks = await prisma.webhook.findMany({
      where: { appUserId },
    });

    const promises = [] as Promise<XiorResponse<unknown>>[];

    for (const wh of webhooks) {
      const reqs = http.request({
        method: "post",
        url: wh.url,
        data: {
          event: job.data.message.eventTypeId,
          data: job.data.message.payload,
        },
        headers: {
          "x-webhook-secret": wh.secrets,
        },
      });

      promises.push(reqs);
    }

    const res = await Promise.allSettled(promises);

    for (const r of res) {
      if (r.status === "fulfilled") {
        console.log(r.value);
      } else {
        console.log(r.reason);
      }
    }

    console.log(res);
  },
  { connection: redisClient }
);

worker.on("completed", (job) => {
  console.log(`${job.data} has completed!`);
});

worker.on("failed", (job, err) => {
  console.log(`${job?.data} has failed with ${err.message}`);
});

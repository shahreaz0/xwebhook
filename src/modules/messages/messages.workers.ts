import { Worker } from "bullmq";
import { sleep } from "bun";
import { MESSAGE_QUEUE } from "@/configs/bullmq";
import { redisClient } from "@/configs/redis";

const worker = new Worker(
  MESSAGE_QUEUE,
  async (job) => {
    await sleep(500);
    console.log(job.data);
  },
  { connection: redisClient }
);

worker.on("completed", (job) => {
  console.log(`${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  console.log(`${job?.id} has failed with ${err.message}`);
});

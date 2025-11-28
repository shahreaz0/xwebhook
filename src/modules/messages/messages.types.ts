import type { Message } from "generated/prisma/client";

export type MessageJobData = {
  message: Message & { eventName: string };
  session: { id: string; name: string };
};

import type { Message } from "generated/prisma/client";

export interface MessageJobData {
  message: Message & { eventName: string };
  session: { id: string; name: string };
}

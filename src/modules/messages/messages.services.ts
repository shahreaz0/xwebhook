import type { MessageStatus } from "generated/prisma/enums";
import { prisma } from "prisma";

export function updateMessageStatus(messageId: string, status: MessageStatus) {
  return prisma.message.update({
    where: { id: messageId },
    data: { status, deliverAt: status === "DELIVERED" ? new Date() : null },
  });
}

import type { Webhook } from "generated/prisma/client";
import type { MessageStatus } from "generated/prisma/enums";
import { prisma } from "prisma";
import { http } from "@/lib/xior";
import type { MessageJobData } from "./messages.types";

export function updateMessageStatus(messageId: string, status: MessageStatus) {
  return prisma.message.update({
    where: { id: messageId },
    data: { status, deliverAt: status === "DELIVERED" ? new Date() : null },
  });
}

export async function deliverMessage(
  message: MessageJobData["message"],
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

import { prisma } from "prisma";
import type { XiorResponse } from "xior";
// import { prisma } from "../../../prisma";
import { http } from "../../lib/xior";

export async function callWebhooks(payload: unknown) {
  const webhooks = await prisma.webhook.findMany({
    where: {
      // event: event,
    },
  });

  const promises = [] as Promise<XiorResponse<unknown>>[];

  for (const wh of webhooks) {
    const pro = http.request({
      method: "post",
      url: wh.url,
      data: {
        data: payload,
      },
      headers: {
        "x-webhook-secret": wh.secrets,
      },
    });
    promises.push(pro);
  }

  const res = await Promise.allSettled(promises);

  return res;
}

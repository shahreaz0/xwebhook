import { XiorResponse } from "xior";
import { prisma } from "../../../prisma";
import { http } from "../../lib/xior";

export async function callWebhooks(event: string, orgId: string, payload: any) {
  const webhooks = await prisma.webhook.findMany({
    where: {
      orgId: orgId,
      event: event,
    },
  });

  const promises = [] as Promise<XiorResponse<unknown>>[];

  for (let wh of webhooks) {
    const pro = http.request({
      method: "post",
      url: wh.url,
      data: {
        event: wh.event,
        data: payload,
      },
      headers: {
        "x-webhook-secret": wh.token,
      },
    });
    promises.push(pro);
  }

  const res = await Promise.allSettled(promises);

  return res;
}

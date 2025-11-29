import type { Prisma } from "generated/prisma/client";

export function buildWebhookFilters(
  appUserId: string,
  query: {
    disabled?: boolean;
    eventTypeId?: string;
  }
) {
  const where: Prisma.WebhookWhereInput = {
    appUserId,
  };

  // Filter by disabled status
  if (query.disabled !== undefined) {
    where.disabled = query.disabled;
  }

  // Filter by eventTypeId (webhooks subscribed to this event type)
  if (query.eventTypeId) {
    where.eventTypes = { some: { eventTypeId: query.eventTypeId } };
  }

  return where;
}

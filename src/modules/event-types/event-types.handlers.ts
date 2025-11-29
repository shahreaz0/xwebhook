import type { RouteHandler } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { prisma } from "prisma";
import { z } from "zod";
import type { AppBindings, AppRouteHandler } from "@/lib/types";
import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./event-types.routes";
import { EventTypeSchema } from "./event-types.schemas";

// ----------------------------
// List Event Types
// ----------------------------
export const list: AppRouteHandler<ListRoute> = async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const params = c.req.valid("param");

  // Verify application ownership
  const application = await prisma.application.findUnique({
    where: { id: params.id },
  });

  if (!application || application.userId !== jwtPayload.id) {
    throw new HTTPException(404, {
      message: "Application not found",
      cause: { success: false },
    });
  }

  const eventTypes = await prisma.eventType.findMany({
    where: { applicationId: params.id },
  });

  const parsedEventTypes = z.array(EventTypeSchema).parse(eventTypes);

  return c.json({
    success: true,
    data: parsedEventTypes,
  });
};

// ----------------------------
// Create Event Type
// ----------------------------
export const create: RouteHandler<CreateRoute, AppBindings> = async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const params = c.req.valid("param");
  const body = c.req.valid("json");

  // Verify application ownership
  const application = await prisma.application.findUnique({
    where: { id: params.id },
  });

  if (!application || application.userId !== jwtPayload.id) {
    throw new HTTPException(404, {
      message: "Application not found",
      cause: { success: false },
    });
  }

  const createdEventType = await prisma.eventType.create({
    data: {
      ...body,
      applicationId: params.id,
    },
  });

  return c.json({ success: true, data: createdEventType }, 201);
};

// ----------------------------
// Get One Event Type
// ----------------------------
export const getOne: RouteHandler<GetOneRoute, AppBindings> = async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const params = c.req.valid("param");

  // Verify application ownership
  const application = await prisma.application.findUnique({
    where: { id: params.id },
  });

  if (!application || application.userId !== jwtPayload.id) {
    throw new HTTPException(404, {
      message: "Application not found",
      cause: { success: false },
    });
  }

  const eventType = await prisma.eventType.findFirst({
    where: { id: params.eventTypeId, applicationId: params.id },
  });

  if (!eventType) {
    throw new HTTPException(404, {
      message: "Event type not found",
      cause: { success: false },
    });
  }

  return c.json({ success: true, data: eventType }, 200);
};

// ----------------------------
// Update Event Type
// ----------------------------
export const patch: RouteHandler<PatchRoute, AppBindings> = async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const params = c.req.valid("param");
  const updates = c.req.valid("json");

  // Verify application ownership
  const application = await prisma.application.findUnique({
    where: { id: params.id },
  });

  if (!application || application.userId !== jwtPayload.id) {
    throw new HTTPException(404, {
      message: "Application not found",
      cause: { success: false },
    });
  }

  const eventType = await prisma.eventType.findFirst({
    where: { id: params.eventTypeId, applicationId: params.id },
  });

  if (!eventType) {
    throw new HTTPException(404, {
      message: "Event type not found",
      cause: { success: false },
    });
  }

  const editedEventType = await prisma.eventType.update({
    where: { id: params.eventTypeId },
    data: updates,
  });

  return c.json({ success: true, data: editedEventType }, 200);
};

// ----------------------------
// Delete Event Type
// ----------------------------
export const remove: RouteHandler<RemoveRoute, AppBindings> = async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const params = c.req.valid("param");

  // Verify application ownership
  const application = await prisma.application.findUnique({
    where: { id: params.id },
  });

  if (!application || application.userId !== jwtPayload.id) {
    throw new HTTPException(404, {
      message: "Application not found",
      cause: { success: false },
    });
  }

  const eventType = await prisma.eventType.findFirst({
    where: { id: params.eventTypeId, applicationId: params.id },
  });

  if (!eventType) {
    throw new HTTPException(404, {
      message: "Event type not found",
      cause: { success: false },
    });
  }

  await prisma.eventType.delete({ where: { id: params.eventTypeId } });

  return c.json({ success: true, data: { id: params.eventTypeId } }, 200);
};

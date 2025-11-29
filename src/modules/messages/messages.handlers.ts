import type { RouteHandler } from "@hono/zod-openapi";
import type { InputJsonValue } from "generated/prisma/internal/prismaNamespace";
import { HTTPException } from "hono/http-exception";
import { prisma } from "prisma";
import { z } from "zod";
import { messagesQueue } from "@/configs/bullmq";
import type { AppBindings, AppRouteHandler } from "@/lib/types";
import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
} from "./messages.routes";
import { MessageSchema } from "./messages.schemas";

// ----------------------------
// List Messages for AppUser
// ----------------------------
export const list: AppRouteHandler<ListRoute> = async (c) => {
  const jwt = c.get("jwtPayload");
  const params = c.req.valid("param");
  // Ensure the app user exists and its application belongs to the authenticated user
  const appUser = await prisma.appUser.findUnique({
    where: { id: params.appUserId },
    include: { application: true },
  });
  if (!appUser || appUser.application.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "AppUser not found",
      cause: { success: false },
    });
  }
  const messages = await prisma.message.findMany({
    where: { appUserId: params.appUserId },
  });
  const data = messages.map((m) => ({
    ...m,
    appUserId: m.appUserId === null ? undefined : m.appUserId,
    deliverAt: m.deliverAt ? m.deliverAt.toISOString() : null,
    createdAt: m.createdAt.toISOString(),
    payload: m.payload as Record<string, unknown>,
  }));
  const parsed = z.array(MessageSchema).parse(data);
  return c.json({ success: true, data: parsed });
};

// ----------------------------
// Create Message for AppUser
// ----------------------------
export const create: RouteHandler<CreateRoute, AppBindings> = async (c) => {
  const jwt = c.get("jwtPayload");
  const params = c.req.valid("param");
  const body = c.req.valid("json");

  const appUser = await prisma.appUser.findUnique({
    where: { id: params.appUserId },
    include: { application: true },
  });

  if (!appUser || appUser.application.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "AppUser not found",
      cause: { success: false },
    });
  }

  const eventType = await prisma.eventType.findUnique({
    where: { id: body.eventTypeId, archived: false },
    select: { name: true },
  });

  if (!eventType) {
    throw new HTTPException(404, {
      message: "Event Type not found or archived",
      cause: { success: false },
    });
  }

  const created = await prisma.message.create({
    data: {
      eventTypeId: body.eventTypeId,
      payload: body.payload as InputJsonValue,
      appUserId: params.appUserId,
    },
  });

  await messagesQueue.add("messages", {
    message: { ...created, eventName: eventType.name },
    session: jwt,
  });

  const result = {
    ...created,
    appUserId: created.appUserId === null ? undefined : created.appUserId,
    deliverAt: created.deliverAt ? created.deliverAt.toISOString() : null,
    createdAt: created.createdAt.toISOString(),
    payload: created.payload as Record<string, unknown>,
  };

  const parsed = MessageSchema.parse(result);

  return c.json({ success: true, data: parsed }, 201);
};

// ----------------------------
// Get One Message for AppUser
// ----------------------------
export const getOne: RouteHandler<GetOneRoute, AppBindings> = async (c) => {
  const jwt = c.get("jwtPayload");
  const params = c.req.valid("param");
  // Ensure the app user exists and belongs to the authenticated user
  const appUser = await prisma.appUser.findUnique({
    where: { id: params.appUserId },
    include: { application: true },
  });
  if (!appUser || appUser.application.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "AppUser not found",
      cause: { success: false },
    });
  }
  const message = await prisma.message.findFirst({
    where: { appUserId: params.appUserId, id: params.messageId },
  });
  if (!message) {
    throw new HTTPException(404, {
      message: "Message not found",
      cause: { success: false },
    });
  }
  const result = {
    ...message,
    appUserId: message.appUserId === null ? undefined : message.appUserId,
    deliverAt: message.deliverAt ? message.deliverAt.toISOString() : null,
    createdAt: message.createdAt.toISOString(),
    payload: message.payload as Record<string, unknown>,
  };
  const parsed = MessageSchema.parse(result);
  return c.json({ success: true, data: parsed }, 200);
};

// ----------------------------
// Update Message for AppUser
// ----------------------------
export const patch: RouteHandler<PatchRoute, AppBindings> = async (c) => {
  const jwt = c.get("jwtPayload");
  const params = c.req.valid("param");
  const body = c.req.valid("json");

  const appUser = await prisma.appUser.findUnique({
    where: { id: params.appUserId },
    include: { application: true },
  });

  if (!appUser || appUser.application.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "AppUser not found",
      cause: { success: false },
    });
  }

  const message = await prisma.message.findFirst({
    where: { appUserId: params.appUserId, id: params.messageId },
  });

  if (!message) {
    throw new HTTPException(404, {
      message: "Message not found",
      cause: { success: false },
    });
  }

  const edited = await prisma.message.update({
    where: { id: params.messageId },
    data: {
      ...body,
      // biome-ignore lint/suspicious/noExplicitAny: Prisma InputJsonValue casting
      payload: body.payload ? (body.payload as any) : undefined,
    },
  });

  const result = {
    ...edited,
    appUserId: edited.appUserId === null ? undefined : edited.appUserId,
    deliverAt: edited.deliverAt ? edited.deliverAt.toISOString() : null,
    createdAt: edited.createdAt.toISOString(),
    payload: edited.payload as Record<string, unknown>,
  };

  const parsed = MessageSchema.parse(result);

  return c.json({ success: true, data: parsed }, 200);
};

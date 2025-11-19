import type { AppBindings, AppRouteHandler } from "@/lib/types";
import type { RouteHandler } from "@hono/zod-openapi";
import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./appusers.routes";
import { prisma } from "prisma";
import { AppUserSchema } from "./appusers.schemas";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";

// ----------------------------
// List AppUsers
// ----------------------------
export const list: AppRouteHandler<ListRoute> = async (c) => {
  const jwtPayload = c.get("jwtPayload");

  const apps = await prisma.application.findMany({
    where: { userId: jwtPayload.id },
    select: { id: true },
  });

  const appIds = apps.map((a) => a.id);

  const appUsers = await prisma.appUser.findMany({
    where: { applicationId: { in: appIds } },
  });

  const parsed = z.array(AppUserSchema).parse(appUsers);

  return c.json({ success: true, data: parsed });
};

// ----------------------------
// Create AppUser
// ----------------------------
export const create: RouteHandler<CreateRoute, AppBindings> = async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const body = c.req.valid("json");

  // Ensure application belongs to the authenticated user
  const application = await prisma.application.findUnique({
    where: { id: body.applicationId },
  });

  if (!application || application.userId !== jwtPayload.id) {
    throw new HTTPException(404, {
      message: "Application not found",
      cause: { success: false },
    });
  }

  const created = await prisma.appUser.create({ data: body });

  return c.json({ success: true, data: created }, 201);
};

// ----------------------------
// Get One AppUser
// ----------------------------
export const getOne: RouteHandler<GetOneRoute, AppBindings> = async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const params = c.req.valid("param");

  const appUser = await prisma.appUser.findUnique({
    where: { id: params.id },
    include: { application: true },
  });

  if (!appUser || appUser.application.userId !== jwtPayload.id) {
    throw new HTTPException(404, {
      message: "AppUser not found",
      cause: { success: false },
    });
  }

  return c.json({ success: true, data: appUser }, 200);
};

// ----------------------------
// Update AppUser
// ----------------------------
export const patch: RouteHandler<PatchRoute, AppBindings> = async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const params = c.req.valid("param");
  const updates = c.req.valid("json");

  const appUser = await prisma.appUser.findUnique({
    include: { application: true },
    where: { id: params.id },
  });

  if (!appUser || appUser.application.userId !== jwtPayload.id) {
    throw new HTTPException(404, {
      message: "AppUser not found",
      cause: { success: false },
    });
  }

  const edited = await prisma.appUser.update({ where: { id: params.id }, data: updates });

  return c.json({ success: true, data: edited }, 200);
};

// ----------------------------
// Delete AppUser
// ----------------------------
export const remove: RouteHandler<RemoveRoute, AppBindings> = async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const params = c.req.valid("param");

  const appUser = await prisma.appUser.findUnique({
    include: { application: true },
    where: { id: params.id },
  });

  if (!appUser || appUser.application.userId !== jwtPayload.id) {
    throw new HTTPException(404, {
      message: "AppUser not found",
      cause: { success: false },
    });
  }

  await prisma.appUser.delete({ where: { id: params.id } });

  return c.json({ success: true, data: { id: params.id } }, 200);
};

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
} from "./app-users.routes";
import { AppUserSchema } from "./app-users.schemas";

// ----------------------------
// List AppUsers
// ----------------------------
export const list: AppRouteHandler<ListRoute> = async (c) => {
  const jwt = c.get("jwtPayload");
  const params = c.req.valid("param");
  // Ensure the application belongs to the user
  const app = await prisma.application.findUnique({ where: { id: params.id } });
  if (!app || app.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "Application not found",
      cause: { success: false },
    });
  }
  const appUsers = await prisma.appUser.findMany({
    where: { applicationId: params.id },
  });
  const parsed = z.array(AppUserSchema).parse(appUsers);
  return c.json({ success: true, data: parsed });
};

// ----------------------------
// Create AppUser
// ----------------------------
export const create: RouteHandler<CreateRoute, AppBindings> = async (c) => {
  const jwt = c.get("jwtPayload");
  const params = c.req.valid("param");
  const body = c.req.valid("json");
  // Ensure application belongs to the authenticated user
  const app = await prisma.application.findUnique({ where: { id: params.id } });
  if (!app || app.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "Application not found",
      cause: { success: false },
    });
  }
  const created = await prisma.appUser.create({
    data: { ...body, applicationId: params.id },
  });
  return c.json({ success: true, data: created }, 201);
};

// ----------------------------
// Get One AppUser
// ----------------------------
export const getOne: RouteHandler<GetOneRoute, AppBindings> = async (c) => {
  const jwt = c.get("jwtPayload");
  const params = c.req.valid("param");
  // Ensure the application belongs to the user
  const app = await prisma.application.findUnique({ where: { id: params.id } });
  if (!app || app.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "Application not found",
      cause: { success: false },
    });
  }
  const appUser = await prisma.appUser.findFirst({
    where: { applicationId: params.id, id: params.userId },
  });
  if (!appUser) {
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
  const jwt = c.get("jwtPayload");
  const params = c.req.valid("param");
  const body = c.req.valid("json");
  // Ensure the application belongs to the user
  const app = await prisma.application.findUnique({ where: { id: params.id } });
  if (!app || app.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "Application not found",
      cause: { success: false },
    });
  }
  const appUser = await prisma.appUser.findFirst({
    where: { applicationId: params.id, id: params.userId },
  });
  if (!appUser) {
    throw new HTTPException(404, {
      message: "AppUser not found",
      cause: { success: false },
    });
  }
  const edited = await prisma.appUser.update({
    where: { id: params.userId },
    data: body,
  });
  return c.json({ success: true, data: edited }, 200);
};

// ----------------------------
// Delete AppUser
// ----------------------------
export const remove: RouteHandler<RemoveRoute, AppBindings> = async (c) => {
  const jwt = c.get("jwtPayload");
  const params = c.req.valid("param");
  // Ensure the application belongs to the user
  const app = await prisma.application.findUnique({ where: { id: params.id } });
  if (!app || app.userId !== jwt.id) {
    throw new HTTPException(404, {
      message: "Application not found",
      cause: { success: false },
    });
  }
  const appUser = await prisma.appUser.findFirst({
    where: { applicationId: params.id, id: params.userId },
  });
  if (!appUser) {
    throw new HTTPException(404, {
      message: "AppUser not found",
      cause: { success: false },
    });
  }
  await prisma.appUser.delete({ where: { id: params.userId } });
  return c.json({ success: true, data: { id: params.userId } }, 200);
};

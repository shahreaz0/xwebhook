import { getConnInfo } from "hono/bun";
import { HTTPException } from "hono/http-exception";
import { prisma } from "prisma";
import { env } from "@/lib/env";
import type { AppRouteHandler } from "@/lib/types";
import type {
  GetTokenRoute,
  LoginRoute,
  LogoutRoute,
  RegisterRoute,
} from "./auth.routes";
import {
  generateSessionToken,
  hashPassword,
  signJwt,
  verifyPassword,
} from "./auth.services";

export const register: AppRouteHandler<RegisterRoute> = async (c) => {
  const body = c.req.valid("json");

  const existing = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (existing) {
    throw new HTTPException(409, {
      message: "Email already exists",
      cause: { success: false },
    });
  }

  const hashedPassword = await hashPassword(body.password);

  const user = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name,
      password: hashedPassword,
    },
  });

  return c.json(
    {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    },
    201
  );
};

export const login: AppRouteHandler<LoginRoute> = async (c) => {
  const body = c.req.valid("json");

  const user = await prisma.user.findUnique({
    where: { email: body.email },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      password: true,
    },
  });

  if (!user) {
    throw new HTTPException(401, { message: "Invalid email or password" });
  }

  const valid = await verifyPassword(user.password, body.password);

  if (!valid) {
    throw new HTTPException(401, { message: "Invalid email or password" });
  }

  // create session
  const token = generateSessionToken();
  const info = getConnInfo(c);

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token,
      ipAddress: info.remote.address,
      userAgent: c.req.header("User-Agent"),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },

    omit: {
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      userId: true,
    },
  });

  return c.json(
    {
      success: true,
      message: "Login Successful",
      session,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    },
    200
  );
};

export const getToken: AppRouteHandler<GetTokenRoute> = async (c) => {
  const token = c.req.header("token");

  if (!token) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const session = await prisma.session.findUnique({
    where: { token },
    select: {
      userId: true,
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!session) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const jwtToken = await signJwt(
    {
      id: session.userId,
      email: session.user.email,
    },
    env.JWT_SECRET
  );

  return c.json({ success: true, data: { token: jwtToken } }, 200);
};

export const logout: AppRouteHandler<LogoutRoute> = async (c) => {
  const token = c.req.header("token");

  if (!token) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  await prisma.session.delete({
    where: { token },
  });

  return c.json({ success: true }, 200);
};

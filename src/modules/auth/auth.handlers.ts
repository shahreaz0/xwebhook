import type { RouteHandler } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { prisma } from "prisma";
import { env } from "@/lib/env";
import type { AppBindings } from "@/lib/types";
import type { LoginRoute, RegisterRoute } from "./auth.routes";
import { hashPassword, signJwt, verifyPassword } from "./auth.services";

export const register: RouteHandler<RegisterRoute, AppBindings> = async (c) => {
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

export const login: RouteHandler<LoginRoute, AppBindings> = async (c) => {
  const body = c.req.valid("json");

  const user = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (!user) {
    throw new HTTPException(401, { message: "Invalid email or password" });
  }

  const valid = await verifyPassword(user.password, body.password);

  if (!valid) {
    throw new HTTPException(401, { message: "Invalid email or password" });
  }

  const token = await signJwt(
    {
      id: user.id,
      email: user.email,
    },
    env.JWT_SECRET
  );

  return c.json(
    {
      success: true,
      message: "Login Successful",
      token,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    },
    200
  );
};

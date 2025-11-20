// lib/auth/jwt.ts

import { hash as argonHash, verify as argonVerify } from "argon2";
import { jwtVerify, SignJWT } from "jose";

const encoder = new TextEncoder();

export async function signJwt(
  payload: Record<string, unknown>,
  secret: string,
  expiresIn = "7d"
): Promise<string> {
  const key = encoder.encode(secret);

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS512" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}

export async function verifyJwt<T = unknown>(
  token: string,
  secret: string
): Promise<T> {
  const key = encoder.encode(secret);

  const { payload } = await jwtVerify(token, key, {
    algorithms: ["HS512"],
  });

  return payload as T;
}

export async function hashPassword(password: string): Promise<string> {
  return await argonHash(password, {
    type: 2, // argon2id
    memoryCost: 2 ** 16, // 64MB
    timeCost: 3,
    parallelism: 1,
  });
}

export async function verifyPassword(
  hashed: string,
  plain: string
): Promise<boolean> {
  return await argonVerify(hashed, plain);
}

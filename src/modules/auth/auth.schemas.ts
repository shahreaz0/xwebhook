import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string().nullable(),
  createdAt: z.string(),
});

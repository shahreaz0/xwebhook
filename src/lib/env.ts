import path from "node:path";
import dotenv from "dotenv";
import { ZodError, z } from "zod";

dotenv.config({
  path: path.resolve(
    process.cwd(),
    process.env.NODE_ENV === "test" ? ".env.test" : ".env"
  ),
});

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  LOG_LEVEL: z.enum([
    "fatal",
    "error",
    "warn",
    "info",
    "debug",
    "trace",
    "silent",
  ]),
  PORT: z.coerce.number().default(8088),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string(),

  // redis
  REDIS_URL: z.url(),
  // REDIS_PORT: z.coerce.number().int().min(1).max(65_535),
  // REDIS_USERNAME: z.string().nonempty().optional(),
  // REDIS_PASSWORD: z.string().nonempty().optional(),
  // REDIS_DB: z.coerce.number().int().min(0).optional(),
});

export let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    console.error("Invalid env");
    console.error(z.treeifyError(error));

    process.exit(1);
  }
}

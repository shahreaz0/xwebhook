import { ZodError, z } from "zod";

import path from "node:path";
import dotenv from "dotenv";

dotenv.config({
  path: path.resolve(
    process.cwd(),
    process.env.NODE_ENV === "test" ? ".env.test" : ".env"
  ),
});

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]),
  PORT: z.coerce.number().default(8088),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string(),
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

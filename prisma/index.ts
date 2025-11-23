import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { PrismaClient } from "../generated/prisma/client.ts";

const connectionString = `${env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function checkDbConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info("Database connected!");
    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
}

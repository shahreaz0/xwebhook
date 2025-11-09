import { logger } from "@/lib/logger";
import { PrismaClient } from "../generated/prisma/client";

export const prisma = new PrismaClient();

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

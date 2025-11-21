import { PrismaPg } from "@prisma/adapter-pg";
import { logger } from "@/lib/logger";
import { PrismaClient } from "../generated/prisma/client.ts";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });

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

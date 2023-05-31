import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export function exclude<T, Key extends keyof T>(table: T, keys: Key[]): Omit<T, Key> {
  for (let key of keys) {
    delete table[key];
  }
  return table;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV === "development") globalForPrisma.prisma = prisma;

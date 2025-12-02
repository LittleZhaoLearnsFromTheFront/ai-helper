import { Prisma, PrismaClient } from '@prisma/client'

// 防止热重载或多次import导致多实例
type DBInstance = InstanceType<typeof PrismaClient>

const globalForPrisma = globalThis as unknown as { prisma?: DBInstance }

export const DB: DBInstance =
  globalForPrisma.prisma ??
  new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = DB

export const DBTransaction = async <T>(
  callback: (prisma: Prisma.TransactionClient) => Promise<T>,
): Promise<T> => {
  return DB.$transaction(callback)
}
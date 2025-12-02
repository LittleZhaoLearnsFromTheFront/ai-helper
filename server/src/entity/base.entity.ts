import { Prisma, PrismaClient } from "@prisma/client"
import { DB } from "../lib/db"

type PrismaExecutor = PrismaClient | Prisma.TransactionClient

class BaseEntity {
    private defaultDB: PrismaClient
    protected usedDB: PrismaExecutor

    constructor() {
        this.defaultDB = DB
        this.usedDB = DB
    }

    openNamespace(prisma: Prisma.TransactionClient) {
        this.usedDB = prisma
    }

    closeNamespace() {
        this.usedDB = this.defaultDB
    }
}

export default BaseEntity
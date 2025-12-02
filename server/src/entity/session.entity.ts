import { Prisma } from "@prisma/client"
import BaseEntity from "./base.entity"

class SessionEntity extends BaseEntity {
    constructor() {
        super()
    }

    async getSessions(where: Prisma.SessionWhereInput = {}) {
        return this.usedDB.session.findMany({
            where,
            orderBy: { createdAt: "desc" }
        })
    }

    async addSession(session: Prisma.SessionCreateInput) {
        return this.usedDB.session.create({ data: session })
    }

    async editSession(id: string, session: Prisma.SessionUpdateInput) {
        return this.usedDB.session.update({
            where: { id },
            data: session
        })
    }

    async deleteSessionById(id: string) {
        return this.usedDB.session.delete({
            where: { id }
        })
    }

    async getSessionById(id: string) {
        return this.usedDB.session.findUnique({
            where: { id },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" }
                }
            }
        })
    }

    async deleteSessionAll() {
        return this.usedDB.session.deleteMany()
    }


}

const globalForPrisma = globalThis as unknown as { sessionEntity?: InstanceType<typeof SessionEntity> }

export const sessionEntity =
    globalForPrisma.sessionEntity ||
    new SessionEntity()

if (process.env.NODE_ENV !== 'production') globalForPrisma.sessionEntity = sessionEntity

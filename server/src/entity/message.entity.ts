import { Prisma } from "@prisma/client"
import BaseEntity from "./base.entity.ts"

class MessageEntity extends BaseEntity {
    constructor() {
        super()
    }

    async getMessages(where: Prisma.MessageWhereInput = {}) {
        return this.usedDB.message.findMany({
            where,
            orderBy: { createdAt: "asc" }
        })
    }

    async addMessage(message: Prisma.MessageCreateInput) {
        return this.usedDB.message.create({
            data: message
        })
    }

    async editMessage(id: string, message: Prisma.MessageUpdateInput) {
        return this.usedDB.message.update({
            where: { id },
            data: message
        })
    }

    async deleteMessageById(id: string) {
        return this.usedDB.message.delete({
            where: { id }
        })
    }

    async getMessageById(id: string) {
        return this.usedDB.message.findUnique({
            where: { id }
        })
    }

    async deleteMessageAll() {
        return this.usedDB.message.deleteMany()
    }


}

const globalForPrisma = globalThis as unknown as { messageEntity?: InstanceType<typeof MessageEntity> }

export const messageEntity =
    globalForPrisma.messageEntity ||
    new MessageEntity()

if (process.env.NODE_ENV !== 'production') globalForPrisma.messageEntity = messageEntity
